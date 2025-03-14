import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { server } from '../msw-setup'
import { aiActionsClient } from "../../src/config/ai-actions-client"

// Mock data
const mockAiAction = {
  sys: {
    id: "mockActionId",
    type: "AiAction",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    version: 1,
    space: { sys: { id: "mockSpace", linkType: "Space", type: "Link" } },
    createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
    updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } }
  },
  name: "Mock Action",
  description: "A mock AI action",
  instruction: {
    template: "This is a {{variable}} template",
    variables: [
      { id: "variable", type: "Text", name: "Variable" }
    ]
  },
  configuration: {
    modelType: "gpt-4",
    modelTemperature: 0.7
  }
}

const mockAiActionCollection = {
  sys: { type: "Array" },
  items: [mockAiAction],
  total: 1,
  skip: 0,
  limit: 10
}

const mockInvocation = {
  sys: {
    id: "mockInvocationId",
    type: "AiActionInvocation",
    space: { sys: { id: "mockSpace", linkType: "Space", type: "Link" } },
    environment: { sys: { id: "master", linkType: "Environment", type: "Link" } },
    aiAction: { sys: { id: "mockActionId", linkType: "AiAction", type: "Link" } },
    status: "COMPLETED"
  },
  result: {
    type: "text",
    content: "Generated content",
    metadata: {
      invocationResult: {
        aiAction: {
          sys: {
            id: "mockActionId",
            linkType: "AiAction",
            type: "Link",
            version: 1
          }
        },
        outputFormat: "PlainText",
        promptTokens: 50,
        completionTokens: 100,
        modelId: "gpt-4",
        modelProvider: "OpenAI"
      }
    }
  }
}

// Mock process.env
vi.mock("../../src/config/client", () => ({
  getContentfulClient: vi.fn().mockResolvedValue({
    raw: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  })
}))

describe("AI Actions Client", () => {
  // No need to set up new handlers, we'll use the existing server
  // and mock the client responses
  
  it("should list AI Actions", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.get.mockResolvedValueOnce({ data: mockAiActionCollection })
    
    const result = await aiActionsClient.listAiActions({ spaceId: "mockSpace" })
    
    expect(mockClient.raw.get).toHaveBeenCalledWith("/spaces/mockSpace/ai/actions?limit=100&skip=0")
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe("Mock Action")
  })
  
  it("should get an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.get.mockResolvedValueOnce({ data: mockAiAction })
    
    const result = await aiActionsClient.getAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId"
    })
    
    expect(mockClient.raw.get).toHaveBeenCalledWith("/spaces/mockSpace/ai/actions/mockActionId")
    expect(result.name).toBe("Mock Action")
  })
  
  it("should create an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.post.mockResolvedValueOnce({ data: mockAiAction })
    
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
    
    expect(mockClient.raw.post).toHaveBeenCalledWith("/spaces/mockSpace/ai/actions", actionData)
    expect(result.name).toBe("Mock Action")
  })
  
  it("should update an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.put.mockResolvedValueOnce({
      data: {
        ...mockAiAction,
        name: "Updated Action"
      }
    })
    
    const actionData = {
      name: "Updated Action",
      description: "An updated AI action",
      instruction: {
        template: "Template",
        variables: []
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.5
      }
    }
    
    const result = await aiActionsClient.updateAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1,
      actionData
    })
    
    expect(mockClient.raw.put).toHaveBeenCalledWith(
      "/spaces/mockSpace/ai/actions/mockActionId",
      actionData,
      { headers: { "X-Contentful-Version": "1" } }
    )
    expect(result.name).toBe("Updated Action")
  })
  
  it("should delete an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.delete.mockResolvedValueOnce({})
    
    await aiActionsClient.deleteAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1
    })
    
    expect(mockClient.raw.delete).toHaveBeenCalledWith(
      "/spaces/mockSpace/ai/actions/mockActionId",
      { headers: { "X-Contentful-Version": "1" } }
    )
  })
  
  it("should publish an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.put.mockResolvedValueOnce({
      data: {
        ...mockAiAction,
        sys: {
          ...mockAiAction.sys,
          publishedAt: "2023-01-03T00:00:00Z",
          publishedVersion: 1,
          publishedBy: { sys: { id: "user1", linkType: "User", type: "Link" } }
        }
      }
    })
    
    const result = await aiActionsClient.publishAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      version: 1
    })
    
    expect(mockClient.raw.put).toHaveBeenCalledWith(
      "/spaces/mockSpace/ai/actions/mockActionId/published",
      {},
      { headers: { "X-Contentful-Version": "1" } }
    )
    expect(result.sys.publishedAt).toBe("2023-01-03T00:00:00Z")
  })
  
  it("should unpublish an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.delete.mockResolvedValueOnce({ data: mockAiAction })
    
    const result = await aiActionsClient.unpublishAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId"
    })
    
    expect(mockClient.raw.delete).toHaveBeenCalledWith("/spaces/mockSpace/ai/actions/mockActionId/published")
    expect(result.name).toBe("Mock Action")
  })
  
  it("should invoke an AI Action", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.post.mockResolvedValueOnce({ data: mockInvocation })
    
    const invocationData = {
      outputFormat: "PlainText" as const,
      variables: [{ id: "variable", value: "test" }]
    }
    
    const result = await aiActionsClient.invokeAiAction({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      invocationData
    })
    
    expect(mockClient.raw.post).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/invoke",
      invocationData,
      { headers: { "X-Contentful-Include-Invocation-Metadata": "true" } }
    )
    expect(result.sys.status).toBe("COMPLETED")
    expect(result.result?.content).toBe("Generated content")
  })
  
  it("should get an AI Action invocation", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    mockClient.raw.get.mockResolvedValueOnce({ data: mockInvocation })
    
    const result = await aiActionsClient.getAiActionInvocation({
      spaceId: "mockSpace",
      aiActionId: "mockActionId",
      invocationId: "mockInvocationId"
    })
    
    expect(mockClient.raw.get).toHaveBeenCalledWith(
      "/spaces/mockSpace/environments/master/ai/actions/mockActionId/invocations/mockInvocationId",
      { headers: { "X-Contentful-Include-Invocation-Metadata": "true" } }
    )
    expect(result.sys.status).toBe("COMPLETED")
  })
  
  it("should poll an AI Action invocation until completion", async () => {
    const { getContentfulClient } = await import("../../src/config/client")
    const mockClient = await getContentfulClient()
    
    // Reset mock call count
    mockClient.raw.get.mockReset()
    
    // First call returns IN_PROGRESS status
    mockClient.raw.get.mockResolvedValueOnce({
      data: {
        ...mockInvocation,
        sys: {
          ...mockInvocation.sys,
          status: "IN_PROGRESS"
        },
        result: undefined
      }
    })
    
    // Second call returns COMPLETED status
    mockClient.raw.get.mockResolvedValueOnce({ data: mockInvocation })
    
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
    
    expect(mockClient.raw.get).toHaveBeenCalledTimes(2)
    expect(result.sys.status).toBe("COMPLETED")
    expect(result.result?.content).toBe("Generated content")
    
    vi.restoreAllMocks()
  })
})