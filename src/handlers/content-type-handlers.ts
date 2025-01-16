import { contentfulClient } from "../config/client.js";
import {
  ContentTypeProps,
  CreateContentTypeProps,
} from "contentful-management";
import { HandlerArgs } from "../types/tools.js";
import { ensureSpaceAndEnvironment } from "../utils/ensure-space-env-id.js";

export const contentTypeHandlers = {
  listContentTypes: async (args: HandlerArgs) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
    };

    const contentTypes = await contentfulClient.contentType.getMany(params);
    return {
      content: [{ type: "text", text: JSON.stringify(contentTypes, null, 2) }],
    };
  },

  getContentType: async (args: HandlerArgs & { contentTypeId: string }) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
      contentTypeId: args.contentTypeId,
    };

    const contentType = await contentfulClient.contentType.get(params);
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    };
  },

  createContentType: async (
    args: HandlerArgs & {
      name: string;
      fields: any[];
      description?: string;
      displayField?: string;
    },
  ) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
    };

    const contentTypeProps: CreateContentTypeProps = {
      name: args.name,
      fields: args.fields,
      description: args.description || "",
      displayField: args.displayField || args.fields[0]?.id || "",
    };

    const contentType = await contentfulClient.contentType.create(
      params,
      contentTypeProps,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    };
  },

  updateContentType: async (
    args: HandlerArgs & {
      contentTypeId: string;
      name: string;
      fields: any[];
      description?: string;
      displayField?: string;
    },
  ) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
      contentTypeId: args.contentTypeId,
    };

    const currentContentType = await contentfulClient.contentType.get(params);

    const contentTypeProps: ContentTypeProps = {
      name: args.name,
      fields: args.fields,
      description: args.description || currentContentType.description || "",
      displayField: args.displayField || currentContentType.displayField || "",
      sys: currentContentType.sys,
    };

    const contentType = await contentfulClient.contentType.update(
      params,
      contentTypeProps,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
    };
  },

  deleteContentType: async (args: HandlerArgs & { contentTypeId: string }) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
      contentTypeId: args.contentTypeId,
    };

    await contentfulClient.contentType.delete(params);
    return {
      content: [
        {
          type: "text",
          text: `Content type ${args.contentTypeId} deleted successfully`,
        },
      ],
    };
  },

  publishContentType: async (args: HandlerArgs & { contentTypeId: string }) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
      contentTypeId: args.contentTypeId,
    };

    const contentType = await contentfulClient.contentType.get(params);
    await contentfulClient.contentType.publish(params, contentType);

    return {
      content: [
        {
          type: "text",
          text: `Content type ${args.contentTypeId} published successfully`,
        },
      ],
    };
  },
};
