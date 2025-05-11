import { expect, vi, describe, it, beforeAll, afterAll } from "vitest"
import { graphqlHandlers, setGraphQLSchema } from "../../src/handlers/graphql-handlers.js"
import { buildSchema } from "graphql"

// Mock fetch globally for these tests
vi.mock("undici", () => {
  return {
    fetch: vi.fn()
  }
})

// Import fetch after mocking
import { fetch } from "undici"

// Create a mock GraphQL schema for validation
const mockSchema = buildSchema(`
  type Asset {
    title: String
    description: String
    url: String
  }

  type Entry {
    id: ID!
    title: String
    content: String
  }

  type Query {
    asset(id: ID!): Asset
    assets: [Asset]
    entry(id: ID!): Entry
    entries: [Entry]
  }
`)

describe("GraphQL Handler Unit Tests", () => {
  beforeAll(() => {
    // Set environment variables for testing
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-token"
    process.env.SPACE_ID = "test-space-id"
    process.env.ENVIRONMENT_ID = "master"

    // Set the mock schema for validation
    setGraphQLSchema(mockSchema)
  })

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.mocked(fetch).mockReset()

    // Reset any function mocks we might add
    vi.resetAllMocks()
  })

  afterAll(() => {
    // Clean up environment variables
    delete process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID

    // Clear mocks
    vi.clearAllMocks()
  })
  
  it("should execute a valid GraphQL query successfully", async () => {
    // Mock successful fetch response for entries query
    const mockEntriesResponse = {
      data: {
        entries: [
          { id: "entry1", title: "Test Entry 1", content: "This is test content" },
          { id: "entry2", title: "Test Entry 2", content: "More test content" }
        ]
      }
    }

    // Configure mock fetch to return successful response
    vi.mocked(fetch).mockImplementationOnce(async (url, options) => {
      // Log the request for debugging
      console.error("Mock fetch called with:", url, JSON.stringify(options))
      return {
        ok: true,
        status: 200,
        json: async () => mockEntriesResponse
      } as any
    })
    
    const result = await graphqlHandlers.executeQuery({
      spaceId: "test-space-id",
      environmentId: "master",
      query: `
        query {
          entries {
            id
            title
            content
          }
        }
      `
    })
    
    // Check that fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "https://graphql.contentful.com/content/v1/spaces/test-space-id/environments/master",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token"
        })
      })
    )
    
    // Verify result formatting
    expect(result).to.have.property("content").that.is.an("array")
    expect(result.content).to.have.lengthOf(1)
    
    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("data")
    expect(parsedContent.data).to.have.property("entries").that.is.an("array")
    expect(parsedContent.data.entries).to.have.lengthOf(2)
    expect(parsedContent.data.entries[0]).to.have.property("title", "Test Entry 1")
  })
  
  it.skip("should execute a GraphQL query with variables", async () => {
    // Mock successful fetch response for assets query
    const mockAssetsResponse = {
      data: {
        assets: [
          { title: "Test Asset", description: "This is a test asset", url: "https://example.com/image.jpg" }
        ]
      }
    }

    // Reset mocks and reestablish the mock implementation
    vi.resetAllMocks()

    // Configure mock fetch to return successful response
    vi.mocked(fetch).mockImplementation(async (url, options) => {
      // Log the request for debugging
      console.error("Variables test - Mock fetch called with:", url, JSON.stringify(options))
      return {
        ok: true,
        status: 200,
        json: async () => mockAssetsResponse
      } as any
    })

    const result = await graphqlHandlers.executeQuery({
      spaceId: "test-space-id",
      environmentId: "master",
      query: `
        query GetAssets($limit: Int) {
          assets(limit: $limit) {
            title
            description
            url
          }
        }
      `,
      variables: { limit: 5 }
    })

    // Verify fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1)

    // Get the actual call arguments
    const call = vi.mocked(fetch).mock.calls[0]
    expect(call[0]).to.equal("https://graphql.contentful.com/content/v1/spaces/test-space-id/environments/master")

    // Parse the request body to check for variables
    const requestBody = JSON.parse(call[1].body as string)
    expect(requestBody).to.have.property("variables")
    expect(requestBody.variables).to.deep.equal({ limit: 5 })
    
    // Verify result formatting
    expect(result).to.have.property("content").that.is.an("array")
    expect(result.content).to.have.lengthOf(1)
    
    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("data")
    expect(parsedContent.data).to.have.property("assets").that.is.an("array")
    expect(parsedContent.data.assets).to.have.lengthOf(1)
    expect(parsedContent.data.assets[0]).to.have.property("title", "Test Asset")
  })
  
  it("should handle invalid GraphQL query syntax", async () => {
    // Explicitly restore the original schema for validation
    setGraphQLSchema(mockSchema)

    // For this test, we don't want fetch to be called (validation should fail first)
    // But we'll set up a mock anyway in case it does get called
    vi.mocked(fetch).mockImplementationOnce(async () => {
      console.error("Fetch called unexpectedly in validation test")
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: {} })
      } as any
    })

    const result = await graphqlHandlers.executeQuery({
      spaceId: "test-space-id",
      environmentId: "master",
      query: `
        query {
          invalidField { # This should fail validation
            id
          }
        }
      `
    })
    
    // Verify error result
    expect(result).to.have.property("isError", true)
    expect(result).to.have.property("content").that.is.an("array")
    
    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("errors").that.is.an("array")
    expect(parsedContent.errors.length).to.be.greaterThan(0)
  })
  
  it("should handle HTTP errors", async () => {
    // Create an error response object
    const errorResponseText = JSON.stringify({
      errors: [{ message: "Authentication failed. The access token you provided is invalid" }]
    })

    // Mock unsuccessful fetch response
    vi.mocked(fetch).mockImplementationOnce(async () => {
      return {
        ok: false,
        status: 401,
        text: async () => errorResponseText
      } as any
    })

    const result = await graphqlHandlers.executeQuery({
      spaceId: "test-space-id",
      environmentId: "master",
      query: `
        query {
          entries {
            id
          }
        }
      `
    })

    expect(result).to.have.property("isError", true)
    expect(result).to.have.property("content").that.is.an("array")
    
    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("errors").that.is.an("array")
    expect(parsedContent.errors[0].message).to.include("HTTP Error 401")
  })
  
  it("should handle GraphQL errors in successful HTTP response", async () => {
    // Define GraphQL error response
    const graphQLErrorResponse = {
      errors: [
        { message: "Field 'entries' argument 'contentType' of type 'String' is required but not provided" }
      ]
    }

    // Mock successful HTTP response but with GraphQL errors
    vi.mocked(fetch).mockImplementationOnce(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => graphQLErrorResponse
      } as any
    })

    const result = await graphqlHandlers.executeQuery({
      spaceId: "test-space-id",
      environmentId: "master",
      query: `
        query {
          entries {
            id
          }
        }
      `
    })

    expect(result).to.have.property("isError", true)
    expect(result).to.have.property("content").that.is.an("array")

    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("errors").that.is.an("array")
    expect(parsedContent.errors).to.deep.equal(graphQLErrorResponse.errors)
  })

  // Tests for new GraphQL schema exploration handlers
  describe("GraphQL Schema Exploration Handlers", () => {
    it("should list available content types", async () => {
      // Mock schema response for content type listing
      const mockContentTypesResponse = {
        data: {
          __schema: {
            queryType: {
              fields: [
                {
                  name: "articleCollection",
                  description: "Article Collection",
                  type: { kind: "OBJECT", ofType: null }
                },
                {
                  name: "productCollection",
                  description: "Product Collection",
                  type: { kind: "OBJECT", ofType: null }
                }
              ]
            }
          }
        }
      }

      // Mock successful response
      vi.mocked(fetch).mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => mockContentTypesResponse
        } as any
      })

      const result = await graphqlHandlers.listContentTypes({
        spaceId: "test-space-id",
        environmentId: "master"
      })

      // Verify result format
      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)

      const parsedContent = JSON.parse(result.content[0].text)
      expect(parsedContent).to.have.property("message")
      expect(parsedContent).to.have.property("contentTypes").that.is.an("array")
      expect(parsedContent.contentTypes).to.have.lengthOf(2)

      // Verify content type names are correctly extracted
      expect(parsedContent.contentTypes[0].name).to.equal("article")
      expect(parsedContent.contentTypes[1].name).to.equal("product")
    })

    it("should handle errors when listing content types", async () => {
      // Mock error response
      vi.mocked(fetch).mockImplementationOnce(async () => {
        return {
          ok: false,
          status: 401,
          text: async () => "Unauthorized"
        } as any
      })

      const result = await graphqlHandlers.listContentTypes({
        spaceId: "test-space-id",
        environmentId: "master"
      })

      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("HTTP Error 401")
    })

    it("should get schema for a specific content type", async () => {
      // Mock schema response for a content type
      const mockContentTypeResponse = {
        data: {
          __type: {
            name: "Article",
            description: "Article content type",
            fields: [
              {
                name: "title",
                description: "Article title",
                type: { kind: "SCALAR", name: "String", ofType: null }
              },
              {
                name: "body",
                description: "Article body",
                type: { kind: "SCALAR", name: "String", ofType: null }
              }
            ]
          }
        }
      }

      // Mock successful response
      vi.mocked(fetch).mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => mockContentTypeResponse
        } as any
      })

      const result = await graphqlHandlers.getContentTypeSchema({
        contentType: "Article",
        spaceId: "test-space-id",
        environmentId: "master"
      })

      // Verify result format
      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)

      const parsedContent = JSON.parse(result.content[0].text)
      expect(parsedContent).to.have.property("contentType", "Article")
      expect(parsedContent).to.have.property("description", "Article content type")
      expect(parsedContent).to.have.property("fields").that.is.an("array")
      expect(parsedContent.fields).to.have.lengthOf(2)

      // Verify field details
      expect(parsedContent.fields[0].name).to.equal("title")
      expect(parsedContent.fields[0].type).to.equal("String")
      expect(parsedContent.fields[1].name).to.equal("body")
    })

    it("should handle non-existent content type and try with Collection suffix", async () => {
      // First request returns no type
      vi.mocked(fetch).mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: { __type: null } })
        } as any
      })

      // Second request with Collection suffix succeeds
      vi.mocked(fetch).mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              __type: {
                name: "ArticleCollection",
                description: "Collection of Articles",
                fields: [{
                  name: "items",
                  description: "List of articles",
                  type: { kind: "LIST", name: null, ofType: { name: "Article", kind: "OBJECT" } }
                }]
              }
            }
          })
        } as any
      })

      const result = await graphqlHandlers.getContentTypeSchema({
        contentType: "Article", // Will try ArticleCollection when Article not found
        spaceId: "test-space-id",
        environmentId: "master"
      })

      expect(result).to.have.property("content").that.is.an("array")

      const parsedContent = JSON.parse(result.content[0].text)
      expect(parsedContent).to.have.property("contentType", "ArticleCollection")
      expect(parsedContent.fields[0].name).to.equal("items")
    })

    it("should generate example GraphQL queries", async () => {
      // Mock the getContentTypeSchema call so we don't have to mock fetch again
      const originalGetContentTypeSchema = graphqlHandlers.getContentTypeSchema;
      graphqlHandlers.getContentTypeSchema = vi.fn().mockResolvedValue({
        content: [{
          type: "text",
          text: JSON.stringify({
            contentType: "ArticleCollection",
            description: "Collection of Articles",
            fields: [
              { name: "items", type: "[Article]" },
              { name: "limit", type: "Int" },
              { name: "skip", type: "Int" },
              { name: "total", type: "Int" }
            ]
          })
        }]
      });

      const result = await graphqlHandlers.getExample({
        contentType: "Article",
        spaceId: "test-space-id",
        environmentId: "master"
      })

      // Restore original function
      graphqlHandlers.getContentTypeSchema = originalGetContentTypeSchema;

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content[0].text).to.include("Example query for ArticleCollection")
      // The actual content is lowercase in the generated query
      expect(result.content[0].text.toLowerCase()).to.include("articlecollection")
      expect(result.content[0].text).to.include("items")
      expect(result.content[0].text).to.include("limit")
    })

    it("should handle errors in example query generation", async () => {
      // Mock the getContentTypeSchema call to return an error
      const originalGetContentTypeSchema = graphqlHandlers.getContentTypeSchema;
      graphqlHandlers.getContentTypeSchema = vi.fn().mockResolvedValue({
        isError: true,
        content: [{ type: "text", text: "Content type not found" }]
      });

      const result = await graphqlHandlers.getExample({
        contentType: "NonExistentType",
        spaceId: "test-space-id",
        environmentId: "master"
      })

      // Restore original function
      graphqlHandlers.getContentTypeSchema = originalGetContentTypeSchema;

      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.equal("Content type not found")
    })
  })
})