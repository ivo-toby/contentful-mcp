#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "contentful-management";

const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;

if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
  console.error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable is not set");
  process.exit(1);
}

// Create the plain Contentful client
const contentfulClient = createClient(
  {
    accessToken: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  },
  { type: "plain" }
);

// Define available tools
const TOOLS = {
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

import { entryHandlers } from './handlers/entry-handlers';
import { assetHandlers } from './handlers/asset-handlers';
import { spaceHandlers } from './handlers/space-handlers';
import { contentTypeHandlers } from './handlers/content-type-handlers';

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
  },
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(TOOLS),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Entry operations
    if (name === "create_entry") return entryHandlers.createEntry(args);
    if (name === "get_entry") return entryHandlers.getEntry(args);
    if (name === "update_entry") return entryHandlers.updateEntry(args);
    if (name === "delete_entry") return entryHandlers.deleteEntry(args);
    if (name === "publish_entry") return entryHandlers.publishEntry(args);
    if (name === "unpublish_entry") return entryHandlers.unpublishEntry(args);

    // Asset operations
    if (name === "upload_asset") return assetHandlers.uploadAsset(args);
    if (name === "get_asset") return assetHandlers.getAsset(args);
    if (name === "update_asset") return assetHandlers.updateAsset(args);
    if (name === "delete_asset") return assetHandlers.deleteAsset(args);
    if (name === "publish_asset") return assetHandlers.publishAsset(args);
    if (name === "unpublish_asset") return assetHandlers.unpublishAsset(args);

    // Space & Environment operations
    if (name === "list_spaces") return spaceHandlers.listSpaces();
    if (name === "get_space") return spaceHandlers.getSpace(args);
    if (name === "list_environments") return spaceHandlers.listEnvironments(args);
    if (name === "create_environment") return spaceHandlers.createEnvironment(args);
    if (name === "delete_environment") return spaceHandlers.deleteEnvironment(args);

    // Content Type operations
    if (name === "list_content_types") return contentTypeHandlers.listContentTypes(args);
    if (name === "get_content_type") return contentTypeHandlers.getContentType(args);
    if (name === "create_content_type") return contentTypeHandlers.createContentType(args);
    if (name === "update_content_type") return contentTypeHandlers.updateContentType(args);
    if (name === "delete_content_type") return contentTypeHandlers.deleteContentType(args);
      // Entry operations
      case "create_entry": {
        const entry = await contentfulClient.entry.create({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          contentTypeId: args.contentTypeId,
          fields: args.fields
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      }

      case "get_entry": {
        const entry = await contentfulClient.entry.get({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          entryId: args.entryId
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      }

      case "update_entry": {
        const entry = await contentfulClient.entry.update({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          entryId: args.entryId,
          fields: args.fields
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      }

      case "delete_entry": {
        await contentfulClient.entry.delete({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          entryId: args.entryId
        });
        return { content: [{ type: "text", text: `Entry ${args.entryId} deleted successfully` }] };
      }

      case "publish_entry": {
        const entry = await contentfulClient.entry.publish({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          entryId: args.entryId
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      }

      case "unpublish_entry": {
        const entry = await contentfulClient.entry.unpublish({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          entryId: args.entryId
        });
        return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
      }

      // Asset operations
      case "upload_asset": {
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
      }

      case "get_asset": {
        const asset = await contentfulClient.asset.get({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          assetId: args.assetId
        });
        return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
      }

      case "update_asset": {
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
      }

      case "delete_asset": {
        await contentfulClient.asset.delete({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          assetId: args.assetId
        });
        return { content: [{ type: "text", text: `Asset ${args.assetId} deleted successfully` }] };
      }

      case "publish_asset": {
        const asset = await contentfulClient.asset.publish({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          assetId: args.assetId
        });
        return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
      }

      case "unpublish_asset": {
        const asset = await contentfulClient.asset.unpublish({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          assetId: args.assetId
        });
        return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
      }

      // Space & Environment operations
      case "list_spaces": {
        const spaces = await contentfulClient.space.getMany();
        return { content: [{ type: "text", text: JSON.stringify(spaces, null, 2) }] };
      }

      case "get_space": {
        const space = await contentfulClient.space.get({
          spaceId: args.spaceId
        });
        return { content: [{ type: "text", text: JSON.stringify(space, null, 2) }] };
      }

      case "list_environments": {
        const environments = await contentfulClient.environment.getMany({
          spaceId: args.spaceId
        });
        return { content: [{ type: "text", text: JSON.stringify(environments, null, 2) }] };
      }

      case "create_environment": {
        const environment = await contentfulClient.environment.create({
          spaceId: args.spaceId,
          environmentId: args.environmentId,
          name: args.name
        });
        return { content: [{ type: "text", text: JSON.stringify(environment, null, 2) }] };
      }

      case "delete_environment": {
        await contentfulClient.environment.delete({
          spaceId: args.spaceId,
          environmentId: args.environmentId
        });
        return { content: [{ type: "text", text: `Environment ${args.environmentId} deleted successfully` }] };
      }

      // Content Type operations
      case "list_content_types": {
        const contentTypes = await contentfulClient.contentType.getMany({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master"
        });
        return { content: [{ type: "text", text: JSON.stringify(contentTypes, null, 2) }] };
      }

      case "get_content_type": {
        const contentType = await contentfulClient.contentType.get({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          contentTypeId: args.contentTypeId
        });
        return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
      }

      case "create_content_type": {
        const contentType = await contentfulClient.contentType.create({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          name: args.name,
          fields: args.fields
        });
        return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
      }

      case "update_content_type": {
        const contentType = await contentfulClient.contentType.update({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          contentTypeId: args.contentTypeId,
          name: args.name,
          fields: args.fields
        });
        return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
      }

      case "delete_content_type": {
        await contentfulClient.contentType.delete({
          spaceId: args.spaceId,
          environmentId: args.environmentId || "master",
          contentTypeId: args.contentTypeId
        });
        return { content: [{ type: "text", text: `Content type ${args.contentTypeId} deleted successfully` }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

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
