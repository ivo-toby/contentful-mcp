import { contentfulClient } from "../config/client.js";
import { HandlerArgs } from "../types/tools";

export const assetHandlers = {
  uploadAsset: async (args: HandlerArgs & {
    title: string;
    description?: string;
    file: {
      fileName: string;
      contentType: string;
      upload?: string;
    };
  }) => {
    const asset = await contentfulClient.asset.create({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      fields: {
        title: { "en-US": args.title },
        description: args.description
          ? { "en-US": args.description }
          : undefined,
        file: { "en-US": args.file },
      },
    });
    const processedAsset = await contentfulClient.asset.processForAllLocales({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: asset.sys.id,
    });
    return {
      content: [
        { type: "text", text: JSON.stringify(processedAsset, null, 2) },
      ],
    };
  },

  getAsset: async (args: HandlerArgs & {
    assetId: string;
  }) => {
    const asset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(asset, null, 2) }],
    };
  },

  updateAsset: async (args: HandlerArgs & {
    assetId: string;
    title?: string;
    description?: string;
    file?: {
      fileName: string;
      contentType: string;
      upload?: string;
    };
  }) => {
    // First get the current asset to get its version
    const currentAsset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
    });

    const fields: Record<string, any> = {};
    if (args.title) fields.title = { "en-US": args.title };
    if (args.description) fields.description = { "en-US": args.description };
    if (args.file) fields.file = { "en-US": args.file };

    const asset = await contentfulClient.asset.update(
      {
        spaceId: args.spaceId,
        environmentId: args.environmentId || "master",
        assetId: args.assetId,
      },
      {
        sys: {
          version: currentAsset.sys.version
        },
        fields
      }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(asset, null, 2) }],
    };
  },

  deleteAsset: async (args: HandlerArgs & {
    assetId: string;
  }) => {
    // First get the current asset to get its version
    const currentAsset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
    });

    await contentfulClient.asset.delete({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
      version: currentAsset.sys.version,
    });
    return {
      content: [
        { type: "text", text: `Asset ${args.assetId} deleted successfully` },
      ],
    };
  },

  publishAsset: async (args: HandlerArgs & {
    assetId: string;
  }) => {
    // First get the current asset to get its version
    const currentAsset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
    });

    const asset = await contentfulClient.asset.publish(
      {
        spaceId: args.spaceId,
        environmentId: args.environmentId || "master",
        assetId: args.assetId,
      },
      {
        sys: {
          version: currentAsset.sys.version
        }
      }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(asset, null, 2) }],
    };
  },

  unpublishAsset: async (args: HandlerArgs & {
    assetId: string;
  }) => {
    // First get the current asset to get its version
    const currentAsset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
    });

    const asset = await contentfulClient.asset.unpublish({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
      version: currentAsset.sys.version,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(asset, null, 2) }],
    };
  },
};
