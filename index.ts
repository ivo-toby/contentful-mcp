#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { entryHandlers } from './handlers/entry-handlers';
import { assetHandlers } from './handlers/asset-handlers';
import { spaceHandlers } from './handlers/space-handlers';
import { contentTypeHandlers } from './handlers/content-type-handlers';
import { TOOLS } from './config/tools';
import { validateEnvironment } from './utils/validation';

// Validate environment variables
validateEnvironment();

// Create MCP server
const server = new Server(
  {
    name: "contentful-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
  // Entry tools
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
  },

  // Asset tools  
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
  },

  // Space & Environment tools
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
  },

  // Content Type tools
  LIST_CONTENT_TYPES: {
    name: "list_content_types",
    description: "List all content types",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" }
      },
      required: ["spaceId"]
    }
  },
  GET_CONTENT_TYPE: {
    name: "get_content_type",
    description: "Get a content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" }
      },
      required: ["spaceId", "contentTypeId"]
    }
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
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              required: { type: "boolean" },
              localized: { type: "boolean" }
            },
            required: ["id", "name", "type"]
          }
        }
      },
      required: ["spaceId", "name", "fields"]
    }
  },
  UPDATE_CONTENT_TYPE: {
    name: "update_content_type",
    description: "Update a content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" },
        name: { type: "string" },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              required: { type: "boolean" },
              localized: { type: "boolean" }
            },
            required: ["id", "name", "type"]
          }
        }
      },
      required: ["spaceId", "contentTypeId", "name", "fields"]
    }
  },
  DELETE_CONTENT_TYPE: {
    name: "delete_content_type",
    description: "Delete a content type",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string" },
        environmentId: { type: "string", default: "master" },
        contentTypeId: { type: "string" }
      },
      required: ["spaceId", "contentTypeId"]
    }
  }
};

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(TOOLS),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    const handler = getHandler(name);
    
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return handler(args);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

// Helper function to map tool names to handlers
function getHandler(name: string) {
  const handlers = {
    // Entry operations
    create_entry: entryHandlers.createEntry,
    get_entry: entryHandlers.getEntry,
    update_entry: entryHandlers.updateEntry,
    delete_entry: entryHandlers.deleteEntry,
    publish_entry: entryHandlers.publishEntry,
    unpublish_entry: entryHandlers.unpublishEntry,

    // Asset operations
    upload_asset: assetHandlers.uploadAsset,
    get_asset: assetHandlers.getAsset,
    update_asset: assetHandlers.updateAsset,
    delete_asset: assetHandlers.deleteAsset,
    publish_asset: assetHandlers.publishAsset,
    unpublish_asset: assetHandlers.unpublishAsset,

    // Space & Environment operations
    list_spaces: spaceHandlers.listSpaces,
    get_space: spaceHandlers.getSpace,
    list_environments: spaceHandlers.listEnvironments,
    create_environment: spaceHandlers.createEnvironment,
    delete_environment: spaceHandlers.deleteEnvironment,

    // Content Type operations
    list_content_types: contentTypeHandlers.listContentTypes,
    get_content_type: contentTypeHandlers.getContentType,
    create_content_type: contentTypeHandlers.createContentType,
    update_content_type: contentTypeHandlers.updateContentType,
    delete_content_type: contentTypeHandlers.deleteContentType,
  };

  return handlers[name as keyof typeof handlers];
}

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Contentful MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
