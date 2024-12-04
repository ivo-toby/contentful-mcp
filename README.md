# Contentful MCP Server

An MCP server implementation that integrates with Contentful's Content Management API, providing comprehensive content management capabilities.

## Features

- **Content Management**: Full CRUD operations for entries and assets
- **Space Management**: Create, update, and manage spaces and environments
- **Content Types**: Manage content type definitions
- **Localization**: Support for multiple locales
- **Publishing**: Control content publishing workflow

## Tools

### Entry Management
- **create_entry**: Create new entries
- **get_entry**: Retrieve existing entries
- **update_entry**: Update entry fields
- **delete_entry**: Remove entries
- **publish_entry**: Publish entries
- **unpublish_entry**: Unpublish entries

### Asset Management
- **upload_asset**: Upload new assets
- **get_asset**: Retrieve asset details
- **update_asset**: Update asset metadata
- **delete_asset**: Remove assets
- **publish_asset**: Publish assets
- **unpublish_asset**: Unpublish assets

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

## Configuration

### Prerequisites
1. Create a Contentful account at [Contentful](https://www.contentful.com/)
2. Generate a Content Management API token from your account settings

### Environment Variables
- `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN`: Your Content Management API token

### Usage with Claude Desktop
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "contentful": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-contentful"
      ],
      "env": {
        "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

## Error Handling
The server implements comprehensive error handling for:
- Authentication failures
- Rate limiting
- Invalid requests
- Network issues
- API-specific errors

## License
MIT License
