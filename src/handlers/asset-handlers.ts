import { CreateAssetProps } from "contentful-management";
import { contentfulClient } from "../config/client.js";
import { HandlerArgs } from "../types/tools.js";
import { getSpaceAndEnvironment } from "../utils/space-environment.js";

type BaseAssetParams = {
  spaceId: string;
  environmentId?: string;
  assetId: string;
};

const getBaseParams = (
  args: HandlerArgs & { assetId: string },
): BaseAssetParams => ({
  ...getSpaceAndEnvironment(args),
  assetId: args.assetId,
});

const formatResponse = (data: any) => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
});

const getCurrentAsset = async (params: BaseAssetParams) => {
  return contentfulClient.asset.get(params);
};

export const assetHandlers = {
  uploadAsset: async (
    args: HandlerArgs & {
      title: string;
      description?: string;
      file: {
        fileName: string;
        contentType: string;
        upload?: string;
      };
    },
  ) => {
    const params = getSpaceAndEnvironment(args);

    const assetProps: CreateAssetProps = {
      fields: {
        title: { "en-US": args.title },
        description: args.description
          ? { "en-US": args.description }
          : undefined,
        file: { "en-US": args.file },
      },
    };

    const asset = await contentfulClient.asset.create(params, assetProps);
    const processedAsset = await contentfulClient.asset.processForAllLocales(
      params,
      {
        sys: asset.sys,
        fields: asset.fields,
      },
      {},
    );

    return formatResponse(processedAsset);
  },

  getAsset: async (args: HandlerArgs & { assetId: string }) => {
    const params = getBaseParams(args);
    const asset = await contentfulClient.asset.get(params);
    return formatResponse(asset);
  },

  updateAsset: async (
    args: HandlerArgs & {
      assetId: string;
      title?: string;
      description?: string;
      file?: {
        fileName: string;
        contentType: string;
        upload?: string;
      };
    },
  ) => {
    const params = getBaseParams(args);
    const currentAsset = await getCurrentAsset(params);

    const fields: Record<string, any> = {};
    if (args.title) fields.title = { "en-US": args.title };
    if (args.description) fields.description = { "en-US": args.description };
    if (args.file) fields.file = { "en-US": args.file };
    const updateParams = {
      fields: {
        title: args.title ? { "en-US": args.title } : currentAsset.fields.title,
        description: args.description
          ? { "en-US": args.description }
          : currentAsset.fields.description,
        file: args.file ? { "en-US": args.file } : currentAsset.fields.file,
      },
      sys: currentAsset.sys,
    };

    const asset = await contentfulClient.asset.update(params, updateParams);

    return formatResponse(asset);
  },

  deleteAsset: async (args: HandlerArgs & { assetId: string }) => {
    const params = getBaseParams(args);
    const currentAsset = await getCurrentAsset(params);

    await contentfulClient.asset.delete({
      ...params,
      version: currentAsset.sys.version,
    });

    return formatResponse({
      message: `Asset ${args.assetId} deleted successfully`,
    });
  },

  publishAsset: async (args: HandlerArgs & { assetId: string }) => {
    const params = getBaseParams(args);
    const currentAsset = await getCurrentAsset(params);

    const asset = await contentfulClient.asset.publish(params, {
      sys: currentAsset.sys,
      fields: currentAsset.fields, // Add the fields property
    });

    return formatResponse(asset);
  },

  unpublishAsset: async (args: HandlerArgs & { assetId: string }) => {
    const params = getBaseParams(args);
    const currentAsset = await getCurrentAsset(params);

    const asset = await contentfulClient.asset.unpublish({
      ...params,
      version: currentAsset.sys.version,
    });

    return formatResponse(asset);
  },
};
