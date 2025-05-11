<img width="700" src="https://images.ctfassets.net/jtqsy5pye0zd/6wNuQ2xMvbw134rccObi0q/bf61badc6d6d9780609e541713f0bba6/Contentful_Logo_2.5_Dark.svg?w=700&q=100" alt="Contentful MCP server"/>

# Contentful MCP Server

[![smithery badge](https://smithery.ai/badge/@ivotoby/contentful-management-mcp-server)](https://smithery.ai/server/@ivotoby/contentful-management-mcp-server)

An MCP server implementation that integrates with Contentful's Content Management API, providing comprehensive content management capabilities.

- Please note \*; if you are not interested in the code, and just want to use this MCP in
  Claude Desktop (or any other tool that is able to use MCP servers) you don't have to
  clone this repo, you can just set it up in Claude desktop, refer to the section
  "Usage with Claude Desktop" for instructions on how to install it.

<a href="https://glama.ai/mcp/servers/l2fxeaot4p"><img width="380" height="200" src="https://glama.ai/mcp/servers/l2fxeaot4p/badge" alt="contentful-mcp MCP server" /></a>

## Features

- **Content Management**: Full CRUD operations for entries and assets
- **Space Management**: Create, update, and manage spaces and environments
- **Content Types**: Manage content type definitions
- **Localization**: Support for multiple locales
- **Publishing**: Control content publishing workflow
- **Bulk Operations**: Execute bulk publishing, unpublishing, and validation across multiple entries and assets
- **GraphQL Support**: Execute GraphQL queries against Contentful's GraphQL API (works with CDA tokens)
- **Smart Pagination**: List operations return maximum 3 items per request to prevent context window overflow, with built-in pagination support

## GraphQL Support

The MCP server includes built-in support for Contentful's GraphQL API, allowing you to perform complex, efficient queries that are not possible with the standard REST API.

### GraphQL Tool Features

- **Flexible Queries**: Retrieve only the fields you need, reducing response size
- **Nested References**: Get related content in a single query
- **Schema Validation**: Queries are validated against the GraphQL schema when available
- **Token Flexibility**: Works with either CDA or CMA tokens
- **Error Handling**: Proper formatting and handling of GraphQL errors

### Using the GraphQL Tool

```graphql
graphql_query({
  query: `
    query {
      entryCollection(limit: 5) {
        items {
          sys {
            id
          }
          title
          linkedContent {
            sys {
              id
            }
          }
        }
      }
    }
  `,
  variables: {
    // Optional variables for parameterized queries
  },
  cdaToken: "your-delivery-token" // Optional, overrides environment variable
})
```

### CDA vs CMA Tokens for GraphQL

- **CDA Token (Recommended)**: Use for most GraphQL queries as they're read-only operations
- **CMA Token**: Can be used but has broader permissions than necessary for queries
- **Token Priority**: Tool argument > Environment variable

## Pagination

To prevent context window overflow in LLMs, list operations (like search_entries and list_assets) are limited to 3 items per request. Each response includes:

- Total number of available items
- Current page of items (max 3)
- Number of remaining items
- Skip value for the next page
- Message prompting the LLM to offer retrieving more items

This pagination system allows the LLM to efficiently handle large datasets while maintaining context window limits.

## Bulk Operations

The bulk operations feature provides efficient management of multiple content items simultaneously:

- **Asynchronous Processing**: Operations run asynchronously and provide status updates
- **Efficient Content Management**: Process multiple entries or assets in a single API call
- **Status Tracking**: Monitor progress with success and failure counts
- **Resource Optimization**: Reduce API calls and improve performance for batch operations

These bulk operation tools are ideal for content migrations, mass updates, or batch publishing workflows.

## Tools

### Entry Management

- **search_entries**: Search for entries using query parameters
- **create_entry**: Create new entries
- **get_entry**: Retrieve existing entries
- **update_entry**: Update entry fields
- **delete_entry**: Remove entries
- **publish_entry**: Publish entries
- **unpublish_entry**: Unpublish entries

### Bulk Operations

- **bulk_publish**: Publish multiple entries and assets in a single operation. Accepts an array of entities (entries and assets) and processes their publication as a batch.
- **bulk_unpublish**: Unpublish multiple entries and assets in a single operation. Similar to bulk_publish but removes content from the delivery API.
- **bulk_validate**: Validate multiple entries for content consistency, references, and required fields. Returns validation results without modifying content.

### Asset Management

- **list_assets**: List assets with pagination (3 items per page)
- **upload_asset**: Upload new assets with metadata
- **get_asset**: Retrieve asset details and information
- **update_asset**: Update asset metadata and files
- **delete_asset**: Remove assets from space
- **publish_asset**: Publish assets to delivery API
- **unpublish_asset**: Unpublish assets from delivery API

### Space & Environment Management

- **list_spaces**: List available spaces
- **get_space**: Get space details
- **list_environments**: List environments in a space
- **create_environment**: Create new environment
- **delete_environment**: Remove environment

### Content Type Management

- **list_content_types**: List available content types
- **get_content_type**: Get content type details
- **create_content_type**: Create new content type
- **update_content_type**: Update content type
- **delete_content_type**: Remove content type
- **publish_content_type**: Publish a content type

### GraphQL Operations

- **graphql_query**: Execute GraphQL queries against Contentful's GraphQL API. This tool allows you to retrieve content in a more flexible and efficient way than REST API calls. Works with either CDA or CMA tokens.

## Development Tools

### MCP Inspector

The project includes an MCP Inspector tool that helps with development and debugging:

- **Inspect Mode**: Run `npm run inspect` to start the inspector, you can open the inspector by going to http://localhost:5173
- **Watch Mode**: Use `npm run inspect:watch` to automatically restart the inspector when files change
- **Visual Interface**: The inspector provides a web interface to test and debug MCP tools
- **Real-time Testing**: Try out tools and see their responses immediately
- **Bulk Operations Testing**: Test and monitor bulk operations with visual feedback on progress and results

The project also contains a `npm run dev` command which rebuilds and reloads the MCP server on every change.

## Configuration

### Prerequisites

1. Create a Contentful account at [Contentful](https://www.contentful.com/)
2. Generate a Content Management API token from your account settings

### Environment Variables

These variables can also be set as arguments

- `CONTENTFUL_HOST` / `--host`: Contentful Management API Endpoint (defaults to https://api.contentful.com)
- `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN` / `--management-token`: Your Content Management API token
- `CONTENTFUL_DELIVERY_ACCESS_TOKEN` / `--delivery-token`: Your Content Delivery API token (can be used for GraphQL operations only)
- `ENABLE_HTTP_SERVER` / `--http`: Set to "true" to enable HTTP/SSE mode
- `HTTP_PORT` / `--port`: Port for HTTP server (default: 3000)
- `HTTP_HOST` / `--http-host`: Host for HTTP server (default: localhost)

### Authentication Modes & Token Options

The MCP server supports three authentication options:

1. **Content Management API (CMA) Token** - Full access to all tools and operations
2. **Content Delivery API (CDA) Token** - Limited access to read-only GraphQL operations
3. **App Identity Authentication** - Uses Contentful App credentials for authentication

When providing tokens, the following rules apply:

- **CMA token only**: All tools and operations are available
- **CDA token only**: Only GraphQL query operations are available
- **Both CMA and CDA tokens**: All tools are available, GraphQL operations will prefer using the CDA token

For GraphQL operations, you can also pass a `cdaToken` parameter directly in the tool invocation, which will take precedence over environment variables.

### Space and Environment Scoping

You can scope the spaceId and EnvironmentId to ensure the LLM will only do operations on the defined space/env ID's.
This is mainly to support agents that are to operate within specific spaces. If both `SPACE_ID` and `ENVIRONMENT_ID` env-vars are set
the tools will not report needing these values and the handlers will use the environment vars to do CMA operations.
You will also loose access to the tools in the space-handler, since these tools are across spaces.
You can also add the `SPACE_ID` and `ENVIRONMENT_ID` by using arguments `--space-id` and `--environment-id`

#### Using App Identity

Instead of providing a Management token you can also leverage [App Identity](https://www.contentful.com/developers/docs/extensibility/app-framework/app-identity/)
for handling authentication. You would have to setup and install a Contentful App and set the following parameters when calling the MCP-server:

- `--app-id` = the app Id which is providing the Apptoken
- `--private-key` = the private key you created in the user-interface with your app, tied to `app_id`
- `--space-id` = the spaceId in which the app is installed
- `--environment-id` = the environmentId (within the space) in which the app is installed.

With these values the MCP server will request a temporary AppToken to do content operation in the defined space/environment-id. This especially useful when using this MCP server in backend systems that act as MCP-client (like chat-agents)

### Usage with Claude Desktop

You do not need to clone this repo to use this MCP, you can simply add it to
your `claude_desktop_config.json`:

Add or edit `~/Library/Application Support/Claude/claude_desktop_config.json`
and add the following lines:

```json
{
  "mcpServers": {
    "contentful": {
      "command": "npx",
      "args": ["-y", "@ivotoby/contentful-management-mcp-server"],
      "env": {
        "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN": "<Your CMA token>",
        "CONTENTFUL_DELIVERY_ACCESS_TOKEN": "<Your CDA token>" // Optional, for GraphQL operations
      }
    }
  }
}
```

If your MCPClient does not support setting environment variables you can also set the management token using an argument like this:

```json
{
  "mcpServers": {
    "contentful": {
      "command": "npx",
      "args": [
        "-y",
        "@ivotoby/contentful-management-mcp-server",
        "--management-token",
        "<your CMA token>",
        "--delivery-token",
        "<your CDA token>", // Optional, for GraphQL operations
        "--host",
        "http://api.contentful.com"
      ]
    }
  }
}
```

### Installing via Smithery

To install Contentful Management Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@ivotoby/contentful-management-mcp-server):

```bash
npx -y @smithery/cli install @ivotoby/contentful-management-mcp-server --client claude
```

### Developing and using Claude desktop

If you want to contribute and test what Claude does with your contributions;

- run `npm run dev`, this will start the watcher that rebuilds the MCP server on every change
- update `claude_desktop_config.json` to reference the project directly, ie;

```
{
  "mcpServers": {
    "contentful": {
      "command": "node",
      "args": ["/Users/ivo/workspace/contentful-mcp/bin/mcp-server.js"],
      "env": {
        "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN": "<Your CMA Token>"
      }
    }
  }
}
```

This will allow you to test any modification in the MCP server with Claude directly, however; if you add new tools/resources you will need to restart Claude Desktop

## Transport Modes

The MCP server supports two transport modes:

### stdio Transport

The default transport mode uses standard input/output streams for communication. This is ideal for integration with MCP clients that support stdio transport, like Claude Desktop.

To use stdio mode, simply run the server without the `--http` flag:

```bash
npx -y contentful-mcp --management-token YOUR_TOKEN
# or alternatively
npx -y @ivotoby/contentful-management-mcp-server --management-token YOUR_TOKEN
```

### StreamableHTTP Transport

The server also supports the StreamableHTTP transport as defined in the MCP protocol. This mode is useful for web-based integrations or when running the server as a standalone service.

To use StreamableHTTP mode, run with the `--http` flag:

```bash
npx -y contentful-mcp --management-token YOUR_TOKEN --http --port 3000
# or alternatively
npx -y @ivotoby/contentful-management-mcp-server --management-token YOUR_TOKEN --http --port 3000
```

#### StreamableHTTP Details

- Uses the official MCP StreamableHTTP transport
- Supports standard MCP protocol operations
- Includes session management for maintaining state
- Properly handles initialize/notify patterns
- Compatible with standard MCP clients
- Replaces the deprecated SSE transport with the modern approach

The implementation follows the standard MCP protocol specification, allowing any MCP client to connect to the server without special handling.

## Error Handling

The server implements comprehensive error handling for:

- Authentication failures
- Rate limiting
- Invalid requests
- Network issues
- API-specific errors

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ivo-toby-contentful-mcp-badge.png)](https://mseep.ai/app/ivo-toby-contentful-mcp)

## License

MIT License

## Fine print

This MCP Server enables Claude (or other agents that can consume MCP resources) to update, delete content, spaces and content-models. So be sure what you allow Claude to do with your Contentful spaces!

This MCP-server is not officially supported by Contentful (yet)
