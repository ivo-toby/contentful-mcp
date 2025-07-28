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
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId
    const { entryId, bodyFormat = "plain-text", status = "active" } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
    }

    const contentfulClient = await getContentfulClient()

    // Build query based on status filter
    const query: any = {}
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
    bodyFormat?: "plain-text" | "rich-text"
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId
    const { entryId, body, status = "active", bodyFormat = "plain-text" } = args

    const baseParams = {
      spaceId,
      environmentId,
      entryId,
    }

    const contentfulClient = await getContentfulClient()

    // Handle different bodyFormat types separately due to TypeScript overloads
    const comment =
      bodyFormat === "rich-text"
        ? await contentfulClient.comment.create(baseParams, {
            body,
            status,
          })
        : await contentfulClient.comment.create(baseParams, {
            body,
            status,
          })

    return {
      content: [
        {
          type: "text",
          text: `Successfully created comment on entry ${entryId}:\n\n${JSON.stringify(comment, null, 2)}`,
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
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId
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
}
