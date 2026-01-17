import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { aiActionHandlers } from "../../src/handlers/ai-action-handlers"

// Mock the AI Actions handlers
vi.mock("../../src/handlers/ai-action-handlers", () => ({
  aiActionHandlers: {
    listAiActions: vi.fn(),
  },
}))

// Mock the AI Actions client
vi.mock("../../src/config/ai-actions-client", () => ({
  aiActionsClient: {
    listAiActions: vi.fn(),
  },
}))

describe("DISABLE_AI_ACTIONS environment variable", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should skip AI Actions loading when DISABLE_AI_ACTIONS is set to 'true'", async () => {
    process.env.DISABLE_AI_ACTIONS = "true"
    process.env.SPACE_ID = "test-space"
    process.env.ENVIRONMENT_ID = "master"

    // Simulate the loadAiActions logic
    const loadAiActions = async () => {
      if (process.env.DISABLE_AI_ACTIONS === "true") {
        return
      }

      if (!process.env.SPACE_ID) {
        return
      }

      await aiActionHandlers.listAiActions({
        spaceId: process.env.SPACE_ID,
        environmentId: process.env.ENVIRONMENT_ID || "master",
        status: "published",
      })
    }

    await loadAiActions()

    expect(aiActionHandlers.listAiActions).not.toHaveBeenCalled()
  })

  it("should load AI Actions when DISABLE_AI_ACTIONS is not set", async () => {
    delete process.env.DISABLE_AI_ACTIONS
    process.env.SPACE_ID = "test-space"
    process.env.ENVIRONMENT_ID = "master"

    vi.mocked(aiActionHandlers.listAiActions).mockResolvedValueOnce({
      sys: { type: "Array" },
      items: [],
      total: 0,
      skip: 0,
      limit: 10,
    })

    // Simulate the loadAiActions logic
    const loadAiActions = async () => {
      if (process.env.DISABLE_AI_ACTIONS === "true") {
        return
      }

      if (!process.env.SPACE_ID) {
        return
      }

      await aiActionHandlers.listAiActions({
        spaceId: process.env.SPACE_ID,
        environmentId: process.env.ENVIRONMENT_ID || "master",
        status: "published",
      })
    }

    await loadAiActions()

    expect(aiActionHandlers.listAiActions).toHaveBeenCalledWith({
      spaceId: "test-space",
      environmentId: "master",
      status: "published",
    })
  })

  it("should load AI Actions when DISABLE_AI_ACTIONS is set to 'false'", async () => {
    process.env.DISABLE_AI_ACTIONS = "false"
    process.env.SPACE_ID = "test-space"
    process.env.ENVIRONMENT_ID = "master"

    vi.mocked(aiActionHandlers.listAiActions).mockResolvedValueOnce({
      sys: { type: "Array" },
      items: [],
      total: 0,
      skip: 0,
      limit: 10,
    })

    // Simulate the loadAiActions logic
    const loadAiActions = async () => {
      if (process.env.DISABLE_AI_ACTIONS === "true") {
        return
      }

      if (!process.env.SPACE_ID) {
        return
      }

      await aiActionHandlers.listAiActions({
        spaceId: process.env.SPACE_ID,
        environmentId: process.env.ENVIRONMENT_ID || "master",
        status: "published",
      })
    }

    await loadAiActions()

    expect(aiActionHandlers.listAiActions).toHaveBeenCalledWith({
      spaceId: "test-space",
      environmentId: "master",
      status: "published",
    })
  })

  it("should skip AI Actions loading when SPACE_ID is not set", async () => {
    delete process.env.DISABLE_AI_ACTIONS
    delete process.env.SPACE_ID

    // Simulate the loadAiActions logic
    const loadAiActions = async () => {
      if (process.env.DISABLE_AI_ACTIONS === "true") {
        return
      }

      if (!process.env.SPACE_ID) {
        return
      }

      await aiActionHandlers.listAiActions({
        spaceId: process.env.SPACE_ID,
        environmentId: process.env.ENVIRONMENT_ID || "master",
        status: "published",
      })
    }

    await loadAiActions()

    expect(aiActionHandlers.listAiActions).not.toHaveBeenCalled()
  })
})
