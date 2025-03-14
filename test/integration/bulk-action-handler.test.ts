import { expect } from "vitest"
import { bulkActionHandlers } from "../../src/handlers/bulk-action-handlers.js"
import { server } from "../msw-setup.js"

// Define constants before vi.mock since it's hoisted to the top
const TEST_ENTRY_ID = "test-entry-id"
const TEST_ASSET_ID = "test-asset-id"
const TEST_BULK_ACTION_ID = "test-bulk-action-id"

// Mock the getContentfulClient function to avoid actual API calls
vi.mock("../../src/config/client.js", () => ({
  getContentfulClient: vi.fn().mockResolvedValue({
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
  }),
}))

describe("Bulk Action Handlers Integration Tests", () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const testSpaceId = "test-space-id"
  const testEnvironmentId = "master"
  const testEntryId = TEST_ENTRY_ID
  const testAssetId = TEST_ASSET_ID

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
