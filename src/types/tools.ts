import { z } from "zod";
import { ContentfulClientAPI } from "../common-types.js";

export type HandlerArgs = {
  spaceId: string;
  environmentId?: string;
  [key: string]: any;
};

export type HandlerResponse = {
  content: Array<{type: string, text: string}>;
  isError?: boolean;
};

export type Handler = (args: HandlerArgs) => Promise<HandlerResponse>;

// Tool definitions for Entry operations
export const ENTRY_TOOLS = {
  CREATE_ENTRY: {
    name: "create_entry",
    description: "Create a new entry in Contentful",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "The ID of the Contentful space" },
        environmentId: { type: "string", description: "The ID of the environment within the space", default: "master" },
        contentTypeId: { type: "string", description: "The ID of the content type for the new entry" },
        fields: { type: "object", description: "The fields of the entry" }
      },
      required: ["spaceId", "contentTypeId", "fields"]
    }
  },
  GET_ENTRY: {
    name: "get_entry",
    description: "Retrieve an existing entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" }
      },
      required: ["spaceId", "entryId"]
    }
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
        fields: { type: "object" }
      },
      required: ["spaceId", "entryId", "fields"]
    }
  },
  DELETE_ENTRY: {
    name: "delete_entry",
    description: "Delete an entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" }
      },
      required: ["spaceId", "entryId"]
    }
  },
  PUBLISH_ENTRY: {
    name: "publish_entry",
    description: "Publish an entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" }
      },
      required: ["spaceId", "entryId"]
    }
  },
  UNPUBLISH_ENTRY: {
    name: "unpublish_entry",
    description: "Unpublish an entry",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        entryId: { type: "string" }
      },
      required: ["spaceId", "entryId"]
    }
  }
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
            contentType: { type: "string" }
          },
          required: ["url", "fileName", "contentType"]
        }
      },
      required: ["spaceId", "title", "file"]
    }
  },
  GET_ASSET: {
    name: "get_asset",
    description: "Retrieve an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" }
      },
      required: ["spaceId", "assetId"]
    }
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
            contentType: { type: "string" }
          },
          required: ["url", "fileName", "contentType"]
        }
      },
      required: ["spaceId", "assetId"]
    }
  },
  DELETE_ASSET: {
    name: "delete_asset",
    description: "Delete an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" }
      },
      required: ["spaceId", "assetId"]
    }
  },
  PUBLISH_ASSET: {
    name: "publish_asset",
    description: "Publish an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" }
      },
      required: ["spaceId", "assetId"]
    }
  },
  UNPUBLISH_ASSET: {
    name: "unpublish_asset",
    description: "Unpublish an asset",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        assetId: { type: "string" }
      },
      required: ["spaceId", "assetId"]
    }
  }
};

// Tool definitions for Space & Environment operations
export const SPACE_ENV_TOOLS = {
  LIST_SPACES: {
    name: "list_spaces",
    description: "List all available spaces",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  GET_SPACE: {
    name: "get_space",
    description: "Get details of a space",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" }
      },
      required: ["spaceId"]
    }
  },
  LIST_ENVIRONMENTS: {
    name: "list_environments",
    description: "List all environments in a space",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" }
      },
      required: ["spaceId"]
    }
  },
  CREATE_ENVIRONMENT: {
    name: "create_environment",
    description: "Create a new environment",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string" },
        name: { type: "string" }
      },
      required: ["spaceId", "environmentId", "name"]
    }
  },
  DELETE_ENVIRONMENT: {
    name: "delete_environment",
    description: "Delete an environment",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string" }
      },
      required: ["spaceId", "environmentId"]
    }
  }
};

// Export combined tools
export const TOOLS = {
  ...ENTRY_TOOLS,
  ...ASSET_TOOLS,
  ...SPACE_ENV_TOOLS
};
