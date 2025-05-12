import { expect, vi, describe, it, beforeEach } from "vitest"
import { contentTypeHandlers } from "../../src/handlers/content-type-handlers.js"

// Define constants
const TEST_CONTENT_TYPE_ID = "test-content-type-id"
const TEST_SPACE_ID = "test-space-id"
const TEST_ENV_ID = "master"

// Mock the Contentful client for testing the merge logic
vi.mock("../../src/config/client.js", () => {
  return {
    getContentfulClient: vi.fn().mockImplementation(() => {
      // Create mock content type inside the function implementation
      const mockContentType = {
        sys: { id: TEST_CONTENT_TYPE_ID, version: 1 },
        name: "Original Content Type",
        description: "Original description",
        displayField: "title",
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Text",
            required: true,
            validations: [{ size: { max: 100 } }]
          },
          {
            id: "description",
            name: "Description",
            type: "Text",
            required: false
          },
          {
            id: "image",
            name: "Image",
            type: "Link",
            linkType: "Asset",
            required: false
          },
          {
            id: "tags",
            name: "Tags",
            type: "Array",
            items: {
              type: "Symbol"
            }
          }
        ]
      }

      return {
        contentType: {
          get: vi.fn().mockResolvedValue(mockContentType),
          update: vi.fn().mockImplementation((params, contentTypeProps) => {
            // Return a merged content type that simulates the updated fields
            return Promise.resolve({
              sys: { id: params.contentTypeId, version: 2 },
              name: contentTypeProps.name,
              description: contentTypeProps.description,
              displayField: contentTypeProps.displayField,
              fields: contentTypeProps.fields
            })
          })
        }
      }
    })
  }
})

describe("Content Type Handler Merge Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should use existing name when name is not provided", async () => {
    // Setup - update without providing name
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      contentTypeId: TEST_CONTENT_TYPE_ID,
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Text",
          required: true,
          validations: [{ size: { max: 100 } }]
        },
        {
          id: "description",
          name: "Description",
          type: "Text",
          required: false
        },
        {
          id: "image",
          name: "Image",
          type: "Link",
          linkType: "Asset",
          required: false
        },
        {
          id: "tags",
          name: "Tags",
          type: "Array",
          items: {
            type: "Symbol"
          }
        }
      ],
      description: "Updated description"
    }

    // Execute
    const result = await contentTypeHandlers.updateContentType(updateData)
    
    // Parse the result
    const updatedContentType = JSON.parse(result.content[0].text)
    
    // Assert - should keep the original name but update description
    expect(updatedContentType.name).toEqual("Original Content Type")
    expect(updatedContentType.description).toEqual("Updated description")
  })

  it("should preserve field metadata when updating fields", async () => {
    // Setup - update with simplified field definition that's missing metadata
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      contentTypeId: TEST_CONTENT_TYPE_ID,
      fields: [
        {
          id: "title",
          name: "New Title Name",
          type: "Text"
          // Intentionally missing required, validations, etc.
        },
        {
          id: "image",
          name: "Updated Image",
          type: "Link"
          // Missing linkType
        },
        {
          id: "tags",
          name: "Updated Tags",
          type: "Array"
          // Missing items definition
        }
      ]
    }

    // Execute
    const result = await contentTypeHandlers.updateContentType(updateData)
    
    // Parse the result
    const updatedContentType = JSON.parse(result.content[0].text)
    
    // Assert - fields should be updated but metadata should be preserved
    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const titleField = updatedContentType.fields.find(f => f.id === "title")
    expect(titleField.name).toEqual("New Title Name") // Updated
    expect(titleField.required).toEqual(true) // Preserved from original
    expect(titleField.validations).toEqual([{ size: { max: 100 } }]) // Preserved from original

    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const imageField = updatedContentType.fields.find(f => f.id === "image")
    expect(imageField.name).toEqual("Updated Image") // Updated
    expect(imageField.linkType).toEqual("Asset") // Preserved from original

    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const tagsField = updatedContentType.fields.find(f => f.id === "tags")
    expect(tagsField.name).toEqual("Updated Tags") // Updated
    expect(tagsField.items).toEqual({ type: "Symbol" }) // Preserved from original
  })

  it("should handle adding new fields", async () => {
    // Define the original and a new field
    const originalFields = [
      {
        id: "title",
        name: "Title",
        type: "Text",
        required: true,
        validations: [{ size: { max: 100 } }]
      },
      {
        id: "description",
        name: "Description",
        type: "Text",
        required: false
      },
      {
        id: "image",
        name: "Image",
        type: "Link",
        linkType: "Asset",
        required: false
      },
      {
        id: "tags",
        name: "Tags",
        type: "Array",
        items: {
          type: "Symbol"
        }
      }
    ]
    
    const newField = {
      id: "newField",
      name: "New Field",
      type: "Boolean",
      required: false
    }
    
    // Setup - add a new field
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      contentTypeId: TEST_CONTENT_TYPE_ID,
      fields: [...originalFields, newField]
    }

    // Execute
    const result = await contentTypeHandlers.updateContentType(updateData)
    
    // Parse the result
    const updatedContentType = JSON.parse(result.content[0].text)
    
    // Assert - should have all original fields plus the new one
    expect(updatedContentType.fields.length).toEqual(5) // 4 original + 1 new
    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const addedField = updatedContentType.fields.find(f => f.id === "newField")
    expect(addedField).toEqual({
      id: "newField",
      name: "New Field",
      type: "Boolean",
      required: false
    })
  })

  it("should handle when no fields are provided", async () => {
    // Setup - update without providing fields, should use existing fields
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      contentTypeId: TEST_CONTENT_TYPE_ID,
      name: "Updated Content Type Name"
    }

    // Execute
    const result = await contentTypeHandlers.updateContentType(updateData)
    
    // Parse the result
    const updatedContentType = JSON.parse(result.content[0].text)
    
    // Assert - should use existing fields but updated name
    expect(updatedContentType.name).toEqual("Updated Content Type Name")
    expect(updatedContentType.fields.length).toEqual(4) // All 4 original fields should be preserved
    
    // Check that all original fields are preserved
    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const titleField = updatedContentType.fields.find(f => f.id === "title")
    expect(titleField).toBeDefined()
    expect(titleField.name).toEqual("Title")

    // @ts-expect-error - This is unit test code, 'f' parameter can be any
    const descriptionField = updatedContentType.fields.find(f => f.id === "description")
    expect(descriptionField).toBeDefined()
    expect(descriptionField.name).toEqual("Description")
  })
})