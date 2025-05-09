import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { StreamableHttpServer } from "../../src/transports/streamable-http.js"
import express from "express"
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"

// Mock the Server class
vi.mock("@modelcontextprotocol/sdk/server/index.js", () => {
  return {
    Server: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockImplementation(async (transport) => {
          // Manually set callbacks for testing
          if (transport.start) {
            await transport.start()
          }
        }),
        setRequestHandler: vi.fn(),
      }
    })
  }
})

// Mock the StreamableHTTPServerTransport
vi.mock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => {
  return {
    StreamableHTTPServerTransport: vi.fn().mockImplementation(({ sessionIdGenerator, onsessioninitialized }) => {
      const sessionId = sessionIdGenerator()
      onsessioninitialized(sessionId)
      
      return {
        sessionId,
        handleRequest: vi.fn().mockResolvedValue(undefined),
        onclose: undefined,
        start: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }
    })
  }
})

describe("StreamableHTTP Server", () => {
  let app: express.Application
  
  beforeEach(() => {
    // Create a test app
    app = express()
    vi.clearAllMocks()
  })
  
  it("should set up correct routes", () => {
    // Create StreamableHTTP server instance that uses the test app
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // @ts-expect-error - Replace the app with our test app
    httpServer.app = app
    
    // Add spy on route configuration methods
    const appAllSpy = vi.spyOn(app, 'all')
    const appGetSpy = vi.spyOn(app, 'get')
    
    // Setup routes manually
    // @ts-expect-error - Access private method for testing
    httpServer.setupRoutes()
    
    // Verify that the expected routes were set up
    expect(appAllSpy).toHaveBeenCalledTimes(1) // /mcp
    expect(appGetSpy).toHaveBeenCalledTimes(1) // /health
    
    // Check specific routes
    const mcpCallArgs = appAllSpy.mock.calls.find(call => call[0] === '/mcp')
    const healthCallArgs = appGetSpy.mock.calls.find(call => call[0] === '/health')
    
    expect(mcpCallArgs).toBeDefined()
    expect(healthCallArgs).toBeDefined()
  })
  
  it("should handle POST initialization requests correctly", async () => {
    // Create StreamableHTTP server
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // @ts-expect-error - Replace the app with our test app
    httpServer.app = app
    
    // @ts-expect-error - Access private method for testing
    httpServer.setupRoutes()
    
    // Mock request and response
    const req = {
      method: "POST",
      headers: {},
      body: {
        jsonrpc: "2.0",
        method: "initialize",
        id: 1,
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
      },
    } as any
    
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      writeHead: vi.fn(),
      headersSent: false,
    } as any
    
    // Get the route handler
    const routeHandler = app._router.stack
      .find((layer: any) => layer.route && layer.route.path === '/mcp')
      ?.route.stack[0].handle
    
    // Call the route handler
    await routeHandler(req, res)
    
    // Check that StreamableHTTPServerTransport was created
    expect(StreamableHTTPServerTransport).toHaveBeenCalledTimes(1)
    
    // Check that handleRequest was called with the initialization request
    const transportInstance = (StreamableHTTPServerTransport as any).mock.results[0].value
    expect(transportInstance.handleRequest).toHaveBeenCalledWith(req, res, req.body)
  })
  
  it("should reject POST requests without session ID or initialization", async () => {
    // Create StreamableHTTP server
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // @ts-expect-error - Replace the app with our test app
    httpServer.app = app
    
    // @ts-expect-error - Access private method for testing
    httpServer.setupRoutes()
    
    // Mock request and response
    const req = {
      method: "POST",
      headers: {},
      body: {
        jsonrpc: "2.0",
        method: "test",
        id: 1,
      },
    } as any
    
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    } as any
    
    // Get the route handler
    const routeHandler = app._router.stack
      .find((layer: any) => layer.route && layer.route.path === '/mcp')
      ?.route.stack[0].handle
    
    // Call the route handler
    await routeHandler(req, res)
    
    // Check that it rejected the request
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided for non-initialize request",
      },
      id: null,
    })
  })
  
  it("should set up server handlers correctly", () => {
    // Create StreamableHTTP server
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // Create a mock server
    const mockServer = {
      setRequestHandler: vi.fn(),
    }
    
    // Call setupServerHandlers
    // @ts-expect-error - Access private method for testing
    httpServer.setupServerHandlers(mockServer as any)
    
    // Verify that setRequestHandler was called for all expected handlers
    expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(4)
  })
  
  it("should start and stop the server", async () => {
    // Create StreamableHTTP server
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // Mock the app.listen method
    const listenMock = vi.fn().mockImplementation((port, callback) => {
      callback()
      return { close: vi.fn().mockImplementation((cb) => cb()) }
    })
    // @ts-expect-error - Replace the app.listen with our mock
    httpServer.app.listen = listenMock
    
    // Start the server
    await httpServer.start()
    
    // Verify that listen was called
    expect(listenMock).toHaveBeenCalledTimes(1)
    
    // Stop the server (with no active transports)
    await httpServer.stop()
    
    // Now test with an active transport
    // @ts-expect-error - Access private property for testing
    httpServer.transports = {
      "test-session": {
        close: vi.fn().mockResolvedValue(undefined),
      } as any,
    }
    
    // Stop the server (with an active transport)
    await httpServer.stop()
    
    // Verify that transport.close was called
    // @ts-expect-error - Access private property for testing
    expect(httpServer.transports["test-session"].close).toHaveBeenCalledTimes(1)
  })
  
  it("should get handler for valid tool names", () => {
    // Create StreamableHTTP server
    const httpServer = new StreamableHttpServer({
      port: 0 // Use any available port for testing
    })
    
    // Test getting a handler for a known tool
    // @ts-expect-error - Access private method for testing
    const handler = httpServer.getHandler("get_entry")
    
    // Verify that a handler was returned
    expect(handler).toBeDefined()
    
    // Test getting a handler for an unknown tool
    // @ts-expect-error - Access private method for testing
    const unknownHandler = httpServer.getHandler("unknown_tool")
    
    // Verify that no handler was returned
    expect(unknownHandler).toBeUndefined()
  })
})