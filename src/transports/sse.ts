import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"
import { randomUUID } from "crypto"
import type { Request, Response } from "express"

/**
 * Interface for the SSE transport session
 */
interface SSESession {
  id: string
  response: Response
  server: Server
  isClosed: boolean
  lastEventId?: string
  heartbeatInterval?: NodeJS.Timeout
}

/**
 * Custom Transport class for SSE
 */
class SSEServerTransport {
  private session: SSESession

  // Callbacks for the transport
  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: (message: JSONRPCMessage) => void

  constructor(session: SSESession) {
    this.session = session
  }

  async start(): Promise<void> {
    // Auto-heartbeat every 30 seconds to keep connection alive
    this.session.heartbeatInterval = setInterval(() => {
      if (!this.session.isClosed) {
        try {
          this.session.response.write(":heartbeat\n\n")
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // Connection may be closed, clean up
          this.clearHeartbeat()
          SSETransport.closeSession(this.session.id)
        }
      } else {
        this.clearHeartbeat()
      }
    }, 30000)

    // Handle client disconnection
    this.session.response.on("close", () => {
      this.clearHeartbeat()
      SSETransport.closeSession(this.session.id)
    })

    // Send initial connection established event
    this.session.response.write(`event: connected\n`)
    this.session.response.write(`data: ${JSON.stringify({ sessionId: this.session.id })}\n\n`)
  }

  async send(message: JSONRPCMessage): Promise<void> {
    // Send message to client
    if (!this.session.isClosed) {
      try {
        const data = JSON.stringify(message)
        this.session.response.write(`id: ${message.id || "notification"}\n`)
        this.session.response.write(`data: ${data}\n\n`)
      } catch (error) {
        console.error(`Error sending SSE message for session ${this.session.id}:`, error)
      }
    }
  }

  async close(): Promise<void> {
    this.clearHeartbeat()
    SSETransport.closeSession(this.session.id)
  }

  private clearHeartbeat(): void {
    if (this.session.heartbeatInterval) {
      clearInterval(this.session.heartbeatInterval)
      this.session.heartbeatInterval = undefined
    }
  }
}

/**
 * Class to handle server-sent events (SSE) transport for the MCP server
 */
export class SSETransport {
  // Session store for managing active connections
  private static sessions: Record<string, SSESession> = {}

  /**
   * Handle an incoming SSE connection request
   *
   * @param req Express request object
   * @param res Express response object
   * @returns Session ID for the established connection
   */
  public static async handleConnection(req: Request, res: Response): Promise<string> {
    // Generate a unique session ID
    const sessionId = randomUUID()

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // For Nginx compatibility
    })

    // Create a new server instance for this connection
    const server = new Server(
      {
        name: "contentful-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      },
    )

    // Store the session
    const session: SSESession = {
      id: sessionId,
      response: res,
      server,
      isClosed: false,
      lastEventId: req.headers["last-event-id"] as string | undefined,
    }

    this.sessions[sessionId] = session

    // Create a transport for this session
    const transport = new SSEServerTransport(session)

    // Connect the transport to the server
    await server.connect(transport)

    // Return the session ID
    return sessionId
  }

  /**
   * Handle an incoming message for a session
   *
   * @param req Express request object
   * @param res Express response object
   * @param sessionId Session ID for the connection
   * @param message JSON-RPC message
   */
  public static async handleMessage(
    req: Request,
    res: Response,
    sessionId: string,
    message: JSONRPCMessage,
  ): Promise<void> {
    const session = this.sessions[sessionId]

    if (!session || session.isClosed) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Session not found or closed",
        },
        id: message.id || null,
      })
      return
    }

    try {
      // Get the transport from the server
      // @ts-expect-error - Accessing transport property
      const transport = session.server.transport as SSEServerTransport

      // Pass the message to the transport's onmessage handler
      if (transport && transport.onmessage) {
        transport.onmessage(message)
      }

      // Send a success response
      res.status(200).json({
        jsonrpc: "2.0",
        result: { success: true },
        id: message.id || null,
      })
    } catch (error) {
      console.error(`Error handling message for session ${sessionId}:`, error)
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: `Error processing message: ${error instanceof Error ? error.message : String(error)}`,
        },
        id: message.id || null,
      })
    }
  }

  /**
   * Close a session
   *
   * @param sessionId Session ID to close
   */
  public static closeSession(sessionId: string): void {
    const session = this.sessions[sessionId]

    if (session && !session.isClosed) {
      session.isClosed = true

      try {
        // Clear heartbeat interval if it exists
        if (session.heartbeatInterval) {
          clearInterval(session.heartbeatInterval)
          session.heartbeatInterval = undefined
        }

        // End the response
        session.response.end()
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error)
      } finally {
        // Delete the session
        delete this.sessions[sessionId]
      }
    }
  }

  /**
   * Get a session by ID
   *
   * @param sessionId Session ID
   * @returns Session object or undefined if not found
   */
  public static getSession(sessionId: string): SSESession | undefined {
    return this.sessions[sessionId]
  }

  /**
   * Get all active sessions
   *
   * @returns Array of session objects
   */
  public static getAllSessions(): SSESession[] {
    return Object.values(this.sessions)
  }
}

