# AI Actions MCP Integration Plan

## LLM-Friendly Variable Names Enhancement Plan (✅ Implemented)

### Problem Statement
Currently, AI Action variables are exposed to LLMs with their original IDs, which are non-descriptive (e.g., `8igfdwv6dy8y`, `7xjf8r2k4q3p`). This makes it difficult for an LLM to understand what data to provide when invoking these tools, especially considering that AI Actions operate on content entries and fields.

### Proposed Solution
We will enhance the AI Action tool generation to provide more descriptive parameter names and documentation while maintaining compatibility with the Contentful API's variable ID requirements.

#### Key Components:
1. **Variable ID to Name Mapping**:
   - Create a mapping system to convert cryptic variable IDs to human-readable names
   - Maintain an internal mapping of friendly names back to the original IDs for API calls

2. **Enhanced Tool Schema Generation**:
   - Generate tool schemas with friendly parameter names
   - Add rich context in parameter descriptions including variable type and purpose
   - Standardize naming patterns for common variable types (e.g., "input_text" for StandardInput)

3. **Parameter Translation Layer**:
   - Add a translation layer in the invocation handler that maps friendly parameter names back to original IDs
   - Maintain all original variable validation and processing

### Key Benefits:
- LLMs will understand the purpose of each parameter
- Tool documentation will be more comprehensive
- No changes to the Contentful API integration
- Maintains backward compatibility with original variable IDs

### Implementation Details

#### 1. Create Variable Name Mapping Functions

```typescript
// Transforms cryptic variable IDs to human-readable names
function getReadableName(variable: Variable): string {
  // If there's a human-readable name provided, use it (converted to snake_case)
  if (variable.name) {
    return toSnakeCase(variable.name);
  }

  // For standard inputs, use descriptive names based on type
  switch(variable.type) {
    case "StandardInput":
      return "input_text";
    case "MediaReference":
      return "media_asset_id";
    case "Reference":
      return "entry_reference_id";
    case "Locale":
      return "target_locale";
    default:
      // For others, create a prefixed version 
      return `${variable.type.toLowerCase()}_${variable.id.substring(0, 5)}`;
  }
}

// Maps from friendly names back to variable IDs
function createReverseMapping(action: AiActionEntity): Map<string, string> {
  const mapping = new Map<string, string>();
  
  for (const variable of action.instruction.variables || []) {
    const friendlyName = getReadableName(variable);
    mapping.set(friendlyName, variable.id);
  }
  
  return mapping;
}
```

#### 2. Enhance Tool Schema Generation

Update the `generateAiActionToolSchema` function to use friendly names:

```typescript
export function generateAiActionToolSchema(action: AiActionEntity) {
  // Create property definitions with friendly names
  const properties: Record<string, any> = {};
  
  // Store the ID mapping for this action
  const reverseMapping = createReverseMapping(action);
  idMappings.set(action.sys.id, reverseMapping);
  
  // Add properties for each variable with friendly names
  for (const variable of (action.instruction.variables || [])) {
    const friendlyName = getReadableName(variable);
    properties[friendlyName] = getEnhancedVariableSchema(variable);
  }
  
  // Add common properties
  properties.outputFormat = {
    type: "string",
    enum: ["Markdown", "RichText", "PlainText"],
    default: "Markdown",
    description: "Format for the output content"
  };
  
  properties.waitForCompletion = {
    type: "boolean",
    default: true,
    description: "Whether to wait for the AI Action to complete"
  };
  
  // Get required field names in their friendly format
  const requiredVars = getRequiredVariables(action.instruction.variables || [])
    .map(id => {
      const variable = action.instruction.variables.find(v => v.id === id);
      return variable ? getReadableName(variable) : id;
    });
  
  const toolSchema = {
    name: `ai_action_${action.sys.id}`,
    description: getEnhancedToolDescription(action),
    inputSchema: getSpaceEnvProperties({
      type: "object",
      properties,
      required: requiredVars
    })
  };
  
  return toolSchema;
}
```

#### 3. Enhance Variable Schema

```typescript
function getEnhancedVariableSchema(variable: Variable): any {
  // Create a rich description that includes type information
  let description = variable.description || `${variable.name || 'Variable'}`;
  
  // Add type information
  description += ` (Type: ${variable.type})`;
  
  // Add additional context based on type
  switch(variable.type) {
    case "MediaReference":
      description += ". Provide an asset ID from your Contentful space";
      break;
    case "Reference":
      description += ". Provide an entry ID from your Contentful space";
      break;
    case "Locale":
      description += ". Use format like 'en-US', 'de-DE', etc.";
      break;
    case "StringOptionsList":
      if (variable.configuration && "values" in variable.configuration) {
        description += `. Choose one of: ${variable.configuration.values.join(", ")}`;
      }
      break;
  }
  
  const schema = {
    type: "string",
    description
  };
  
  // Add enums for StringOptionsList
  if (variable.type === "StringOptionsList" && 
      variable.configuration && 
      "values" in variable.configuration) {
    schema.enum = variable.configuration.values;
  }
  
  return schema;
}
```

#### 4. Enhance Tool Description

```typescript
function getEnhancedToolDescription(action: AiActionEntity): string {
  // Start with the name and description
  let description = `${action.name}: ${action.description}`;
  
  // Add contextual information about what this AI Action does
  description += "\n\nThis AI Action works on content entries and fields in Contentful. ";
  
  // Add variable information summary
  if (action.instruction.variables && action.instruction.variables.length > 0) {
    description += `\n\nRequired inputs: ${action.instruction.variables
      .filter(v => !isOptionalVariable(v))
      .map(v => v.name || getReadableName(v))
      .join(", ")}.`;
  }
  
  // Add model information
  description += `\n\nUses ${action.configuration.modelType} model with temperature ${action.configuration.modelTemperature}.`;
  
  return description;
}
```

#### 5. Parameter Translation Layer

```typescript
// Store ID mappings globally
const idMappings = new Map<string, Map<string, string>>();

// Translation function for invocation handler
function translateParametersToVariableIds(actionId: string, params: Record<string, any>): Record<string, any> {
  const mapping = idMappings.get(actionId);
  if (!mapping) {
    return params; // No mapping found, return as is
  }
  
  const result: Record<string, any> = {};
  
  // Copy non-variable parameters (like outputFormat) directly
  for (const [key, value] of Object.entries(params)) {
    if (key === 'outputFormat' || key === 'waitForCompletion') {
      result[key] = value;
      continue;
    }
    
    // Check if we have a mapping for this friendly name
    const originalId = mapping.get(key);
    if (originalId) {
      result[originalId] = value;
    } else {
      // No mapping found, keep the original key
      result[key] = value;
    }
  }
  
  return result;
}
```

#### 6. Update the Invocation Handler

```typescript
// Handler for dynamic AI Action tools
async function handleAiActionInvocation(actionId: string, args: any) {
  try {
    // 1. Translate friendly parameter names to original IDs
    const translatedArgs = translateParametersToVariableIds(actionId, args);
    
    // 2. Get invocation parameters from the tool context
    const params = aiActionToolContext.getInvocationParams(actionId, translatedArgs);
    
    // 3. Invoke the AI Action
    return aiActionHandlers.invokeAiAction({
      ...params,
      variables: translatedArgs
    });
  } catch (error) {
    return {
      isError: true,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}
```

### Integration with Existing Code

This enhancement will be integrated by updating the `ai-action-tool-generator.ts` file with the new parameter mapping functionality, and modifying the `handleAiActionInvocation` function in `index.ts` to use the translation layer.

The solution maintains all existing functionality while adding LLM-friendly parameter names and enhanced documentation for better usability.

## Entity Path Enhancement Plan (✅ Implemented)

### Problem Statement
When working with AI Actions that process content from Contentful entries and assets, we need to specify which field within the entity should be processed. The default implementation didn't support the `entityPath` parameter needed for this functionality.

### Solution Implemented
We've enhanced the AI Action tool generation and invocation to fully support field-level operations:

1. **Entity Path Parameters**:
   - For each Reference or MediaReference variable, we now generate an additional `*_path` parameter
   - This parameter allows specifying the exact field path to process (e.g., "fields.title.en-US")
   - Clear documentation in tool descriptions explains how to use these parameters

2. **Path Mapping System**:
   - Added a mapping system to track friendly path parameter names to original IDs
   - Ensures proper translation between user-friendly names and API-required format

3. **Enhanced Documentation**:
   - Added clear instructions about how to use entity paths
   - Included warnings that results are NOT automatically applied to fields
   - Explained the relationship between source fields and generated content

4. **Improved Error Handling**:
   - Added robust validation and debugging for path parameters
   - Clear console logging during server startup shows all path mappings

This enhancement ensures that AI Actions can be properly used to process specific fields within entries and assets, matching the behavior of the Contentful UI.


## Overview
This document outlines the approach for integrating Contentful AI Actions into the MCP server, allowing users to discover and invoke AI Actions directly through the MCP interface.

## Implementation Status
As of now, we have implemented:

1. **Type Definitions**
   - Full AI Action type system based on the OpenAPI spec
   - Tests for type validations

2. **API Client**
   - Client for interacting with AI Actions API endpoints
   - Support for all CRUD operations
   - Support for invoking AI Actions
   - Polling mechanism for asynchronous invocations
   - Tests for client functionality

## Alpha Header Implementation Plan

The AI Actions API requires an alpha header for access that wasn't specified in the OpenAPI spec. After examining the current client implementation, we need a more robust approach.

### Option 1: Custom AI Actions Client

1. **Create Dedicated AI Client**
   - Create a new custom client specifically for AI Actions
   - Replace the dependency on contentful-management's raw client with direct API calls using fetch/axios
   - Build in the alpha header from the ground up

2. **Implementation Approach**
   - Create a new file `src/config/ai-actions-http-client.ts`
   - Implement a class that handles authentication similar to the contentful client
   - Add alpha header to all requests automatically
   - Create methods for each HTTP verb (GET, POST, PUT, DELETE)
   - Update ai-actions-client.ts to use this new client

3. **Sample Implementation**
```typescript
// ai-actions-http-client.ts
import axios from 'axios';

const ALPHA_HEADER_NAME = 'X-Contentful-Alpha';
const ALPHA_HEADER_VALUE = 'ai-actions';

export class AiActionsHttpClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string, host = 'api.contentful.com') {
    this.accessToken = accessToken;
    this.baseUrl = `https://${host}`;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, any> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE,
      'Content-Type': 'application/json',
      ...customHeaders
    };
  }

  async get(path: string, options: { headers?: Record<string, string> } = {}) {
    const response = await axios.get(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(options.headers || {})
    });
    return response.data;
  }

  // Similar methods for post, put, delete
}
```

### Option 2: Modify All Requests with Headers

1. **Keep Using Existing Client**
   - Continue using the contentful-management raw client
   - Add the alpha header to each individual request
   - Create a helper function to consistently apply the header

2. **Implementation Approach**
   - Add constants for the header name and value
   - Create a utility function to generate the options object for each request
   - Update all client.raw calls to include the header

3. **Sample Implementation**
```typescript
const ALPHA_HEADER_NAME = 'X-Contentful-Alpha';
const ALPHA_HEADER_VALUE = 'ai-actions';

function withAlphaHeader(options: any = {}) {
  const headers = options.headers || {};
  return {
    ...options,
    headers: {
      ...headers,
      [ALPHA_HEADER_NAME]: ALPHA_HEADER_VALUE
    }
  };
}

// Then in each method:
const response = await client.raw.get(url, withAlphaHeader({ headers }));
```

### Recommended Approach

**Option 2** is more pragmatic and faster to implement. It maintains compatibility with the existing code while adding the necessary header. The contentful-management client already handles authentication and other infrastructure concerns, so we can leverage that work.

### Testing Updates for Either Approach
- Update tests to verify the header is being included in requests
- Mock and verify header inclusion in unit tests
- Document the header requirement in comments

### Documentation
- Update README to mention the alpha header requirement
- Add a note about this being an alpha feature

3. **Handler Layer**
   - Handler functions for all AI Action operations
   - Error handling and response formatting
   - Tests for handler functionality

4. **Tool Definitions**
   - Static tools for AI Action management
   - Tests for tool schema validation 

5. **Dynamic Tool Generation**
   - Utility for generating tool schemas from AI Actions
   - Variable mapping system for different types
   - Tests for schema generation

6. **Server Integration**
   - Loading AI Actions at startup
   - Dynamic tool registration
   - Tool handler routing for both static and dynamic tools
   - Response formatting for AI Action results

The integration has been tested with TypeScript and should be ready for actual use once deployed.

## Understanding AI Actions
AI Actions in Contentful are templated AI operations with predefined variables that work as follows:

1. **Structure**: Each action has a name, description, instruction template, and variables
 
2. **Variables**: AI Actions accept different variable types (Text, Reference, ResourceLink, etc.) which users provide during invocation

3. **Templates**: The core is an instruction template with placeholders for variables

4. **Execution**: When invoked, the system:
   - Substitutes variables into the template
   - Sends to AI model (specified in configuration)
   - Returns formatted output as RichText, Markdown, or PlainText

5. **Asynchronous**: Invocations have status tracking (SCHEDULED, IN_PROGRESS, COMPLETED)

6. **Conditions**: Templates can have conditional sections based on variable values

7. **References**: Can link to Contentful entries and assets as inputs

Think of them as parameterized AI prompts that content teams can invoke without writing complex prompts themselves.

## Architecture
We'll implement AI Actions integration following the existing MCP server patterns:

1. **Dual-Mode Implementation**
   - Static tools for AI Action management (list, get, create, update, delete)
   - Dynamic tools generated from available AI Actions

2. **Tool Organization**
   - Standard management tools in `ai-action-handlers.ts` 
   - Dynamic tool generation based on fetched AI Actions

3. **Invocation Flow**
   - Support both synchronous and asynchronous invocation patterns
   - Handle variable validation based on AI Action schemas

## Implementation Steps

### 1. Create Type Definitions
- Define types for AI Action schemas based on the OpenAPI spec
- Focus on `AiActionEntity`, `Instruction`, `Variable`, and related types
- Create types for invocation requests and responses

### 2. Implement Management Handlers
- Create handlers for listing, getting, creating, updating, and deleting AI Actions
- Support filtering by status (published/all)
- Include environment-specific operations

### 3. Implement Dynamic Tool Generation
- Create a system to convert AI Actions to MCP tools
- Map each AI Action variable to a tool parameter
- Generate appropriate descriptions based on AI Action metadata

### 4. Add Invocation Handlers
- Support both space-level and environment-level invocations
- Implement polling for asynchronous operations
- Handle different output formats (Markdown, RichText, PlainText)

### 5. Add Tool Registration
- Register static management tools
- Create a mechanism to dynamically register AI Action tools
- Ensure proper descriptions and parameter schemas

### 6. Implement Error Handling
- Handle common errors like not found, validation failures
- Support retry logic for IN_PROGRESS invocations

## Detailed Components

### New Files
- `src/handlers/ai-action-handlers.ts` - Handlers for AI Action operations
- `src/types/ai-actions.ts` - Type definitions
- `src/config/ai-actions-client.ts` - Client for AI Action API communication
- `src/utils/ai-action-tool-generator.ts` - Converts AI Actions to dynamic tools

### Modified Files
- `src/index.ts` - Add AI Action tools registration
- `src/types/tools.ts` - Add AI Action tool schemas
- `src/prompts/contentful-prompts.ts` - Add AI Action related prompts

## Management Tools

1. **List AI Actions**
   - Parameters: spaceId, environmentId (optional), limit, skip, status
   - Returns: Collection of AI Actions

2. **Get AI Action**
   - Parameters: spaceId, environmentId (optional), aiActionId
   - Returns: Single AI Action with full details

3. **Create/Update AI Action**
   - Parameters: spaceId, name, description, instruction, configuration
   - Returns: Created/Updated AI Action

4. **Delete AI Action**
   - Parameters: spaceId, aiActionId
   - Returns: Success indicator

5. **Publish/Unpublish AI Action**
   - Parameters: spaceId, aiActionId
   - Returns: Updated AI Action

## Dynamic AI Action Tools

Generated dynamically from available AI Actions with:
- Name derived from AI Action ID/name
- Description from AI Action description
- Parameters mapped from AI Action variables
- Different parameter schemas based on variable types
- Support for Reference, Text, and other variable types

## Invocation Flow
1. User calls an AI Action tool
2. System maps parameters to AI Action variables
3. Invocation is sent to Contentful

### API Invocation Details
- HTTP POST to `/spaces/{spaceId}/ai/actions/{aiActionId}/invoke`
- Can include environment (`/environments/{environmentId}/...`)
- Request body includes `outputFormat` and `variables` array
- Variables have `id` and either string `value` or entity reference

### Result Handling
- Response includes `result` object and `sys` metadata
- Results can be synchronous or asynchronous (status tracking)
- For async: poll using GET to `.../invocations/{invocationId}`
- Result format matches requested `outputFormat` (RichText, Markdown, PlainText)

### Return Structure
- `FlowResult` object containing `content`, `type`, and `metadata`
- Content can be string or RichText document
- Metadata includes tokens, model info, and timing data
- For MCP integration: convert RichText to Markdown if needed for better tool output display

## Considerations
- **Performance**: Cache AI Actions for efficient tool generation
- **Authentication**: Use existing client authentication flow
- **Versioning**: Handle API changes gracefully
- **Variable Types**: Support complex variable types (References, ResourceLinks)
- **Error Handling**: Provide clear error messages
- **Output Formats**: Support Markdown, PlainText, RichText
- **Polling Strategy**: Implement backoff for long-running operations