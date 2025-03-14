import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the client module first, before any other imports
vi.mock("../../src/config/client", () => {
  // Create mock functions for the raw client
  const mockRawClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  
  return {
    getContentfulClient: vi.fn().mockResolvedValue({ 
      raw: mockRawClient 
    })
  }
})

// Now import the client that will use the mocked getContentfulClient
import { aiActionsClient } from "../../src/config/ai-actions-client"
import { getContentfulClient } from "../../src/config/client"

// Constants for alpha header (for test assertions)
const ALPHA_HEADER_NAME = 'X-Contentful-Enable-Alpha-Feature'
const ALPHA_HEADER_VALUE = 'ai-service'

// Mock data with const assertions for TypeScript
const mockAiAction = {
  sys: {
    id: "mockActionId",
    type: "AiAction" as const,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    version: 1,
    space: { sys: { id: "mockSpace", linkType: "Space", type: "Link" as const } },
    createdBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } },
    updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } }
  },
  name: "Mock Action",
  description: "A mock AI action",
  instruction: {
    template: "This is a template with {{variable}}",
    variables: [
      { id: "variable", type: "Text" as const, name: "Variable" }
    ]
  },
  configuration: {
    modelType: "gpt-4",
    modelTemperature: 0.7
  }
}

const mockAiActionCollection = {
  sys: { type: "Array" as const },
  items: [mockAiAction],
  total: 1,
  skip: 0,
  limit: 10
}

const mockInvocation = {
  sys: {
    id: "mockInvocationId",
    type: "AiActionInvocation" as const,
    space: { sys: { id: "mockSpace", linkType: "Space", type: "Link" as const } },
    environment: { sys: { id: "master", linkType: "Environment", type: "Link" as const } },
    aiAction: { sys: { id: "mockActionId", linkType: "AiAction", type: "Link" as const } },
    status: "COMPLETED" as const
  },
  result: {
    type: "text" as const,
    content: "Generated content",
    metadata: {
      invocationResult: {
        aiAction: {
          sys: {
            id: "mockActionId",
            linkType: "AiAction",
            type: "Link" as const,
            version: 1
          }
        },
        outputFormat: "PlainText" as const,
        promptTokens: 50,
        completionTokens: 100,
        modelId: "gpt-4",
        modelProvider: "OpenAI"
      }
    }
  }
}

describe("AI Actions Client", () => {
  let mockClientRaw: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked client to work with in tests
    const client = await getContentfulClient()
    mockClientRaw = client.raw
  })

  it("should list AI Actions with alpha header", async () => {
    mockClientRaw.get.mockResolvedValueOnce({ data: mockAiActionCollection })
    
    const result = await aiActionsClient.listAiActions({ spaceId: "mockSpace" })
    
    // Verify the alpha header was included
    expect(mockClientRaw.get).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions?limit=100&skip=0", 
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE
        })
      })
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe("Mock Action")
  })
  
  it("should get an AI Action with alpha header", async () => {
    mockClientRaw.get.mockResolvedValueOnce({ data: mockAiAction })
    
    const result = await aiActionsClient.getAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId"
    })
    
    expect(mockClientRaw.get).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId",
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE
        })
      })
    )
    expect(result.name).toBe("Mock Action")
  })
  
  it("should create an AI Action with alpha header", async () => {
    mockClientRaw.post.mockResolvedValueOnce({ data: mockAiAction })
    
    const actionData = {
      name: "New Action",
      description: "A new AI action",
      instruction: {
        template: "Template",
        variables: []
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.5
      }
    }
    
    const result = await aiActionsClient.createAiAction({
      spaceId: "mockSpace",
      actionData
    })
    
    expect(mockClientRaw.post).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions", 
      actionData,
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE
        })
      })
    )
    expect(result.name).toBe("Mock Action")
  })
  
  it("should update an AI Action with alpha header", async () => {
    mockClientRaw.get.mockResolvedValueOnce({ data: mockAiAction })
    mockClientRaw.put.mockResolvedValueOnce({
      data: {
        ...mockAiAction,
        name: "Updated Action"
      }
    })
    
    const actionData = {
      name: "Updated Action",
      description: "An updated AI action",
      instruction: {
        template: "Updated template",
        variables: []
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.7
      }
    }
    
    const result = await aiActionsClient.updateAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1,
      actionData
    })
    
    expect(mockClientRaw.put).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId",
      actionData,
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Version": "1"
        })
      })
    )
    expect(result).toHaveProperty("name", "Updated Action")
  })
  
  it("should delete an AI Action with alpha header", async () => {
    mockClientRaw.get.mockResolvedValueOnce({ data: mockAiAction })
    mockClientRaw.delete.mockResolvedValueOnce({})
    
    await aiActionsClient.deleteAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1
    })
    
    expect(mockClientRaw.delete).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId",
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Version": "1"
        })
      })
    )
  })
  
  it("should publish an AI Action with alpha header", async () => {
    mockClientRaw.get.mockResolvedValueOnce({ data: mockAiAction })
    mockClientRaw.put.mockResolvedValueOnce({
      data: {
        ...mockAiAction,
        sys: {
          ...mockAiAction.sys,
          publishedAt: "2023-01-03T00:00:00Z",
          publishedVersion: 1,
          publishedBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } }
        }
      }
    })
    
    const result = await aiActionsClient.publishAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1
    })
    
    expect(mockClientRaw.put).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/published",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Version": "1"
        })
      })
    )
    expect(result.sys).toHaveProperty("publishedAt", "2023-01-03T00:00:00Z")
  })
  
  it("should unpublish an AI Action with alpha header", async () => {
    mockClientRaw.delete.mockResolvedValueOnce({ data: mockAiAction })
    
    const result = await aiActionsClient.unpublishAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId"
    })
    
    expect(mockClientRaw.delete).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/published",
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE
        })
      })
    )
    expect(result.name).toBe("Mock Action")
  })
  
  it("should invoke an AI Action with alpha header", async () => {
    mockClientRaw.post.mockResolvedValueOnce({ data: mockInvocation })
    
    const invocationData = {
      outputFormat: "PlainText" as const,
      variables: [{ id: "variable", value: "test" }]
    }
    
    const result = await aiActionsClient.invokeAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      invocationData
    })
    
    expect(mockClientRaw.post).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/invoke",
      invocationData,
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Include-Invocation-Metadata": "true"
        })
      })
    )
    expect(result.sys.status).toBe("COMPLETED")
    expect(result.result?.content).toBe("Generated content")
  })
  
  it("should get an AI Action invocation with alpha header", async () => {
    // Make sure we reset the mock to avoid any previous mock calls affecting this test
    mockClientRaw.get.mockReset()
    
    // Mock with the correct invocation response
    mockClientRaw.get.mockResolvedValueOnce({ data: mockInvocation })
    
    const result = await aiActionsClient.getAiActionInvocation({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      invocationId: "mockInvocationId"
    })
    
    // Verify the correct API endpoint was called with the alpha header
    expect(mockClientRaw.get).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/invocations/mockInvocationId",
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Include-Invocation-Metadata": "true"
        })
      })
    )
    
    // Just check critical properties rather than exact equality
    expect(result.sys.id).toBe("mockInvocationId")
    expect(result.sys.type).toBe("AiActionInvocation")
    expect(result.sys.status).toBe("COMPLETED")
    expect(result.result?.content).toBe("Generated content")
  })
  
  it("should poll an AI Action invocation with alpha header", async () => {
    // Reset mock call count
    mockClientRaw.get.mockReset()
    
    // First call returns IN_PROGRESS status
    mockClientRaw.get.mockResolvedValueOnce({
      data: {
        ...mockInvocation,
        sys: {
          ...mockInvocation.sys,
          status: "IN_PROGRESS" as const
        },
        result: undefined
      }
    })
    
    // Second call returns COMPLETED status
    mockClientRaw.get.mockResolvedValueOnce({ data: mockInvocation })
    
    // Spy on setTimeout to avoid actual waiting
    vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
      callback()
      return {} as any
    })
    
    const result = await aiActionsClient.pollInvocation({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      invocationId: "mockInvocationId"
    }, 2, 100, 100)
    
    // Verify both API calls included the alpha header
    expect(mockClientRaw.get).toHaveBeenCalledTimes(2)
    expect(mockClientRaw.get).toHaveBeenNthCalledWith(
      1,
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/invocations/mockInvocationId",
      expect.objectContaining({
        headers: expect.objectContaining({
          [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
          "X-Contentful-Include-Invocation-Metadata": "true"
        })
      })
    )
    
    expect(result.sys.status).toBe("COMPLETED")
    expect(result.result?.content).toBe("Generated content")
    
    vi.restoreAllMocks()
  })
})