/**
 * Handler for invoking AI Actions in Contentful
 */
import { PromptResult } from "./handlePrompt"

export async function handleAiActionsInvoke(actionId?: string, details?: string): Promise<PromptResult> {
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
          text: `I need help with invoking an AI Action ${actionId ? `with ID ${actionId}` : "in my Contentful space"}. ${details || "Please guide me through providing variables correctly, handling references, and interpreting the results."}`,
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: `# Invoking AI Actions in Contentful${actionId ? `: ${actionId}` : ""}

I'll guide you through the process of effectively invoking AI Actions through the MCP interface.

## Finding Available AI Actions

Before invoking an AI Action, you need to know which ones are available in your space. You can discover them using:

\`\`\`javascript
list_ai_actions({
  spaceId: "your-space-id",
  environmentId: "master", // typically "master" or your environment name
  status: "published" // only show published (available) actions
});
\`\`\`

This will return a list of AI Actions with their IDs, names, descriptions, and other metadata.

## Understanding An AI Action's Requirements

Once you've identified the AI Action you want to use${actionId ? ` (in this case, ${actionId})` : ""}, you can get its details:

\`\`\`javascript
get_ai_action({
  spaceId: "your-space-id",
  environmentId: "master",
  aiActionId: ${actionId ? `"${actionId}"` : `"the-action-id"`}
});
\`\`\`

This will show you the full definition, including all required variables and their types.

## Dynamic AI Action Tools

In the MCP implementation, each published AI Action becomes available as a dynamic tool with the prefix \`ai_action_\` followed by the AI Action ID. For example, an AI Action with ID "3woPNtzC81CEsBEvgQo96J" would be accessible as:

\`\`\`javascript
ai_action_3woPNtzC81CEsBEvgQo96J({
  // parameters based on the AI Action's variables
});
\`\`\`

## Preparing Parameters

AI Actions require specific parameters based on their variable definitions:

### Basic Variable Types

For simple variable types (Text, FreeFormInput, StringOptionsList, Locale), provide the values directly:

\`\`\`javascript
ai_action_example({
  tone: "Professional", // StringOptionsList
  target_audience: "Enterprise customers", // Text
  locale: "en-US" // Locale
});
\`\`\`

### Reference Variables

For Reference variables (linking to other entries), you need to provide:

1. The entry ID
2. The field path to access

\`\`\`javascript
ai_action_example({
  product_entry: "6tFnSQdgHuWYOk8eICA0w", // Entry ID
  product_entry_path: "fields.description.en-US" // Field path
});
\`\`\`

### Media Reference Variables

Similarly, for MediaReference variables (images, videos, etc.):

\`\`\`javascript
ai_action_example({
  product_image: "7tGnRQegIvWZPj9eICA1q", // Asset ID
  product_image_path: "fields.file.en-US" // Field path
});
\`\`\`

### Standard Input

For the main content (StandardInput):

\`\`\`javascript
ai_action_example({
  input_text: "Your content to process..."
});
\`\`\`

## Complete Example

Here's a complete example of invoking an AI Action:

\`\`\`javascript
ai_action_content_enhancer({
  // Basic parameters
  input_text: "Original content to enhance...",
  tone: "Professional",
  
  // Reference to another entry
  brand_guidelines: "1aBcDeFgHiJkLmNoPqR",
  brand_guidelines_path: "fields.guidelines.en-US",
  
  // Additional settings
  outputFormat: "Markdown", // Output format (Markdown, RichText, or PlainText)
  waitForCompletion: true // Wait for processing to complete
});
\`\`\`

## Output Formats

You can specify how you want the output formatted using the \`outputFormat\` parameter:

- **Markdown**: Clean, formatted text with markdown syntax (default)
- **RichText**: Contentful's structured rich text format
- **PlainText**: Simple text without formatting

## Asynchronous Processing

AI Actions process asynchronously by default. You can control this behavior with:

- **waitForCompletion**: Set to \`true\` to wait for the operation to complete (default)
- If set to \`false\`, you'll receive an invocation ID that you can use to check status later

## Getting Results Later

If you opted not to wait for completion, you can check the status later:

\`\`\`javascript
get_ai_action_invocation({
  spaceId: "your-space-id",
  environmentId: "master",
  aiActionId: "the-action-id",
  invocationId: "the-invocation-id" // Received from the initial invoke call
});
\`\`\`

## Important Notes

1. **Results are not automatically applied**: AI Action results are returned for you to review but aren't automatically applied to entries.

2. **Field paths are crucial**: When working with References and MediaReferences, always provide the correct field path.

3. **Check for required variables**: All required variables must be provided, or the invocation will fail.

4. **Response times vary**: Complex AI Actions may take longer to process.

Does this help with your AI Action invocation? Would you like more specific guidance on any of these aspects?`,
        },
      },
    ],
  }
}

