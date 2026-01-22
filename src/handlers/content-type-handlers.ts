/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContentfulClient } from "../config/client.js"
import { ContentTypeProps, CreateContentTypeProps } from "contentful-management"
import { toCamelCase } from "../utils/to-camel-case.js"
import {summarizeData} from "../utils/summarizer.js";

export const contentTypeHandlers = {
  listContentTypes: async (args: { spaceId: string; environmentId: string, limit?: number, skip?: number }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId
    const { limit = 3, skip = 0 } = args

    const params = {
      spaceId,
      environmentId,
      limit,
      skip,
    }

    const contentfulClient = await getContentfulClient()
    const contentTypes = await contentfulClient.contentType.getMany(params)
    const summarized = summarizeData(contentTypes, {
      maxItems: limit,
      remainingMessage: "To see more content types, please ask me to retrieve the next page.",
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
      contentTypeId: toCamelCase(args.name),
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
    const contentType = await contentfulClient.contentType.createWithId(params, contentTypeProps)

    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    }
  },

  updateContentType: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
    name?: string
    fields?: any[]
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

    // Use the new fields if provided, otherwise keep existing fields
    const fields = args.fields || currentContentType.fields

    // If fields are provided, ensure we're not removing any required field metadata
    // This creates a map of existing fields by ID for easier lookup
    if (args.fields) {
      const existingFieldsMap = currentContentType.fields.reduce((acc: Record<string, any>, field: any) => {
        acc[field.id] = field
        return acc
      }, {})

      // Ensure each field has all required metadata
      fields.forEach((field: any) => {
        const existingField = existingFieldsMap[field.id]
        if (existingField) {
          // If this is an existing field, ensure we preserve any metadata not explicitly changed
          // This prevents losing validations, linkType, etc.
          field.validations = field.validations || existingField.validations

          // Preserve required flag if not explicitly set
          if (field.required === undefined && existingField.required !== undefined) {
            field.required = existingField.required
          }

          if (field.type === 'Link' && !field.linkType && existingField.linkType) {
            field.linkType = existingField.linkType
          }

          if (field.type === 'Array' && !field.items && existingField.items) {
            field.items = existingField.items
          }
        }
      })
    }

    const contentTypeProps: ContentTypeProps = {
      name: args.name || currentContentType.name,
      fields: fields,
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
