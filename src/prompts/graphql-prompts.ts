/**
 * Prompt definitions for GraphQL schema exploration and query building
 * These prompts help guide users through GraphQL schema understanding and query creation
 */
export const GRAPHQL_PROMPTS = {
  "explore-graphql-schema": {
    name: "explore-graphql-schema",
    description:
      "Explore the GraphQL schema for this Contentful space and get guidance on querying content",
    arguments: [
      {
        name: "goal",
        description: "What kind of content you're trying to retrieve (optional)",
        required: false,
      },
    ],
    template: `# Exploring the Contentful GraphQL Schema

To help you explore the Contentful GraphQL schema and construct effective queries, I'll guide you through the following steps:

1. First, I'll use the graphql_list_content_types tool to discover all available content types in this space
2. {{#if goal}}Based on your goal to retrieve "{{goal}}", I'll identify the most relevant content types{{else}}I'll identify the key content types that might be useful for you{{/if}}
3. For each relevant content type, I'll examine its schema with graphql_get_content_type_schema
4. I'll generate example queries that you can use as templates
5. Finally, I'll explain how to customize these queries for your specific needs

Let's start by exploring all available content types...
`,
  },

  "build-graphql-query": {
    name: "build-graphql-query",
    description: "Build a custom GraphQL query for a specific content need",
    arguments: [
      {
        name: "contentType",
        description: "The primary content type you want to query",
        required: true,
      },
      {
        name: "fields",
        description: "The specific fields you want to retrieve, comma-separated",
        required: false,
      },
      {
        name: "filters",
        description: "Any filtering criteria (optional)",
        required: false,
      },
      {
        name: "includeReferences",
        description: "Whether to include referenced content",
        required: false,
      },
    ],
    template: `# Building a Custom GraphQL Query

I'll help you build a GraphQL query for the "{{contentType}}" content type{{#if fields}}, retrieving these fields: {{fields}}{{else}}, retrieving all relevant fields{{/if}}.
{{#if filters}}We'll apply these filters: {{filters}}.{{/if}}
{{#if includeReferences}}We'll also include referenced content where appropriate.{{/if}}

First, let's verify the content type exists and examine its schema...
`,
  },
}

