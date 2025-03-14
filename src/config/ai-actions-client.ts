import { getContentfulClient } from "./client"
import type {
  AiActionEntity,
  AiActionEntityCollection,
  AiActionInvocation,
  AiActionInvocationType,
  AiActionSchemaParsed,
  StatusFilter
} from "../types/ai-actions"

/**
 * Parameters for AI Action API operations
 */

// List AI Actions
export interface ListAiActionsParams {
  spaceId: string
  environmentId?: string
  limit?: number
  skip?: number
  status?: StatusFilter
}

// Get AI Action
export interface GetAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
}

// Create AI Action
export interface CreateAiActionParams {
  spaceId: string
  actionData: AiActionSchemaParsed
}

// Update AI Action
export interface UpdateAiActionParams {
  spaceId: string
  aiActionId: string
  version: number
  actionData: AiActionSchemaParsed
}

// Delete AI Action
export interface DeleteAiActionParams {
  spaceId: string
  aiActionId: string
  version: number
}

// Publish AI Action
export interface PublishAiActionParams {
  spaceId: string
  aiActionId: string
  version: number
}

// Unpublish AI Action
export interface UnpublishAiActionParams {
  spaceId: string
  aiActionId: string
}

// Invoke AI Action
export interface InvokeAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  invocationData: AiActionInvocationType
}

// Get AI Action invocation
export interface GetAiActionInvocationParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  invocationId: string
}

/**
 * AI Actions client for interacting with the Contentful API
 */
export const aiActionsClient = {
  /**
   * List AI Actions in a space
   */
  async listAiActions({ 
    spaceId, 
    environmentId = "master", 
    limit = 100, 
    skip = 0,
    status
  }: ListAiActionsParams): Promise<AiActionEntityCollection> {
    const client = await getContentfulClient()
    
    // Build the URL for listing AI actions
    let url = `/spaces/${spaceId}/ai/actions`
    const queryParams = new URLSearchParams()
    
    queryParams.append("limit", limit.toString())
    queryParams.append("skip", skip.toString())
    if (status) {
      queryParams.append("status", status)
    }
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    const response = await client.raw.get(url)
    return (response as any).data as AiActionEntityCollection
  },

  /**
   * Get a specific AI Action
   */
  async getAiAction({
    spaceId,
    environmentId = "master",
    aiActionId
  }: GetAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions/${aiActionId}`
    const response = await client.raw.get(url)
    return (response as any).data as AiActionEntity
  },

  /**
   * Create a new AI Action
   */
  async createAiAction({
    spaceId,
    actionData
  }: CreateAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions`
    const response = await client.raw.post(url, actionData)
    return (response as any).data as AiActionEntity
  },

  /**
   * Update an existing AI Action
   */
  async updateAiAction({
    spaceId,
    aiActionId,
    version,
    actionData
  }: UpdateAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions/${aiActionId}`
    const headers = {
      "X-Contentful-Version": version.toString()
    }
    
    const response = await client.raw.put(url, actionData, { headers })
    return (response as any).data as AiActionEntity
  },

  /**
   * Delete an AI Action
   */
  async deleteAiAction({
    spaceId,
    aiActionId,
    version
  }: DeleteAiActionParams): Promise<void> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions/${aiActionId}`
    const headers = {
      "X-Contentful-Version": version.toString()
    }
    
    await client.raw.delete(url, { headers })
  },

  /**
   * Publish an AI Action
   */
  async publishAiAction({
    spaceId,
    aiActionId,
    version
  }: PublishAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions/${aiActionId}/published`
    const headers = {
      "X-Contentful-Version": version.toString()
    }
    
    const response = await client.raw.put(url, {}, { headers })
    return (response as any).data as AiActionEntity
  },

  /**
   * Unpublish an AI Action
   */
  async unpublishAiAction({
    spaceId,
    aiActionId
  }: UnpublishAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()
    
    const url = `/spaces/${spaceId}/ai/actions/${aiActionId}/published`
    const response = await client.raw.delete(url)
    return (response as any).data as AiActionEntity
  },

  /**
   * Invoke an AI Action
   */
  async invokeAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
    invocationData
  }: InvokeAiActionParams): Promise<AiActionInvocation> {
    const client = await getContentfulClient()
    
    let url = `/spaces/${spaceId}`
    if (environmentId) {
      url += `/environments/${environmentId}`
    }
    url += `/ai/actions/${aiActionId}/invoke`
    
    const headers = {
      "X-Contentful-Include-Invocation-Metadata": "true"
    }
    
    const response = await client.raw.post(url, invocationData, { headers })
    return (response as any).data as AiActionInvocation
  },

  /**
   * Get an AI Action invocation result
   */
  async getAiActionInvocation({
    spaceId,
    environmentId = "master",
    aiActionId,
    invocationId
  }: GetAiActionInvocationParams): Promise<AiActionInvocation> {
    const client = await getContentfulClient()
    
    let url = `/spaces/${spaceId}`
    if (environmentId) {
      url += `/environments/${environmentId}`
    }
    url += `/ai/actions/${aiActionId}/invocations/${invocationId}`
    
    const headers = {
      "X-Contentful-Include-Invocation-Metadata": "true"
    }
    
    const response = await client.raw.get(url, { headers })
    return (response as any).data as AiActionInvocation
  },

  /**
   * Poll an AI Action invocation until it is complete or fails
   * @param params The invocation parameters
   * @param maxAttempts Maximum number of polling attempts
   * @param initialDelay Initial delay in ms between polling attempts
   * @param maxDelay Maximum delay in ms between polling attempts
   */
  async pollInvocation(
    params: GetAiActionInvocationParams,
    maxAttempts = 10,
    initialDelay = 1000,
    maxDelay = 5000
  ): Promise<AiActionInvocation> {
    let attempts = 0
    let delay = initialDelay
    
    while (attempts < maxAttempts) {
      const invocation = await this.getAiActionInvocation(params)
      
      if (invocation.sys.status === "COMPLETED" || 
          invocation.sys.status === "FAILED" || 
          invocation.sys.status === "CANCELLED") {
        return invocation
      }
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.5, maxDelay)
      attempts++
    }
    
    throw new Error(`AI Action invocation polling exceeded maximum attempts (${maxAttempts})`)
  }
}