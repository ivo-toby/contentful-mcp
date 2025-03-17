/* eslint-disable @typescript-eslint/no-explicit-any */
import { aiActionsClient } from "../config/ai-actions-client"
import type {
  AiActionEntity,
  AiActionEntityCollection,
  AiActionInvocation,
  AiActionInvocationType,
  StatusFilter,
  AiActionSchemaParsed,
  OutputFormat,
} from "../types/ai-actions"

/**
 * Parameter types for AI Action handlers
 */
export interface ListAiActionsParams {
  spaceId: string
  environmentId?: string
  limit?: number
  skip?: number
  status?: StatusFilter
}

export interface GetAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
}

export interface CreateAiActionParams {
  spaceId: string
  environmentId?: string
  name: string
  description: string
  instruction: {
    template: string
    variables: any[]
    conditions?: any[]
  }
  configuration: {
    modelType: string
    modelTemperature: number
  }
  testCases?: any[]
}

export interface UpdateAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  name: string
  description: string
  instruction: {
    template: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conditions?: any[]
  }
  configuration: {
    modelType: string
    modelTemperature: number
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCases?: any[]
}

export interface DeleteAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
}

export interface PublishAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
}

export interface UnpublishAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
}

// Base interface for AI Action invocation
export interface InvokeAiActionBaseParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  outputFormat?: OutputFormat
  waitForCompletion?: boolean
}

// For direct string variables
export interface InvokeAiActionWithVariablesParams extends InvokeAiActionBaseParams {
  variables?: Record<string, string>
}

// For raw variable array with complex types
export interface InvokeAiActionWithRawVariablesParams extends InvokeAiActionBaseParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawVariables?: any[]
}

// Union type for both invocation parameter types
export type InvokeAiActionParams =
  | InvokeAiActionWithVariablesParams
  | InvokeAiActionWithRawVariablesParams

export interface GetAiActionInvocationParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  invocationId: string
}

/**
 * Error handling utility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatError(error: any): { isError: true; message: string } {
  const message = error?.response?.data?.message || error?.message || "Unknown error"
  return { isError: true, message }
}

/**
 * AI Action handlers for the MCP server
 */
export const aiActionHandlers = {
  /**
   * List AI Actions
   */
  async listAiActions(
    params: ListAiActionsParams,
  ): Promise<AiActionEntityCollection | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { limit, skip, status } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      const result = await aiActionsClient.listAiActions({
        spaceId,
        environmentId,
        limit,
        skip,
        status,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Get a specific AI Action
   */
  async getAiAction(
    params: GetAiActionParams,
  ): Promise<AiActionEntity | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      const result = await aiActionsClient.getAiAction({
        spaceId,
        environmentId,
        aiActionId,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Create a new AI Action
   */
  async createAiAction(
    params: CreateAiActionParams,
  ): Promise<AiActionEntity | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { name, description, instruction, configuration, testCases } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      const actionData: AiActionSchemaParsed = {
        name,
        description,
        instruction,
        configuration,
        testCases,
      }

      const result = await aiActionsClient.createAiAction({
        spaceId,
        environmentId,
        actionData,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Update an existing AI Action
   */
  async updateAiAction(
    params: UpdateAiActionParams,
  ): Promise<AiActionEntity | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId, name, description, instruction, configuration, testCases } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      // First, get the current action to get the version
      const currentAction = await aiActionsClient.getAiAction({
        spaceId,
        environmentId,
        aiActionId,
      })

      const actionData: AiActionSchemaParsed = {
        name,
        description,
        instruction,
        configuration,
        testCases,
      }

      const result = await aiActionsClient.updateAiAction({
        spaceId,
        environmentId,
        aiActionId,
        version: currentAction.sys.version,
        actionData,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Delete an AI Action
   */
  async deleteAiAction(
    params: DeleteAiActionParams,
  ): Promise<{ success: true } | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      // First, get the current action to get the version
      const currentAction = await aiActionsClient.getAiAction({
        spaceId,
        environmentId,
        aiActionId,
      })

      await aiActionsClient.deleteAiAction({
        spaceId,
        environmentId,
        aiActionId,
        version: currentAction.sys.version,
      })

      return { success: true }
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Publish an AI Action
   */
  async publishAiAction(
    params: PublishAiActionParams,
  ): Promise<AiActionEntity | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      // First, get the current action to get the version
      const currentAction = await aiActionsClient.getAiAction({
        spaceId,
        environmentId,
        aiActionId,
      })

      const result = await aiActionsClient.publishAiAction({
        spaceId,
        environmentId,
        aiActionId,
        version: currentAction.sys.version,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Unpublish an AI Action
   */
  async unpublishAiAction(
    params: UnpublishAiActionParams,
  ): Promise<AiActionEntity | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      const result = await aiActionsClient.unpublishAiAction({
        spaceId,
        environmentId,
        aiActionId,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Invoke an AI Action
   */
  async invokeAiAction(
    params: InvokeAiActionParams,
  ): Promise<AiActionInvocation | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId, outputFormat = "Markdown", waitForCompletion = true } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      // Prepare variables based on the input format
      let variables = []

      if ("variables" in params && params.variables) {
        // Convert simple key-value variables to the expected format
        variables = Object.entries(params.variables).map(([id, value]) => ({
          id,
          value,
        }))
      } else if ("rawVariables" in params && params.rawVariables) {
        // Use raw variables directly (for complex types like references)
        variables = params.rawVariables
      }

      // Log the variables being sent
      console.error(`Variables for invocation of ${aiActionId}:`, JSON.stringify(variables))

      const invocationData: AiActionInvocationType = {
        outputFormat,
        variables,
      }

      // Log the complete invocation payload
      console.error(
        `Complete invocation payload for ${aiActionId}:`,
        JSON.stringify(invocationData),
      )

      const invocationResult = await aiActionsClient.invokeAiAction({
        spaceId,
        environmentId,
        aiActionId,
        invocationData,
      })

      // If waitForCompletion is false or the status is already COMPLETED, return immediately
      if (
        !waitForCompletion ||
        invocationResult.sys.status === "COMPLETED" ||
        invocationResult.sys.status === "FAILED" ||
        invocationResult.sys.status === "CANCELLED"
      ) {
        return invocationResult
      }

      // Otherwise, poll until completion
      return await aiActionsClient.pollInvocation({
        spaceId,
        environmentId,
        aiActionId,
        invocationId: invocationResult.sys.id,
      })
    } catch (error) {
      return formatError(error)
    }
  },

  /**
   * Get an AI Action invocation result
   */
  async getAiActionInvocation(
    params: GetAiActionInvocationParams,
  ): Promise<AiActionInvocation | { isError: true; message: string }> {
    try {
      // Use provided parameters or fall back to environment variables
      const spaceId = params.spaceId || process.env.SPACE_ID
      const environmentId = params.environmentId || process.env.ENVIRONMENT_ID || "master"
      const { aiActionId, invocationId } = params

      if (!spaceId) {
        return { isError: true, message: "Space ID is required" }
      }

      if (!aiActionId) {
        return { isError: true, message: "AI Action ID is required" }
      }

      if (!invocationId) {
        return { isError: true, message: "Invocation ID is required" }
      }

      const result = await aiActionsClient.getAiActionInvocation({
        spaceId,
        environmentId,
        aiActionId,
        invocationId,
      })

      return result
    } catch (error) {
      return formatError(error)
    }
  },
}
