import { describe, it, expect, beforeEach } from "vitest"
import { getSpaceEnvProperties, getBulkActionTools } from "../../src/types/tools"

describe("getSpaceEnvProperties", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should add spaceId and environmentId properties when environment variables are not set", () => {
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID

    const config = {
      type: "object",
      properties: {
        existingProperty: { type: "string" },
      },
      required: ["existingProperty"],
    }

    const result = getSpaceEnvProperties(config)

    expect(result.properties).toHaveProperty("spaceId")
    expect(result.properties).toHaveProperty("environmentId")
    expect(result.required).toContain("spaceId")
    expect(result.required).toContain("environmentId")
  })

  it("should not add spaceId and environmentId properties when environment variables are set", () => {
    process.env.SPACE_ID = "test-space-id"
    process.env.ENVIRONMENT_ID = "test-environment-id"

    const config = {
      type: "object",
      properties: {
        existingProperty: { type: "string" },
      },
      required: ["existingProperty"],
    }

    const result = getSpaceEnvProperties(config)

    expect(result.properties).not.toHaveProperty("spaceId")
    expect(result.properties).not.toHaveProperty("environmentId")
    expect(result.required).not.toContain("spaceId")
    expect(result.required).not.toContain("environmentId")
  })

  it("should merge spaceId and environmentId properties with existing properties", () => {
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID

    const config = {
      type: "object",
      properties: {
        existingProperty: { type: "string" },
      },
      required: ["existingProperty"],
    }

    const result = getSpaceEnvProperties(config)

    expect(result.properties).toHaveProperty("existingProperty")
    expect(result.properties).toHaveProperty("spaceId")
    expect(result.properties).toHaveProperty("environmentId")
    expect(result.required).toContain("existingProperty")
    expect(result.required).toContain("spaceId")
    expect(result.required).toContain("environmentId")
  })
})

describe("getBulkActionTools", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should return bulk action tools with correct structure", () => {
    const bulkActionTools = getBulkActionTools()
    
    // Check if all expected bulk actions are present
    expect(bulkActionTools).toHaveProperty("BULK_PUBLISH")
    expect(bulkActionTools).toHaveProperty("BULK_UNPUBLISH")
    expect(bulkActionTools).toHaveProperty("BULK_VALIDATE")
    
    // Check BULK_PUBLISH structure
    expect(bulkActionTools.BULK_PUBLISH.name).toBe("bulk_publish")
    expect(bulkActionTools.BULK_PUBLISH.description).toBe("Publish multiple entries or assets at once")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.properties).toHaveProperty("entities")
    
    // Check BULK_UNPUBLISH structure
    expect(bulkActionTools.BULK_UNPUBLISH.name).toBe("bulk_unpublish")
    expect(bulkActionTools.BULK_UNPUBLISH.description).toBe("Unpublish multiple entries or assets at once")
    expect(bulkActionTools.BULK_UNPUBLISH.inputSchema.properties).toHaveProperty("entities")
    
    // Check BULK_VALIDATE structure
    expect(bulkActionTools.BULK_VALIDATE.name).toBe("bulk_validate")
    expect(bulkActionTools.BULK_VALIDATE.description).toBe("Validate multiple entries at once")
    expect(bulkActionTools.BULK_VALIDATE.inputSchema.properties).toHaveProperty("entryIds")
  })

  it("should include spaceId and environmentId in schema when environment variables are not set", () => {
    delete process.env.SPACE_ID
    delete process.env.ENVIRONMENT_ID
    
    const bulkActionTools = getBulkActionTools()
    
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.properties).toHaveProperty("spaceId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.properties).toHaveProperty("environmentId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.required).toContain("spaceId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.required).toContain("environmentId")
  })

  it("should not include spaceId and environmentId in schema when environment variables are set", () => {
    process.env.SPACE_ID = "test-space-id"
    process.env.ENVIRONMENT_ID = "test-environment-id"
    
    const bulkActionTools = getBulkActionTools()
    
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.properties).not.toHaveProperty("spaceId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.properties).not.toHaveProperty("environmentId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.required || []).not.toContain("spaceId")
    expect(bulkActionTools.BULK_PUBLISH.inputSchema.required || []).not.toContain("environmentId")
  })
})
