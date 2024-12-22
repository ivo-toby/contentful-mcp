import { GetPromptResult } from "@modelcontextprotocol/sdk/types";
import { CONTENTFUL_PROMPTS } from "./contentful-prompts";

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
              text: "I am a Contentful API expert. I'll explain key concepts and their relationships.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Please explain the Contentful concept: ${args?.concept}`,
            },
          },
        ],
      };

    case "content-modeling-guide":
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "I am a Contentful content modeling expert. I'll help you design your content structure.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Help me design a content model for this use case: ${args?.useCase}`,
            },
          },
        ],
      };

    case "api-operation-help":
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "I am a Contentful API operations expert. I'll help you understand and implement API operations.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Explain how to perform a ${args?.operation} operation on a ${args?.resourceType}`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
