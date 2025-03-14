/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, vi } from "vitest"
import { entryHandlers } from "../../src/handlers/entry-handlers.js"
import { server } from "../msw-setup.js"

// Set up mocks for bulk action handlers
const bulkPublishMock = vi.fn().mockResolvedValue({
  content: [
    {
      type: "text",
      text: "Bulk publish completed with status: succeeded. Successfully processed 2 items.",
    },
  ],
})

const bulkUnpublishMock = vi.fn().mockResolvedValue({
  content: [
    {
      type: "text",
      text: "Bulk unpublish completed with status: succeeded. Successfully processed 2 items.",
    },
  ],
})

// Mock the bulk-action-handlers module
vi.mock("../../src/handlers/bulk-action-handlers.js", () => ({
  bulkActionHandlers: {
    bulkPublish: bulkPublishMock,
    bulkUnpublish: bulkUnpublishMock,
  },
}))

// Mock the contentful client for testing bulk operations
vi.mock("../../src/config/client.js", async (importOriginal) => {
  const originalModule = await importOriginal();
  
  // Create a mock function that will be used for the content client
  const getContentfulClient = vi.fn();
  
  // Store the original function so we can call it if needed
  const originalGetClient = originalModule.getContentfulClient;
  
  // Set up the mock function to return either the original or our mocked version
  getContentfulClient.mockImplementation(async () => {
    // Create our mock client
    const mockClient = {
      entry: {
        get: vi.fn().mockImplementation((params) => {
          // Special handling for our bulk test entries
          if (params.entryId === "entry-id-1" || params.entryId === "entry-id-2") {
            return Promise.resolve({
              sys: { id: params.entryId, version: 1 },
              fields: { title: { "en-US": "Test Entry" } }
            });
          }
          
          // Otherwise, call the original implementation
          return originalGetClient().then(client => client.entry.get(params));
        }),
        // Mock the other methods by passing through
        getMany: (...args) => originalGetClient().then(client => client.entry.getMany(...args)),
        create: (...args) => originalGetClient().then(client => client.entry.create(...args)),
        update: (...args) => originalGetClient().then(client => client.entry.update(...args)),
        delete: (...args) => originalGetClient().then(client => client.entry.delete(...args)),
        publish: (...args) => originalGetClient().then(client => client.entry.publish(...args)),
        unpublish: (...args) => originalGetClient().then(client => client.entry.unpublish(...args)),
      },
      bulkAction: {
        publish: vi.fn().mockResolvedValue({
          sys: { id: "bulk-action-id", status: "created" }
        }),
        unpublish: vi.fn().mockResolvedValue({
          sys: { id: "bulk-action-id", status: "created" }
        }),
        get: vi.fn().mockResolvedValue({
          sys: { id: "bulk-action-id", status: "succeeded" },
          succeeded: [
            { sys: { id: "entry-id-1", type: "Entry" } },
            { sys: { id: "entry-id-2", type: "Entry" } },
          ]
        }),
      }
    };
    
    return mockClient;
  });
  
  return {
    ...originalModule,
    getContentfulClient
  };
});

describe("Entry Handlers Integration Tests", () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const testSpaceId = "test-space-id"
  const testEntryId = "test-entry-id"
  const testContentTypeId = "test-content-type-id"

  describe("searchEntries", () => {
    it("should search all entries", async () => {
      const result = await entryHandlers.searchEntries({
        spaceId: testSpaceId,
        query: {
          content_type: testContentTypeId,
        },
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)

      const entries = JSON.parse(result.content[0].text)
      expect(entries.items).to.be.an("array")
      expect(entries.items[0]).to.have.nested.property("sys.id", "test-entry-id")
      expect(entries.items[0]).to.have.nested.property("fields.title.en-US", "Test Entry")
    })
  })

  describe("getEntry", () => {
    it("should get details of a specific entry", async () => {
      const result = await entryHandlers.getEntry({
        spaceId: testSpaceId,
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.id).to.equal(testEntryId)
      expect(entry).to.have.nested.property("fields.title.en-US", "Test Entry")
    })

    it("should throw error for invalid entry ID", async () => {
      try {
        await entryHandlers.getEntry({
          spaceId: testSpaceId,
          entryId: "invalid-entry-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
      }
    })
  })

  describe("createEntry", () => {
    it("should create a new entry", async () => {
      const entryData = {
        spaceId: testSpaceId,
        contentTypeId: testContentTypeId,
        fields: {
          title: { "en-US": "New Entry" },
          description: { "en-US": "New Description" },
        },
      }

      const result = await entryHandlers.createEntry(entryData)

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry).to.have.nested.property("sys.id", "new-entry-id")
      expect(entry).to.have.nested.property("fields.title.en-US", "New Entry")
    })
  })

  describe("updateEntry", () => {
    it("should update an existing entry", async () => {
      const updateData = {
        spaceId: testSpaceId,
        entryId: testEntryId,
        fields: {
          title: { "en-US": "Updated Entry" },
          description: { "en-US": "Updated Description" },
        },
      }

      const result = await entryHandlers.updateEntry(updateData)

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.id).to.equal(testEntryId)
      expect(entry).to.have.nested.property("fields.title.en-US", "Updated Entry")
    })
  })

  describe("deleteEntry", () => {
    it("should delete an entry", async () => {
      const result = await entryHandlers.deleteEntry({
        spaceId: testSpaceId,
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("deleted successfully")
    })

    it("should throw error when deleting non-existent entry", async () => {
      try {
        await entryHandlers.deleteEntry({
          spaceId: testSpaceId,
          entryId: "non-existent-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
      }
    })
  })

  describe("publishEntry", () => {
    it("should publish a single entry", async () => {
      const result = await entryHandlers.publishEntry({
        spaceId: testSpaceId,
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.publishedVersion).to.exist
    })

    it("should publish multiple entries using bulkPublish", async () => {
      // Clear previous calls to the mock
      bulkPublishMock.mockClear()

      const result = await entryHandlers.publishEntry({
        spaceId: testSpaceId,
        entryId: ["entry-id-1", "entry-id-2"],
      })

      expect(bulkPublishMock).toHaveBeenCalledWith(
        expect.objectContaining({
          spaceId: testSpaceId,
          entities: [
            { sys: { id: "entry-id-1", type: "Entry" } },
            { sys: { id: "entry-id-2", type: "Entry" } },
          ],
        }),
      )

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("Bulk publish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })

  describe("unpublishEntry", () => {
    it("should unpublish a single entry", async () => {
      const result = await entryHandlers.unpublishEntry({
        spaceId: testSpaceId,
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.publishedVersion).to.not.exist
    })

    it("should unpublish multiple entries using bulkUnpublish", async () => {
      // Clear previous calls to the mock
      bulkUnpublishMock.mockClear()

      const result = await entryHandlers.unpublishEntry({
        spaceId: testSpaceId,
        entryId: ["entry-id-1", "entry-id-2"],
      })

      expect(bulkUnpublishMock).toHaveBeenCalledWith(
        expect.objectContaining({
          spaceId: testSpaceId,
          entities: [
            { sys: { id: "entry-id-1", type: "Entry" } },
            { sys: { id: "entry-id-2", type: "Entry" } },
          ],
        }),
      )

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("Bulk unpublish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })
})
