/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContentfulClient } from "../config/client.js"

export const commentHandlers = {
  getComments: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    bodyFormat?: "plain-text" | "rich-text"
    status?: "active" | "resolved" | "all"
    limit?: number
    skip?: number
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, bodyFormat = "plain-text", status = "active", limit = 10, skip = 0 } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
    }

    const contentfulClient = await getContentfulClient()

    // Build query based on status filter
    const query: { status?: "active" | "resolved" } = {}
    if (status !== "all") {
      query.status = status
    }

    // Handle different bodyFormat types separately due to TypeScript overloads
    const comments =
      bodyFormat === "rich-text"
        ? await contentfulClient.comment.getMany({
            ...baseParams,
            bodyFormat: "rich-text" as const,
            query,
          })
        : await contentfulClient.comment.getMany({
            ...baseParams,
            bodyFormat: "plain-text" as const,
            query,
          })

    // Apply manual pagination since Contentful Comments API doesn't support it
    const startIndex = skip
    const endIndex = skip + limit
    const paginatedItems = comments.items.slice(startIndex, endIndex)

    const paginatedResult = {
      items: paginatedItems,
      total: comments.total,
      showing: paginatedItems.length,
      remaining: Math.max(0, comments.total - endIndex),
      skip: endIndex < comments.total ? endIndex : undefined,
      message:
        endIndex < comments.total
          ? "To see more comments, use skip parameter with the provided skip value."
          : undefined,
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(paginatedResult, null, 2),
        },
      ],
    }
  },

  createComment: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    body: string
    status?: "active"
    parent?: string
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, body, parent } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
      // Add parentCommentId to baseParams when parent is provided
      ...(parent && { parentCommentId: parent }),
    }

    const contentfulClient = await getContentfulClient()

    // Simple comment data object (no parent in body)
    const commentData = {
      body,
      status: "active" as const,
    }

    const comment = await contentfulClient.comment.create(baseParams, commentData)

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(comment, null, 2),
        },
      ],
    }
  },

  getSingleComment: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    commentId: string
    bodyFormat?: "plain-text" | "rich-text"
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, commentId, bodyFormat = "plain-text" } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
      commentId,
    }

    const contentfulClient = await getContentfulClient()

    // Handle different bodyFormat types separately due to TypeScript overloads
    const comment =
      bodyFormat === "rich-text"
        ? await contentfulClient.comment.get({
            ...baseParams,
            bodyFormat: "rich-text" as const,
          })
        : await contentfulClient.comment.get({
            ...baseParams,
            bodyFormat: "plain-text" as const,
          })

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(comment, null, 2),
        },
      ],
    }
  },

  deleteComment: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    commentId: string
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, commentId } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
      commentId,
    }

    const contentfulClient = await getContentfulClient()

    // First get the comment to obtain its version
    const comment = await contentfulClient.comment.get({
      ...baseParams,
      bodyFormat: "plain-text" as const,
    })

    // Now delete with the version
    await contentfulClient.comment.delete({
      ...baseParams,
      version: comment.sys.version,
    })

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: `Successfully deleted comment ${commentId} from entry ${entryId}`,
            },
            null,
            2,
          ),
        },
      ],
    }
  },

  updateComment: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    commentId: string
    body?: string
    status?: "active" | "resolved"
    bodyFormat?: "plain-text" | "rich-text"
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, commentId, body, status, bodyFormat = "plain-text" } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
      commentId,
    }

    // Build update data object with only provided fields
    const updateData: { body?: string; status?: "active" | "resolved" } = {}
    if (body !== undefined) updateData.body = body
    if (status !== undefined) updateData.status = status

    const contentfulClient = await getContentfulClient()

    // First get the comment to obtain its version
    const existingComment =
      bodyFormat === "rich-text"
        ? await contentfulClient.comment.get({
            ...baseParams,
            bodyFormat: "rich-text" as const,
          })
        : await contentfulClient.comment.get({
            ...baseParams,
            bodyFormat: "plain-text" as const,
          })

    // Update with the version
    const comment = await contentfulClient.comment.update(baseParams, {
      ...updateData,
      version: existingComment.sys.version,
    })

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(comment, null, 2),
        },
      ],
    }
  },
}
