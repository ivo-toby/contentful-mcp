import { describe, it, expect, vi, beforeEach } from "vitest"
import { aiActionHandlers } from "../../src/handlers/ai-action-handlers"
import { aiActionsClient } from "../../src/config/ai-actions-client"

// Mock the AI Actions client
vi.mock("../../src/config/ai-actions-client", () => ({
  aiActionsClient: {
    listAiActions: vi.fn(),
    getAiAction: vi.fn(),
    createAiAction: vi.fn(),
    updateAiAction: vi.fn(),
    deleteAiAction: vi.fn(),
    publishAiAction: vi.fn(),
    unpublishAiAction: vi.fn(),
    invokeAiAction: vi.fn(),
    getAiActionInvocation: vi.fn(),
    pollInvocation: vi.fn()
  }
}))

// Mock data
const mockAiAction = {
  sys: {
    id: "action1",
    type: "AiAction" as const,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    version: 1,
    space: { sys: { id: "space1", linkType: "Space", type: "Link" as const } },
    createdBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } },
    updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } }
  },
  name: "Test Action",
  description: "A test action",
  instruction: {
    template: "Template with {{var}}",
    variables: [{ id: "var", type: "Text" }]
  },
  configuration: {
    modelType: "gpt-4",
    modelTemperature: 0.5
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
    id: "inv1",
    type: "AiActionInvocation" as const,
    space: { sys: { id: "space1", linkType: "Space", type: "Link" as const } },
    environment: { sys: { id: "master", linkType: "Environment", type: "Link" as const } },
    aiAction: { sys: { id: "action1", linkType: "AiAction", type: "Link" as const } },
    status: "COMPLETED" as const
  },
  result: {
    type: "text" as const,
    content: "Generated content",
    metadata: {
      invocationResult: {
        aiAction: {
          sys: {
            id: "action1",
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

describe("AI Action Handlers", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should list AI Actions", async () => {
    const clientSpy = vi.mocked(aiActionsClient.listAiActions).mockResolvedValueOnce(mockAiActionCollection)
    
    const result = await aiActionHandlers.listAiActions({
      spaceId: "space1",
      limit: 10
    })
    
    expect(clientSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      limit: 10
    })
    expect(result).toEqual(mockAiActionCollection)
  })

  it("should get an AI Action", async () => {
    const clientSpy = vi.mocked(aiActionsClient.getAiAction).mockResolvedValueOnce(mockAiAction)
    
    const result = await aiActionHandlers.getAiAction({
      spaceId: "space1",
      aiActionId: "action1"
    })
    
    expect(clientSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      aiActionId: "action1"
    })
    expect(result).toEqual(mockAiAction)
  })

  it("should create an AI Action", async () => {
    const clientSpy = vi.mocked(aiActionsClient.createAiAction).mockResolvedValueOnce(mockAiAction)
    
    const actionData = {
      spaceId: "space1",
      name: "New Action",
      description: "A new action",
      instruction: {
        template: "Template",
        variables: []
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.5
      }
    }
    
    const result = await aiActionHandlers.createAiAction(actionData)
    
    expect(clientSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      actionData: {
        name: "New Action",
        description: "A new action",
        instruction: {
          template: "Template",
          variables: []
        },
        configuration: {
          modelType: "gpt-4",
          modelTemperature: 0.5
        }
      }
    })
    expect(result).toEqual(mockAiAction)
  })

  it("should update an AI Action", async () => {
    vi.mocked(aiActionsClient.getAiAction).mockResolvedValueOnce(mockAiAction)
    const updateSpy = vi.mocked(aiActionsClient.updateAiAction).mockResolvedValueOnce({
      ...mockAiAction,
      name: "Updated Action"
    })
    
    const actionData = {
      spaceId: "space1",
      aiActionId: "action1",
      name: "Updated Action",
      description: "An updated action",
      instruction: {
        template: "Updated template",
        variables: []
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.7
      }
    }
    
    const result = await aiActionHandlers.updateAiAction(actionData)
    
    expect(updateSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      aiActionId: "action1",
      version: 1,
      actionData: {
        name: "Updated Action",
        description: "An updated action",
        instruction: {
          template: "Updated template",
          variables: []
        },
        configuration: {
          modelType: "gpt-4",
          modelTemperature: 0.7
        }
      }
    })
    expect(result).toEqual({
      ...mockAiAction,
      name: "Updated Action"
    })
  })

  it("should delete an AI Action", async () => {
    vi.mocked(aiActionsClient.getAiAction).mockResolvedValueOnce(mockAiAction)
    const deleteSpy = vi.mocked(aiActionsClient.deleteAiAction).mockResolvedValueOnce()
    
    const result = await aiActionHandlers.deleteAiAction({
      spaceId: "space1",
      aiActionId: "action1"
    })
    
    expect(deleteSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      aiActionId: "action1",
      version: 1
    })
    expect(result).toEqual({ success: true })
  })

  it("should publish an AI Action", async () => {
    vi.mocked(aiActionsClient.getAiAction).mockResolvedValueOnce(mockAiAction)
    const publishSpy = vi.mocked(aiActionsClient.publishAiAction).mockResolvedValueOnce({
      ...mockAiAction,
      sys: {
        ...mockAiAction.sys,
        publishedAt: "2023-01-03T00:00:00Z",
        publishedVersion: 1
      }
    })
    
    const result = await aiActionHandlers.publishAiAction({
      spaceId: "space1",
      aiActionId: "action1"
    })
    
    expect(publishSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      aiActionId: "action1",
      version: 1
    })
    expect(result).toHaveProperty("sys.publishedAt", "2023-01-03T00:00:00Z")
  })

  it("should unpublish an AI Action", async () => {
    const unpublishSpy = vi.mocked(aiActionsClient.unpublishAiAction).mockResolvedValueOnce(mockAiAction)
    
    const result = await aiActionHandlers.unpublishAiAction({
      spaceId: "space1",
      aiActionId: "action1"
    })
    
    expect(unpublishSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      aiActionId: "action1"
    })
    expect(result).toEqual(mockAiAction)
  })

  it("should invoke an AI Action with key-value variables", async () => {
    const invokeSpy = vi.mocked(aiActionsClient.invokeAiAction).mockResolvedValueOnce(mockInvocation)
    
    const result = await aiActionHandlers.invokeAiAction({
      spaceId: "space1",
      aiActionId: "action1",
      variables: {
        var1: "value1",
        var2: "value2"
      }
    })
    
    expect(invokeSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      environmentId: undefined,
      aiActionId: "action1",
      invocationData: {
        outputFormat: "Markdown",
        variables: [
          { id: "var1", value: "value1" },
          { id: "var2", value: "value2" }
        ]
      }
    })
    expect(result).toEqual(mockInvocation)
  })

  it("should invoke an AI Action with raw variables", async () => {
    const invokeSpy = vi.mocked(aiActionsClient.invokeAiAction).mockResolvedValueOnce(mockInvocation)
    
    const rawVariables = [
      {
        id: "refVar",
        value: {
          entityType: "Entry",
          entityId: "entry123"
        }
      }
    ]
    
    const result = await aiActionHandlers.invokeAiAction({
      spaceId: "space1",
      aiActionId: "action1",
      rawVariables
    })
    
    expect(invokeSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      environmentId: undefined,
      aiActionId: "action1",
      invocationData: {
        outputFormat: "Markdown",
        variables: rawVariables
      }
    })
    expect(result).toEqual(mockInvocation)
  })

  it("should poll for completion when invoking asynchronously", async () => {
    const inProgressInvocation = {
      ...mockInvocation,
      sys: {
        ...mockInvocation.sys,
        status: "IN_PROGRESS"
      },
      result: undefined
    }
    
    vi.mocked(aiActionsClient.invokeAiAction).mockResolvedValueOnce(inProgressInvocation)
    vi.mocked(aiActionsClient.pollInvocation).mockResolvedValueOnce(mockInvocation)
    
    const result = await aiActionHandlers.invokeAiAction({
      spaceId: "space1",
      aiActionId: "action1",
      variables: { var: "value" },
      waitForCompletion: true
    })
    
    expect(aiActionsClient.pollInvocation).toHaveBeenCalledWith({
      spaceId: "space1",
      environmentId: undefined,
      aiActionId: "action1",
      invocationId: "inv1"
    })
    expect(result).toEqual(mockInvocation)
  })

  it("should not poll when waitForCompletion is false", async () => {
    const inProgressInvocation = {
      ...mockInvocation,
      sys: {
        ...mockInvocation.sys,
        status: "IN_PROGRESS"
      },
      result: undefined
    }
    
    vi.mocked(aiActionsClient.invokeAiAction).mockResolvedValueOnce(inProgressInvocation)
    
    const result = await aiActionHandlers.invokeAiAction({
      spaceId: "space1",
      aiActionId: "action1",
      variables: { var: "value" },
      waitForCompletion: false
    })
    
    expect(aiActionsClient.pollInvocation).not.toHaveBeenCalled()
    expect(result).toEqual(inProgressInvocation)
  })

  it("should get an AI Action invocation", async () => {
    const getSpy = vi.mocked(aiActionsClient.getAiActionInvocation).mockResolvedValueOnce(mockInvocation)
    
    const result = await aiActionHandlers.getAiActionInvocation({
      spaceId: "space1",
      aiActionId: "action1",
      invocationId: "inv1"
    })
    
    expect(getSpy).toHaveBeenCalledWith({
      spaceId: "space1",
      environmentId: undefined,
      aiActionId: "action1",
      invocationId: "inv1"
    })
    expect(result).toEqual(mockInvocation)
  })

  it("should handle errors correctly", async () => {
    vi.mocked(aiActionsClient.getAiAction).mockRejectedValueOnce({
      message: "Not found",
      response: {
        data: {
          message: "AI Action not found"
        }
      }
    })
    
    const result = await aiActionHandlers.getAiAction({
      spaceId: "space1",
      aiActionId: "nonexistent"
    })
    
    expect(result).toEqual({
      isError: true,
      message: "AI Action not found"
    })
  })
})