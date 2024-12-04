#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "contentful-management";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
// Base schemas
const BaseSchema = z.object({
    spaceId: z.string().describe("The ID of the Contentful space"),
    environmentId: z.string().optional().default('master').describe("The ID of the environment within the space"),
});
// Entry schemas
const CreateEntrySchema = BaseSchema.extend({
    contentTypeId: z.string().describe("The ID of the content type for the new entry"),
    fields: z.record(z.string(), z.any()).describe("The fields of the entry"),
});
const GetEntrySchema = BaseSchema.extend({
    entryId: z.string().describe("The ID of the entry to retrieve"),
});
const UpdateEntrySchema = GetEntrySchema.extend({
    fields: z.record(z.string(), z.any()).describe("The updated fields"),
});
const DeleteEntrySchema = GetEntrySchema;
const PublishEntrySchema = GetEntrySchema;
const UnpublishEntrySchema = GetEntrySchema;
// Asset schemas
const UploadAssetSchema = BaseSchema.extend({
    title: z.string().describe("Asset title"),
    description: z.string().optional().describe("Asset description"),
    file: z.object({
        url: z.string().describe("URL of the file to upload"),
        fileName: z.string().describe("Name of the file"),
        contentType: z.string().describe("MIME type of the file"),
    }),
});
const GetAssetSchema = BaseSchema.extend({
    assetId: z.string().describe("The ID of the asset to retrieve"),
});
const UpdateAssetSchema = GetAssetSchema.extend({
    title: z.string().optional(),
    description: z.string().optional(),
    file: z.object({
        url: z.string(),
        fileName: z.string(),
        contentType: z.string(),
    }).optional(),
});
const DeleteAssetSchema = GetAssetSchema;
const PublishAssetSchema = GetAssetSchema;
const UnpublishAssetSchema = GetAssetSchema;
// Space & Environment schemas
const ListSpacesSchema = z.object({});
const GetSpaceSchema = z.object({
    spaceId: z.string(),
});
const ListEnvironmentsSchema = z.object({
    spaceId: z.string(),
});
const CreateEnvironmentSchema = z.object({
    spaceId: z.string(),
    environmentId: z.string(),
    name: z.string(),
});
const DeleteEnvironmentSchema = z.object({
    spaceId: z.string(),
    environmentId: z.string(),
});
// Content Type schemas
const ListContentTypesSchema = BaseSchema;
const GetContentTypeSchema = BaseSchema.extend({
    contentTypeId: z.string(),
});
const CreateContentTypeSchema = BaseSchema.extend({
    name: z.string(),
    fields: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        required: z.boolean().optional(),
        localized: z.boolean().optional(),
    })),
});
const UpdateContentTypeSchema = CreateContentTypeSchema.extend({
    contentTypeId: z.string(),
});
const DeleteContentTypeSchema = GetContentTypeSchema;
// Tool definitions
const TOOLS = {
    // Entry tools
    CREATE_ENTRY: {
        name: "create_entry",
        description: "Create a new entry in Contentful",
        inputSchema: zodToJsonSchema(CreateEntrySchema),
    },
    GET_ENTRY: {
        name: "get_entry",
        description: "Retrieve an existing entry",
        inputSchema: zodToJsonSchema(GetEntrySchema),
    },
    UPDATE_ENTRY: {
        name: "update_entry",
        description: "Update an existing entry",
        inputSchema: zodToJsonSchema(UpdateEntrySchema),
    },
    DELETE_ENTRY: {
        name: "delete_entry",
        description: "Delete an entry",
        inputSchema: zodToJsonSchema(DeleteEntrySchema),
    },
    PUBLISH_ENTRY: {
        name: "publish_entry",
        description: "Publish an entry",
        inputSchema: zodToJsonSchema(PublishEntrySchema),
    },
    UNPUBLISH_ENTRY: {
        name: "unpublish_entry",
        description: "Unpublish an entry",
        inputSchema: zodToJsonSchema(UnpublishEntrySchema),
    },
    // Asset tools
    UPLOAD_ASSET: {
        name: "upload_asset",
        description: "Upload a new asset",
        inputSchema: zodToJsonSchema(UploadAssetSchema),
    },
    GET_ASSET: {
        name: "get_asset",
        description: "Retrieve an asset",
        inputSchema: zodToJsonSchema(GetAssetSchema),
    },
    UPDATE_ASSET: {
        name: "update_asset",
        description: "Update an asset",
        inputSchema: zodToJsonSchema(UpdateAssetSchema),
    },
    DELETE_ASSET: {
        name: "delete_asset",
        description: "Delete an asset",
        inputSchema: zodToJsonSchema(DeleteAssetSchema),
    },
    PUBLISH_ASSET: {
        name: "publish_asset",
        description: "Publish an asset",
        inputSchema: zodToJsonSchema(PublishAssetSchema),
    },
    UNPUBLISH_ASSET: {
        name: "unpublish_asset",
        description: "Unpublish an asset",
        inputSchema: zodToJsonSchema(UnpublishAssetSchema),
    },
    // Space & Environment tools
    LIST_SPACES: {
        name: "list_spaces",
        description: "List all available spaces",
        inputSchema: zodToJsonSchema(ListSpacesSchema),
    },
    GET_SPACE: {
        name: "get_space",
        description: "Get details of a space",
        inputSchema: zodToJsonSchema(GetSpaceSchema),
    },
    LIST_ENVIRONMENTS: {
        name: "list_environments",
        description: "List all environments in a space",
        inputSchema: zodToJsonSchema(ListEnvironmentsSchema),
    },
    CREATE_ENVIRONMENT: {
        name: "create_environment",
        description: "Create a new environment",
        inputSchema: zodToJsonSchema(CreateEnvironmentSchema),
    },
    DELETE_ENVIRONMENT: {
        name: "delete_environment",
        description: "Delete an environment",
        inputSchema: zodToJsonSchema(DeleteEnvironmentSchema),
    },
    // Content Type tools
    LIST_CONTENT_TYPES: {
        name: "list_content_types",
        description: "List all content types",
        inputSchema: zodToJsonSchema(ListContentTypesSchema),
    },
    GET_CONTENT_TYPE: {
        name: "get_content_type",
        description: "Get a content type",
        inputSchema: zodToJsonSchema(GetContentTypeSchema),
    },
    CREATE_CONTENT_TYPE: {
        name: "create_content_type",
        description: "Create a new content type",
        inputSchema: zodToJsonSchema(CreateContentTypeSchema),
    },
    UPDATE_CONTENT_TYPE: {
        name: "update_content_type",
        description: "Update a content type",
        inputSchema: zodToJsonSchema(UpdateContentTypeSchema),
    },
    DELETE_CONTENT_TYPE: {
        name: "delete_content_type",
        description: "Delete a content type",
        inputSchema: zodToJsonSchema(DeleteContentTypeSchema),
    },
};
const CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) {
    console.error("CONTENTFUL_MANAGEMENT_ACCESS_TOKEN environment variable is not set");
    process.exit(1);
}
const contentfulClient = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
});
const server = new Server({
    name: "contentful-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: Object.values(TOOLS),
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        async function getEnvironment(spaceId, environmentId) {
            const space = await contentfulClient.getSpace(spaceId);
            return space.getEnvironment(environmentId);
        }
        switch (name) {
            // Entry operations
            case "create_entry": {
                const { spaceId, environmentId, contentTypeId, fields } = CreateEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.createEntry(contentTypeId, { fields });
                return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
            }
            case "get_entry": {
                const { spaceId, environmentId, entryId } = GetEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.getEntry(entryId);
                return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
            }
            case "update_entry": {
                const { spaceId, environmentId, entryId, fields } = UpdateEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.getEntry(entryId);
                Object.assign(entry.fields, fields);
                const updatedEntry = await entry.update();
                return { content: [{ type: "text", text: JSON.stringify(updatedEntry, null, 2) }] };
            }
            case "delete_entry": {
                const { spaceId, environmentId, entryId } = DeleteEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.getEntry(entryId);
                await entry.delete();
                return { content: [{ type: "text", text: `Entry ${entryId} deleted successfully` }] };
            }
            case "publish_entry": {
                const { spaceId, environmentId, entryId } = PublishEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.getEntry(entryId);
                const publishedEntry = await entry.publish();
                return { content: [{ type: "text", text: JSON.stringify(publishedEntry, null, 2) }] };
            }
            case "unpublish_entry": {
                const { spaceId, environmentId, entryId } = UnpublishEntrySchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const entry = await environment.getEntry(entryId);
                const unpublishedEntry = await entry.unpublish();
                return { content: [{ type: "text", text: JSON.stringify(unpublishedEntry, null, 2) }] };
            }
            // Asset operations
            case "upload_asset": {
                const { spaceId, environmentId, title, description, file } = UploadAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.createAsset({
                    fields: {
                        title: { 'en-US': title },
                        description: description ? { 'en-US': description } : undefined,
                        file: { 'en-US': file },
                    },
                });
                const processedAsset = await asset.processForAllLocales();
                return { content: [{ type: "text", text: JSON.stringify(processedAsset, null, 2) }] };
            }
            case "get_asset": {
                const { spaceId, environmentId, assetId } = GetAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.getAsset(assetId);
                return { content: [{ type: "text", text: JSON.stringify(asset, null, 2) }] };
            }
            case "update_asset": {
                const { spaceId, environmentId, assetId, title, description, file } = UpdateAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.getAsset(assetId);
                if (title)
                    asset.fields.title = { 'en-US': title };
                if (description)
                    asset.fields.description = { 'en-US': description };
                if (file)
                    asset.fields.file = { 'en-US': file };
                const updatedAsset = await asset.update();
                return { content: [{ type: "text", text: JSON.stringify(updatedAsset, null, 2) }] };
            }
            case "delete_asset": {
                const { spaceId, environmentId, assetId } = DeleteAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.getAsset(assetId);
                await asset.delete();
                return { content: [{ type: "text", text: `Asset ${assetId} deleted successfully` }] };
            }
            case "publish_asset": {
                const { spaceId, environmentId, assetId } = PublishAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.getAsset(assetId);
                const publishedAsset = await asset.publish();
                return { content: [{ type: "text", text: JSON.stringify(publishedAsset, null, 2) }] };
            }
            case "unpublish_asset": {
                const { spaceId, environmentId, assetId } = UnpublishAssetSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const asset = await environment.getAsset(assetId);
                const unpublishedAsset = await asset.unpublish();
                return { content: [{ type: "text", text: JSON.stringify(unpublishedAsset, null, 2) }] };
            }
            // Space & Environment operations
            case "list_spaces": {
                const spaces = await contentfulClient.getSpaces();
                return { content: [{ type: "text", text: JSON.stringify(spaces.items, null, 2) }] };
            }
            case "get_space": {
                const { spaceId } = GetSpaceSchema.parse(args);
                const space = await contentfulClient.getSpace(spaceId);
                return { content: [{ type: "text", text: JSON.stringify(space, null, 2) }] };
            }
            case "list_environments": {
                const { spaceId } = ListEnvironmentsSchema.parse(args);
                const space = await contentfulClient.getSpace(spaceId);
                const environments = await space.getEnvironments();
                return { content: [{ type: "text", text: JSON.stringify(environments.items, null, 2) }] };
            }
            case "create_environment": {
                const { spaceId, environmentId, name } = CreateEnvironmentSchema.parse(args);
                const space = await contentfulClient.getSpace(spaceId);
                const environment = await space.createEnvironment({ name }, environmentId);
                return { content: [{ type: "text", text: JSON.stringify(environment, null, 2) }] };
            }
            case "delete_environment": {
                const { spaceId, environmentId } = DeleteEnvironmentSchema.parse(args);
                const space = await contentfulClient.getSpace(spaceId);
                const environment = await space.getEnvironment(environmentId);
                await environment.delete();
                return { content: [{ type: "text", text: `Environment ${environmentId} deleted successfully` }] };
            }
            // Content Type operations
            case "list_content_types": {
                const { spaceId, environmentId } = ListContentTypesSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const contentTypes = await environment.getContentTypes();
                return { content: [{ type: "text", text: JSON.stringify(contentTypes.items, null, 2) }] };
            }
            case "get_content_type": {
                const { spaceId, environmentId, contentTypeId } = GetContentTypeSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const contentType = await environment.getContentType(contentTypeId);
                return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
            }
            case "create_content_type": {
                const { spaceId, environmentId, name, fields } = CreateContentTypeSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const contentType = await environment.createContentType({ name, fields });
                return { content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }] };
            }
            case "update_content_type": {
                const { spaceId, environmentId, contentTypeId, name, fields } = UpdateContentTypeSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const contentType = await environment.getContentType(contentTypeId);
                contentType.name = name;
                contentType.fields = fields;
                const updatedContentType = await contentType.update();
                return { content: [{ type: "text", text: JSON.stringify(updatedContentType, null, 2) }] };
            }
            case "delete_content_type": {
                const { spaceId, environmentId, contentTypeId } = DeleteContentTypeSchema.parse(args);
                const environment = await getEnvironment(spaceId, environmentId);
                const contentType = await environment.getContentType(contentTypeId);
                await contentType.delete();
                return { content: [{ type: "text", text: `Content type ${contentTypeId} deleted successfully` }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Contentful MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
