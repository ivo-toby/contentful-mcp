import { contentfulClient } from "../config/client.js";
import { HandlerArgs } from "../types/tools.js";
import { CreateEntryProps, EntryProps, QueryOptions } from "contentful-management";
import { getSpaceAndEnvironment } from "../utils/space-environment.js";

export const entryHandlers = {
  searchEntries: async (args: HandlerArgs & { query: QueryOptions }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
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
    args: HandlerArgs & {
      contentTypeId: string;
      fields: Record<string, any>;
    },
  ) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
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

  getEntry: async (args: HandlerArgs & { entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      entryId: args.entryId,
    };

    const entry = await contentfulClient.entry.get(params);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    };
  },

  updateEntry: async (
    args: HandlerArgs & {
      entryId: string;
      fields: Record<string, any>;
    },
  ) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
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

  deleteEntry: async (args: HandlerArgs & { entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
      entryId: args.entryId,
    };

    await contentfulClient.entry.delete(params);
    return {
      content: [
        { type: "text", text: `Entry ${args.entryId} deleted successfully` },
      ],
    };
  },

  publishEntry: async (args: HandlerArgs & { entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
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

  unpublishEntry: async (args: HandlerArgs & { entryId: string }) => {
    const params = {
      spaceId: args.spaceId,
      environmentId: args.environmentId || "master",
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
