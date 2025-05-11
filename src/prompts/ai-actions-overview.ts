/**
 * Handler for providing a comprehensive overview of AI Actions in Contentful
 */
import { PromptResult } from "./handlePrompt"

export async function handleAiActionsOverview(): Promise<PromptResult> {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'm your Contentful AI Actions specialist. I can explain how AI Actions integrate AI capabilities directly into your content management workflows.",
        },
      },
      {
        role: "user",
        content: {
          type: "text",
          text: `Please explain what AI Actions are in Contentful, how they work, and how they relate to content entries and fields.`,
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: `# AI Actions in Contentful

AI Actions are predefined AI operations that can be integrated directly into your Contentful content workflows. They allow content creators to leverage AI capabilities without needing technical expertise in prompt engineering or AI integration.

## Key Concepts

1. **Templates with Variables**: Each AI Action contains a prompt template with placeholders for variables that users can provide when invoking the action.

2. **Content Integration**: AI Actions operate on content entries and fields in your Contentful space. They can read content from specific fields and generate new content based on that input.

3. **Asynchronous Processing**: When invoked, AI Actions run asynchronously in the background, allowing content editors to continue working while waiting for results.

4. **Flexible Variable Types**: Support for various input types:
   - Simple text inputs
   - References to other entries
   - Media references
   - Locale selection
   - Predefined option lists

5. **Field-Level Operations**: AI Actions can be applied to specific fields within entries using the entity path parameter.

## How AI Actions Work

1. **Creation**: Developers or content managers define AI Actions with:
   - A name and description
   - A prompt template
   - Variable definitions
   - AI model configuration (model type, temperature)

2. **Publication**: Actions are published to make them available to content editors.

3. **Invocation**: Content editors can:
   - Select an AI Action from the UI
   - Fill in required variables
   - Apply it to specific content
   - Receive AI-generated content they can review and incorporate

4. **Results**: The AI-generated content is presented to the editor who can then:
   - Accept it as is
   - Edit it further
   - Reject it and try again with different parameters

## Practical Applications

- Generating SEO metadata from existing content
- Creating alt text for images
- Translating content between languages
- Summarizing long-form content
- Enhancing product descriptions
- Creating variations of existing content
- Improving grammar and readability

## Using AI Actions via MCP

When using this MCP integration, you can:
1. Create and manage AI Actions using the management tools
2. Invoke existing AI Actions on specific content
3. Process the results for further use

Each published AI Action becomes available as a dynamic tool with its own parameters based on its variable definitions.

## Working with Complex Variables

One of the most important aspects to understand is how to work with References and MediaReferences:

- They require both an ID parameter (which entry/asset to use)
- And a path parameter (which field within that entry/asset to access)

This two-part approach gives you precise control over what content is processed by the AI Action.

## Understanding the Output

AI Actions return results for review, but they don't automatically update fields in your entries. This gives editors control over what content actually gets published.

Would you like me to explain any specific aspect of AI Actions in more detail?`,
        },
      },
    ],
  }
}

