import { expect, vi, describe, it, beforeEach, afterEach } from "vitest"
import { getAllTools } from "../../src/index.js"
import { graphqlHandlers } from "../../src/handlers/graphql-handlers.js"

// Mock tools module
vi.mock("../../src/types/tools.js", () => {
  const getTools = () => ({
    GRAPHQL_QUERY: { name: "graphql_query", description: "GraphQL query tool" },
    CREATE_ENTRY: { name: "create_entry", description: "Create entry tool" }
  })
  
  return {
    getTools,
    getGraphQLTools: vi.fn(),
    getEntryTools: vi.fn(),
    getSpaceEnvProperties: vi.fn()
  }
})

// Mock AI Action tool context
vi.mock("../../src/utils/ai-action-tool-generator.js", () => {
  return {
    AiActionToolContext: class {
      constructor() {}
      generateAllToolSchemas() { return []; }
    }
  }
})

describe("Token Authorization Scenarios", () => {
  // Save original environment variables
  const originalEnv = { ...process.env }
  
  beforeEach(() => {
    // Clear env variables before each test
    delete process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    delete process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN
    delete process.env.PRIVATE_KEY
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID
  })
  
  afterEach(() => {
    // Reset environment variables after each test
    process.env = { ...originalEnv }
    vi.resetModules()
  })
  
  describe("Tool availability based on token type", () => {
    it("should expose only GraphQL tools when only CDA token is provided", () => {
      // Set up the environment with only a CDA token
      process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN = "test-cda-token"
      process.env.SPACE_ID = "test-space"
      
      // Get the tools
      const tools = getAllTools()
      
      // Verify only GraphQL tools are available
      expect(tools).to.be.an("object")
      expect(Object.keys(tools)).to.have.lengthOf(1)
      expect(tools).to.have.property("GRAPHQL_QUERY")
      expect(tools).to.not.have.property("CREATE_ENTRY")
    })
    
    it("should expose all tools when CMA token is provided", () => {
      // Set up the environment with a CMA token
      process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-cma-token"
      process.env.SPACE_ID = "test-space"
      
      // Get the tools
      const tools = getAllTools()
      
      // Verify all tools are available
      expect(tools).to.be.an("object")
      expect(Object.keys(tools)).to.have.length.at.least(2)
      expect(tools).to.have.property("GRAPHQL_QUERY")
      expect(tools).to.have.property("CREATE_ENTRY")
    })
    
    it("should expose all tools when both CDA and CMA tokens are provided", () => {
      // Set up the environment with both CDA and CMA tokens
      process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN = "test-cda-token"
      process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-cma-token"
      process.env.SPACE_ID = "test-space"
      
      // Get the tools
      const tools = getAllTools()
      
      // Verify all tools are available
      expect(tools).to.be.an("object")
      expect(Object.keys(tools)).to.have.length.at.least(2)
      expect(tools).to.have.property("GRAPHQL_QUERY")
      expect(tools).to.have.property("CREATE_ENTRY")
    })
  })
  
  describe("GraphQL handler token usage", () => {
    // Mock the fetch function
    vi.mock("undici", () => ({
      fetch: vi.fn().mockImplementation(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ data: { test: "data" } })
      }))
    }))
    
    it("should prefer CDA token over CMA token for GraphQL queries", async () => {
      // Import the mocked fetch
      const { fetch } = await import("undici")
      
      // Set up mock environment with both tokens
      process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN = "test-cda-token"
      process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-cma-token"
      
      // Execute a GraphQL query
      await graphqlHandlers.executeQuery({
        spaceId: "test-space",
        environmentId: "master",
        query: "{ test { field } }"
      })
      
      // Verify the CDA token was used
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test-space"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-cda-token"
          })
        })
      )
    })
    
    it("should use argument cdaToken over environment token", async () => {
      // Import the mocked fetch
      const { fetch } = await import("undici")
      
      // Set up mock environment
      process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN = "env-cda-token"
      
      // Execute a GraphQL query with explicit cdaToken
      await graphqlHandlers.executeQuery({
        spaceId: "test-space",
        environmentId: "master",
        query: "{ test { field } }",
        cdaToken: "arg-cda-token"
      })
      
      // Verify the argument CDA token was used
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test-space"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer arg-cda-token"
          })
        })
      )
    })
    
    it("should fall back to CMA token when no CDA token is provided", async () => {
      // Import the mocked fetch
      const { fetch } = await import("undici")
      
      // Set up mock environment with only CMA token
      process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-cma-token"
      
      // Execute a GraphQL query
      await graphqlHandlers.executeQuery({
        spaceId: "test-space",
        environmentId: "master",
        query: "{ test { field } }"
      })
      
      // Verify the CMA token was used
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test-space"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-cma-token"
          })
        })
      )
    })
  })
})