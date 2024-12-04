import { contentfulClient } from '../config/client';

export const contentTypeHandlers = {
  listContentTypes: async (args: any) => {
    const contentTypes = await contentfulClient.contentType.getMany({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master"
    });
    return { content: [{ type: "text", text: JSON.stringify(contentTypes, null, 2) }] };
  },

  getContentType: async (args: any) => {
    const contentType = await contentfulClient.contentType.get({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      contentTypeId: args.contentTypeId
    });
    return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
  },

  createContentType: async (args: any) => {
    const contentType = await contentfulClient.contentType.create({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      name: args.name,
      fields: args.fields
    });
    return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
  },

  updateContentType: async (args: any) => {
    const contentType = await contentfulClient.contentType.update({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      contentTypeId: args.contentTypeId,
      name: args.name,
      fields: args.fields
    });
    return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
  },

  deleteContentType: async (args: any) => {
    await contentfulClient.contentType.delete({
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      contentTypeId: args.contentTypeId
    });
    return { content: [{ type: "text", text: `Content type ${args.contentTypeId} deleted successfully` }] };
  }
};
