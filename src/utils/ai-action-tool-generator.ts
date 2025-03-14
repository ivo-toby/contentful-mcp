import { getSpaceEnvProperties } from "../types/tools"
import type { AiActionEntity, Variable, OutputFormat } from "../types/ai-actions"

// Interface for the context object properties
interface IAiActionToolContext {
  spaceId: string
  environmentId?: string
  aiActionCache: Map<string, AiActionEntity>
}

/**
 * Generate a dynamic tool schema for an AI Action
 */
export function generateAiActionToolSchema(action: AiActionEntity) {
  const toolSchema = {
    name: `ai_action_${action.sys.id}`,
    description: `${action.name}: ${action.description}`,
    inputSchema: getSpaceEnvProperties({
      type: "object",
      properties: {
        // Add properties for each variable in the AI Action
        ...(action.instruction.variables || []).reduce((acc, variable) => {
          acc[variable.id] = getVariableSchema(variable)
          return acc
        }, {} as Record<string, any>),
        
        // Common properties
        outputFormat: {
          type: "string",
          enum: ["Markdown", "RichText", "PlainText"],
          default: "Markdown",
          description: "Format for the output content"
        },
        waitForCompletion: {
          type: "boolean",
          default: true,
          description: "Whether to wait for the AI Action to complete"
        }
      },
      required: getRequiredVariables(action.instruction.variables || [])
    })
  }

  return toolSchema
}

/**
 * Get the JSON schema for a variable based on its type
 */
function getVariableSchema(variable: Variable): any {
  const baseSchema = {
    description: variable.description || `Variable: ${variable.name || variable.id}`
  }

  switch(variable.type) {
    case "Text":
    case "FreeFormInput":
    case "StandardInput":
      return {
        type: "string",
        ...baseSchema
      }
    
    case "StringOptionsList":
      if (variable.configuration && "values" in variable.configuration) {
        return {
          type: "string",
          enum: variable.configuration.values,
          ...baseSchema
        }
      }
      return {
        type: "string",
        ...baseSchema
      }
    
    case "Locale":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (locale code, e.g. 'en-US')`
      }
    
    case "Reference":
    case "MediaReference":
    case "ResourceLink":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (ID of the referenced entity)`
      }
    
    case "SmartContext":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (context info, usually free text)`
      }
    
    default:
      return {
        type: "string",
        ...baseSchema
      }
  }
}

/**
 * Get the list of required variables based on the variable definitions
 */
function getRequiredVariables(variables: Variable[]): string[] {
  return variables
    .filter(v => !isOptionalVariable(v))
    .map(v => v.id)
}

/**
 * Check if a variable is optional
 */
function isOptionalVariable(variable: Variable): boolean {
  // Variables with StringOptionsList that allow free form input
  if (variable.type === "StringOptionsList" && 
      variable.configuration && 
      "allowFreeFormInput" in variable.configuration && 
      variable.configuration.allowFreeFormInput) {
    return true
  }
  
  // FreeFormInput and StandardInput are usually optional
  if (variable.type === "FreeFormInput" || variable.type === "StandardInput") {
    return true
  }
  
  // SmartContext is usually optional
  if (variable.type === "SmartContext") {
    return true
  }
  
  return false
}

/**
 * Map simple variable values from the tool input to the AI Action invocation format
 */
export function mapVariablesToInvocationFormat(
  action: AiActionEntity,
  toolInput: Record<string, any>
): { variables: any[], outputFormat: OutputFormat } {
  const variables = []
  const actionVariables = action.instruction.variables || []
  
  // Map each variable from the tool input to the AI Action invocation format
  for (const variable of actionVariables) {
    const value = toolInput[variable.id]
    
    // Skip undefined values for optional variables
    if (value === undefined && isOptionalVariable(variable)) {
      continue
    }
    
    // Format the value based on the variable type
    if (["Reference", "MediaReference", "ResourceLink"].includes(variable.type)) {
      // For reference types, create a complex value
      variables.push({
        id: variable.id,
        value: {
          entityType: variable.type === "Reference" ? "Entry" : 
                      variable.type === "MediaReference" ? "Asset" : "ResourceLink",
          entityId: value
        }
      })
    } else {
      // For simple types, pass the value directly
      variables.push({
        id: variable.id,
        value: value
      })
    }
  }
  
  // Get the output format (default to Markdown)
  const outputFormat = (toolInput.outputFormat as OutputFormat) || "Markdown"
  
  return { variables, outputFormat }
}

/**
 * Context for storing and managing dynamic AI Action tools
 */
export class AiActionToolContext {
  private spaceId: string
  private environmentId: string
  private aiActionCache: Map<string, AiActionEntity> = new Map()
  
  constructor(spaceId: string, environmentId: string = "master") {
    this.spaceId = spaceId
    this.environmentId = environmentId
  }
  
  /**
   * Add an AI Action to the cache
   */
  addAiAction(action: AiActionEntity): void {
    this.aiActionCache.set(action.sys.id, action)
  }
  
  /**
   * Get an AI Action from the cache
   */
  getAiAction(actionId: string): AiActionEntity | undefined {
    return this.aiActionCache.get(actionId)
  }
  
  /**
   * Remove an AI Action from the cache
   */
  removeAiAction(actionId: string): void {
    this.aiActionCache.delete(actionId)
  }
  
  /**
   * Get all AI Actions in the cache
   */
  getAllAiActions(): AiActionEntity[] {
    return Array.from(this.aiActionCache.values())
  }
  
  /**
   * Generate schemas for all AI Actions in the cache
   */
  generateAllToolSchemas(): any[] {
    return this.getAllAiActions().map(action => generateAiActionToolSchema(action))
  }
  
  /**
   * Get the parameters needed for invoking an AI Action
   */
  getInvocationParams(actionId: string, toolInput: Record<string, any>): {
    spaceId: string,
    environmentId: string,
    aiActionId: string,
    invocationData: any,
    waitForCompletion: boolean
  } {
    const action = this.getAiAction(actionId)
    if (!action) {
      throw new Error(`AI Action not found: ${actionId}`)
    }
    
    const { variables, outputFormat } = mapVariablesToInvocationFormat(action, toolInput)
    const waitForCompletion = toolInput.waitForCompletion !== false
    
    return {
      spaceId: this.spaceId,
      environmentId: this.environmentId,
      aiActionId: actionId,
      invocationData: {
        outputFormat,
        variables
      },
      waitForCompletion
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.aiActionCache.clear()
  }
}