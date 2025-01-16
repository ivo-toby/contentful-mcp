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

## Tools

### Entry Management

- **search_entries**: Search for entries using query parameters
- **create_entry**: Create new entries
- **get_entry**: Retrieve existing entries
- **update_entry**: Update entry fields
- **delete_entry**: Remove entries
- **publish_entry**: Publish entries
- **unpublish_entry**: Unpublish entries

### Asset Management

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

## Development Tools

### MCP Inspector

The project includes an MCP Inspector tool that helps with development and debugging:

- **Inspect Mode**: Run `npm run inspect` to start the inspector, you can open the inspector by going to http://localhost:5173
- **Watch Mode**: Use `npm run inspect:watch` to automatically restart the inspector when files change
- **Visual Interface**: The inspector provides a web interface to test and debug MCP tools
- **Real-time Testing**: Try out tools and see their responses immediately

The project also contains a `npm run dev` command which rebuilds and reloads the MCP server on every change.

## Configuration

### Prerequisites

1. Create a Contentful account at [Contentful](https://www.contentful.com/)
2. Generate a Content Management API token from your account settings

### Environment Variables

- `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN`: Your Content Management API token

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
        "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN": "<Your CMA token>"
      }
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

## Error Handling

The server implements comprehensive error handling for:

- Authentication failures
- Rate limiting
- Invalid requests
- Network issues
- API-specific errors

## License

MIT License

## Fine print

This MCP Server enables Claude (or other agents that can consume MCP resources) to update, delete content, spaces and content-models. So be sure what you allow Claude to do with your Contentful spaces!

