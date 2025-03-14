import { describe, it, expect } from "vitest"
import { getAiActionTools } from "../../src/types/tools"

describe("AI Action Tool Definitions", () => {
  const tools = getAiActionTools()
  
  it("should export the correct AI Action tools", () => {
    expect(tools).toHaveProperty("LIST_AI_ACTIONS")
    expect(tools).toHaveProperty("GET_AI_ACTION")
    expect(tools).toHaveProperty("CREATE_AI_ACTION")
    expect(tools).toHaveProperty("UPDATE_AI_ACTION")
    expect(tools).toHaveProperty("DELETE_AI_ACTION")
    expect(tools).toHaveProperty("PUBLISH_AI_ACTION")
    expect(tools).toHaveProperty("UNPUBLISH_AI_ACTION")
    expect(tools).toHaveProperty("INVOKE_AI_ACTION")
    expect(tools).toHaveProperty("GET_AI_ACTION_INVOCATION")
  })
  
  it("should have the correct schema for LIST_AI_ACTIONS", () => {
    const tool = tools.LIST_AI_ACTIONS
    
    expect(tool.name).toBe("list_ai_actions")
    expect(tool.description).toContain("List all AI Actions")
    
    const schema = tool.inputSchema
    expect(schema.properties).toHaveProperty("limit")
    expect(schema.properties).toHaveProperty("skip")
    expect(schema.properties).toHaveProperty("status")
  })
  
  it("should have the correct schema for INVOKE_AI_ACTION", () => {
    const tool = tools.INVOKE_AI_ACTION
    
    expect(tool.name).toBe("invoke_ai_action")
    expect(tool.description).toContain("Invoke an AI Action")
    
    const schema = tool.inputSchema
    expect(schema.properties).toHaveProperty("aiActionId")
    expect(schema.properties).toHaveProperty("variables")
    expect(schema.properties).toHaveProperty("rawVariables")
    expect(schema.properties).toHaveProperty("outputFormat")
    expect(schema.properties).toHaveProperty("waitForCompletion")
    
    // Variables should be an object with free-form properties
    expect(schema.properties.variables.type).toBe("object")
    expect(schema.properties.variables.additionalProperties).toBeDefined()
    
    // outputFormat should be an enum
    expect(schema.properties.outputFormat.enum).toContain("Markdown")
    expect(schema.properties.outputFormat.enum).toContain("RichText")
    expect(schema.properties.outputFormat.enum).toContain("PlainText")
    
    // aiActionId should be required
    expect(schema.required).toContain("aiActionId")
  })
  
  it("should have the correct schema for CREATE_AI_ACTION", () => {
    const tool = tools.CREATE_AI_ACTION
    
    expect(tool.name).toBe("create_ai_action")
    expect(tool.description).toContain("Create a new AI Action")
    
    const schema = tool.inputSchema
    expect(schema.properties).toHaveProperty("name")
    expect(schema.properties).toHaveProperty("description")
    expect(schema.properties).toHaveProperty("instruction")
    expect(schema.properties).toHaveProperty("configuration")
    
    // Instruction should have template and variables
    expect(schema.properties.instruction.properties).toHaveProperty("template")
    expect(schema.properties.instruction.properties).toHaveProperty("variables")
    
    // Configuration should have modelType and modelTemperature
    expect(schema.properties.configuration.properties).toHaveProperty("modelType")
    expect(schema.properties.configuration.properties).toHaveProperty("modelTemperature")
    
    // Required fields
    expect(schema.required).toContain("name")
    expect(schema.required).toContain("description")
    expect(schema.required).toContain("instruction")
    expect(schema.required).toContain("configuration")
  })
})