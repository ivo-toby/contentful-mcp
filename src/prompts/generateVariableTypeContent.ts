/**
 * Generate detailed content for AI Action variable types
 * @param variableType Specific variable type to generate content for
 * @returns Detailed explanation of the variable type(s)
 */
export function generateVariableTypeContent(variableType?: string): string {
  // If no specific type is requested, return an overview of all types
  if (!variableType) {
    return `AI Actions in Contentful use variables to make templates dynamic and adaptable. These variables serve as placeholders in your prompt templates that get replaced with actual values when an AI Action is invoked.

## Available Variable Types

### 1. StandardInput

The primary input variable for text content. Ideal for the main content that needs processing.

- **Use case**: Processing existing content, like rewriting or improving text
- **Template usage**: {{input_text}}
- **MCP parameter**: Usually exposed as "input_text"
- **Best for**: Main content field being operated on

### 2. Text

Simple text variables for additional information or context.

- **Use case**: Adding supplementary information to guide the AI
- **Template usage**: {{context}}, {{guidelines}}
- **Configuration**: Can be strict (limit to specific values) or free-form
- **Best for**: Providing context, instructions, or metadata

### 3. FreeFormInput

Unstructured text input with minimal constraints.

- **Use case**: Open-ended user input where flexibility is needed
- **Template usage**: {{user_instructions}}
- **Best for**: Custom requests or specific directions

### 4. StringOptionsList

Predefined options presented as a dropdown menu.

- **Use case**: Selecting from a fixed set of choices (tone, style, etc.)
- **Template usage**: {{tone}}, {{style}}
- **Configuration**: Requires defining the list of available options
- **Best for**: Consistent, controlled parameters like tones or formatting options

### 5. Reference

Links to other Contentful entries.

- **Use case**: Using content from other entries as context
- **Template usage**: Content accessed via helpers: "{{reference.fields.title}}"
- **Configuration**: Can restrict to specific content types
- **Special properties**: When using in MCP, requires "*_path" parameter to specify field path
- **Best for**: Cross-referencing content for context or expansion

### 6. MediaReference

Links to media assets like images, videos.

- **Use case**: Generating descriptions from media, processing asset metadata
- **Configuration**: Points to a specific asset in your space
- **Special properties**: When using in MCP, requires "*_path" parameter to specify which part to process
- **Best for**: Image description, alt text generation, media analysis

### 7. Locale

Specifies the language or region for content.

- **Use case**: Translation, localization, region-specific content
- **Template usage**: {{locale}}
- **Format**: Language codes like "en-US", "de-DE"
- **Best for**: Multi-language operations or locale-specific formatting

## Best Practices for Variables

1. **Use descriptive names**: Make variable names intuitive ({{product_name}} not {{var1}})
2. **Provide clear descriptions**: Help users understand what each variable does
3. **Use appropriate types**: Match variable types to their purpose
4. **Set sensible defaults**: Pre-populate where possible to guide users
5. **Consider field paths**: For Reference and MediaReference variables, remember that users need to specify which field to access

## Template Integration

Variables are referenced in templates using double curly braces: {{variable_id}}

Example template with multiple variable types:

\`\`\`
You are a content specialist helping improve product descriptions.

TONE: {{tone}}

AUDIENCE: Customers interested in {{target_market}}

ORIGINAL CONTENT:
{{input_text}}

INSTRUCTIONS:
Rewrite the above product description to be more engaging, maintaining the key product details but optimizing for {{tone}} tone and the {{target_market}} market.

IMPROVED DESCRIPTION:
\`\`\`

## Working with References

When working with References and MediaReferences, remember that the content must be accessed via the correct path. In the MCP integration, this is handled through separate parameters (e.g., "reference" and "reference_path").

## Variable Validation

AI Actions validate variables at runtime to ensure they meet requirements. Configure validation rules appropriately to prevent errors during invocation.`;
  }

  // Generate content for specific variable types
  switch (variableType.toLowerCase()) {
    case "standardinput":
    case "standard input":
      return `## StandardInput Variable Type

The StandardInput is the primary input variable for text content in AI Actions. It's designed to handle the main content that needs to be processed by the AI model.

### Purpose

This variable type is typically used for:
- The primary text to be transformed
- Existing content that needs enhancement, rewriting, or analysis
- The core content that the AI Action will operate on

### Configuration

StandardInput has minimal configuration needs:

- **ID**: A unique identifier (e.g., "main_content")
- **Name**: User-friendly label (e.g., "Main Content")
- **Description**: Clear explanation (e.g., "The content to be processed")

No additional configuration properties are required for this type.

### In MCP Integration

When working with the MCP integration, StandardInput variables are typically exposed with the parameter name "input_text" for consistency and clarity.

### Template Usage

In your AI Action template, reference StandardInput variables using double curly braces:

\`\`\`
ORIGINAL CONTENT:
{{input_text}}

Please improve the above content by...
\`\`\`

### Examples

**Example 1: Content Enhancement**

\`\`\`
You are a content specialist.

ORIGINAL CONTENT:
{{input_text}}

Enhance the above content by improving clarity, fixing grammar, and making it more engaging while preserving the key information.

IMPROVED CONTENT:
\`\`\`

**Example 2: SEO Optimization**

\`\`\`
You are an SEO expert.

ORIGINAL CONTENT:
{{input_text}}

KEYWORDS: {{keywords}}

Rewrite the above content to optimize for SEO using the provided keywords. Maintain the core message but improve readability and keyword usage.

SEO-OPTIMIZED CONTENT:
\`\`\`

### Best Practices

1. **Clear instructions**: Always include clear directions about what to do with the input text
2. **Context setting**: Provide context about what the input represents (e.g., product description, blog post)
3. **Output expectations**: Clearly indicate what the expected output format should be
4. **Complementary variables**: Pair StandardInput with other variables that provide direction (tone, style, keywords)

### Implementation with MCP Tools

When creating an AI Action with StandardInput using MCP tools:

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "You are helping improve content...\\n\\nORIGINAL CONTENT:\\n{{input_text}}\\n\\nIMPROVED CONTENT:",
    variables: [
      {
        id: "input_text",
        type: "StandardInput",
        name: "Input Content",
        description: "The content to be improved"
      }
      // other variables...
    ]
  }
});
\`\`\``;

    case "text":
      return `## Text Variable Type

The Text variable type provides a simple way to collect text input in AI Actions. It's more flexible than StringOptionsList but can include validation constraints if needed.

### Purpose

Text variables are used for:
- Supplementary information to guide the AI
- Additional context that affects output
- Simple inputs that don't require the full flexibility of FreeFormInput

### Configuration

Text variables can be configured with these properties:

- **ID**: Unique identifier (e.g., "brand_guidelines")
- **Name**: User-friendly label (e.g., "Brand Guidelines")
- **Description**: Explanation of what to input
- **Configuration** (optional):
  - **strict**: Boolean indicating whether values are restricted
  - **in**: Array of allowed values if strict is true

### Template Usage

Reference Text variables in templates using double curly braces:

\`\`\`
BRAND GUIDELINES: {{brand_guidelines}}

CONTENT:
{{input_text}}

Please rewrite the above content following the brand guidelines provided.
\`\`\`

### Examples

**Example 1: Simple Text Variable**

\`\`\`javascript
{
  id: "customer_segment",
  type: "Text",
  name: "Customer Segment",
  description: "The target customer segment for this content"
}
\`\`\`

**Example 2: Text Variable with Validation**

\`\`\`javascript
{
  id: "priority_level",
  type: "Text",
  name: "Priority Level",
  description: "The priority level for this task",
  configuration: {
    strict: true,
    in: ["High", "Medium", "Low"]
  }
}
\`\`\`

### Best Practices

1. **Clarify expectations**: Provide clear descriptions about what information is expected
2. **Use validation when appropriate**: If only certain values are valid, use the strict configuration
3. **Consider using StringOptionsList**: If you have a fixed set of options, StringOptionsList may be more appropriate
4. **Keep it focused**: Ask for specific information rather than general input

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Create content with customer segment {{customer_segment}} in mind...",
    variables: [
      {
        id: "customer_segment",
        type: "Text",
        name: "Customer Segment",
        description: "The target customer segment for this content"
      }
      // other variables...
    ]
  }
});
\`\`\``;

    case "freeforminput":
    case "free form input":
      return `## FreeFormInput Variable Type

The FreeFormInput variable type provides the most flexibility for collecting user input in AI Actions. It's designed for open-ended text entry with minimal constraints.

### Purpose

FreeFormInput variables are ideal for:
- Custom instructions from users
- Specific guidance that can't be predetermined
- Open-ended information that requires flexibility

### Configuration

FreeFormInput has minimal configuration requirements:

- **ID**: Unique identifier (e.g., "special_instructions")
- **Name**: User-friendly label (e.g., "Special Instructions")
- **Description**: Clear guidance on what kind of input is expected

No additional configuration properties are typically needed.

### Template Usage

Reference FreeFormInput variables in templates with double curly braces:

\`\`\`
CONTENT:
{{input_text}}

SPECIAL INSTRUCTIONS:
{{special_instructions}}

Please modify the content above according to the special instructions provided.
\`\`\`

### Examples

**Example: Content Creation Guidance**

\`\`\`javascript
{
  id: "author_preferences",
  type: "FreeFormInput",
  name: "Author Preferences",
  description: "Any specific preferences or requirements from the author that should be considered"
}
\`\`\`

### Best Practices

1. **Provide guidance**: Even though it's free-form, give users clear guidance about what kind of input is helpful
2. **Set expectations**: Explain how the input will be used in the AI Action
3. **Use sparingly**: Too many free-form inputs can make AI Actions confusing - use only where flexibility is needed
4. **Position appropriately**: Place FreeFormInput variables where they make most sense in your template flow

### When to Use FreeFormInput vs. Text

- Use **FreeFormInput** when you need completely open-ended input without restrictions
- Use **Text** when you want simple input that might benefit from validation

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Generate content based on these specifications...\\n\\nSPECIAL REQUIREMENTS:\\n{{special_requirements}}",
    variables: [
      {
        id: "special_requirements",
        type: "FreeFormInput",
        name: "Special Requirements",
        description: "Any special requirements or preferences for the generated content"
      }
      // other variables...
    ]
  }
});
\`\`\``;

    case "stringoptionslist":
    case "string options list":
      return `## StringOptionsList Variable Type

The StringOptionsList variable type provides a dropdown menu of predefined options. It's ideal for scenarios where users should select from a fixed set of choices.

### Purpose

StringOptionsList variables are perfect for:
- Tone selection (formal, casual, etc.)
- Content categories or types
- Predefined styles or formats
- Any parameter with a limited set of valid options

### Configuration

StringOptionsList requires these configuration properties:

- **ID**: Unique identifier (e.g., "tone")
- **Name**: User-friendly label (e.g., "Content Tone")
- **Description**: Explanation of what the options represent
- **Configuration** (required):
  - **values**: Array of string options to display
  - **allowFreeFormInput** (optional): Boolean indicating if custom values are allowed

### Template Usage

Reference StringOptionsList variables in templates using double curly braces:

\`\`\`
TONE: {{tone}}

CONTENT:
{{input_text}}

Please rewrite the above content using a {{tone}} tone.
\`\`\`

### Examples

**Example 1: Tone Selection**

\`\`\`javascript
{
  id: "tone",
  type: "StringOptionsList",
  name: "Content Tone",
  description: "The tone to use for the content",
  configuration: {
    values: ["Formal", "Professional", "Casual", "Friendly", "Humorous"],
    allowFreeFormInput: false
  }
}
\`\`\`

**Example 2: Content Format with Custom Option**

\`\`\`javascript
{
  id: "format",
  type: "StringOptionsList",
  name: "Content Format",
  description: "The format for the generated content",
  configuration: {
    values: ["Blog Post", "Social Media", "Email", "Product Description", "Press Release"],
    allowFreeFormInput: true
  }
}
\`\`\`

### Best Practices

1. **Limit options**: Keep the list reasonably short (typically 3-7 options)
2. **Use clear labels**: Make option names self-explanatory
3. **Order logically**: Arrange options in a logical order (alphabetical, frequency, etc.)
4. **Consider defaults**: Place commonly used options earlier in the list
5. **Use allowFreeFormInput sparingly**: Only enable when custom options are truly needed

### In MCP Integration

In the MCP implementation, StringOptionsList variables are presented as enum parameters with the predefined options as choices.

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Generate a {{content_type}} about {{topic}}...",
    variables: [
      {
        id: "content_type",
        type: "StringOptionsList",
        name: "Content Type",
        description: "The type of content to generate",
        configuration: {
          values: ["Blog Post", "Social Media Post", "Newsletter", "Product Description"],
          allowFreeFormInput: false
        }
      },
      {
        id: "topic",
        type: "Text",
        name: "Topic",
        description: "The topic for the content"
      }
      // other variables...
    ]
  }
});
\`\`\``;

    case "reference":
      return `## Reference Variable Type

The Reference variable type allows AI Actions to access content from other entries in your Contentful space, creating powerful content relationships and context-aware operations.

### Purpose

Reference variables are used for:
- Accessing content from related entries
- Processing entry data for context or analysis
- Creating content based on existing entries
- Cross-referencing information across multiple content types

### Configuration

Reference variables require these properties:

- **ID**: Unique identifier (e.g., "product_entry")
- **Name**: User-friendly label (e.g., "Product Entry")
- **Description**: Explanation of what entry to reference
- **Configuration** (optional):
  - **allowedEntities**: Array of entity types that can be referenced (typically ["Entry"])

### Field Path Specification

When using References in MCP, you must provide both:
1. The entry ID (which entry to reference)
2. The field path (which field within that entry to use)

This is handled through two parameters:
- **reference**: The entry ID to reference
- **reference_path**: The path to the field (e.g., "fields.description.en-US")

### Template Usage

In templates, you can access referenced entry fields using helpers or direct field access:

\`\`\`
PRODUCT NAME: {{product_entry.fields.name}}

CURRENT DESCRIPTION:
{{product_entry.fields.description}}

Please generate an improved product description that highlights the key features while maintaining brand voice.
\`\`\`

### Examples

**Example: Product Description Generator**

\`\`\`javascript
{
  id: "product_entry",
  type: "Reference",
  name: "Product Entry",
  description: "The product entry to generate content for",
  configuration: {
    allowedEntities: ["Entry"]
  }
}
\`\`\`

### Best Practices

1. **Clear field paths**: Always specify exactly which field to use from the referenced entry
2. **Provide context**: Explain which content type or entry type should be referenced
3. **Consider localization**: Remember that fields may be localized, so paths typically include locale code
4. **Check existence**: Handle cases where referenced fields might be empty
5. **Document requirements**: Clearly explain which entry types are valid for the reference

### MCP Implementation Notes

When using Reference variables with the MCP server:

1. The dynamic tool will include two parameters for each Reference:
   - The reference ID parameter (e.g., "product_entry")
   - The path parameter (e.g., "product_entry_path")

2. Always specify both when invoking the AI Action:
   \`\`\`javascript
   invoke_ai_action_product_description({
     product_entry: "6tFnSQdgHuWYOk8eICA0w",
     product_entry_path: "fields.description.en-US"
   });
   \`\`\`

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Generate SEO metadata for this product...\\n\\nPRODUCT: {{product.fields.title}}\\n\\nDESCRIPTION: {{product.fields.description}}",
    variables: [
      {
        id: "product",
        type: "Reference",
        name: "Product Entry",
        description: "The product entry to create metadata for",
        configuration: {
          allowedEntities: ["Entry"]
        }
      }
      // other variables...
    ]
  }
});
\`\`\`

When invoking this AI Action via MCP, you would provide both the entry ID and the specific fields to process.`;

    case "mediareference":
    case "media reference":
      return `## MediaReference Variable Type

The MediaReference variable type enables AI Actions to work with digital assets such as images, videos, documents, and other media files in your Contentful space.

### Purpose

MediaReference variables are ideal for:
- Generating descriptions for images
- Creating alt text for accessibility
- Analyzing media content
- Processing metadata from assets
- Working with document content

### Configuration

MediaReference variables require these properties:

- **ID**: Unique identifier (e.g., "product_image")
- **Name**: User-friendly label (e.g., "Product Image")
- **Description**: Explanation of what asset to reference
- **Configuration**: Typically minimal, as it's restricted to assets

### Field Path Specification

Similar to References, when using MediaReferences in MCP, you need to provide:
1. The asset ID (which media asset to reference)
2. The field path (which aspect of the asset to use)

This is handled through two parameters:
- **media**: The asset ID to reference
- **media_path**: The path to the field (e.g., "fields.file.en-US.url" or "fields.title.en-US")

### Template Usage

In templates, you can access asset properties:

\`\`\`
IMAGE URL: {{product_image.fields.file.url}}
IMAGE TITLE: {{product_image.fields.title}}

Please generate an SEO-friendly alt text description for this product image that highlights key visual elements.
\`\`\`

### Examples

**Example: Image Alt Text Generator**

\`\`\`javascript
{
  id: "product_image",
  type: "MediaReference",
  name: "Product Image",
  description: "The product image to generate alt text for"
}
\`\`\`

### Best Practices

1. **Specify asset type**: Clearly indicate what type of asset should be referenced (image, video, etc.)
2. **Include guidance**: Explain what aspect of the asset will be processed
3. **Consider asset metadata**: Remember that assets have both file data and metadata fields
4. **Handle different asset types**: If your AI Action supports multiple asset types, provide clear instructions

### MCP Implementation Notes

When using MediaReference variables with the MCP server:

1. The dynamic tool will include two parameters for each MediaReference:
   - The media reference parameter (e.g., "product_image")
   - The path parameter (e.g., "product_image_path")

2. Always specify both when invoking the AI Action:
   \`\`\`javascript
   invoke_ai_action_alt_text_generator({
     product_image: "7tGnRQegIvWZPj9eICA1q",
     product_image_path: "fields.file.en-US"
   });
   \`\`\`

### Common Path Values

- **fields.file.{locale}**: To access the file data
- **fields.title.{locale}**: To access the asset title
- **fields.description.{locale}**: To access the asset description

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Generate an SEO-friendly alt text for this image...\\n\\nImage context: {{image_context}}\\n\\nProduct category: {{product_category}}",
    variables: [
      {
        id: "product_image",
        type: "MediaReference",
        name: "Product Image",
        description: "The product image to generate alt text for"
      },
      {
        id: "image_context",
        type: "Text",
        name: "Image Context",
        description: "Additional context about the image"
      },
      {
        id: "product_category",
        type: "StringOptionsList",
        name: "Product Category",
        description: "The category of the product",
        configuration: {
          values: ["Apparel", "Electronics", "Home", "Beauty", "Food"]
        }
      }
    ]
  }
});
\`\`\`

When invoking this action via MCP, you would provide the asset ID and the specific field path to process.`;

    case "locale":
      return `## Locale Variable Type

The Locale variable type allows AI Actions to work with specific languages and regions, enabling localization and translation workflows in your content operations.

### Purpose

Locale variables are perfect for:
- Translation operations
- Region-specific content generation
- Language-aware content processing
- Multilingual content workflows

### Configuration

Locale variables have straightforward configuration:

- **ID**: Unique identifier (e.g., "target_language")
- **Name**: User-friendly label (e.g., "Target Language")
- **Description**: Explanation of how the locale will be used

No additional configuration properties are typically required.

### Format

Locale values follow the standard language-country format:
- **Language code**: 2-letter ISO language code (e.g., "en", "de", "fr")
- **Country/region code**: 2-letter country code (e.g., "US", "DE", "FR")
- **Combined**: language-country (e.g., "en-US", "de-DE", "fr-FR")

### Template Usage

Reference Locale variables in templates using double curly braces:

\`\`\`
ORIGINAL CONTENT (en-US):
{{input_text}}

Please translate the above content into {{target_locale}}.

TRANSLATED CONTENT ({{target_locale}}):
\`\`\`

### Examples

**Example: Content Translation**

\`\`\`javascript
{
  id: "target_locale",
  type: "Locale",
  name: "Target Language",
  description: "The language to translate the content into"
}
\`\`\`

### Best Practices

1. **Clear descriptions**: Specify whether you're looking for target or source language
2. **Validate locale format**: Ensure users enter valid locale codes (typically managed by the UI)
3. **Consider language variants**: Be clear about regional differences (e.g., en-US vs. en-GB)
4. **Use with other variables**: Combine with StandardInput for the content to be localized

### MCP Implementation

In the MCP integration, Locale variables are typically presented as string parameters with descriptions that guide users to enter valid locale codes.

### Implementation with MCP Tools

\`\`\`javascript
create_ai_action({
  // other parameters...
  instruction: {
    template: "Translate the following content into {{target_locale}}...\\n\\nORIGINAL CONTENT:\\n{{input_text}}\\n\\nTRANSLATED CONTENT:",
    variables: [
      {
        id: "target_locale",
        type: "Locale",
        name: "Target Language",
        description: "The language to translate the content into (e.g., fr-FR, de-DE, ja-JP)"
      },
      {
        id: "input_text",
        type: "StandardInput",
        name: "Content to Translate",
        description: "The content that needs to be translated"
      }
    ]
  }
});
\`\`\`

When invoking this action via MCP:

\`\`\`javascript
invoke_ai_action_translator({
  target_locale: "de-DE",
  input_text: "Welcome to our store. We offer the best products at competitive prices."
});
\`\`\`

### Common Locale Codes

- **English**: en-US, en-GB, en-AU, en-CA
- **Spanish**: es-ES, es-MX, es-AR
- **French**: fr-FR, fr-CA
- **German**: de-DE, de-AT, de-CH
- **Japanese**: ja-JP
- **Chinese**: zh-CN, zh-TW
- **Portuguese**: pt-PT, pt-BR
- **Italian**: it-IT
- **Dutch**: nl-NL
- **Russian**: ru-RU`;

    default:
      return `# AI Action Variables: ${variableType}

The variable type "${variableType}" doesn't match any of the standard Contentful AI Action variable types. The standard types are:

1. StandardInput
2. Text
3. FreeFormInput
4. StringOptionsList
5. Reference
6. MediaReference
7. Locale

Please check the spelling or request information about one of these standard types for detailed guidance.`;
  }
}