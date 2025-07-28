/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, vi } from "vitest"
import { commentHandlers } from "../../src/handlers/comment-handlers.js"
import { server } from "../msw-setup.js"

// Mock comment data
const mockComment = {
  sys: {
    id: "test-comment-id",
    version: 1,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    createdBy: {
      sys: { id: "test-user-id", type: "Link", linkType: "User" },
    },
    updatedBy: {
      sys: { id: "test-user-id", type: "Link", linkType: "User" },
    },
  },
  body: "This is a test comment",
  status: "active",
}

const mockRichTextComment = {
  sys: {
    id: "test-rich-comment-id",
    version: 1,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    createdBy: {
      sys: { id: "test-user-id", type: "Link", linkType: "User" },
    },
    updatedBy: {
      sys: { id: "test-user-id", type: "Link", linkType: "User" },
    },
  },
  body: {
    nodeType: "document",
    content: [
      {
        nodeType: "paragraph",
        content: [
          {
            nodeType: "text",
            value: "This is a rich text comment",
            marks: [],
          },
        ],
      },
    ],
  },
  status: "active",
}

const mockCommentsCollection = {
  sys: { type: "Array" },
  total: 2,
  skip: 0,
  limit: 100,
  items: [mockComment, mockRichTextComment],
}

// Mock Contentful client comment methods
const mockCommentGetMany = vi.fn().mockResolvedValue(mockCommentsCollection)
const mockCommentCreate = vi.fn().mockResolvedValue(mockComment)
const mockCommentGet = vi.fn().mockResolvedValue(mockComment)

// Mock the contentful client for testing comment operations
vi.mock("../../src/config/client.js", async (importOriginal) => {
  const originalModule = await importOriginal()

  // Create a mock function that will be used for the content client
  const getContentfulClient = vi.fn()

  // Store the original function so we can call it if needed
  const originalGetClient = originalModule.getContentfulClient

  // Set up the mock function to return either the original or our mocked version
  getContentfulClient.mockImplementation(async () => {
    // Create our mock client
    const mockClient = {
      comment: {
        getMany: mockCommentGetMany,
        create: mockCommentCreate,
        get: mockCommentGet,
      },
      // Pass through other methods to the original client
      entry: {
        get: (...args) => originalGetClient().then((client) => client.entry.get(...args)),
        getMany: (...args) => originalGetClient().then((client) => client.entry.getMany(...args)),
        create: (...args) => originalGetClient().then((client) => client.entry.create(...args)),
        update: (...args) => originalGetClient().then((client) => client.entry.update(...args)),
        delete: (...args) => originalGetClient().then((client) => client.entry.delete(...args)),
        publish: (...args) => originalGetClient().then((client) => client.entry.publish(...args)),
        unpublish: (...args) =>
          originalGetClient().then((client) => client.entry.unpublish(...args)),
      },
    }

    return mockClient
  })

  return {
    ...originalModule,
    getContentfulClient,
  }
})

describe("Comment Handlers Integration Tests", () => {
  // Start MSW Server before tests
  beforeAll(() => {
    server.listen()
    // Ensure environment variables are not set
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID
  })
  afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })
  afterAll(() => server.close())

  const testSpaceId = "test-space-id"
  const testEnvironmentId = "master"
  const testEntryId = "test-entry-id"
  const testCommentId = "test-comment-id"

  describe("getComments", () => {
    it("should retrieve comments for an entry with default parameters", async () => {
      const result = await commentHandlers.getComments({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
      })

      expect(mockCommentGetMany).toHaveBeenCalledWith({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        bodyFormat: "plain-text",
        query: { status: "active" },
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)
      expect(result.content[0].text).to.include(`Retrieved 2 comments for entry ${testEntryId}`)

      const responseData = JSON.parse(result.content[0].text.split(":\n\n")[1])
      expect(responseData.items).to.be.an("array")
      expect(responseData.total).to.equal(2)
    })

    it("should retrieve comments with rich-text body format", async () => {
      const result = await commentHandlers.getComments({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        bodyFormat: "rich-text",
      })

      expect(mockCommentGetMany).toHaveBeenCalledWith({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        bodyFormat: "rich-text",
        query: { status: "active" },
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include(`Retrieved 2 comments for entry ${testEntryId}`)
    })

    it("should retrieve comments with status filter", async () => {
      const result = await commentHandlers.getComments({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        status: "resolved",
      })

      expect(mockCommentGetMany).toHaveBeenCalledWith({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        bodyFormat: "plain-text",
        query: { status: "resolved" },
      })

      expect(result).to.have.property("content")
    })

    it("should retrieve all comments when status is 'all'", async () => {
      const result = await commentHandlers.getComments({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        status: "all",
      })

      expect(mockCommentGetMany).toHaveBeenCalledWith({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        bodyFormat: "plain-text",
        query: {},
      })

      expect(result).to.have.property("content")
    })

    it("should use environment variables when provided", async () => {
      // Set environment variables
      const originalSpaceId = process.env.SPACE_ID
      const originalEnvironmentId = process.env.ENVIRONMENT_ID
      process.env.SPACE_ID = "env-space-id"
      process.env.ENVIRONMENT_ID = "env-environment-id"

      const result = await commentHandlers.getComments({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
      })

      expect(mockCommentGetMany).toHaveBeenCalledWith({
        spaceId: "env-space-id",
        environmentId: "env-environment-id",
        entryId: testEntryId,
        bodyFormat: "plain-text",
        query: { status: "active" },
      })

      // Restore environment variables
      process.env.SPACE_ID = originalSpaceId
      process.env.ENVIRONMENT_ID = originalEnvironmentId

      expect(result).to.have.property("content")
    })
  })

  describe("createComment", () => {
    it("should create a plain-text comment with default parameters", async () => {
      const testBody = "This is a test comment"

      const result = await commentHandlers.createComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        body: testBody,
      })

      expect(mockCommentCreate).toHaveBeenCalledWith(
        {
          spaceId: "undefined",
          environmentId: "undefined",
          entryId: testEntryId,
        },
        {
          body: testBody,
          status: "active",
        },
      )

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)
      expect(result.content[0].text).to.include(
        `Successfully created comment on entry ${testEntryId}`,
      )

      const responseData = JSON.parse(result.content[0].text.split(":\n\n")[1])
      expect(responseData.sys.id).to.equal("test-comment-id")
      expect(responseData.body).to.equal("This is a test comment")
      expect(responseData.status).to.equal("active")
    })

    it("should create a rich-text comment", async () => {
      const testBody = "This is a rich text comment"

      mockCommentCreate.mockResolvedValueOnce(mockRichTextComment)

      const result = await commentHandlers.createComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        body: testBody,
        bodyFormat: "rich-text",
      })

      expect(mockCommentCreate).toHaveBeenCalledWith(
        {
          spaceId: "undefined",
          environmentId: "undefined",
          entryId: testEntryId,
        },
        {
          body: testBody,
          status: "active",
        },
      )

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include(
        `Successfully created comment on entry ${testEntryId}`,
      )
    })

    it("should create a comment with custom status", async () => {
      const testBody = "This is a test comment"

      const result = await commentHandlers.createComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        body: testBody,
        status: "active",
      })

      expect(mockCommentCreate).toHaveBeenCalledWith(
        {
          spaceId: "undefined",
          environmentId: "undefined",
          entryId: testEntryId,
        },
        {
          body: testBody,
          status: "active",
        },
      )

      expect(result).to.have.property("content")
    })

    it("should use environment variables when provided", async () => {
      // Set environment variables
      const originalSpaceId = process.env.SPACE_ID
      const originalEnvironmentId = process.env.ENVIRONMENT_ID
      process.env.SPACE_ID = "env-space-id"
      process.env.ENVIRONMENT_ID = "env-environment-id"

      const testBody = "This is a test comment"

      const result = await commentHandlers.createComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        body: testBody,
      })

      expect(mockCommentCreate).toHaveBeenCalledWith(
        {
          spaceId: "env-space-id",
          environmentId: "env-environment-id",
          entryId: testEntryId,
        },
        {
          body: testBody,
          status: "active",
        },
      )

      // Restore environment variables
      process.env.SPACE_ID = originalSpaceId
      process.env.ENVIRONMENT_ID = originalEnvironmentId

      expect(result).to.have.property("content")
    })
  })

  describe("getSingleComment", () => {
    it("should retrieve a specific comment with default parameters", async () => {
      const result = await commentHandlers.getSingleComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        commentId: testCommentId,
      })

      expect(mockCommentGet).toHaveBeenCalledWith({
        spaceId: "undefined",
        environmentId: "undefined",
        entryId: testEntryId,
        commentId: testCommentId,
        bodyFormat: "plain-text",
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)
      expect(result.content[0].text).to.include(
        `Retrieved comment ${testCommentId} for entry ${testEntryId}`,
      )

      const responseData = JSON.parse(result.content[0].text.split(":\n\n")[1])
      expect(responseData.sys.id).to.equal("test-comment-id")
      expect(responseData.body).to.equal("This is a test comment")
      expect(responseData.status).to.equal("active")
    })

    it("should retrieve a specific comment with rich-text body format", async () => {
      mockCommentGet.mockResolvedValueOnce(mockRichTextComment)

      const result = await commentHandlers.getSingleComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        commentId: testCommentId,
        bodyFormat: "rich-text",
      })

      expect(mockCommentGet).toHaveBeenCalledWith({
        spaceId: "undefined",
        environmentId: "undefined",
        entryId: testEntryId,
        commentId: testCommentId,
        bodyFormat: "rich-text",
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include(
        `Retrieved comment ${testCommentId} for entry ${testEntryId}`,
      )

      const responseData = JSON.parse(result.content[0].text.split(":\n\n")[1])
      expect(responseData.body).to.have.property("nodeType", "document")
    })

    it("should use environment variables when provided", async () => {
      // Set environment variables
      const originalSpaceId = process.env.SPACE_ID
      const originalEnvironmentId = process.env.ENVIRONMENT_ID
      process.env.SPACE_ID = "env-space-id"
      process.env.ENVIRONMENT_ID = "env-environment-id"

      const result = await commentHandlers.getSingleComment({
        spaceId: testSpaceId,
        environmentId: testEnvironmentId,
        entryId: testEntryId,
        commentId: testCommentId,
      })

      expect(mockCommentGet).toHaveBeenCalledWith({
        spaceId: "env-space-id",
        environmentId: "env-environment-id",
        entryId: testEntryId,
        commentId: testCommentId,
        bodyFormat: "plain-text",
      })

      // Restore environment variables
      process.env.SPACE_ID = originalSpaceId
      process.env.ENVIRONMENT_ID = originalEnvironmentId

      expect(result).to.have.property("content")
    })

    it("should handle errors gracefully", async () => {
      mockCommentGet.mockRejectedValueOnce(new Error("Comment not found"))

      try {
        await commentHandlers.getSingleComment({
          spaceId: testSpaceId,
          environmentId: testEnvironmentId,
          entryId: testEntryId,
          commentId: "invalid-comment-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.equal("Comment not found")
      }
    })
  })

  describe("Error handling", () => {
    it("should handle getComments API errors", async () => {
      mockCommentGetMany.mockRejectedValueOnce(new Error("API Error"))

      try {
        await commentHandlers.getComments({
          spaceId: testSpaceId,
          environmentId: testEnvironmentId,
          entryId: testEntryId,
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.equal("API Error")
      }
    })

    it("should handle createComment API errors", async () => {
      mockCommentCreate.mockRejectedValueOnce(new Error("Create failed"))

      try {
        await commentHandlers.createComment({
          spaceId: testSpaceId,
          environmentId: testEnvironmentId,
          entryId: testEntryId,
          body: "Test comment",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.equal("Create failed")
      }
    })
  })
})
