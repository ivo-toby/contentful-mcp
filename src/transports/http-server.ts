import express, { Request, Response } from "express"
import cors from "cors"
import { SSETransport } from "./sse.js"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"

/**
 * Configuration options for the HTTP server
 */
export interface HttpServerOptions {
  port?: number
  host?: string
  corsOptions?: cors.CorsOptions
}

/**
 * Class to handle HTTP server setup and configuration
 */
export class HttpServer {
  private app: express.Application
  private server: any
  private port: number
  private host: string
  
  /**
   * Create a new HTTP server for handling SSE connections
   * 
   * @param options Configuration options
   */
  constructor(options: HttpServerOptions = {}) {
    this.port = options.port || 3000
    this.host = options.host || "localhost"
    
    // Create Express app
    this.app = express()
    
    // Configure CORS
    this.app.use(cors(options.corsOptions || {
      origin: "*",
      methods: ["GET", "POST", "DELETE"],
      allowedHeaders: ["Content-Type", "MCP-Session-ID", "Last-Event-ID"],
      exposedHeaders: ["MCP-Session-ID"],
    }))
    
    // Configure JSON body parsing
    this.app.use(express.json())
    
    // Set up routes
    this.setupRoutes()
  }
  
  /**
   * Set up the routes for SSE connections and message handling
   */
  private setupRoutes(): void {
    // SSE connection endpoint
    this.app.get("/mcp", async (req: Request, res: Response) => {
      try {
        // Handle SSE connection
        const sessionId = await SSETransport.handleConnection(req, res)
        console.error(`SSE connection established: ${sessionId}`)
      } catch (error) {
        console.error("Error handling SSE connection:", error)
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: `Error establishing SSE connection: ${error instanceof Error ? error.message : String(error)}`,
          },
          id: null,
        })
      }
    })
    
    // JSON-RPC message endpoint
    this.app.post("/mcp", async (req: Request, res: Response) => {
      const sessionId = req.headers["mcp-session-id"] as string
      
      if (!sessionId) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Missing MCP-Session-ID header",
          },
          id: null,
        })
        return
      }
      
      try {
        // Validate message format
        const message = req.body as JSONRPCMessage
        
        if (typeof message !== "object" || !message.jsonrpc || message.jsonrpc !== "2.0") {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32600,
              message: "Invalid JSON-RPC 2.0 message",
            },
            id: message.id || null,
          })
          return
        }
        
        // Handle the message
        await SSETransport.handleMessage(req, res, sessionId, message)
      } catch (error) {
        console.error(`Error processing message:`, error)
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: `Internal server error: ${error instanceof Error ? error.message : String(error)}`,
          },
          id: null,
        })
      }
    })
    
    // Session termination endpoint
    this.app.delete("/mcp", (req: Request, res: Response) => {
      const sessionId = req.headers["mcp-session-id"] as string
      
      if (!sessionId) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Missing MCP-Session-ID header",
          },
          id: null,
        })
        return
      }
      
      // Close the session
      SSETransport.closeSession(sessionId)
      
      // Return success
      res.status(200).json({
        jsonrpc: "2.0",
        result: { success: true },
        id: null,
      })
    })
    
    // Add a health check endpoint
    this.app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "ok",
        sessions: Object.keys(SSETransport.getAllSessions()).length,
      })
    })
  }
  
  /**
   * Start the HTTP server
   * 
   * @returns Promise that resolves when the server is started
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.error(`HTTP server running on http://${this.host}:${this.port}`)
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