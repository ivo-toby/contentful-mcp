/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContentfulClient } from "../config/client.js"
import { summarizeData } from "../utils/summarizer.js"
import { ContentTypeProps, CreateContentTypeProps } from "contentful-management"

export const contentTypeHandlers = {
  listContentTypes: async (args: { spaceId: string; environmentId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
    }

    const contentfulClient = await getContentfulClient()
    const contentTypes = await contentfulClient.contentType.getMany({
      ...params,
      query: {
        limit: Math.min(args.limit || 3, 3),
        skip: args.skip || 0
      }
    })

    const summarized = summarizeData(contentTypes.items, {
      maxItems: 3,
      remainingMessage: "To see more content types, please ask me to retrieve the next page."
    })

    return {
      content: [{ type: "text", text: JSON.stringify(summarized, null, 2) }],
    }
  },

  getContentType: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      contentTypeId: args.contentTypeId,
    }

    const contentfulClient = await getContentfulClient()
    const contentType = await contentfulClient.contentType.get(params)
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    }
  },

  createContentType: async (args: {
    spaceId: string
    environmentId: string
    name: string
    fields: any[]
    description?: string
    displayField?: string
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
    }

    const contentTypeProps: CreateContentTypeProps = {
      name: args.name,
      fields: args.fields,
      description: args.description || "",
      displayField: args.displayField || args.fields[0]?.id || "",
    }

    const contentfulClient = await getContentfulClient()
    const contentType = await contentfulClient.contentType.create(params, contentTypeProps)
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    }
  },

  updateContentType: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
    name: string
    fields: any[]
    description?: string
    displayField?: string
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      contentTypeId: args.contentTypeId,
    }

    const contentfulClient = await getContentfulClient()
    const currentContentType = await contentfulClient.contentType.get(params)

    const contentTypeProps: ContentTypeProps = {
      name: args.name,
      fields: args.fields,
      description: args.description || currentContentType.description || "",
      displayField: args.displayField || currentContentType.displayField || "",
      sys: currentContentType.sys,
    }

    const contentType = await contentfulClient.contentType.update(params, contentTypeProps)
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    }
  },

  deleteContentType: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      contentTypeId: args.contentTypeId,
    }

    const contentfulClient = await getContentfulClient()
    await contentfulClient.contentType.delete(params)
    return {
      content: [
        {
          type: "text",
          text: `Content type ${args.contentTypeId} deleted successfully`,
        },
      ],
    }
  },

  publishContentType: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      contentTypeId: args.contentTypeId,
    }

    const contentfulClient = await getContentfulClient()
    const contentType = await contentfulClient.contentType.get(params)
    await contentfulClient.contentType.publish(params, contentType)

    return {
      content: [
        {
          type: "text",
          text: `Content type ${args.contentTypeId} published successfully`,
        },
      ],
    }
  },
}
