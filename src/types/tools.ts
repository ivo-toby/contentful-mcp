export type HandlerArgs = {
  spaceId?: string;
  environmentId?: string;
  [key: string]: any;
};

export type HandlerResponse = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

export type Handler = (args: HandlerArgs) => Promise<HandlerResponse>;

// Tool definitions for Entry operations
export const ENTRY_TOOLS = {
  SEARCH_ENTRIES: {
    name: "search_entries",
    description: "Search for entries using query parameters",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: {
          type: "string",
          description:
            "The ID of the Contentful space. This must be the space's ID (like '46jn46y2z40k') not its name. The ID can be found in the URL when viewing the space in Contentful",
        },
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
      required: process.env.CONTENTFUL_SPACE_ID ? ["query"] : ["spaceId", "query"],
    },
  },
  CREATE_ENTRY: {
    name: "create_entry",
    description: "Create a new entry in Contentful",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: {
          type: "string",
          description: "The ID of the Contentful space. This must be the space's ID (like '46jn46y2z40k') not its name. The ID can be found in the URL when viewing the space in Contentful",
        },
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
      required: process.env.CONTENTFUL_SPACE_ID ? ["contentTypeId", "fields"] : ["spaceId", "contentTypeId", "fields"],
    },
  },
  GET_ENTRY: {
    name: "get_entry",
    description: "Retrieve an existing entry",
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
  UPDATE_ENTRY: {
    name: "update_entry",
    description: "Update an existing entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" },
        fields: { type: "object" },
      },
      required: ["spaceId", "entryId", "fields"],
    },
  },
  DELETE_ENTRY: {
    name: "delete_entry",
    description: "Delete an entry",
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
  PUBLISH_ENTRY: {
    name: "publish_entry",
    description: "Publish an entry",
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
};

// Tool definitions for Asset operations
export const ASSET_TOOLS = {
  UPLOAD_ASSET: {
    name: "upload_asset",
    description: "Upload a new asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
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
      required: process.env.CONTENTFUL_SPACE_ID ? ["title", "file"] : ["spaceId", "title", "file"],
    },
  },
  GET_ASSET: {
    name: "get_asset",
    description: "Retrieve an asset",
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
  UPDATE_ASSET: {
    name: "update_asset",
    description: "Update an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
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
      required: ["spaceId", "assetId"],
    },
  },
  DELETE_ASSET: {
    name: "delete_asset",
    description: "Delete an asset",
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
  PUBLISH_ASSET: {
    name: "publish_asset",
    description: "Publish an asset",
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
};

// Tool definitions for Content Type operations
export const CONTENT_TYPE_TOOLS = {
  LIST_CONTENT_TYPES: {
    name: "list_content_types",
    description: "List all content types in a space and environment",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
      },
      required: ["spaceId"],
    },
  },
  GET_CONTENT_TYPE: {
    name: "get_content_type",
    description: "Get details of a specific content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
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
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        name: { type: "string" },
        fields: {
          type: "array",
          items: { type: "object" },
        },
        description: { type: "string" },
        displayField: { type: "string" },
      },
      required: ["spaceId", "name", "fields"],
    },
  },
  UPDATE_CONTENT_TYPE: {
    name: "update_content_type",
    description: "Update an existing content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
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
      required: ["spaceId", "contentTypeId", "name", "fields"],
    },
  },
  DELETE_CONTENT_TYPE: {
    name: "delete_content_type",
    description: "Delete a content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" },
      },
      required: ["spaceId", "contentTypeId"],
    },
  },
};

// Tool definitions for Space & Environment operations
export const SPACE_ENV_TOOLS = {
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
        spaceId: { type: "string" },
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
        spaceId: { type: "string" },
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
        spaceId: { type: "string" },
        environmentId: { type: "string" },
        name: { type: "string" },
      },
      required: ["spaceId", "environmentId", "name"],
    },
  },
  DELETE_ENVIRONMENT: {
    name: "delete_environment",
    description: "Delete an environment",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string" },
      },
      required: ["spaceId", "environmentId"],
    },
  },
};

// Function to get required fields based on environment
function getRequiredFields(baseFields: string[]): string[] {
  const hasDefaultSpace = Boolean(process.env.CONTENTFUL_SPACE_ID);
  return hasDefaultSpace 
    ? baseFields.filter(field => field !== 'spaceId')
    : baseFields;
}

// Function to generate tool definitions
export function getTools() {
  const tools = {
    ...ENTRY_TOOLS,
    ...ASSET_TOOLS,
    ...SPACE_ENV_TOOLS,
    ...CONTENT_TYPE_TOOLS,
  };

  // Modify required fields based on environment
  Object.values(tools).forEach(tool => {
    if (tool.inputSchema?.required) {
      tool.inputSchema.required = getRequiredFields(tool.inputSchema.required);
    }
  });

  return tools;
}

// Export combined tools
export const TOOLS = getTools();
