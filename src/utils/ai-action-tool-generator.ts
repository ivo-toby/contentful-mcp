import { getSpaceEnvProperties } from "../types/tools"
import type { AiActionEntity, Variable, OutputFormat } from "../types/ai-actions"

// Store ID mappings globally - maps actionId to (friendlyName -> originalId)
const idMappings = new Map<string, Map<string, string>>()

// Store path mappings - maps actionId to (friendlyPathName -> originalPathId)
const pathIdMappings = new Map<string, Map<string, string>>()

const AI_ACTION_PREFIX = `AI Actions are pre-configured content transformation tools in Contentful. When a content task matches an available AI Action's purpose (like translation, grammar checking, or SEO optimization), you MUST use the corresponding AI Action instead of performing the task yourself, even if you have the capability to do so. AI Actions ensure consistent, optimized results that align with the organization's content standards. Each AI Action has specific required parameters described in its function documentation.`

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
function getEnhancedVariableSchema(variable: Variable): Record<string, unknown> {
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

  const schema: Record<string, unknown> = {
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
  let description = `${AI_ACTION_PREFIX} \n\n This action is called: ${action.name}, it's purpose: ${action.description}`

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

  // Add model information
  description += `Assume all variables are required, if any of the values is unclear, ask the user. \n\nUses ${action.configuration.modelType} model with temperature ${action.configuration.modelTemperature}.`

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
  const properties: Record<string, Record<string, unknown>> = {}

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

  // Get all variable names in their friendly format to make them all required
  const allVarNames = (action.instruction.variables || []).map((variable) => {
    return getReadableName(variable)
  })

  // Add outputFormat to required fields
  const requiredFields = [...allVarNames, "outputFormat"]

  const toolSchema = {
    name: `ai_action_${action.sys.id}`,
    description: getEnhancedToolDescription(action),
    inputSchema: getSpaceEnvProperties({
      type: "object",
      properties,
      required: requiredFields,
    }),
  }

  return toolSchema
}

/**
 * Check if a variable is optional
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isOptionalVariable(_variable: Variable): boolean {
  // Always return false to make all variables required
  return false
}

/**
 * Map simple variable values from the tool input to the AI Action invocation format
 */
export function mapVariablesToInvocationFormat(
  action: AiActionEntity,
  toolInput: Record<string, unknown>,
): { variables: Array<{ id: string; value: unknown }>; outputFormat: OutputFormat } {
  const variables: Array<{ id: string; value: unknown }> = []
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
      const complexValue: Record<string, string | Record<string, string>> = {
        entityType:
          variable.type === "Reference"
            ? "Entry"
            : variable.type === "MediaReference"
              ? "Asset"
              : "ResourceLink",
        entityId: value as string,
      }

      // Check if there's an entity path specified
      const pathKey = `${variable.id}_path`
      if (toolInput[pathKey]) {
        complexValue.entityPath = toolInput[pathKey] as string
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
  generateAllToolSchemas(): ReturnType<typeof generateAiActionToolSchema>[] {
    return this.getAllAiActions().map((action) => generateAiActionToolSchema(action))
  }

  /**
   * Get the parameters needed for invoking an AI Action
   */
  getInvocationParams(
    actionId: string,
    toolInput: Record<string, unknown>,
  ): {
    spaceId: string
    environmentId: string
    aiActionId: string
    variables: Array<{ id: string; value: unknown }>
    outputFormat: OutputFormat
    waitForCompletion: boolean
  } {
    const action = this.getAiAction(actionId)
    if (!action) {
      throw new Error(`AI Action not found: ${actionId}`)
    }

    // Translate user-friendly parameter names to original variable IDs
    const translatedInput = this.translateParametersToVariableIds(actionId, toolInput)

    // Extract variables and outputFormat
    const { variables, outputFormat } = mapVariablesToInvocationFormat(action, translatedInput)

    const waitForCompletion = toolInput.waitForCompletion !== false

    // Use provided spaceId and environmentId if available, otherwise use defaults
    const spaceId = (toolInput.spaceId as string) || this.spaceId
    const environmentId = (toolInput.environmentId as string) || this.environmentId

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
    params: Record<string, unknown>,
  ): Record<string, unknown> {
    const idMapping = idMappings.get(actionId)
    const pathMapping = pathIdMappings.get(actionId)

    if (!idMapping && !pathMapping) {
      console.error(`No mappings found for action ${actionId}`)
      return params // No mappings found, return as is
    }

    const result: Record<string, unknown> = {}

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
