import { expect, vi } from "vitest"
import { server } from "../msw-setup.js"

// Define mock values
const TEST_ENTRY_ID = "test-entry-id"
const TEST_ASSET_ID = "test-asset-id"
const TEST_BULK_ACTION_ID = "test-bulk-action-id"

// Create mock implementation
const mockClient = {
  entry: {
    get: vi.fn().mockResolvedValue({
      sys: { id: TEST_ENTRY_ID, version: 1 },
    }),
  },
  asset: {
    get: vi.fn().mockResolvedValue({
      sys: { id: TEST_ASSET_ID, version: 1 },
    }),
  },
  bulkAction: {
    publish: vi.fn().mockResolvedValue({
      sys: { id: TEST_BULK_ACTION_ID, status: "created" },
    }),
    unpublish: vi.fn().mockResolvedValue({
      sys: { id: TEST_BULK_ACTION_ID, status: "created" },
    }),
    validate: vi.fn().mockResolvedValue({
      sys: { id: TEST_BULK_ACTION_ID, status: "created" },
    }),
    get: vi.fn().mockResolvedValue({
      sys: { id: TEST_BULK_ACTION_ID, status: "succeeded" },
      succeeded: [
        { sys: { id: TEST_ENTRY_ID, type: "Entry" } },
        { sys: { id: TEST_ASSET_ID, type: "Asset" } },
      ],
    }),
  },
}

// Mock the client module
vi.mock("../../src/config/client.js", () => ({
  getContentfulClient: vi.fn().mockResolvedValue(mockClient)
}))

// Import handlers after mocking
import { bulkActionHandlers } from "../../src/handlers/bulk-action-handlers.js"

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
          { sys: { id: testEntryId, type: "Entry" } },
          { sys: { id: testAssetId, type: "Asset" } },
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
          { sys: { id: testEntryId, type: "Entry" } },
          { sys: { id: testAssetId, type: "Asset" } },
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
        entryIds: [testEntryId],
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content[0].text).to.include("Bulk validation completed")
      expect(result.content[0].text).to.include("Successfully validated")
    })
  })
})
