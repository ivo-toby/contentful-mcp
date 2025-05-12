/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, vi, beforeAll, afterAll, afterEach } from "vitest"
import { entryHandlers } from "../../src/handlers/entry-handlers.js"
import { server } from "../msw-setup.js"

// Mock Contentful client bulkAction methods
const mockBulkActionPublish = vi.fn().mockResolvedValue({ 
  sys: { id: "mock-bulk-action-id", status: "created" } 
})

const mockBulkActionGet = vi.fn().mockResolvedValue({
  sys: { id: "mock-bulk-action-id", status: "succeeded" },
  succeeded: [
    { sys: { id: "entry-id-1", type: "Entry" }},
    { sys: { id: "entry-id-2", type: "Entry" }}
  ]
})

// Mock the contentful client for testing bulk operations
vi.mock("../../src/config/client.js", async (importOriginal) => {
  // Type the import original more specifically
  const originalModule = await importOriginal() as {
    getContentfulClient: () => Promise<any>
  };

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
          return originalGetClient().then((client: any) => client.entry.get(params));
        }),
        // Mock the other methods by passing through
        getMany: (...args: any[]) => originalGetClient().then((client: any) => client.entry.getMany(...args)),
        create: (...args: any[]) => originalGetClient().then((client: any) => client.entry.create(...args)),
        update: (...args: any[]) => originalGetClient().then((client: any) => client.entry.update(...args)),
        delete: (...args: any[]) => originalGetClient().then((client: any) => client.entry.delete(...args)),
        publish: (...args: any[]) => originalGetClient().then((client: any) => client.entry.publish(...args)),
        unpublish: (...args: any[]) => originalGetClient().then((client: any) => client.entry.unpublish(...args)),
      },
      bulkAction: {
        publish: mockBulkActionPublish,
        unpublish: mockBulkActionPublish, // Using same mock for simplicity
        get: mockBulkActionGet
      }
    };

    return mockClient;
  });

  return {
    ...originalModule as any, // Force the spread
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
        environmentId: "master", // Add required environmentId
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
        environmentId: "master", // Add required environmentId
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
          environmentId: "master", // Add required environmentId
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
        environmentId: "master", // Adding environmentId parameter
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
        environmentId: "master", // Adding environmentId parameter
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
        environmentId: "master", // Adding environmentId parameter
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("deleted successfully")
    })

    it("should throw error when deleting non-existent entry", async () => {
      try {
        await entryHandlers.deleteEntry({
          spaceId: testSpaceId,
          environmentId: "master", // Adding environmentId parameter
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
        environmentId: "master", // Adding environmentId parameter
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.publishedVersion).to.exist
    })

    it("should publish multiple entries using bulk publish", async () => {
      // Clear previous calls to the mocks
      mockBulkActionPublish.mockClear()
      mockBulkActionGet.mockClear()

      const result = await entryHandlers.publishEntry({
        spaceId: testSpaceId,
        environmentId: "master", // Adding environmentId parameter
        entryId: ["entry-id-1", "entry-id-2"],
      })

      // Verify the bulk publish was called
      expect(mockBulkActionPublish).toHaveBeenCalled()
      
      // Verify the payload structure
      const callArgs = mockBulkActionPublish.mock.calls[0][1]
      expect(callArgs).to.have.property('entities')
      expect(callArgs.entities.sys.type).to.equal('Array')
      expect(callArgs.entities.items).to.have.length(2)
      expect(callArgs.entities.items[0].sys.id).to.equal('entry-id-1')
      expect(callArgs.entities.items[1].sys.id).to.equal('entry-id-2')

      // Verify the response
      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("Bulk publish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })

  describe("unpublishEntry", () => {
    it("should unpublish a single entry", async () => {
      const result = await entryHandlers.unpublishEntry({
        spaceId: testSpaceId,
        environmentId: "master", // Adding environmentId parameter
        entryId: testEntryId,
      })

      expect(result).to.have.property("content")
      const entry = JSON.parse(result.content[0].text)
      expect(entry.sys.publishedVersion).to.not.exist
    })

    it("should unpublish multiple entries using bulk unpublish", async () => {
      // Clear previous calls to the mocks
      mockBulkActionPublish.mockClear()
      mockBulkActionGet.mockClear()

      const result = await entryHandlers.unpublishEntry({
        spaceId: testSpaceId,
        environmentId: "master", // Adding environmentId parameter
        entryId: ["entry-id-1", "entry-id-2"],
      })

      // Verify the bulk unpublish was called
      expect(mockBulkActionPublish).toHaveBeenCalled()
      
      // Verify the payload structure
      const callArgs = mockBulkActionPublish.mock.calls[0][1]
      expect(callArgs).to.have.property('entities')
      expect(callArgs.entities.sys.type).to.equal('Array')
      expect(callArgs.entities.items).to.have.length(2)
      expect(callArgs.entities.items[0].sys.id).to.equal('entry-id-1')
      expect(callArgs.entities.items[1].sys.id).to.equal('entry-id-2')

      // Verify the response
      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("Bulk unpublish completed")
      expect(result.content[0].text).to.include("Successfully processed")
    })
  })
})
