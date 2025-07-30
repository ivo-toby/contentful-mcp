/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContentfulClient } from "../config/client.js"
import { summarizeData } from "../utils/summarizer.js"

export const commentHandlers = {
  getComments: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    bodyFormat?: "plain-text" | "rich-text"
    status?: "active" | "resolved" | "all"
  }) => {
    const spaceId =
      process.env.SPACE_ID && process.env.SPACE_ID !== "undefined"
        ? process.env.SPACE_ID
        : args.spaceId
    const environmentId =
      process.env.ENVIRONMENT_ID && process.env.ENVIRONMENT_ID !== "undefined"
        ? process.env.ENVIRONMENT_ID
        : args.environmentId
    const { entryId, bodyFormat = "plain-text", status = "active" } = args

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

    const summarized = summarizeData(comments, {
      maxItems: 10,
      remainingMessage: "To see more comments, please ask me to retrieve the next page.",
    })

    return {
      content: [
        {
          type: "text",
          text: `Retrieved ${comments.total} comments for entry ${entryId}:\n\n${JSON.stringify(summarized, null, 2)}`,
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
          text: `Successfully created ${parent ? "reply" : "comment"} on entry ${entryId}:\n\n${JSON.stringify(comment, null, 2)}`,
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
          text: `Retrieved comment ${commentId} for entry ${entryId}:\n\n${JSON.stringify(comment, null, 2)}`,
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
          text: `Successfully deleted comment ${commentId} from entry ${entryId}`,
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
          text: `Successfully updated comment ${commentId} on entry ${entryId}:\n\n${JSON.stringify(comment, null, 2)}`,
        },
      ],
    }
  },
}
