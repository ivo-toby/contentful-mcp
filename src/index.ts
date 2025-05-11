#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { CONTENTFUL_PROMPTS } from "./prompts/contentful-prompts.js"
export { CONTENTFUL_PROMPTS }
import { handlePrompt } from "./prompts/handlers.js"
import { entryHandlers } from "./handlers/entry-handlers.js"
import { assetHandlers } from "./handlers/asset-handlers.js"
import { spaceHandlers } from "./handlers/space-handlers.js"
import { contentTypeHandlers } from "./handlers/content-type-handlers.js"
import { bulkActionHandlers } from "./handlers/bulk-action-handlers.js"
import { aiActionHandlers } from "./handlers/ai-action-handlers.js"
import { getTools } from "./types/tools.js"
import { validateEnvironment } from "./utils/validation.js"
import { AiActionToolContext } from "./utils/ai-action-tool-generator.js"
import type { AiActionInvocation } from "./types/ai-actions.js"
import { StreamableHttpServer } from "./transports/streamable-http.js"

// Validate environment variables
validateEnvironment()

// Create AI Action tool context
const aiActionToolContext = new AiActionToolContext(
  process.env.SPACE_ID || "",
  process.env.ENVIRONMENT_ID || "master",
)

// Function to get all tools including dynamic AI Action tools
export function getAllTools() {
  const staticTools = getTools()

  // Add dynamically generated tools for AI Actions
  const dynamicTools = aiActionToolContext.generateAllToolSchemas()

  return {
    ...staticTools,
    ...dynamicTools.reduce(
      (acc, tool) => {
        acc[tool.name] = tool
        return acc
      },
      {} as Record<string, unknown>,
    ),
  }
}

// Create MCP server
const server = new Server(
  {
    name: "contentful-mcp-server",
    version: "1.14.2",
  },
  {
    capabilities: {
      tools: getAllTools(),
      prompts: CONTENTFUL_PROMPTS,
    },
  },
)

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Return both static and dynamic tools
  return {
    tools: Object.values(getAllTools()),
  }
})

// Set up request handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: Object.values(CONTENTFUL_PROMPTS),
}))

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  return handlePrompt(name, args)
})

// Type-safe handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
server.setRequestHandler(CallToolRequestSchema, async (request, _extra): Promise<any> => {
  try {
    const { name, arguments: args } = request.params
    const handler = getHandler(name)

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

// Helper function to map tool names to handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHandler(name: string): ((args: any) => Promise<any>) | undefined {
  // Check if this is a dynamic AI Action tool
  if (name.startsWith("ai_action_")) {
    const actionId = name.replace("ai_action_", "")
    return (args: Record<string, unknown>) => handleAiActionInvocation(actionId, args)
  }

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
  }

  return handlers[name as keyof typeof handlers]
}

// Handler for dynamic AI Action tools
async function handleAiActionInvocation(actionId: string, args: Record<string, unknown>) {
  try {
    console.error(`Handling AI Action invocation for ${actionId} with args:`, JSON.stringify(args))

    // Get the parameters using the updated getInvocationParams
    const params = aiActionToolContext.getInvocationParams(actionId, args)

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

// Functions to initialize and refresh AI Actions
async function loadAiActions() {
  try {
    // First, clear the cache to avoid duplicates
    aiActionToolContext.clearCache()

    // Only load AI Actions if we have required space and environment
    if (!process.env.SPACE_ID) {
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
      console.error("Error loading AI Actions: No response received")
      return
    }

    if (typeof response === "object" && "isError" in response) {
      console.error(`Error loading AI Actions: ${response.message}`)
      return
    }

    // Add each AI Action to the context
    for (const action of response.items) {
      aiActionToolContext.addAiAction(action)

      // Log variable mappings for debugging
      if (action.instruction.variables && action.instruction.variables.length > 0) {
        // Log ID mappings
        const idMappings = aiActionToolContext.getIdMappings(action.sys.id)
        if (idMappings && idMappings.size > 0) {
          const mappingLog = Array.from(idMappings.entries())
            .map(([friendly, original]) => `${friendly} -> ${original}`)
            .join(", ")
          console.error(`AI Action ${action.name} - Parameter mappings: ${mappingLog}`)
        }

        // Log path mappings
        const pathMappings = aiActionToolContext.getPathMappings(action.sys.id)
        if (pathMappings && pathMappings.size > 0) {
          const pathMappingLog = Array.from(pathMappings.entries())
            .map(([friendly, original]) => `${friendly} -> ${original}`)
            .join(", ")
          console.error(`AI Action ${action.name} - Path parameter mappings: ${pathMappingLog}`)
        }
      }
    }

    console.error(`Loaded ${response.items.length} AI Actions`)
  } catch (error) {
    console.error("Error loading AI Actions:", error)
  }
}

// Start the server
async function runServer() {
  // Determine if HTTP server mode is enabled
  const enableHttp = process.env.ENABLE_HTTP_SERVER === "true"
  const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000

  // Load AI Actions before connecting
  await loadAiActions()

  if (enableHttp) {
    // Start StreamableHTTP server for MCP over HTTP
    const httpServer = new StreamableHttpServer({
      port: httpPort,
      host: process.env.HTTP_HOST || "localhost",
    })

    await httpServer.start()
    console.error(
      `Contentful MCP Server running with StreamableHTTP on port ${httpPort} using contentful host ${process.env.CONTENTFUL_HOST}`,
    )

    // Keep the process running
    process.on("SIGINT", async () => {
      console.error("Shutting down HTTP server...")
      await httpServer.stop()
      process.exit(0)
    })
  } else {
    // Traditional stdio mode
    const transport = new StdioServerTransport()

    // Connect to the server
    await server.connect(transport)

    console.error(
      `Contentful MCP Server running on stdio using contentful host ${process.env.CONTENTFUL_HOST}`,
    )
  }

  // Set up periodic refresh of AI Actions (every 5 minutes)
  setInterval(loadAiActions, 5 * 60 * 1000)
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error)
  process.exit(1)
})
