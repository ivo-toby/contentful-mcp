import { describe, it, expect } from "vitest"
import {
  generateAiActionToolSchema,
  mapVariablesToInvocationFormat,
  AiActionToolContext,
} from "../../src/utils/ai-action-tool-generator"
import type { AiActionEntity } from "../../src/types/ai-actions"

describe("AI Action Tool Generator", () => {
  const mockTextAction: AiActionEntity = {
    sys: {
      id: "text-action",
      type: "AiAction",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
      version: 1,
      space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
      createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
      updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
    },
    name: "Text Action",
    description: "An action with text variables",
    instruction: {
      template: "Template with {{var1}} and {{var2}}",
      variables: [
        { id: "var1", type: "Text", name: "Variable 1", description: "First variable" },
        { id: "var2", type: "FreeFormInput", name: "Variable 2" },
      ],
    },
    configuration: {
      modelType: "gpt-4",
      modelTemperature: 0.5,
    },
  }

  const mockOptionsAction: AiActionEntity = {
    sys: {
      id: "options-action",
      type: "AiAction",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
      version: 1,
      space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
      createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
      updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
    },
    name: "Options Action",
    description: "An action with options",
    instruction: {
      template: "Template with {{option}}",
      variables: [
        {
          id: "option",
          type: "StringOptionsList",
          name: "Option",
          configuration: {
            values: ["option1", "option2", "option3"],
            allowFreeFormInput: false,
          },
        },
      ],
    },
    configuration: {
      modelType: "gpt-4",
      modelTemperature: 0.5,
    },
  }

  const mockReferenceAction: AiActionEntity = {
    sys: {
      id: "reference-action",
      type: "AiAction",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
      version: 1,
      space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
      createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
      updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
    },
    name: "Reference Action",
    description: "An action with references",
    instruction: {
      template: "Template with {{entry}} and {{asset}}",
      variables: [
        {
          id: "entry",
          type: "Reference",
          name: "Entry Reference",
          configuration: { allowedEntities: ["Entry"] },
        },
        { id: "asset", type: "MediaReference", name: "Asset Reference" },
      ],
    },
    configuration: {
      modelType: "gpt-4",
      modelTemperature: 0.5,
    },
  }

  it("should generate a tool schema for a text action", () => {
    const schema = generateAiActionToolSchema(mockTextAction)

    expect(schema.name).toBe("ai_action_text-action")
    expect(schema.description).toContain(
      "This action is called: Text Action, it's purpose: An action with text variables",
    )
    expect(schema.description).toContain(
      "This AI Action works on content entries and fields in Contentful",
    )

    // Check variables in schema - now using friendly names
    const inputSchema = schema.inputSchema
    expect(inputSchema.properties).toHaveProperty("variable_1") // snake_case of "Variable 1"
    expect(inputSchema.properties).toHaveProperty("variable_2") // snake_case of "Variable 2"
    expect(inputSchema.properties.variable_1.type).toBe("string")
    expect(inputSchema.properties.variable_1.description).toContain("First variable")

    // All variables should be required now
    expect(inputSchema.required).toContain("variable_1")
    expect(inputSchema.required).toContain("variable_2") // Now required
    expect(inputSchema.required).toContain("outputFormat") // outputFormat is also required
  })

  it("should generate a tool schema for an options action", () => {
    const schema = generateAiActionToolSchema(mockOptionsAction)

    expect(schema.name).toBe("ai_action_options-action")

    // Check options in schema
    const inputSchema = schema.inputSchema
    expect(inputSchema.properties).toHaveProperty("option") // Keeps original name since it's clean
    expect(inputSchema.properties.option.type).toBe("string")
    expect(inputSchema.properties.option.enum).toEqual(["option1", "option2", "option3"])

    // option should be required
    expect(inputSchema.required).toContain("option")
  })

  it("should generate a tool schema for a reference action", () => {
    const schema = generateAiActionToolSchema(mockReferenceAction)

    expect(schema.name).toBe("ai_action_reference-action")

    // Check reference variables in schema - now uses friendly names
    const inputSchema = schema.inputSchema
    expect(inputSchema.properties).toHaveProperty("entry_reference") // friendly name
    expect(inputSchema.properties).toHaveProperty("asset_reference") // friendly name
    expect(inputSchema.properties.entry_reference.type).toBe("string")
    expect(inputSchema.properties.asset_reference.type).toBe("string")
    expect(inputSchema.properties.entry_reference.description).toContain("Entry Reference")

    // References should be required
    expect(inputSchema.required).toContain("entry_reference")
    expect(inputSchema.required).toContain("asset_reference")
  })

  it("should map variables to invocation format", () => {
    const toolInput = {
      var1: "value1",
      var2: "value2",
      outputFormat: "Markdown",
    }

    const result = mapVariablesToInvocationFormat(mockTextAction, toolInput)

    expect(result.variables).toHaveLength(2)
    expect(result.variables[0]).toEqual({ id: "var1", value: "value1" })
    expect(result.variables[1]).toEqual({ id: "var2", value: "value2" })
    expect(result.outputFormat).toBe("Markdown")
  })

  it("should map reference variables to invocation format", () => {
    const toolInput = {
      entry: "entry123",
      asset: "asset456",
      outputFormat: "RichText",
    }

    const result = mapVariablesToInvocationFormat(mockReferenceAction, toolInput)

    expect(result.variables).toHaveLength(2)
    expect(result.variables[0]).toEqual({
      id: "entry",
      value: { entityType: "Entry", entityId: "entry123" },
    })
    expect(result.variables[1]).toEqual({
      id: "asset",
      value: { entityType: "Asset", entityId: "asset456" },
    })
    expect(result.outputFormat).toBe("RichText")
  })

  it("should manage AI Actions in the tool context", () => {
    const context = new AiActionToolContext("space1", "master")

    // Add actions
    context.addAiAction(mockTextAction)
    context.addAiAction(mockOptionsAction)

    // Get all actions
    const allActions = context.getAllAiActions()
    expect(allActions).toHaveLength(2)

    // Get specific action
    const action = context.getAiAction("text-action")
    expect(action).toBe(mockTextAction)

    // Generate all tool schemas
    const schemas = context.generateAllToolSchemas()
    expect(schemas).toHaveLength(2)
    expect(schemas[0].name).toBe("ai_action_text-action")
    expect(schemas[1].name).toBe("ai_action_options-action")

    // Remove an action
    context.removeAiAction("text-action")
    expect(context.getAllAiActions()).toHaveLength(1)

    // Clear cache
    context.clearCache()
    expect(context.getAllAiActions()).toHaveLength(0)
  })

  it("should generate invocation parameters", () => {
    const context = new AiActionToolContext("space1", "master")
    context.addAiAction(mockTextAction)

    const toolInput = {
      var1: "value1",
      var2: "value2",
      outputFormat: "PlainText",
      waitForCompletion: false,
    }

    const params = context.getInvocationParams("text-action", toolInput)

    expect(params).toEqual({
      spaceId: "space1",
      environmentId: "master",
      aiActionId: "text-action",
      outputFormat: "PlainText",
      variables: [
        { id: "var1", value: "value1" },
        { id: "var2", value: "value2" },
      ],
      waitForCompletion: false,
    })
  })

  it("should use friendly parameter names in tool schema and map them back for invocation", () => {
    // Create a mock AI Action with cryptic variable IDs
    const crypticAction: AiActionEntity = {
      sys: {
        id: "cryptic-action",
        type: "AiAction",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        version: 1,
        space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
        createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
        updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
      },
      name: "Cryptic Action",
      description: "An action with cryptic IDs",
      instruction: {
        template: "Template with {{x7yz12b}} and {{87abcde}}",
        variables: [
          { id: "x7yz12b", type: "Text", name: "First Variable", description: "Named text input" },
          { id: "87abcde", type: "StandardInput", description: "Unnamed standard input" },
        ],
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.5,
      },
    }

    // Generate tool schema
    const schema = generateAiActionToolSchema(crypticAction)

    // Check that friendly names are used in the schema
    const inputSchema = schema.inputSchema
    expect(inputSchema.properties).toHaveProperty("first_variable") // snake_case conversion of name
    expect(inputSchema.properties).toHaveProperty("input_text") // Standard naming for StandardInput
    expect(inputSchema.properties).not.toHaveProperty("x7yz12b") // Original ID not used
    expect(inputSchema.properties).not.toHaveProperty("87abcde") // Original ID not used

    // Test parameter translation
    const context = new AiActionToolContext("space1", "master")
    context.addAiAction(crypticAction)

    // Input using friendly names
    const toolInput = {
      first_variable: "value1",
      input_text: "value2",
      outputFormat: "Markdown",
    }

    const params = context.getInvocationParams("cryptic-action", toolInput)

    // Verify the parameters were translated to original IDs
    expect(params.variables).toEqual([
      { id: "x7yz12b", value: "value1" },
      { id: "87abcde", value: "value2" },
    ])
  })
})
