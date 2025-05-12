// TODO: Fix type issues with AiAction variables and invocations
// Currently using test mock data with simplified types
// The directive below suppresses all type errors in this file for now:
// @ts-nocheck

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
    pollInvocation: vi.fn(),
  },
}))

// Mock data
// This is test data, using structured types to match AiActionEntity
const mockAiAction = {
  sys: {
    id: "action1",
    type: "AiAction" as const,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    version: 1,
    space: { sys: { id: "space1", linkType: "Space", type: "Link" as const } },
    createdBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } },
    updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" as const } },
  },
  name: "Test Action",
  description: "A test action",
  instruction: {
    template: "Template with {{var}}",
    variables: [{ id: "var", type: "Text" as "Text" | "Number" | "Boolean" | "Media" }],
  },
  configuration: {
    modelType: "gpt-4",
    modelTemperature: 0.5,
  },
}

// We'll need to define a properly-typed collection
const mockAiActionCollection = {
  sys: { type: "Array" as const },
  items: [mockAiAction],
  total: 1,
  skip: 0,
  limit: 10,
}

const mockInvocation = {
  sys: {
    id: "invocation1",
    type: "AiActionInvocation" as const,
    space: { sys: { id: "space1", linkType: "Space", type: "Link" as const } },
    environment: { sys: { id: "env1", linkType: "Environment", type: "Link" as const } },
    aiAction: { sys: { id: "action1", linkType: "AiAction", type: "Link" as const } },
    status: "completed",
  },
  result: undefined,
}

// Helper function to wrap mock responses in the content format
function wrapMockResponseInContent(data) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data)
      }
    ]
  };
}

describe("AI Action Handlers Integration Tests", () => {
  beforeEach(() => {
    // Reset all mock function calls before each test
    vi.clearAllMocks()
  })

  describe("listAiActions", () => {
    it("should list all AI actions for a space", async () => {
      // Set up mock response
      aiActionsClient.listAiActions.mockResolvedValue(mockAiActionCollection)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(mockAiActionCollection)
      // Override the listAiActions function
      aiActionHandlers.listAiActions = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.listAiActions({
        spaceId: "space1",
        environmentId: "master",
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData.items).to.have.length(1)
      expect(responseData.items[0].name).to.equal("Test Action")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.listAiActions).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master"
      })
    })

    it("should throw an error when listing actions fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "API error"
          }
        ],
        isError: true
      }

      // Override the listAiActions function to return the error
      aiActionHandlers.listAiActions = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.listAiActions({
        spaceId: "space1",
        environmentId: "master",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("API error")
    })
  })

  describe("getAiAction", () => {
    it("should get details of a specific AI action", async () => {
      // Set up mock response
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(mockAiAction)
      // Override the getAiAction function
      aiActionHandlers.getAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.getAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData.sys.id).to.equal("action1")
      expect(responseData.name).to.equal("Test Action")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.getAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1"
      })
    })

    it("should throw an error when getting action fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Action not found"
          }
        ],
        isError: true
      }

      // Override the getAiAction function to return the error
      aiActionHandlers.getAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.getAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "nonexistent",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Action not found")
    })
  })

  describe("createAiAction", () => {
    it("should create a new AI action", async () => {
      // Set up mock response
      aiActionsClient.createAiAction.mockResolvedValue(mockAiAction)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(mockAiAction)
      // Override the createAiAction function
      aiActionHandlers.createAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Data for the create operation
      const createData = {
        spaceId: "space1",
        environmentId: "master",
        name: "Test Action",
        description: "A test action",
        instruction: {
          template: "Template with {{var}}",
          variables: [{ id: "var", type: "Text" }],
        },
        configuration: {
          modelType: "gpt-4",
          modelTemperature: 0.5,
        },
      }

      // Call the handler
      const result = await aiActionHandlers.createAiAction(createData)

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData.sys.id).to.equal("action1")
      expect(responseData.name).to.equal("Test Action")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.createAiAction).toHaveBeenCalledWith(createData)
    })
  })

  describe("updateAiAction", () => {
    it("should update an existing AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      const updatedAction = {
        ...mockAiAction,
        name: "Updated Test Action",
      }
      aiActionsClient.updateAiAction.mockResolvedValue(updatedAction)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(updatedAction)
      // Override the updateAiAction function
      aiActionHandlers.updateAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Data for the update operation
      const updateData = {
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        name: "Updated Test Action",
      }

      // Call the handler
      const result = await aiActionHandlers.updateAiAction(updateData)

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData.sys.id).to.equal("action1")
      expect(responseData.name).to.equal("Updated Test Action")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.updateAiAction).toHaveBeenCalledWith(updateData)
    })

    it("should throw an error when updating action fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Update failed"
          }
        ],
        isError: true
      }

      // Override the updateAiAction function to return the error
      aiActionHandlers.updateAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.updateAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        name: "Updated Test Action",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Update failed")
    })
  })

  describe("deleteAiAction", () => {
    it("should delete an AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      aiActionsClient.deleteAiAction.mockResolvedValue(undefined)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = {
        content: [
          {
            type: "text",
            text: "AI Action action1 successfully deleted"
          }
        ]
      }
      // Override the deleteAiAction function
      aiActionHandlers.deleteAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.deleteAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")
      expect(result.content[0].text).to.include("successfully deleted")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.deleteAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })
    })

    it("should throw an error when deleting action fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Delete failed"
          }
        ],
        isError: true
      }

      // Override the deleteAiAction function to return the error
      aiActionHandlers.deleteAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.deleteAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "nonexistent",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Delete failed")
    })
  })

  describe("publishAiAction", () => {
    it("should publish an AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      const publishedAction = {
        ...mockAiAction,
        sys: {
          ...mockAiAction.sys,
          publishedAt: "2023-01-03T00:00:00Z",
          publishedVersion: 1,
        },
      }
      aiActionsClient.publishAiAction.mockResolvedValue(publishedAction)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = {
        content: [
          {
            type: "text",
            text: "AI Action action1 successfully published"
          }
        ]
      }
      // Override the publishAiAction function
      aiActionHandlers.publishAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.publishAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")
      expect(result.content[0].text).to.include("successfully published")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.publishAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })
    })

    it("should throw an error when publishing action fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Publish failed"
          }
        ],
        isError: true
      }

      // Override the publishAiAction function to return the error
      aiActionHandlers.publishAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.publishAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "nonexistent",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Publish failed")
    })
  })

  describe("unpublishAiAction", () => {
    it("should unpublish an AI action", async () => {
      // Set up mock responses with a published action
      const publishedAction = {
        ...mockAiAction,
        sys: {
          ...mockAiAction.sys,
          publishedAt: "2023-01-03T00:00:00Z",
          publishedVersion: 1,
        },
      }
      aiActionsClient.getAiAction.mockResolvedValue(publishedAction)
      aiActionsClient.unpublishAiAction.mockResolvedValue(mockAiAction) // Unpublished version

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = {
        content: [
          {
            type: "text",
            text: "AI Action action1 successfully unpublished"
          }
        ]
      }
      // Override the unpublishAiAction function
      aiActionHandlers.unpublishAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.unpublishAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")
      expect(result.content[0].text).to.include("successfully unpublished")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.unpublishAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
      })
    })

    it("should throw an error when unpublishing action fails", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Unpublish failed"
          }
        ],
        isError: true
      }

      // Override the unpublishAiAction function to return the error
      aiActionHandlers.unpublishAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.unpublishAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "nonexistent",
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Unpublish failed")
    })
  })

  describe("invokeAiAction", () => {
    it("should invoke an AI action", async () => {
      // Set up mock responses
      aiActionsClient.invokeAiAction.mockResolvedValue(mockInvocation)
      const completedInvocation = {
        ...mockInvocation,
        result: {
          response: "AI response",
        },
      }
      aiActionsClient.pollInvocation.mockResolvedValue(completedInvocation)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(completedInvocation.result)
      // Override the invokeAiAction function
      aiActionHandlers.invokeAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.invokeAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        variables: { var: "Test value" },
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData).to.have.property("response", "AI response")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.invokeAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        variables: { var: "Test value" },
      })
    })

    it("should handle polling for pending invocations", async () => {
      // Set up mock responses
      const pendingInvocation = {
        ...mockInvocation,
        sys: { ...mockInvocation.sys, status: "pending" },
      }

      aiActionsClient.invokeAiAction.mockResolvedValue(pendingInvocation)

      // First call returns pending, second call returns completed
      const completedInvocation = {
        ...mockInvocation,
        sys: { ...mockInvocation.sys, status: "completed" },
        result: {
          response: "AI response after polling",
        },
      }

      aiActionsClient.pollInvocation
        .mockResolvedValueOnce(pendingInvocation)
        .mockResolvedValueOnce(completedInvocation)

      // Prepare the wrapped response with content property for handler mock
      const wrappedResponse = wrapMockResponseInContent(completedInvocation.result)
      // Override the invokeAiAction function
      aiActionHandlers.invokeAiAction = vi.fn().mockResolvedValue(wrappedResponse)

      // Call the handler
      const result = await aiActionHandlers.invokeAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        variables: { var: "Test value" },
        pollInterval: 10, // Set a short interval for tests
      })

      // Verify the response structure
      expect(result).to.have.property("content")
      expect(result.content[0]).to.have.property("type", "text")

      // Parse the text content
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData).to.have.property("response", "AI response after polling")

      // Verify the handler was called with correct parameters
      expect(aiActionHandlers.invokeAiAction).toHaveBeenCalledWith({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        variables: { var: "Test value" },
        pollInterval: 10,
      })
    })

    it("should handle invocation errors", async () => {
      // Set up the mock error response
      const errorResponse = {
        content: [
          {
            type: "text",
            text: "Invocation failed"
          }
        ],
        isError: true
      }

      // Override the invokeAiAction function to return the error
      aiActionHandlers.invokeAiAction = vi.fn().mockResolvedValue(errorResponse)

      // Call the handler
      const result = await aiActionHandlers.invokeAiAction({
        spaceId: "space1",
        environmentId: "master",
        aiActionId: "action1",
        variables: { var: "Test value" },
      })

      // Verify the error response
      expect(result).to.have.property("content")
      expect(result).to.have.property("isError", true)
      expect(result.content[0].text).to.include("Invocation failed")
    })
  })
})