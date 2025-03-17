import { getContentfulClient } from "./client"
import type {
  AiActionEntity,
  AiActionEntityCollection,
  AiActionInvocation,
  AiActionInvocationType,
  AiActionSchemaParsed,
  StatusFilter,
} from "../types/ai-actions"

// Alpha header required for AI Actions (temporary - will be removed in 2-3 weeks)
// TODO: Remove alpha header after 2-3 weeks (around May 2025) when it's no longer required
const ALPHA_HEADER_NAME = "X-Contentful-Enable-Alpha-Feature"
const ALPHA_HEADER_VALUE = "ai-service"

/**
 * Add alpha header to request options
 * @param options Request options
 * @returns Options with alpha header added
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAlphaHeader(options: any = {}): any {
  const headers = options.headers || {}
  return {
    ...options,
    headers: {
      ...headers,
      [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
    },
  }
}

/**
 * Extract data from response, handling both direct response and response.data formats
 * @param response API response from contentful-management client
 * @returns Extracted data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractResponseData<T>(response: any): T {
  // If we have a response but no data property, check if the response itself is the data
  if (response && !response.data && typeof response === "object") {
    // For collections (AI Action listing)
    if ("items" in response && "sys" in response && response.sys.type === "Array") {
      return response as T
    }

    // For single entities (AI Action retrieval)
    if ("sys" in response) {
      return response as T
    }
  }

  // Default to the data property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any).data as T
}

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
  environmentId?: string
  actionData: AiActionSchemaParsed
}

// Update AI Action
export interface UpdateAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  version: number
  actionData: AiActionSchemaParsed
}

// Delete AI Action
export interface DeleteAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  version: number
}

// Publish AI Action
export interface PublishAiActionParams {
  spaceId: string
  environmentId?: string
  aiActionId: string
  version: number
}

// Unpublish AI Action
export interface UnpublishAiActionParams {
  spaceId: string
  environmentId?: string
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
    status,
  }: ListAiActionsParams): Promise<AiActionEntityCollection> {
    const client = await getContentfulClient()

    // Build the URL for listing AI actions
    let url = `/spaces/${spaceId}`

    // Add environment if specified (API uses space-level endpoint for AI Actions)
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += "/ai/actions"
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

    const response = await client.raw.get(url, withAlphaHeader())
    return extractResponseData<AiActionEntityCollection>(response)
  },

  /**
   * Get a specific AI Action
   */
  async getAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
  }: GetAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions/${aiActionId}`

    const response = await client.raw.get(url, withAlphaHeader())
    return extractResponseData<AiActionEntity>(response)
  },

  /**
   * Create a new AI Action
   */
  async createAiAction({
    spaceId,
    environmentId = "master",
    actionData,
  }: CreateAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions`

    const response = await client.raw.post(url, actionData, withAlphaHeader())
    return extractResponseData<AiActionEntity>(response)
  },

  /**
   * Update an existing AI Action
   */
  async updateAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
    version,
    actionData,
  }: UpdateAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions/${aiActionId}`
    const headers = {
      "X-Contentful-Version": version.toString(),
    }

    const response = await client.raw.put(url, actionData, withAlphaHeader({ headers }))
    return extractResponseData<AiActionEntity>(response)
  },

  /**
   * Delete an AI Action
   */
  async deleteAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
    version,
  }: DeleteAiActionParams): Promise<void> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions/${aiActionId}`
    const headers = {
      "X-Contentful-Version": version.toString(),
    }

    await client.raw.delete(url, withAlphaHeader({ headers }))
  },

  /**
   * Publish an AI Action
   */
  async publishAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
    version,
  }: PublishAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions/${aiActionId}/published`
    const headers = {
      "X-Contentful-Version": version.toString(),
    }

    const response = await client.raw.put(url, {}, withAlphaHeader({ headers }))
    return extractResponseData<AiActionEntity>(response)
  },

  /**
   * Unpublish an AI Action
   */
  async unpublishAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
  }: UnpublishAiActionParams): Promise<AiActionEntity> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`

    // Add environment if specified
    if (environmentId) {
      url += `/environments/${environmentId}`
    }

    url += `/ai/actions/${aiActionId}/published`
    const response = await client.raw.delete(url, withAlphaHeader())
    return extractResponseData<AiActionEntity>(response)
  },

  /**
   * Invoke an AI Action
   */
  async invokeAiAction({
    spaceId,
    environmentId = "master",
    aiActionId,
    invocationData,
  }: InvokeAiActionParams): Promise<AiActionInvocation> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`
    if (environmentId) {
      url += `/environments/${environmentId}`
    }
    url += `/ai/actions/${aiActionId}/invoke`

    const headers = {
      "X-Contentful-Include-Invocation-Metadata": "true",
    }

    // Debug log the invocation data before sending
    console.error(`AI Action invocation request to ${url}:`, JSON.stringify(invocationData))

    const response = await client.raw.post(url, invocationData, withAlphaHeader({ headers }))
    return extractResponseData<AiActionInvocation>(response)
  },

  /**
   * Get an AI Action invocation result
   */
  async getAiActionInvocation({
    spaceId,
    environmentId = "master",
    aiActionId,
    invocationId,
  }: GetAiActionInvocationParams): Promise<AiActionInvocation> {
    const client = await getContentfulClient()

    let url = `/spaces/${spaceId}`
    if (environmentId) {
      url += `/environments/${environmentId}`
    }
    url += `/ai/actions/${aiActionId}/invocations/${invocationId}`

    const headers = {
      "X-Contentful-Include-Invocation-Metadata": "true",
    }

    const response = await client.raw.get(url, withAlphaHeader({ headers }))
    return extractResponseData<AiActionInvocation>(response)
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
    maxDelay = 5000,
  ): Promise<AiActionInvocation> {
    let attempts = 0
    let delay = initialDelay

    while (attempts < maxAttempts) {
      const invocation = await this.getAiActionInvocation(params)

      if (
        invocation.sys.status === "COMPLETED" ||
        invocation.sys.status === "FAILED" ||
        invocation.sys.status === "CANCELLED"
      ) {
        return invocation
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.5, maxDelay)
      attempts++
    }

    throw new Error(`AI Action invocation polling exceeded maximum attempts (${maxAttempts})`)
  },
}
