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

describe("AI Action Handlers Integration Tests", () => {
  beforeEach(() => {
    // Reset all mock function calls before each test
    vi.clearAllMocks()
  })

  describe("listAiActions", () => {
    it("should list all AI actions for a space", async () => {
      // Set up mock response
      aiActionsClient.listAiActions.mockResolvedValue(mockAiActionCollection)

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.listAiActions).toHaveBeenCalledWith("space1", "master")
    })

    it("should throw an error when listing actions fails", async () => {
      // Set up mock response
      aiActionsClient.listAiActions.mockRejectedValue(new Error("API error"))

      // Call the handler and expect it to throw
      try {
        await aiActionHandlers.listAiActions({
          spaceId: "space1",
          environmentId: "master",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.include("API error")
      }
    })
  })

  describe("getAiAction", () => {
    it("should get details of a specific AI action", async () => {
      // Set up mock response
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.getAiAction).toHaveBeenCalledWith("space1", "master", "action1")
    })

    it("should throw an error when getting action fails", async () => {
      // Set up mock response
      aiActionsClient.getAiAction.mockRejectedValue(new Error("Action not found"))

      // Call the handler and expect it to throw
      try {
        await aiActionHandlers.getAiAction({
          spaceId: "space1",
          environmentId: "master",
          aiActionId: "nonexistent",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.include("Action not found")
      }
    })
  })

  describe("createAiAction", () => {
    it("should create a new AI action", async () => {
      // Set up mock response
      aiActionsClient.createAiAction.mockResolvedValue(mockAiAction)

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.createAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        expect.objectContaining({
          name: "Test Action",
          description: "A test action",
        })
      )
    })
  })

  describe("updateAiAction", () => {
    it("should update an existing AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      aiActionsClient.updateAiAction.mockResolvedValue({
        ...mockAiAction,
        name: "Updated Test Action",
      })

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.updateAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        "action1",
        expect.objectContaining({
          name: "Updated Test Action",
        }),
        1 // version
      )
    })
  })

  describe("deleteAiAction", () => {
    it("should delete an AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      aiActionsClient.deleteAiAction.mockResolvedValue(undefined)

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.deleteAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        "action1",
        1 // version
      )
    })
  })

  describe("publishAiAction", () => {
    it("should publish an AI action", async () => {
      // Set up mock responses
      aiActionsClient.getAiAction.mockResolvedValue(mockAiAction)
      aiActionsClient.publishAiAction.mockResolvedValue({
        ...mockAiAction,
        sys: {
          ...mockAiAction.sys,
          publishedAt: "2023-01-03T00:00:00Z",
          publishedVersion: 1,
        },
      })

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.publishAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        "action1",
        1 // version
      )
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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.unpublishAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        "action1",
        expect.any(Number) // version
      )
    })
  })

  describe("invokeAiAction", () => {
    it("should invoke an AI action", async () => {
      // Set up mock responses
      aiActionsClient.invokeAiAction.mockResolvedValue(mockInvocation)
      aiActionsClient.pollInvocation.mockResolvedValue({
        ...mockInvocation,
        result: {
          response: "AI response",
        },
      })

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

      // Verify the client was called with correct parameters
      expect(aiActionsClient.invokeAiAction).toHaveBeenCalledWith(
        "space1",
        "master",
        "action1",
        { var: "Test value" }
      )
      expect(aiActionsClient.pollInvocation).toHaveBeenCalled()
    })

    it("should handle polling for pending invocations", async () => {
      // Set up mock responses
      aiActionsClient.invokeAiAction.mockResolvedValue({
        ...mockInvocation,
        sys: { ...mockInvocation.sys, status: "pending" },
      })
      
      // First call returns pending, second call returns completed
      aiActionsClient.pollInvocation
        .mockResolvedValueOnce({
          ...mockInvocation,
          sys: { ...mockInvocation.sys, status: "pending" },
        })
        .mockResolvedValueOnce({
          ...mockInvocation,
          sys: { ...mockInvocation.sys, status: "completed" },
          result: {
            response: "AI response after polling",
          },
        })

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
      const responseData = JSON.parse(result.content[0].text)
      expect(responseData).to.have.property("response", "AI response after polling")

      // Verify polling was called multiple times
      expect(aiActionsClient.pollInvocation).toHaveBeenCalledTimes(2)
    })

    it("should handle invocation errors", async () => {
      // Set up mock error response
      aiActionsClient.invokeAiAction.mockRejectedValue(new Error("Invocation failed"))

      // Call the handler and expect it to throw
      try {
        await aiActionHandlers.invokeAiAction({
          spaceId: "space1",
          environmentId: "master",
          aiActionId: "action1",
          variables: { var: "Test value" },
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.include("Invocation failed")
      }
    })
  })
})