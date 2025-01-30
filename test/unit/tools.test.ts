import { describe, it, expect, beforeEach } from "vitest"
import { getSpaceEnvProperties } from "../../src/types/tools"

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
