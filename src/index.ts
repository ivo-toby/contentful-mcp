#!/usr/bin/env node

// Import prompt schemas
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PROMPTS } from "./config/prompts.js";

// Validate environment variables
validateEnvironment();

// Create MCP server with prompts capability
const server = new Server(
  {
    name: "contentful-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: TOOLS,
      prompts: {},
    },
  },
);

// Set up request handlers for prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: Object.values(PROMPTS),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const prompt = PROMPTS[request.params.name];
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  // Implement prompt logic here
  if (request.params.name === "get-asset-details") {
    const assetId = request.params.arguments?.assetId;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please provide details for the asset with ID: ${assetId}.`,
          },
        },
      ],
    };
  }

  if (request.params.name === "list-all-assets") {
    const spaceId = request.params.arguments?.spaceId;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `List all assets available in space with ID: ${spaceId}.`,
          },
        },
      ],
    };
  }

  // Add logic for other prompts as needed

  throw new Error("Prompt implementation not found");
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
