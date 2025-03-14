import { expect, vi } from "vitest"
import { server } from "../msw-setup.js"

// Define mock values first - these can be before vi.mock
const TEST_ENTRY_ID = "test-entry-id"
const TEST_ASSET_ID = "test-asset-id"
const TEST_BULK_ACTION_ID = "test-bulk-action-id"

// Mock the client module without using variables defined later
vi.mock("../../src/config/client.ts", () => {
  return {
    getContentfulClient: vi.fn().mockResolvedValue({
      entry: {
        get: vi.fn().mockResolvedValue({
          sys: { id: "test-entry-id", version: 1 },
        }),
      },
      asset: {
        get: vi.fn().mockResolvedValue({
          sys: { id: "test-asset-id", version: 1 },
        }),
      },
      bulkAction: {
        publish: vi.fn().mockResolvedValue({
          sys: { id: "test-bulk-action-id", status: "created" },
        }),
        unpublish: vi.fn().mockResolvedValue({
          sys: { id: "test-bulk-action-id", status: "created" },
        }),
        validate: vi.fn().mockResolvedValue({
          sys: { id: "test-bulk-action-id", status: "created" },
        }),
        get: vi.fn().mockResolvedValue({
          sys: { id: "test-bulk-action-id", status: "succeeded" },
          succeeded: [
            { sys: { id: "test-entry-id", type: "Entry" } },
            { sys: { id: "test-asset-id", type: "Asset" } },
          ],
        }),
      },
    }),
  }
})

// Import handlers after mocking
import { bulkActionHandlers } from "../../src/handlers/bulk-action-handlers.ts"

describe("Bulk Action Handlers Integration Tests", () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const testSpaceId = "test-space-id"
  const testEnvironmentId = "master"

  describe("bulkPublish", () => {
    it("should publish multiple entries and assets", async () => {
      const result = await bulkActionHandlers.bulkPublish({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entities: [
          { sys: { id: TEST_ENTRY_ID, type: "Entry" } },
          { sys: { id: TEST_ASSET_ID, type: "Asset" } },
        ],
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content[0].text).to.include("Bulk publish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })

  describe("bulkUnpublish", () => {
    it("should unpublish multiple entries and assets", async () => {
      const result = await bulkActionHandlers.bulkUnpublish({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entities: [
          { sys: { id: TEST_ENTRY_ID, type: "Entry" } },
          { sys: { id: TEST_ASSET_ID, type: "Asset" } },
        ],
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content[0].text).to.include("Bulk unpublish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })

  describe("bulkValidate", () => {
    it("should validate multiple entries", async () => {
      const result = await bulkActionHandlers.bulkValidate({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryIds: [TEST_ENTRY_ID],
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content[0].text).to.include("Bulk validation completed")
      expect(result.content[0].text).to.include("Successfully validated")
    })
  })
})
