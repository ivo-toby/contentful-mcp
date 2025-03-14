# AI Actions MCP Integration Plan

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