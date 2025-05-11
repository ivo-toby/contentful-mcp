import { GetPromptResult } from "@modelcontextprotocol/sdk/types"

/**
 * Handler for API concepts prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleApiConcepts(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful API specialist. I can explain core concepts like Spaces, Environments, Content Types, Entries, Assets, and how they relate to each other in the Contentful Content Management and Delivery APIs. I'll include practical examples and best practices.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Please explain the Contentful concept: ${args?.concept}. Include how it's used in real applications and any important API endpoints related to it.`,
        },
      },
    ],
  }
}

/**
 * Handler for content modeling guide prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleContentModelingGuide(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful content modeling consultant. I can help you design efficient, scalable content structures that support your specific business needs. I understand content types, fields, validations, references, and best practices for headless CMS architecture.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Help me design a content model for this use case: ${args?.useCase}. Please describe your project requirements, target platforms, and any specific content relationships you need to maintain.`,
        },
      },
    ],
  }
}

/**
 * Handler for API operation help prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleApiOperationHelp(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful API implementation guide. I can explain CMA, CDA, CPA, GraphQL, and Images API operations with code examples. I'm familiar with pagination, filtering, localization, and API rate limits across different SDKs and environments.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Explain how to perform a ${args?.operation} operation on a ${args?.resourceType} in Contentful. If relevant, please specify your programming language or environment so I can provide appropriate SDK examples.`,
        },
      },
    ],
  }
}

/**
 * Handler for space identification prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleSpaceIdentification(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful space navigator. I can help you identify and select the right space for your operations. I understand space organization, access controls, and how to locate specific spaces in your Contentful organization.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to identify the correct Contentful space for this operation: ${args?.operation}. Please guide me through the process of finding and selecting the appropriate space.`,
        },
      },
    ],
  }
}

/**
 * Handler for entry management prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleEntryManagement(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful entry management expert. I can help you with CRUD operations, publishing workflows, and bulk actions for content entries. I understand entry versioning, localization, references, and validation processes in the Contentful API.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need assistance with ${args?.task || "managing"} entries in my Contentful space. ${args?.details || "Please guide me through the process, available tools, and provide code examples if applicable."}`,
        },
      },
    ],
  }
}

/**
 * Handler for asset management prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleAssetManagement(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful asset management specialist. I can help you upload, process, and publish digital assets like images, videos, and documents. I understand asset processing, image transformations, and media optimization in Contentful.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with ${args?.task || "managing"} assets in Contentful. ${args?.details || "Please explain the process, available tools, and potential challenges."}`,
        },
      },
    ],
  }
}

/**
 * Handler for content type operations prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleContentTypeOperations(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful content type specialist. I can help you create, modify, and manage content types and their fields. I understand field validations, appearances, required fields, editor interfaces, and content type migrations.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need assistance with ${args?.task || "defining"} content types in Contentful. ${args?.details || "Please guide me on best practices, available tools, and implementation details."}`,
        },
      },
    ],
  }
}

/**
 * Handler for bulk operations prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleBulkOperations(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful bulk operations specialist. I can help you efficiently perform actions on multiple entries or assets simultaneously. I understand bulk publishing, unpublishing, validation, and how to track the status of bulk operations.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to ${args?.operation || "perform a bulk operation"} on multiple ${args?.entityType || "entities"} in Contentful. ${args?.details || "Please explain the process, available tools, and any limitations I should be aware of."}`,
        },
      },
    ],
  }
}

/**
 * Handler for space/environment management prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleSpaceEnvironmentManagement(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful space and environment expert. I can help you manage spaces, create and configure environments, and understand deployment workflows. I'm familiar with environment aliases, branching strategies, and content staging practices.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `I need assistance with ${args?.task || "managing"} ${args?.entity || "spaces and environments"} in Contentful. ${args?.details || "Please guide me through the process, available tools, and best practices."}`,
        },
      },
    ],
  }
}

/**
 * Handler for MCP tool usage prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleMcpToolUsage(args?: Record<string, string>): GetPromptResult {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful MCP tool specialist. I can explain how to use the Model Context Protocol tools available in this integration to efficiently work with Contentful from your AI assistant.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `${args?.toolName ? `Explain how to use the ${args?.toolName} tool in the Contentful MCP integration.` : "Please provide an overview of the available tools in the Contentful MCP integration and how to use them effectively."} Include parameter explanations, example use cases, and common patterns.`,
        },
      },
    ],
  }
}

/**
 * Export all general Contentful handlers
 */
export const contentfulHandlers = {
  "explain-api-concepts": (args?: Record<string, string>) => handleApiConcepts(args),
  "content-modeling-guide": (args?: Record<string, string>) => handleContentModelingGuide(args),
  "api-operation-help": (args?: Record<string, string>) => handleApiOperationHelp(args),
  "space-identification": (args?: Record<string, string>) => handleSpaceIdentification(args),
  "entry-management": (args?: Record<string, string>) => handleEntryManagement(args),
  "asset-management": (args?: Record<string, string>) => handleAssetManagement(args),
  "content-type-operations": (args?: Record<string, string>) => handleContentTypeOperations(args),
  "bulk-operations": (args?: Record<string, string>) => handleBulkOperations(args),
  "space-environment-management": (args?: Record<string, string>) =>
    handleSpaceEnvironmentManagement(args),
  "mcp-tool-usage": (args?: Record<string, string>) => handleMcpToolUsage(args),
}

