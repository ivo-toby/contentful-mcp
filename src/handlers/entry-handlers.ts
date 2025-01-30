import { contentfulClient } from "../config/client.js";
import { CreateEntryProps, EntryProps, QueryOptions } from "contentful-management";

export const entryHandlers = {
  searchEntries: async (args: { spaceId: string; environmentId: string; query: QueryOptions }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId;
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId;

    const params = {
      spaceId,
      environmentId,
    };

    const entries = await contentfulClient.entry.getMany({
      ...params,
      query: args.query
    });

    return {
      content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
    };
  },
  createEntry: async (
    args: {
      spaceId: string;
      environmentId: string;
      contentTypeId: string;
      fields: Record<string, any>;
    },
  ) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      contentTypeId: args.contentTypeId,
    };

    const entryProps: CreateEntryProps = {
      fields: args.fields,
    };

    const entry = await contentfulClient.entry.create(params, entryProps);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },

  getEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      entryId: args.entryId,
    };

    const entry = await contentfulClient.entry.get(params);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },

  updateEntry: async (
    args: {
      spaceId: string;
      environmentId: string;
      entryId: string;
      fields: Record<string, any>;
    },
  ) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      entryId: args.entryId,
    };

    const currentEntry = await contentfulClient.entry.get(params);

    const entryProps: EntryProps = {
      fields: args.fields,
      sys: currentEntry.sys,
    };

    const entry = await contentfulClient.entry.update(params, entryProps);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },

  deleteEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      entryId: args.entryId,
    };

    await contentfulClient.entry.delete(params);
    return {
      content: [
        { type: "text", text: `Entry ${args.entryId} deleted successfully` },
      ],
    };
  },

  publishEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      entryId: args.entryId,
    };

    const currentEntry = await contentfulClient.entry.get(params);

    const entry = await contentfulClient.entry.publish(params, {
      sys: currentEntry.sys,
      fields: currentEntry.fields,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },

  unpublishEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId,
      entryId: args.entryId,
    };

    const currentEntry = await contentfulClient.entry.get(params);

    // Add version to params for unpublish
    const entry = await contentfulClient.entry.unpublish({
      ...params,
      version: currentEntry.sys.version,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },
};
