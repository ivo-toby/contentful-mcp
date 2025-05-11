import { expect, vi, describe, it, beforeEach } from "vitest"
import { entryHandlers } from "../../src/handlers/entry-handlers.js"

// Define test constants 
const TEST_ENTRY_ID = "test-entry-id"
const TEST_SPACE_ID = "test-space-id"
const TEST_ENV_ID = "master"

// Move vi.mock call to top level - this gets hoisted automatically
vi.mock("../../src/config/client.js", () => {
  return {
    getContentfulClient: vi.fn().mockImplementation(() => {
      // Create mock entry when the function is called
      const mockEntry = {
        sys: { id: TEST_ENTRY_ID, version: 1 },
        fields: {
          title: { "en-US": "Original Title" },
          description: { "en-US": "Original Description" },
          tags: { "en-US": ["tag1", "tag2"] }
        }
      }

      return {
        entry: {
          get: vi.fn().mockResolvedValue(mockEntry),
          update: vi.fn().mockImplementation((params, entryProps) => {
            // Return a merged entry that simulates the updated fields
            return Promise.resolve({
              sys: { id: params.entryId, version: 2 },
              fields: entryProps.fields
            })
          })
        }
      }
    })
  }
})

describe("Entry Handler Merge Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should merge existing fields with update fields when only partial update is provided", async () => {
    // Setup - just update the title but not other fields
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      entryId: TEST_ENTRY_ID,
      fields: {
        title: { "en-US": "Updated Title" }
      }
    }

    // Execute
    const result = await entryHandlers.updateEntry(updateData)
    
    // Parse the result
    const updatedEntry = JSON.parse(result.content[0].text)
    
    // Assert - should have updated title but kept original description and tags
    expect(updatedEntry.fields.title["en-US"]).toEqual("Updated Title")
    expect(updatedEntry.fields.description["en-US"]).toEqual("Original Description")
    expect(updatedEntry.fields.tags["en-US"]).toEqual(["tag1", "tag2"])
  })

  it("should handle updates to nested locale fields", async () => {
    // Setup - update a specific locale but not others
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      entryId: TEST_ENTRY_ID,
      fields: {
        title: { 
          "de-DE": "Deutscher Titel" // Add a new locale
        }
      }
    }

    // Execute
    const result = await entryHandlers.updateEntry(updateData)
    
    // Parse the result
    const updatedEntry = JSON.parse(result.content[0].text)
    
    // Assert - should merge the locales in the title field
    expect(updatedEntry.fields.title["en-US"]).toEqual("Original Title") // Kept original locale
    expect(updatedEntry.fields.title["de-DE"]).toEqual("Deutscher Titel") // Added new locale
    expect(updatedEntry.fields.description["en-US"]).toEqual("Original Description") // Kept other fields
  })

  it("should handle adding a new field", async () => {
    // Setup - add a completely new field
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      entryId: TEST_ENTRY_ID,
      fields: {
        newField: { "en-US": "New Field Value" }
      }
    }

    // Execute
    const result = await entryHandlers.updateEntry(updateData)
    
    // Parse the result
    const updatedEntry = JSON.parse(result.content[0].text)
    
    // Assert - should have original fields plus the new field
    expect(updatedEntry.fields.title["en-US"]).toEqual("Original Title")
    expect(updatedEntry.fields.description["en-US"]).toEqual("Original Description")
    expect(updatedEntry.fields.newField["en-US"]).toEqual("New Field Value")
  })

  it("should handle updating an array field", async () => {
    // Setup - update the tags array
    const updateData = {
      spaceId: TEST_SPACE_ID,
      environmentId: TEST_ENV_ID,
      entryId: TEST_ENTRY_ID,
      fields: {
        tags: { "en-US": ["tag1", "tag2", "tag3"] } // Add tag3
      }
    }

    // Execute
    const result = await entryHandlers.updateEntry(updateData)
    
    // Parse the result
    const updatedEntry = JSON.parse(result.content[0].text)
    
    // Assert - should have updated tags but kept other fields
    expect(updatedEntry.fields.title["en-US"]).toEqual("Original Title")
    expect(updatedEntry.fields.description["en-US"]).toEqual("Original Description")
    expect(updatedEntry.fields.tags["en-US"]).toEqual(["tag1", "tag2", "tag3"])
  })
})