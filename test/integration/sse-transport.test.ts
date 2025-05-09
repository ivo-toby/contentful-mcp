import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { SSETransport } from "../../src/transports/sse.js"
import { HttpServer } from "../../src/transports/http-server.js"
import express from "express"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"

// Mock Response object for testing
class MockResponse {
  headers: Record<string, string> = {}
  statusCode = 200
  body = ""
  chunks: string[] = []
  ended = false
  eventHandlers: Record<string, (() => void)[]> = {}

  writeHead(status: number, headers: Record<string, string>) {
    this.statusCode = status
    this.headers = headers
    return this
  }

  write(chunk: string) {
    this.chunks.push(chunk)
    return true
  }

  end() {
    this.ended = true
    // Trigger close event handlers
    if (this.eventHandlers["close"]) {
      this.eventHandlers["close"].forEach(handler => handler())
    }
  }

  on(event: string, callback: () => void) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(callback)
    return this
  }
}

// Mock the Server class to avoid the property access issue
vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  return {
    Server: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockImplementation(async (transport) => {
          // Manually set the callbacks that we need for testing
          if (transport.start) {
            await transport.start()
          }
        })
      }
    })
  }
})

describe("SSE Transport", () => {
  // Mock request for testing
  const mockRequest = {
    headers: {} as Record<string, string>,
  }

  beforeEach(() => {
    // Reset the sessions before each test
    // @ts-expect-error - Accessing private property for testing
    SSETransport.sessions = {}

    // Reset mocks
    vi.clearAllMocks()
  })

  it("should establish an SSE connection", async () => {
    const res = new MockResponse()

    const sessionId = await SSETransport.handleConnection(
      mockRequest as any,
      res as any
    )

    // Verify session ID format (UUID)
    expect(sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )

    // Verify response headers
    expect(res.headers["Content-Type"]).toBe("text/event-stream")
    expect(res.headers["Cache-Control"]).toBe("no-cache")
    expect(res.headers["Connection"]).toBe("keep-alive")

    // Verify that the session was created
    // @ts-expect-error - Accessing private property for testing
    const session = SSETransport.sessions[sessionId]
    expect(session).toBeDefined()
    expect(session.isClosed).toBe(false)

    // Verify initial message
    const initialMessageEvent = res.chunks.find(chunk =>
      chunk.includes("event: connected")
    )
    expect(initialMessageEvent).toBeDefined()

    // Close the session
    SSETransport.closeSession(sessionId)

    // Verify that the session was closed
    // @ts-expect-error - Accessing private property for testing
    expect(SSETransport.sessions[sessionId]).toBeUndefined()
    expect(res.ended).toBe(true)
  })

  it("should handle JSON-RPC messages", async () => {
    const res = new MockResponse()

    // Establish a connection
    const sessionId = await SSETransport.handleConnection(
      mockRequest as any,
      res as any
    )

    // Create a request and response for the message handling
    const messageReq = { headers: { "mcp-session-id": sessionId } } as any
    const messageRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any

    // Create a test message
    const message: JSONRPCMessage = {
      jsonrpc: "2.0",
      method: "test",
      id: 1
    }

    // Mock the server's transport to simulate successful message handling
    // @ts-expect-error - Accessing private property for testing
    const session = SSETransport.sessions[sessionId]
    // @ts-expect-error - Setting up mock transport for testing
    session.server.transport = {
      onmessage: vi.fn()
    }

    // Handle the message
    await SSETransport.handleMessage(messageReq, messageRes, sessionId, message)

    // Verify response
    expect(messageRes.status).toHaveBeenCalledWith(200)
    expect(messageRes.json).toHaveBeenCalledWith({
      jsonrpc: "2.0",
      result: { success: true },
      id: 1
    })
  })

  it("should reject messages for invalid sessions", async () => {
    // Create a request and response for the message handling
    const messageReq = { headers: { "mcp-session-id": "invalid-session-id" } } as any
    const messageRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any

    // Create a test message
    const message: JSONRPCMessage = {
      jsonrpc: "2.0",
      method: "test",
      id: 1
    }

    // Handle the message
    await SSETransport.handleMessage(messageReq, messageRes, "invalid-session-id", message)

    // Verify response
    expect(messageRes.status).toHaveBeenCalledWith(404)
    expect(messageRes.json).toHaveBeenCalledWith({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Session not found or closed"
      },
      id: 1
    })
  })
})

describe("HTTP Server", () => {
  let app: express.Application

  beforeEach(() => {
    // Create a test app
    app = express()
  })

  it("should set up correct routes", () => {
    // Create HTTP server instance that uses the test app
    const httpServer = new HttpServer({
      port: 0 // Use any available port for testing
    })

    // @ts-expect-error - Replace the app with our test app
    httpServer.app = app

    // Add spy on route configuration methods
    const appGetSpy = vi.spyOn(app, 'get')
    const appPostSpy = vi.spyOn(app, 'post')
    const appDeleteSpy = vi.spyOn(app, 'delete')

    // Setup routes manually
    // @ts-expect-error - Access private method for testing
    httpServer.setupRoutes()

    // Verify that the expected routes were set up - we have 3 GET routes (/mcp, /health, and '/')
    expect(appGetSpy).toHaveBeenCalledTimes(3) // /mcp, /health, and '/'
    expect(appPostSpy).toHaveBeenCalledTimes(1) // /mcp
    expect(appDeleteSpy).toHaveBeenCalledTimes(1) // /mcp

    // Check specific routes
    const getMcpCallArgs = appGetSpy.mock.calls.find(call => call[0] === '/mcp')
    const getHealthCallArgs = appGetSpy.mock.calls.find(call => call[0] === '/health')
    const postMcpCallArgs = appPostSpy.mock.calls.find(call => call[0] === '/mcp')
    const deleteMcpCallArgs = appDeleteSpy.mock.calls.find(call => call[0] === '/mcp')

    expect(getMcpCallArgs).toBeDefined()
    expect(getHealthCallArgs).toBeDefined()
    expect(postMcpCallArgs).toBeDefined()
    expect(deleteMcpCallArgs).toBeDefined()
  })
})