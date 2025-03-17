import { describe, it, expect } from "vitest"
import type {
  AiActionEntity,
  Variable,
  Instruction,
  Configuration,
  VariableValue,
  AiActionInvocation
} from "../../src/types/ai-actions"

describe("AI Action Types", () => {
  it("should validate Variable type structure", () => {
    // Test creating variables of different types
    const textVariable: Variable = {
      id: "text-var",
      type: "Text",
      name: "Text Variable",
      description: "A text variable"
    }

    const optionsVariable: Variable = {
      id: "options-var",
      type: "StringOptionsList",
      name: "Options Variable",
      configuration: {
        values: ["option1", "option2", "option3"],
        allowFreeFormInput: false
      }
    }

    const referenceVariable: Variable = {
      id: "ref-var",
      type: "Reference",
      name: "Reference Variable",
      configuration: {
        allowedEntities: ["Entry"]
      } as any
    }

    expect(textVariable.id).toBe("text-var")
    expect(optionsVariable.type).toBe("StringOptionsList")
    expect((referenceVariable.configuration as any)?.allowedEntities).toContain("Entry")
  })

  it("should validate Instruction type structure", () => {
    const instruction: Instruction = {
      template: "This is a template with {{var1}} and {{var2}}",
      variables: [
        { id: "var1", type: "Text" },
        { id: "var2", type: "StandardInput" }
      ],
      conditions: [
        { id: "cond1", variable: "var1", operator: "eq", value: "some value" }
      ]
    }

    expect(instruction.template).toContain("{{var1}}")
    expect(instruction.variables).toHaveLength(2)
    expect(instruction.conditions?.[0].operator).toBe("eq")
  })

  it("should validate Configuration type structure", () => {
    const config: Configuration = {
      modelType: "gpt-4",
      modelTemperature: 0.7
    }

    expect(config.modelType).toBe("gpt-4")
    expect(config.modelTemperature).toBe(0.7)
  })

  it("should validate variable value structure", () => {
    const textValue: VariableValue = {
      id: "text-var",
      value: "some text value"
    }

    const refValue: VariableValue = {
      id: "ref-var",
      value: {
        entityType: "Entry",
        entityId: "entry123",
        entityPath: "fields.title"
      }
    }

    expect(textValue.value).toBe("some text value")
    expect(refValue.value.entityType).toBe("Entry")
  })

  it("should validate AiActionEntity structure", () => {
    const entity: AiActionEntity = {
      sys: {
        id: "action1",
        type: "AiAction",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        version: 1,
        space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
        createdBy: { sys: { id: "user1", linkType: "User", type: "Link" } },
        updatedBy: { sys: { id: "user1", linkType: "User", type: "Link" } }
      },
      name: "Test Action",
      description: "A test action",
      instruction: {
        template: "Template with {{var}}",
        variables: [{ id: "var", type: "Text" }]
      },
      configuration: {
        modelType: "gpt-4",
        modelTemperature: 0.5
      }
    }

    expect(entity.sys.id).toBe("action1")
    expect(entity.name).toBe("Test Action")
    expect(entity.instruction.variables).toHaveLength(1)
  })

  it("should validate AiActionInvocation structure", () => {
    const invocation: AiActionInvocation = {
      sys: {
        id: "inv1",
        type: "AiActionInvocation",
        space: { sys: { id: "space1", linkType: "Space", type: "Link" } },
        environment: { sys: { id: "master", linkType: "Environment", type: "Link" } },
        aiAction: { sys: { id: "action1", linkType: "AiAction", type: "Link" } },
        status: "COMPLETED"
      },
      result: {
        type: "text",
        content: "Generated content",
        metadata: {
          invocationResult: {
            aiAction: {
              sys: {
                id: "action1",
                linkType: "AiAction",
                type: "Link",
                version: 1
              }
            },
            outputFormat: "PlainText",
            promptTokens: 50,
            completionTokens: 100,
            modelId: "gpt-4",
            modelProvider: "OpenAI"
          }
        }
      }
    }

    expect(invocation.sys.status).toBe("COMPLETED")
    expect(invocation.result?.content).toBe("Generated content")
    expect(invocation.result?.metadata.invocationResult.promptTokens).toBe(50)
  })
})