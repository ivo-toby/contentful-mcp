import { getSpaceEnvProperties } from "../types/tools"
import type { AiActionEntity, Variable, OutputFormat } from "../types/ai-actions"

// Store ID mappings globally - maps actionId to (friendlyName -> originalId)
const idMappings = new Map<string, Map<string, string>>()

// Store path mappings - maps actionId to (friendlyPathName -> originalPathId)
const pathIdMappings = new Map<string, Map<string, string>>()

// Interface for the context object properties
interface IAiActionToolContext {
  spaceId: string
  environmentId?: string
  aiActionCache: Map<string, AiActionEntity>
}

/**
 * Utility function to convert string to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_+/g, "_") // Remove duplicate underscores
}

/**
 * Get a human-readable name for a variable
 */
function getReadableName(variable: Variable): string {
  // If there's a human-readable name provided, use it (converted to snake_case)
  if (variable.name) {
    return toSnakeCase(variable.name)
  }

  // For standard inputs, use descriptive names based on type
  switch (variable.type) {
    case "StandardInput":
      return "input_text"
    case "MediaReference":
      return "media_asset_id"
    case "Reference":
      return "entry_reference_id"
    case "Locale":
      return "target_locale"
    case "FreeFormInput":
      return "free_text_input"
    case "SmartContext":
      return "context_info"
    default:
      // For others, create a prefixed version
      return `${variable.type.toLowerCase()}_${variable.id.substring(0, 5)}`
  }
}

/**
 * Create a mapping from friendly names to original variable IDs
 */
function createReverseMapping(action: AiActionEntity): Map<string, string> {
  const mapping = new Map<string, string>()

  for (const variable of action.instruction.variables || []) {
    const friendlyName = getReadableName(variable)
    mapping.set(friendlyName, variable.id)
  }

  return mapping
}

/**
 * Get an enhanced description for a variable schema
 */
function getEnhancedVariableSchema(variable: Variable): any {
  // Create a rich description that includes type information
  let description = variable.description || `${variable.name || "Variable"}`

  // Add type information
  description += ` (Type: ${variable.type})`

  // Add additional context based on type
  switch (variable.type) {
    case "MediaReference":
      description += ". Provide an asset ID from your Contentful space"
      break
    case "Reference":
      description += ". Provide an entry ID from your Contentful space"
      break
    case "Locale":
      description += ". Use format like 'en-US', 'de-DE', etc."
      break
    case "StringOptionsList":
      if (variable.configuration && "values" in variable.configuration) {
        description += `. Choose one of: ${variable.configuration.values.join(", ")}`
      }
      break
    case "StandardInput":
      description += ". The main text content to process"
      break
  }

  const schema: any = {
    type: "string",
    description,
  }

  // Add enums for StringOptionsList
  if (
    variable.type === "StringOptionsList" &&
    variable.configuration &&
    "values" in variable.configuration
  ) {
    schema.enum = variable.configuration.values
  }

  return schema
}

/**
 * Create an enhanced description for the AI Action tool
 */
function getEnhancedToolDescription(action: AiActionEntity): string {
  // Start with the name and description
  let description = `${action.name}: ${action.description}`

  // Add contextual information about what this AI Action does
  description += "\n\nThis AI Action works on content entries and fields in Contentful."

  // Check if we have reference fields that could use entity paths
  const hasReferences = action.instruction.variables?.some(
    (v) => v.type === "Reference" || v.type === "MediaReference",
  )

  if (hasReferences) {
    description +=
      "\n\n📝 IMPORTANT: When working with entry or asset references, you can use the '_path' parameters to specify which field's content to process. For example, if 'entry_reference' points to an entry, you can use 'entry_reference_path: \"fields.title.en-US\"' to process that entry's title field."
  }

  // Add variable information summary
  if (action.instruction.variables && action.instruction.variables.length > 0) {
    const requiredVars = action.instruction.variables
      .filter((v) => !isOptionalVariable(v))
      .map((v) => v.name || getReadableName(v))

    if (requiredVars.length > 0) {
      description += `\n\nRequired inputs: ${requiredVars.join(", ")}.`
    }
  }

  // Add model information
  description += `\n\nUses ${action.configuration.modelType} model with temperature ${action.configuration.modelTemperature}.`

  // Add note about result handling
  description +=
    "\n\n⚠️ Note: Results from this AI Action are NOT automatically applied to fields. The model will generate content based on your inputs, which you would then need to manually update in your Contentful entry."

  return description
}

/**
 * Generate a dynamic tool schema for an AI Action
 */
export function generateAiActionToolSchema(action: AiActionEntity) {
  // Create property definitions with friendly names
  const properties: Record<string, any> = {}

  // Store the ID mapping for this action
  const reverseMapping = createReverseMapping(action)
  const pathMappings = new Map<string, string>()
  idMappings.set(action.sys.id, reverseMapping)

  // Add properties for each variable with friendly names
  for (const variable of action.instruction.variables || []) {
    const friendlyName = getReadableName(variable)
    properties[friendlyName] = getEnhancedVariableSchema(variable)

    // For Reference and MediaReference types, add an entityPath parameter
    if (variable.type === "Reference" || variable.type === "MediaReference") {
      const pathParamName = `${friendlyName}_path`
      properties[pathParamName] = {
        type: "string",
        description: `Optional field path within the ${variable.type === "Reference" ? "entry" : "asset"} to process (e.g., "fields.title.en-US"). This specifies which field content to use as input.`,
      }

      // Add to path mappings for later use during invocation
      pathMappings.set(pathParamName, `${variable.id}_path`)
    }
  }

  // Store path mappings alongside ID mappings
  if (pathMappings.size > 0) {
    pathIdMappings.set(action.sys.id, pathMappings)
  }

  // Add common properties
  properties.outputFormat = {
    type: "string",
    enum: ["Markdown", "RichText", "PlainText"],
    default: "Markdown",
    description: "Format for the output content",
  }

  properties.waitForCompletion = {
    type: "boolean",
    default: true,
    description: "Whether to wait for the AI Action to complete",
  }

  // Get required field names in their friendly format
  const requiredVars = getRequiredVariables(action.instruction.variables || []).map((id) => {
    const variable = action.instruction.variables.find((v) => v.id === id)
    return variable ? getReadableName(variable) : id
  })

  const toolSchema = {
    name: `ai_action_${action.sys.id}`,
    description: getEnhancedToolDescription(action),
    inputSchema: getSpaceEnvProperties({
      type: "object",
      properties,
      required: requiredVars,
    }),
  }

  return toolSchema
}

/**
 * Get the JSON schema for a variable based on its type
 */
function getVariableSchema(variable: Variable): any {
  const baseSchema = {
    description: variable.description || `Variable: ${variable.name || variable.id}`,
  }

  switch (variable.type) {
    case "Text":
    case "FreeFormInput":
    case "StandardInput":
      return {
        type: "string",
        ...baseSchema,
      }

    case "StringOptionsList":
      if (variable.configuration && "values" in variable.configuration) {
        return {
          type: "string",
          enum: variable.configuration.values,
          ...baseSchema,
        }
      }
      return {
        type: "string",
        ...baseSchema,
      }

    case "Locale":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (locale code, e.g. 'en-US')`,
      }

    case "Reference":
    case "MediaReference":
    case "ResourceLink":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (ID of the referenced entity)`,
      }

    case "SmartContext":
      return {
        type: "string",
        ...baseSchema,
        description: `${baseSchema.description} (context info, usually free text)`,
      }

    default:
      return {
        type: "string",
        ...baseSchema,
      }
  }
}

/**
 * Get the list of required variables based on the variable definitions
 */
function getRequiredVariables(variables: Variable[]): string[] {
  return variables.filter((v) => !isOptionalVariable(v)).map((v) => v.id)
}

/**
 * Check if a variable is optional
 */
function isOptionalVariable(variable: Variable): boolean {
  // Variables with StringOptionsList that allow free form input
  if (
    variable.type === "StringOptionsList" &&
    variable.configuration &&
    "allowFreeFormInput" in variable.configuration &&
    variable.configuration.allowFreeFormInput
  ) {
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
  toolInput: Record<string, any>,
): { variables: any[]; outputFormat: OutputFormat } {
  const variables = []
  const actionVariables = action.instruction.variables || []

  // Map each variable from the tool input to the AI Action invocation format
  for (const variable of actionVariables) {
    const value = toolInput[variable.id]

    // Skip undefined values for optional variables
    if (value === undefined && isOptionalVariable(variable)) {
      continue
    }

    // If value is undefined but variable is required, throw an error
    if (value === undefined && !isOptionalVariable(variable)) {
      throw new Error(`Required parameter ${variable.id} is missing from invocation call`)
    }

    // Format the value based on the variable type
    if (["Reference", "MediaReference", "ResourceLink"].includes(variable.type)) {
      // For reference types, create a complex value
      const complexValue: any = {
        entityType:
          variable.type === "Reference"
            ? "Entry"
            : variable.type === "MediaReference"
              ? "Asset"
              : "ResourceLink",
        entityId: value,
      }

      // Check if there's an entity path specified
      const pathKey = `${variable.id}_path`
      if (toolInput[pathKey]) {
        complexValue.entityPath = toolInput[pathKey]
      }

      variables.push({
        id: variable.id,
        value: complexValue,
      })
    } else {
      // For simple types, pass the value directly
      variables.push({
        id: variable.id,
        value: value,
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
    return this.getAllAiActions().map((action) => generateAiActionToolSchema(action))
  }

  /**
   * Get the parameters needed for invoking an AI Action
   */
  getInvocationParams(
    actionId: string,
    toolInput: Record<string, any>,
  ): {
    spaceId: string
    environmentId: string
    aiActionId: string
    variables: any[]
    outputFormat: OutputFormat
    waitForCompletion: boolean
  } {
    const action = this.getAiAction(actionId)
    if (!action) {
      throw new Error(`AI Action not found: ${actionId}`)
    }

    // Translate user-friendly parameter names to original variable IDs
    const translatedInput = this.translateParametersToVariableIds(actionId, toolInput)

    // Debug the translated input
    console.error(`Translated input for action ${actionId}:`, JSON.stringify(translatedInput))

    // Extract variables and outputFormat
    const { variables, outputFormat } = mapVariablesToInvocationFormat(action, translatedInput)

    // Debug the variables array
    console.error(`Formatted variables for action ${actionId}:`, JSON.stringify(variables))

    const waitForCompletion = toolInput.waitForCompletion !== false

    // Use provided spaceId and environmentId if available, otherwise use defaults
    const spaceId = toolInput.spaceId || this.spaceId
    const environmentId = toolInput.environmentId || this.environmentId

    return {
      spaceId,
      environmentId,
      aiActionId: actionId,
      variables,
      outputFormat,
      waitForCompletion,
    }
  }

  /**
   * Translate friendly parameter names to original variable IDs
   */
  translateParametersToVariableIds(
    actionId: string,
    params: Record<string, any>,
  ): Record<string, any> {
    const idMapping = idMappings.get(actionId)
    const pathMapping = pathIdMappings.get(actionId)

    if (!idMapping && !pathMapping) {
      console.error(`No mappings found for action ${actionId}`)
      return params // No mappings found, return as is
    }

    const result: Record<string, any> = {}

    // Debug information - log all mappings
    if (idMapping) {
      console.error(
        `ID mappings for action ${actionId}:`,
        Array.from(idMapping.entries())
          .map(([k, v]) => `${k} -> ${v}`)
          .join(", "),
      )
    }

    // Copy non-variable parameters directly
    for (const [key, value] of Object.entries(params)) {
      if (key === "outputFormat" || key === "waitForCompletion") {
        result[key] = value
        continue
      }

      // Check if this is a path parameter
      if (pathMapping && key.endsWith("_path")) {
        const originalPathId = pathMapping.get(key)
        if (originalPathId) {
          result[originalPathId] = value
          continue
        }
      }

      // Check if we have a variable ID mapping for this friendly name
      if (idMapping) {
        const originalId = idMapping.get(key)
        if (originalId) {
          result[originalId] = value
          continue
        }
      }

      // No mapping found, keep the original key
      result[key] = value
    }

    return result
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.aiActionCache.clear()
    // Also clear mappings when cache is cleared
    idMappings.clear()
    pathIdMappings.clear()
  }

  /**
   * Get the ID mappings for a specific action
   * (Useful for debugging)
   */
  getIdMappings(actionId: string): Map<string, string> | undefined {
    return idMappings.get(actionId)
  }

  /**
   * Get the path mappings for a specific action
   * (Useful for debugging)
   */
  getPathMappings(actionId: string): Map<string, string> | undefined {
    return pathIdMappings.get(actionId)
  }
}
