import { expect, vi, describe, it, beforeAll, afterAll, beforeEach } from "vitest"
import { graphqlHandlers, setGraphQLSchema } from "../../src/handlers/graphql-handlers.js"
import { buildSchema } from "graphql"

// Mock fetch globally for these tests
vi.mock("undici", async () => {
  const actual = await vi.importActual("undici")
  return {
    ...actual,
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

  type Query {
    assets(limit: Int): [Asset]
  }
`)

describe("GraphQL Handler Variables Test", () => {
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
    vi.clearAllMocks()
  })
  
  afterAll(() => {
    // Clean up environment variables
    delete process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID
  })
  
  it("should execute a GraphQL query with variables", async () => {
    // Mock successful fetch response for assets query
    const mockAssetsResponse = {
      data: {
        assets: [
          { title: "Test Asset", description: "This is a test asset", url: "https://example.com/image.jpg" }
        ]
      }
    }
    
    // Configure mock fetch to return successful response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockAssetsResponse
    } as any)
    
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
    
    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1)
    
    // Verify the request contained the variables
    const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1].body as string)
    expect(callBody).to.have.property('variables')
    expect(callBody.variables).to.deep.equal({ limit: 5 })
    
    // Verify the result
    expect(result).to.have.property("content").that.is.an("array")
    const parsedContent = JSON.parse(result.content[0].text)
    expect(parsedContent).to.have.property("data")
    expect(parsedContent.data.assets[0]).to.have.property("title", "Test Asset")
  })
})