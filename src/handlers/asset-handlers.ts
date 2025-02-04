/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateAssetProps } from "contentful-management"
import { getContentfulClient } from "../config/client.js"

type BaseAssetParams = {
  spaceId: string
  environmentId: string
  assetId: string
}

const formatResponse = (data: any) => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
})

const getCurrentAsset = async (params: BaseAssetParams) => {
  const contentfulClient = await getContentfulClient()
  return contentfulClient.asset.get(params)
}

export const assetHandlers = {
  uploadAsset: async (args: {
    spaceId: string
    environmentId: string
    title: string
    description?: string
    file: {
      fileName: string
      contentType: string
      upload?: string
    }
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
    }

    const assetProps: CreateAssetProps = {
      fields: {
        title: { "en-US": args.title },
        description: args.description ? { "en-US": args.description } : undefined,
        file: { "en-US": args.file },
      },
    }

    const contentfulClient = await getContentfulClient()
    const asset = await contentfulClient.asset.create(params, assetProps)

    const processedAsset = await contentfulClient.asset.processForAllLocales(
      params,
      {
        sys: asset.sys,
        fields: asset.fields,
      },
      {},
    )

    return formatResponse(processedAsset)
  },

  getAsset: async (args: { spaceId: string; environmentId: string; assetId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      assetId: args.assetId,
    }

    const contentfulClient = await getContentfulClient()
    const asset = await contentfulClient.asset.get(params)
    return formatResponse(asset)
  },

  updateAsset: async (args: {
    spaceId: string
    environmentId: string
    assetId: string
    title?: string
    description?: string
    file?: {
      fileName: string
      contentType: string
      upload?: string
    }
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      assetId: args.assetId,
    }
    const currentAsset = await getCurrentAsset(params)

    const fields: Record<string, any> = {}
    if (args.title) fields.title = { "en-US": args.title }
    if (args.description) fields.description = { "en-US": args.description }
    if (args.file) fields.file = { "en-US": args.file }
    const updateParams = {
      fields: {
        title: args.title ? { "en-US": args.title } : currentAsset.fields.title,
        description: args.description
          ? { "en-US": args.description }
          : currentAsset.fields.description,
        file: args.file ? { "en-US": args.file } : currentAsset.fields.file,
      },
      sys: currentAsset.sys,
    }

    const contentfulClient = await getContentfulClient()
    const asset = await contentfulClient.asset.update(params, updateParams)

    return formatResponse(asset)
  },

  deleteAsset: async (args: { spaceId: string; environmentId: string; assetId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      assetId: args.assetId,
    }
    const currentAsset = await getCurrentAsset(params)

    const contentfulClient = await getContentfulClient()
    await contentfulClient.asset.delete({
      ...params,
      version: currentAsset.sys.version,
    })

    return formatResponse({
      message: `Asset ${args.assetId} deleted successfully`,
    })
  },

  publishAsset: async (args: { spaceId: string; environmentId: string; assetId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      assetId: args.assetId,
    }
    const currentAsset = await getCurrentAsset(params)

    const contentfulClient = await getContentfulClient()
    const asset = await contentfulClient.asset.publish(params, {
      sys: currentAsset.sys,
      fields: currentAsset.fields,
    })

    return formatResponse(asset)
  },

  unpublishAsset: async (args: { spaceId: string; environmentId: string; assetId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      assetId: args.assetId,
    }
    const currentAsset = await getCurrentAsset(params)

    const contentfulClient = await getContentfulClient()
    const asset = await contentfulClient.asset.unpublish({
      ...params,
      version: currentAsset.sys.version,
    })

    return formatResponse(asset)
  },
}
