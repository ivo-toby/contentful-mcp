import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { getAllTools } from "../index.js"
import { AiActionToolContext } from "../utils/ai-action-tool-generator.js"
import { CONTENTFUL_PROMPTS } from "../prompts/contentful-prompts.js"
import { handlePrompt } from "../prompts/handlers.js"
import { randomUUID } from "crypto"
import express, { Request, Response } from "express"
import cors from "cors"
import {
  isInitializeRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { entryHandlers } from "../handlers/entry-handlers.js"
import { assetHandlers } from "../handlers/asset-handlers.js"
import { spaceHandlers } from "../handlers/space-handlers.js"
import { contentTypeHandlers } from "../handlers/content-type-handlers.js"
import { bulkActionHandlers } from "../handlers/bulk-action-handlers.js"
import { aiActionHandlers } from "../handlers/ai-action-handlers.js"
import { graphqlHandlers } from "../handlers/graphql-handlers.js"
import type { AiActionInvocation } from "../types/ai-actions.js"

/**
 * Configuration options for the HTTP server
 */
export interface StreamableHttpServerOptions {
  port?: number
  host?: string
  corsOptions?: cors.CorsOptions
}

/**
 * Class to handle HTTP server setup and configuration using the official MCP StreamableHTTP transport
 */
export class StreamableHttpServer {
  private app: express.Application
  private server: any
  private port: number
  private host: string

  // Map to store transports by session ID
  private transports: Record<string, StreamableHTTPServerTransport> = {}

  /**
   * Create a new HTTP server for MCP over HTTP
   *
   * @param options Configuration options
   */
  constructor(options: StreamableHttpServerOptions = {}) {
    this.port = options.port || 3000
    this.host = options.host || "localhost"

    // Create Express app
    this.app = express()

    // Initialize AI Action tool context
    this.aiActionToolContext = new AiActionToolContext(
      process.env.SPACE_ID || "",
      process.env.ENVIRONMENT_ID || "master",
    )

    // Load AI Actions
    this.loadAiActions().catch(error => {
      console.error("Error loading AI Actions for StreamableHTTP server:", error)
    })

    // Configure CORS
    this.app.use(
      cors(
        options.corsOptions || {
          origin: "*",
          methods: ["GET", "POST", "DELETE"],
          allowedHeaders: ["Content-Type", "MCP-Session-ID"],
          exposedHeaders: ["MCP-Session-ID"],
        },
      ),
    )

    // Configure JSON body parsing
    this.app.use(express.json())

    // Set up routes
    this.setupRoutes()
  }

  /**
   * Set up the routes for MCP over HTTP
   */
  private setupRoutes(): void {
    // Handle all MCP requests (POST, GET, DELETE) on a single endpoint
    this.app.all("/mcp", async (req: Request, res: Response) => {
      try {
        if (req.method === "POST") {
          // Check for existing session ID
          const sessionId = req.headers["mcp-session-id"] as string | undefined
          let transport: StreamableHTTPServerTransport

          if (sessionId && this.transports[sessionId]) {
            // Reuse existing transport
            transport = this.transports[sessionId]
          } else if (!sessionId && isInitializeRequest(req.body)) {
            // Create a new server instance for this connection
            const server = new Server(
              {
                name: "contentful-mcp-server",
                version: "1.14.1",
              },
              {
                capabilities: {
                  tools: getAllTools(),
                  prompts: CONTENTFUL_PROMPTS,
                },
              },
            )

            // New initialization request
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (sid) => {
                // Store the transport by session ID
                this.transports[sid] = transport
              },
            })

            // Clean up transport when closed
            transport.onclose = () => {
              if (transport.sessionId) {
                delete this.transports[transport.sessionId]
                console.log(`Session ${transport.sessionId} closed`)
              }
            }

            // Set up request handlers
            this.setupServerHandlers(server)

            // Connect to the MCP server
            await server.connect(transport)
          } else {
            // Invalid request
            res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided for non-initialize request",
              },
              id: null,
            })
            return
          }

          // Handle the request
          await transport.handleRequest(req, res, req.body)
        } else if (req.method === "GET") {
          // Server-sent events endpoint for notifications
          const sessionId = req.headers["mcp-session-id"] as string | undefined

          if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send("Invalid or missing session ID")
            return
          }

          const transport = this.transports[sessionId]
          await transport.handleRequest(req, res)
        } else if (req.method === "DELETE") {
          // Session termination
          const sessionId = req.headers["mcp-session-id"] as string | undefined

          if (!sessionId || !this.transports[sessionId]) {
            res.status(400).send("Invalid or missing session ID")
            return
          }

          const transport = this.transports[sessionId]
          await transport.handleRequest(req, res)
        } else {
          // Other methods not supported
          res.status(405).send("Method not allowed")
        }
      } catch (error) {
        console.error("Error handling MCP request:", error)
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: `Internal server error: ${error instanceof Error ? error.message : String(error)}`,
            },
            id: null,
          })
        }
      }
    })

    // Add a health check endpoint
    this.app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "ok",
        sessions: Object.keys(this.transports).length,
      })
    })
  }

  /**
   * Set up the request handlers for a server instance
   *
   * @param server Server instance
   */
  private setupServerHandlers(server: Server): void {
    // List tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.values(getAllTools()),
      }
    })

    // List prompts handler
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: Object.values(CONTENTFUL_PROMPTS),
      }
    })

    // Get prompt handler
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      return handlePrompt(name, args)
    })

    // Call tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params
        const handler = this.getHandler(name)

        if (!handler) {
          throw new Error(`Unknown tool: ${name}`)
        }

        const result = await handler(args || {})

        // For AI Action responses, format them appropriately
        if (result && typeof result === "object") {
          // Check if this is an AI Action invocation result
          if (
            "sys" in result &&
            typeof result.sys === "object" &&
            result.sys &&
            "type" in result.sys &&
            result.sys.type === "AiActionInvocation"
          ) {
            const invocationResult = result as AiActionInvocation

            // Format AI Action result as text content if available
            if (invocationResult.result && invocationResult.result.content) {
              return {
                content: [
                  {
                    type: "text",
                    text:
                      typeof invocationResult.result.content === "string"
                        ? invocationResult.result.content
                        : JSON.stringify(invocationResult.result.content),
                  },
                ],
              }
            }
          }

          // Check for error response
          if ("isError" in result && result.isError === true) {
            // Format error response
            return {
              content: [
                {
                  type: "text",
                  text: "message" in result ? String(result.message) : "Unknown error",
                },
              ],
              isError: true,
            }
          }
        }

        // Return the result as is for regular handlers
        return result
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  // AI Action Tool Context for handling dynamic tools
  private aiActionToolContext: AiActionToolContext

  /**
   * Helper function to map tool names to handlers
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getHandler(name: string): ((args: any) => Promise<any>) | undefined {
    // Determine which authentication methods are available
    const hasCmaToken = !!process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
    const hasCdaToken = !!process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN;
    const hasPrivateKey = !!process.env.PRIVATE_KEY;

    // Check if this is a dynamic AI Action tool - only available with CMA token
    if (name.startsWith("ai_action_") && (hasCmaToken || hasPrivateKey)) {
      const actionId = name.replace("ai_action_", "")
      return (args: Record<string, unknown>) => this.handleAiActionInvocation(actionId, args)
    }

    // If we only have a CDA token, only enable GraphQL operations
    if (hasCdaToken && !hasCmaToken && !hasPrivateKey) {
      const cdaOnlyHandlers = {
        // Only GraphQL operations are allowed with just a CDA token
        graphql_query: graphqlHandlers.executeQuery,
      }

      return cdaOnlyHandlers[name as keyof typeof cdaOnlyHandlers]
    }

    // Full handlers list for CMA token or private key
    const handlers = {
      // Entry operations
      create_entry: entryHandlers.createEntry,
      get_entry: entryHandlers.getEntry,
      update_entry: entryHandlers.updateEntry,
      delete_entry: entryHandlers.deleteEntry,
      publish_entry: entryHandlers.publishEntry,
      unpublish_entry: entryHandlers.unpublishEntry,
      search_entries: entryHandlers.searchEntries,

      // Bulk operations
      bulk_publish: bulkActionHandlers.bulkPublish,
      bulk_unpublish: bulkActionHandlers.bulkUnpublish,
      bulk_validate: bulkActionHandlers.bulkValidate,

      // Asset operations
      upload_asset: assetHandlers.uploadAsset,
      get_asset: assetHandlers.getAsset,
      update_asset: assetHandlers.updateAsset,
      delete_asset: assetHandlers.deleteAsset,
      publish_asset: assetHandlers.publishAsset,
      unpublish_asset: assetHandlers.unpublishAsset,
      list_assets: assetHandlers.listAssets,

      // Space & Environment operations
      list_spaces: spaceHandlers.listSpaces,
      get_space: spaceHandlers.getSpace,
      list_environments: spaceHandlers.listEnvironments,
      create_environment: spaceHandlers.createEnvironment,
      delete_environment: spaceHandlers.deleteEnvironment,

      // Content Type operations
      list_content_types: contentTypeHandlers.listContentTypes,
      get_content_type: contentTypeHandlers.getContentType,
      create_content_type: contentTypeHandlers.createContentType,
      update_content_type: contentTypeHandlers.updateContentType,
      delete_content_type: contentTypeHandlers.deleteContentType,
      publish_content_type: contentTypeHandlers.publishContentType,

      // AI Action operations
      list_ai_actions: aiActionHandlers.listAiActions,
      get_ai_action: aiActionHandlers.getAiAction,
      create_ai_action: aiActionHandlers.createAiAction,
      update_ai_action: aiActionHandlers.updateAiAction,
      delete_ai_action: aiActionHandlers.deleteAiAction,
      publish_ai_action: aiActionHandlers.publishAiAction,
      unpublish_ai_action: aiActionHandlers.unpublishAiAction,
      invoke_ai_action: aiActionHandlers.invokeAiAction,
      get_ai_action_invocation: aiActionHandlers.getAiActionInvocation,

      // GraphQL operations
      graphql_query: graphqlHandlers.executeQuery,
    }

    return handlers[name as keyof typeof handlers]
  }

  /**
   * Handler for dynamic AI Action tools
   */
  private async handleAiActionInvocation(actionId: string, args: Record<string, unknown>) {
    try {
      console.error(
        `Handling AI Action invocation for ${actionId} with args:`,
        JSON.stringify(args),
      )

      // Get the parameters using the getInvocationParams
      const params = this.aiActionToolContext.getInvocationParams(actionId, args)

      // Directly use the variables property from getInvocationParams
      const invocationParams = {
        spaceId: params.spaceId,
        environmentId: params.environmentId,
        aiActionId: params.aiActionId,
        outputFormat: params.outputFormat,
        waitForCompletion: params.waitForCompletion,
        // Use the correctly formatted variables array directly
        rawVariables: params.variables,
      }

      console.error(`Invoking AI Action with params:`, JSON.stringify(invocationParams))

      // Invoke the AI Action
      return aiActionHandlers.invokeAiAction(invocationParams)
    } catch (error) {
      console.error(`Error invoking AI Action:`, error)
      return {
        isError: true,
        message: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Load available AI Actions
   * This mimics the loadAiActions function in index.ts
   */
  private async loadAiActions(): Promise<void> {
    try {
      // First, clear the cache to avoid duplicates
      this.aiActionToolContext.clearCache()

      // Only load AI Actions if we have required space, environment, and CMA token or private key
      const hasCmaToken = !!process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
      const hasPrivateKey = !!process.env.PRIVATE_KEY;

      if (!process.env.SPACE_ID || (!hasCmaToken && !hasPrivateKey)) {
        console.error("Skipping AI Actions loading for StreamableHTTP: Requires Space ID and either CMA token or Private Key")
        return
      }

      // Fetch published AI Actions
      const response = await aiActionHandlers.listAiActions({
        spaceId: process.env.SPACE_ID,
        environmentId: process.env.ENVIRONMENT_ID || "master",
        status: "published",
      })

      // Check for errors or undefined response
      if (!response) {
        console.error("Error loading AI Actions for StreamableHTTP: No response received")
        return
      }

      if (typeof response === "object" && "isError" in response) {
        console.error(`Error loading AI Actions for StreamableHTTP: ${response.message}`)
        return
      }

      // Add each AI Action to the context
      for (const action of response.items) {
        this.aiActionToolContext.addAiAction(action)

        // Log variable mappings for debugging
        if (action.instruction.variables && action.instruction.variables.length > 0) {
          // Log ID mappings
          const idMappings = this.aiActionToolContext.getIdMappings(action.sys.id)
          if (idMappings && idMappings.size > 0) {
            const mappingLog = Array.from(idMappings.entries())
              .map(([friendly, original]) => `${friendly} -> ${original}`)
              .join(", ")
            console.error(`AI Action ${action.name} - Parameter mappings: ${mappingLog}`)
          }

          // Log path mappings
          const pathMappings = this.aiActionToolContext.getPathMappings(action.sys.id)
          if (pathMappings && pathMappings.size > 0) {
            const pathMappingLog = Array.from(pathMappings.entries())
              .map(([friendly, original]) => `${friendly} -> ${original}`)
              .join(", ")
            console.error(`AI Action ${action.name} - Path parameter mappings: ${pathMappingLog}`)
          }
        }
      }

      console.error(`Loaded ${response.items.length} AI Actions for StreamableHTTP`)
    } catch (error) {
      console.error("Error loading AI Actions for StreamableHTTP:", error)
    }
  }

  // Interval for refreshing AI Actions
  private aiActionsRefreshInterval?: NodeJS.Timeout

  /**
   * Start the HTTP server
   *
   * @returns Promise that resolves when the server is started
   */
  public async start(): Promise<void> {
    // Set up periodic refresh of AI Actions (every 5 minutes)
    this.aiActionsRefreshInterval = setInterval(() => {
      this.loadAiActions().catch(error => {
        console.error("Error refreshing AI Actions for StreamableHTTP:", error)
      })
    }, 5 * 60 * 1000)

    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.error(`MCP StreamableHTTP server running on http://${this.host}:${this.port}/mcp`)
        resolve()
      })
    })
  }

  /**
   * Stop the HTTP server
   *
   * @returns Promise that resolves when the server is stopped
   */
  public async stop(): Promise<void> {
    // Clear AI Actions refresh interval
    if (this.aiActionsRefreshInterval) {
      clearInterval(this.aiActionsRefreshInterval)
      this.aiActionsRefreshInterval = undefined
    }

    // Close all transports
    for (const sessionId in this.transports) {
      try {
        await this.transports[sessionId].close()
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error)
      }
    }

    // Close the HTTP server
    if (this.server) {
      return new Promise((resolve, reject) => {
        this.server.close((err: Error) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  }
}

