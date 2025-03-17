import { GetPromptResult } from "@modelcontextprotocol/sdk/types";
import { generateVariableTypeContent } from "../generateVariableTypeContent";
import { handleAiActionsInvoke } from "../ai-actions-invoke";
import { handleAiActionsOverview } from "../ai-actions-overview";

/**
 * Handler for AI Actions create prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleAiActionsCreate(args?: Record<string, string>): GetPromptResult {
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
      {
        role: "assistant",
        content: {
          type: "text",
          text: `# Creating an AI Action for ${args?.useCase || "your Contentful project"}

I'll guide you through creating an effective AI Action for your use case. Here's a step-by-step approach:

## 1. Define your AI Action

Let's start by clearly defining what your AI Action will do:

- **Name**: Choose a descriptive name that reflects the action's purpose
- **Description**: Write a clear description of what the AI Action does and when to use it

## 2. Choose the right model

${args?.modelType ? `You've mentioned using the ${args?.modelType} model, which is a good choice for this use case.` : `For your use case, consider these models:
- **GPT-4** (gpt-4): Best for complex reasoning and high-quality content generation
- **Claude 3 Opus** (claude-3-opus): Excellent for nuanced understanding and creative content
- **Claude 3 Sonnet** (claude-3-5-sonnet): Good balance of quality and performance
- **GPT-3.5 Turbo** (gpt-3.5-turbo): Fastest option for simpler tasks`}

**Temperature setting**: 
- Lower (0.0-0.3): More consistent, predictable outputs
- Medium (0.4-0.7): Balance of creativity and consistency
- Higher (0.8-1.0): More creative, varied outputs

## 3. Design your template

The template is the prompt that will be sent to the AI model, with placeholders for variables. Here are some best practices:

- Start with clear instructions about the task
- Define the desired tone, style, and format
- Include context about how the output will be used
- Use variable placeholders with double curly braces: {{variable_name}}

Example template structure:

\`\`\`
You are helping create content for a Contentful entry.

TASK: [Clear description of what to generate]

CONTEXT: The content will be used for {{purpose}}.

TONE: {{tone}}

BASED ON THIS INFORMATION: {{input_content}}

GENERATE: [Specific output instructions]
\`\`\`

## 4. Define your variables

For each placeholder in your template, you'll need to define a variable:

### Common variable types:

1. **StandardInput**: For primary text input
2. **Text**: For simple text fields
3. **FreeFormInput**: For custom text input
4. **StringOptionsList**: For selecting from predefined options
5. **Reference**: For linking to other Contentful entries
6. **MediaReference**: For linking to assets (images, videos, etc.)
7. **Locale**: For specifying language/region

For each variable, define:
- ID: Internal identifier
- Name: User-friendly display name
- Description: Clear explanation of what the variable is for
- Type: One of the types above
- Configuration: Type-specific settings (e.g., option values for StringOptionsList)

## 5. Implementation steps

To create this AI Action using the MCP tools:

1. Use the **create_ai_action** tool with these parameters:
   - spaceId, environmentId
   - name, description
   - instruction (containing template and variables)
   - configuration (model type and temperature)

2. Test your AI Action:
   - Add test cases with sample values
   - Verify outputs match expectations

3. Publish your AI Action:
   - Use the **publish_ai_action** tool to make it available to content editors

Would you like me to help you structure a specific template and variables for your use case?`,
        },
      },
    ],
  };
}

/**
 * Handler for AI Actions variables prompt
 * @param args Optional arguments for the prompt
 * @returns Prompt result with messages
 */
export function handleAiActionsVariables(args?: Record<string, string>): GetPromptResult {
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
      {
        role: "assistant",
        content: {
          type: "text",
          text: `# AI Action Variables${args?.variableType ? `: ${args?.variableType} Type` : " Overview"}

${generateVariableTypeContent(args?.variableType)}`,
        },
      },
    ],
  };
}

/**
 * Export all AI Actions related handlers
 */
export const aiActionsHandlers = {
  "ai-actions-overview": () => handleAiActionsOverview(),
  "ai-actions-create": (args?: Record<string, string>) => handleAiActionsCreate(args),
  "ai-actions-variables": (args?: Record<string, string>) => handleAiActionsVariables(args),
  "ai-actions-invoke": (args?: Record<string, string>) => handleAiActionsInvoke(args?.actionId, args?.details),
};