import { GetPromptResult } from "@modelcontextprotocol/sdk/types"
import { CONTENTFUL_PROMPTS } from "./contentful-prompts"

/**
 * Handle a prompt request and return the appropriate response
 * @param name Prompt name
 * @param args Optional arguments provided for the prompt
 * @returns Prompt result with messages
 */
export async function handlePrompt(
  name: string,
  args?: Record<string, string>,
): Promise<GetPromptResult> {
  switch (name) {
    case "explain-api-concepts":
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

    case "content-modeling-guide":
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

    case "api-operation-help":
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
      
    case "space-identification":
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

    case "entry-management":
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

    case "asset-management":
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

    case "content-type-operations":
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

    case "ai-actions-create":
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "I'm your Contentful AI Actions specialist. I can help you design, create, and configure AI Actions that integrate AI capabilities into your content workflows. I understand templates, variables, conditions, and model settings.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `I want to create an AI Action for this use case: ${args?.useCase || "my Contentful project"}. ${args?.modelType ? `I'm planning to use the ${args?.modelType} model.` : "Please recommend appropriate model types."} Guide me through the creation process, including template design, variable configuration, and testing.`,
            },
          },
        ],
      }

    case "ai-actions-variables":
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "I'm your Contentful AI Actions variables expert. I can explain how to configure variables for AI Actions, including different types, configurations, and best practices for different scenarios.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `${args?.variableType ? `Explain how to use and configure the ${args?.variableType} variable type in AI Actions.` : "Explain the different variable types available in AI Actions, their use cases, and how to configure them effectively."} Include examples and best practices for template integration.`,
            },
          },
        ],
      }

    case "ai-actions-invoke":
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "I'm your Contentful AI Actions execution expert. I can help you invoke AI Actions, provide the right parameters, and understand the results. I know how to work with both simple and complex variable types, including references and entity paths.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `I need help with invoking an AI Action ${args?.actionId ? `with ID ${args?.actionId}` : "in my Contentful space"}. ${args?.details || "Please guide me through providing variables correctly, handling references, and interpreting the results."}`,
            },
          },
        ],
      }

    case "bulk-operations":
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

    case "space-environment-management":
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

    case "mcp-tool-usage":
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

    default:
      throw new Error(`Unknown prompt: ${name}`)
  }
}