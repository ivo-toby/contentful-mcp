import { PromptResult } from "../handlePrompt"

/**
 * Handler for exploring GraphQL schema prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleExploreGraphQLSchema(args?: Record<string, string>): PromptResult {
  const goal = args?.goal || "different types of content"

  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful GraphQL schema explorer. I can help you understand and navigate the GraphQL schema for your content model, so you can construct effective queries for your content needs.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Help me explore the GraphQL schema in my Contentful space so I can create queries to retrieve ${goal}. Please guide me through the process step by step.`,
        },
      },
    ],
  }
}

/**
 * Handler for building GraphQL query prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleBuildGraphQLQuery(args?: Record<string, string>): PromptResult {
  if (!args?.contentType) {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: "I need to know which content type you want to query. Please provide a contentType parameter.",
          },
        },
      ],
    }
  }

  const fields = args.fields || "all relevant fields"
  const filters = args.filters ? `and filter by ${args.filters}` : ""
  const references = args.includeReferences === "true" ? "including any referenced content" : ""

  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful GraphQL query builder. I can help you construct well-formed queries to retrieve exactly the content you need from your Contentful space.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Please help me build a GraphQL query for the "${args.contentType}" content type to retrieve ${fields} ${filters} ${references}. Guide me through the process step by step.`,
        },
      },
    ],
  }
}

/**
 * Export all GraphQL prompt handlers
 */
export const graphqlHandlers = {
  "explore-graphql-schema": (args?: Record<string, string>) => handleExploreGraphQLSchema(args),
  "build-graphql-query": (args?: Record<string, string>) => handleBuildGraphQLQuery(args),
}

