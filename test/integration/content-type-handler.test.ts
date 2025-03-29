import { expect } from "vitest"
import { contentTypeHandlers } from "../../src/handlers/content-type-handlers.js"
import { server } from "../msw-setup.js"
import { toCamelCase } from "../../src/utils/to-camel-case.js"

describe("Content Type Handlers Integration Tests", () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const testSpaceId = "test-space-id"
  const testContentTypeId = "test-content-type-id"

  describe("listContentTypes", () => {
    it("should list all content types", async () => {
      const result = await contentTypeHandlers.listContentTypes({
        spaceId: testSpaceId,
      })

      expect(result).to.have.property("content").that.is.an("array")
      expect(result.content).to.have.lengthOf(1)

      const contentTypes = JSON.parse(result.content[0].text)
      expect(contentTypes.items).to.be.an("array")
      expect(contentTypes.items[0]).to.have.nested.property("sys.id", "test-content-type-id")
      expect(contentTypes.items[0]).to.have.property("name", "Test Content Type")
    })
  })

  describe("getContentType", () => {
    it("should get details of a specific content type", async () => {
      const result = await contentTypeHandlers.getContentType({
        spaceId: testSpaceId,
        contentTypeId: testContentTypeId,
      })

      expect(result).to.have.property("content")
      const contentType = JSON.parse(result.content[0].text)
      expect(contentType).to.have.nested.property("sys.id", toCamelCase(testContentTypeId))
      expect(contentType).to.have.property("name", "Test Content Type")
      expect(contentType.fields).to.be.an("array")
    })

    it("should throw error for invalid content type ID", async () => {
      try {
        await contentTypeHandlers.getContentType({
          spaceId: testSpaceId,
          contentTypeId: "invalid-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
      }
    })
  })

  describe("createContentType", () => {
    it("should create a new content type", async () => {
      const contentTypeData = {
        spaceId: testSpaceId,
        name: "New Content Type",
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Text",
            required: true,
          },
        ],
      }

      const result = await contentTypeHandlers.createContentType(contentTypeData)

      expect(result).to.have.property("content")
      const contentType = JSON.parse(result.content[0].text)
      expect(contentType).to.have.nested.property("sys.id", "newContentType")
      expect(contentType).to.have.property("name", "New Content Type")
      expect(contentType.fields).to.be.an("array")
    })
  })

  describe("updateContentType", () => {
    it("should update an existing content type", async () => {
      const updateData = {
        spaceId: testSpaceId,
        contentTypeId: testContentTypeId,
        name: "Updated Content Type",
        fields: [
          {
            id: "title",
            name: "Updated Title",
            type: "Text",
            required: true,
          },
        ],
      }

      const result = await contentTypeHandlers.updateContentType(updateData)

      expect(result).to.have.property("content")
      const contentType = JSON.parse(result.content[0].text)
      expect(contentType).to.have.nested.property("sys.id", testContentTypeId)
      expect(contentType).to.have.property("name", "Updated Content Type")
    })
  })

  describe("deleteContentType", () => {
    it("should delete a content type", async () => {
      const result = await contentTypeHandlers.deleteContentType({
        spaceId: testSpaceId,
        contentTypeId: testContentTypeId,
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("deleted successfully")
    })

    it("should throw error when deleting non-existent content type", async () => {
      try {
        await contentTypeHandlers.deleteContentType({
          spaceId: testSpaceId,
          contentTypeId: "non-existent-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
      }
    })
  })

  describe("publishContentType", () => {
    it("should publish a content type", async () => {
      const result = await contentTypeHandlers.publishContentType({
        spaceId: testSpaceId,
        contentTypeId: testContentTypeId,
      })

      expect(result).to.have.property("content")
      expect(result.content[0].text).to.include("published successfully")
    })

    it("should throw error when publishing non-existent content type", async () => {
      try {
        await contentTypeHandlers.publishContentType({
          spaceId: testSpaceId,
          contentTypeId: "non-existent-id",
        })
        expect.fail("Should have thrown an error")
      } catch (error) {
        expect(error).to.exist
      }
    })
  })
})
