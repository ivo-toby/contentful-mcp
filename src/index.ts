#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CONTENTFUL_PROMPTS } from "./prompts/contentful-prompts.js";
import { handlePrompt } from "./prompts/handlers.js";
import { entryHandlers } from "./handlers/entry-handlers.js";
import { assetHandlers } from "./handlers/asset-handlers.js";
import { spaceHandlers } from "./handlers/space-handlers.js";
import { contentTypeHandlers } from "./handlers/content-type-handlers.js";
import { TOOLS } from "./config/tools.js";
import { validateEnvironment } from "./utils/validation.js";

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
      tools: TOOLS,
      prompts: {}
    },
  },
);

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(TOOLS),
}));

// Set up request handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: Object.values(CONTENTFUL_PROMPTS)
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handlePrompt(name, args);
});

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
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
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
    search_entries: entryHandlers.searchEntries,

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
