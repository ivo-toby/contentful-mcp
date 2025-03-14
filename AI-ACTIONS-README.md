# Contentful MCP AI Actions Integration

This package extends the Contentful MCP server with full support for AI Actions, allowing users to discover, manage, and invoke AI Actions directly from the MCP interface.

## Features

### Static Management Tools

- **List AI Actions**: View all available AI Actions in a space
- **Get AI Action**: View details of a specific AI Action
- **Create AI Action**: Create new AI Actions with templates and variables
- **Update AI Action**: Modify existing AI Actions
- **Delete AI Action**: Remove AI Actions from the space
- **Publish AI Action**: Make AI Actions available for use
- **Unpublish AI Action**: Temporarily disable AI Actions
- **Invoke AI Action**: Manually invoke an AI Action with specific variables

### Dynamic AI Action Tools

Each published AI Action automatically becomes an MCP tool with:

- Name based on the AI Action ID
- Description from the AI Action metadata
- Input schema derived from the AI Action variables
- Runtime validation matching AI Action requirements
- Support for all variable types (Text, Reference, Media, etc.)

### Variable Mapping

The integration handles complex variable mapping:

- Simple text variables are mapped directly
- References are converted to the proper entity reference format
- Enumerated values are presented as dropdown options
- Optional variables are appropriately marked

### Asynchronous Processing

- Support for both synchronous and asynchronous invocations
- Automatic polling for long-running operations
- Configurable polling intervals and timeout handling

### Error Handling

- Detailed error reporting for failed invocations
- Validation errors for incorrect variable values
- Clear feedback for API-level issues

## Usage Examples

### Managing AI Actions

```
// List all AI Actions in a space
list_ai_actions({
  spaceId: "your-space-id",
  environmentId: "master",
  status: "published"
})

// Create a new AI Action
create_ai_action({
  spaceId: "your-space-id",
  name: "Product Description",
  description: "Generates product descriptions from key features",
  instruction: {
    template: "Create a product description for {{product_name}}. Key features: {{features}}",
    variables: [
      { id: "product_name", type: "Text", name: "Product Name" },
      { id: "features", type: "Text", name: "Key Features" }
    ]
  },
  configuration: {
    modelType: "gpt-4",
    modelTemperature: 0.7
  }
})
```

### Using Dynamic AI Action Tools

Once an AI Action is published, it becomes available as a dynamic tool with the prefix `ai_action_`:

```
// Invoke an AI Action directly through its dynamic tool
ai_action_product_description({
  product_name: "Smart Coffee Maker",
  features: "WiFi enabled, voice control, scheduled brewing, temperature control",
  outputFormat: "Markdown"
})
```

## Implementation Details

The AI Actions integration is built on a modular architecture:

1. **Type Definitions**: Comprehensive type system for AI Actions
2. **API Client**: Low-level client for Contentful AI Actions API
3. **Handler Layer**: Business logic for all operations
4. **Tool Schemas**: Static and dynamic tool definitions
5. **Dynamic Tool Generation**: Converts AI Actions to MCP tools
6. **Server Integration**: Ties everything together with the MCP server

## Configuration

The integration uses the same authentication as the main MCP server and respects environment variables like:

- `SPACE_ID`: Default space ID
- `ENVIRONMENT_ID`: Default environment ID 
- `CONTENTFUL_MANAGEMENT_TOKEN`: Authentication token

## Limitations

- RichText output is converted to plain text or markdown for tool output
- Variable validation is performed at runtime rather than schema level
- Bulk operations are not currently supported for AI Actions