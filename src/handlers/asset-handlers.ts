import { contentfulClient } from '../config/client.js';

export const assetHandlers = {
  uploadAsset: async (args: any) => {
    const asset = await contentfulClient.asset.create({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      fields: {
        title: { 'en-US': args.title },
        description: args.description ? { 'en-US': args.description } : undefined,
        file: { 'en-US': args.file }
      }
    });
    const processedAsset = await contentfulClient.asset.processForAllLocales({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: asset.sys.id
    });
    return { content: [{ type: "text", text: JSON.stringify(processedAsset, null, 2) }] };
  },

  getAsset: async (args: any) => {
    const asset = await contentfulClient.asset.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId
    });
    return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
  },

  updateAsset: async (args: any) => {
    const updateParams: any = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId,
      fields: {}
    };
    
    if (args.title) updateParams.fields.title = { 'en-US': args.title };
    if (args.description) updateParams.fields.description = { 'en-US': args.description };
    if (args.file) updateParams.fields.file = { 'en-US': args.file };

    const asset = await contentfulClient.asset.update(updateParams);
    return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
  },

  deleteAsset: async (args: any) => {
    await contentfulClient.asset.delete({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId
    });
    return { content: [{ type: "text", text: `Asset ${args.assetId} deleted successfully` }] };
  },

  publishAsset: async (args: any) => {
    const asset = await contentfulClient.asset.publish({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId
    });
    return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
  },

  unpublishAsset: async (args: any) => {
    const asset = await contentfulClient.asset.unpublish({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      assetId: args.assetId
    });
    return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
  }
};
