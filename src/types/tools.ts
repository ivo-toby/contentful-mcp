export interface HandlerArgs {
  spaceId?: string;
  environmentId?: string;
  [key: string]: any;
}

export type HandlerResponse = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

export type Handler = (args: HandlerArgs) => Promise<HandlerResponse>;
// Tool definitions for Entry operations
export const getEntryTools = (config: {
  spaceId?: string;
  environmentId?: string;
}) => ({
  SEARCH_ENTRIES: {
    name: "search_entries",
    description: "Search for entries using query parameters",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId
          ? {}
          : {
              spaceId: {
                type: "string",
                description:
                  "The ID of the Contentful space. This must be the space's ID (like '46jn46y2z40k') not its name. The ID can be found in the URL when viewing the space in Contentful",
              },
            }),
        environmentId: {
          type: "string",
          description:
            "The ID of the environment within the space, by default this will be called Master",
          default: "master",
        },

        query: {
          type: "object",
          description: "Query parameters for searching entries",

          properties: {
            content_type: { type: "string" },
            select: { type: "string" },
            limit: { type: "number" },
            skip: { type: "number" },
            order: { type: "string" },
            query: { type: "string" },
          },
        },
      },
      required: [...(config.spaceId ? [] : ["spaceId"]), "query"],
    },
  },
  CREATE_ENTRY: {
    name: "create_entry",
    description: "Create a new entry in Contentful",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId
          ? {}
          : {
              spaceId: {
                type: "string",
                description:
                  "The ID of the Contentful space. This must be the space's ID (like '46jn46y2z40k') not its name. The ID can be found in the URL when viewing the space in Contentful",
              },
            }),
        environmentId: {
          type: "string",
          description: "The ID of the environment within the space",
          default: "master",
        },
        contentTypeId: {
          type: "string",
          description: "The ID of the content type for the new entry",
        },
        fields: { type: "object", description: "The fields of the entry" },
      },
      required: [
        "contentTypeId",
        "fields",
        ...(config.spaceId ? [] : ["spaceId"]),
      ],
    },
  },
  GET_ENTRY: {
    name: "get_entry",
    description: "Retrieve an existing entry",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
      },
      required: ["entryId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  UPDATE_ENTRY: {
    name: "update_entry",
    description: "Update an existing entry",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
        fields: { type: "object" },
      },
      required: ["entryId", "fields", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  DELETE_ENTRY: {
    name: "delete_entry",
    description: "Delete an entry",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
      },
      required: ["entryId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  PUBLISH_ENTRY: {
    name: "publish_entry",
    description: "Publish an entry",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
      },
      required: ["entryId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  UNPUBLISH_ENTRY: {
    name: "unpublish_entry",
    description: "Unpublish an entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
      },
      required: ["spaceId", "entryId"],
    },
  },
});

// Tool definitions for Asset operations
export const getAssetTools = (config: {
  spaceId?: string;
  environmentId?: string;
}) => ({
  UPLOAD_ASSET: {
    name: "upload_asset",
    description: "Upload a new asset",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        title: { type: "string" },
        description: { type: "string" },
        file: {
          type: "object",
          properties: {
            url: { type: "string" },
            fileName: { type: "string" },
            contentType: { type: "string" },
          },
          required: ["url", "fileName", "contentType"],
        },
      },
      required: ["title", "file", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  GET_ASSET: {
    name: "get_asset",
    description: "Retrieve an asset",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" },
      },
      required: ["assetId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  UPDATE_ASSET: {
    name: "update_asset",
    description: "Update an asset",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        file: {
          type: "object",
          properties: {
            url: { type: "string" },
            fileName: { type: "string" },
            contentType: { type: "string" },
          },
          required: ["url", "fileName", "contentType"],
        },
      },
      required: ["assetId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  DELETE_ASSET: {
    name: "delete_asset",
    description: "Delete an asset",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" },
      },
      required: ["assetId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  PUBLISH_ASSET: {
    name: "publish_asset",
    description: "Publish an asset",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" },
      },
      required: ["assetId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  UNPUBLISH_ASSET: {
    name: "unpublish_asset",
    description: "Unpublish an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" },
      },
      required: ["spaceId", "assetId"],
    },
  },
});

// Tool definitions for Content Type operations
export const getContentTypeTools = (config: {
  spaceId?: string;
  environmentId?: string;
}) => ({
  LIST_CONTENT_TYPES: {
    name: "list_content_types",
    description: "List all content types in a space and environment",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
      },
      required: [...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  GET_CONTENT_TYPE: {
    name: "get_content_type",
    description: "Get details of a specific content type",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" },
      },
      required: ["spaceId", "contentTypeId"],
    },
  },
  CREATE_CONTENT_TYPE: {
    name: "create_content_type",
    description: "Create a new content type",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        name: { type: "string" },
        fields: {
          type: "array",
          items: { type: "object" },
        },
        description: { type: "string" },
        displayField: { type: "string" },
      },
      required: ["name", "fields", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
  UPDATE_CONTENT_TYPE: {
    name: "update_content_type",
    description: "Update an existing content type",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" },
        name: { type: "string" },
        fields: {
          type: "array",
          items: { type: "object" },
        },
        description: { type: "string" },
        displayField: { type: "string" },
      },
      required: [
        "contentTypeId",
        "name",
        "fields",
        ...(config.spaceId ? [] : ["spaceId"]),
      ],
    },
  },
  DELETE_CONTENT_TYPE: {
    name: "delete_content_type",
    description: "Delete a content type",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" },
      },
      required: ["contentTypeId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
});

// Tool definitions for Space & Environment operations
export const getSpaceEnvTools = (config: {
  spaceId?: string;
  environmentId?: string;
}) => ({
  LIST_SPACES: {
    name: "list_spaces",
    description: "List all available spaces",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  GET_SPACE: {
    name: "get_space",
    description: "Get details of a space",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
      },
      required: ["spaceId"],
    },
  },
  LIST_ENVIRONMENTS: {
    name: "list_environments",
    description: "List all environments in a space",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),
      },
      required: ["spaceId"],
    },
  },
  CREATE_ENVIRONMENT: {
    name: "create_environment",
    description: "Create a new environment",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),

        environmentId: { type: "string" },
        name: { type: "string" },
      },
      required: [
        "environmentId",
        "name",
        ...(config.spaceId ? [] : ["spaceId"]),
      ],
    },
  },
  DELETE_ENVIRONMENT: {
    name: "delete_environment",
    description: "Delete an environment",
    inputSchema: {
      type: "object",
      properties: {
        ...(config.spaceId ? {} : { spaceId: { type: "string" } }),

        environmentId: { type: "string" },
      },
      required: ["environmentId", ...(config.spaceId ? [] : ["spaceId"])],
    },
  },
});

// Export tools factory
export const getTools = (config: {
  spaceId?: string;
  environmentId?: string;
}) => ({
  ...getEntryTools(config),
  ...getAssetTools(config),
  ...getSpaceEnvTools(config),
  ...getContentTypeTools(config),
});
