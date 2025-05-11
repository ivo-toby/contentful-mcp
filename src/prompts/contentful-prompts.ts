/**
 * Prompt definitions for the Contentful MCP server
 * These prompts help guide users through common operations and concepts
 */
import { GRAPHQL_PROMPTS } from "./graphql-prompts.js"

export const CONTENTFUL_PROMPTS = {
  "explain-api-concepts": {
    name: "explain-api-concepts",
    description: "Explain Contentful API concepts and relationships",
    arguments: [
      {
        name: "concept",
        description: "Contentful concept (Space/Environment/ContentType/Entry/Asset)",
        required: true,
      },
    ],
  },
  "space-identification": {
    name: "space-identification",
    description: "Guide for identifying the correct Contentful space for operations",
    arguments: [
      {
        name: "operation",
        description: "Operation you want to perform",
        required: true,
      },
    ],
  },
  "content-modeling-guide": {
    name: "content-modeling-guide",
    description: "Guide through content modeling decisions and best practices",
    arguments: [
      {
        name: "useCase",
        description: "Description of the content modeling scenario",
        required: true,
      },
    ],
  },
  "api-operation-help": {
    name: "api-operation-help",
    description: "Get detailed help for specific Contentful API operations",
    arguments: [
      {
        name: "operation",
        description: "API operation (CRUD, publish, archive, etc)",
        required: true,
      },
      {
        name: "resourceType",
        description: "Type of resource (Entry/Asset/ContentType)",
        required: true,
      },
    ],
  },
  "entry-management": {
    name: "entry-management",
    description: "Help with CRUD operations and publishing workflows for content entries",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/read/update/delete/publish/unpublish/bulk)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context or requirements",
        required: false,
      },
    ],
  },
  "asset-management": {
    name: "asset-management",
    description: "Guidance on managing digital assets like images, videos, and documents",
    arguments: [
      {
        name: "task",
        description: "Specific task (upload/process/update/delete/publish)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context about asset types or requirements",
        required: false,
      },
    ],
  },
  "content-type-operations": {
    name: "content-type-operations",
    description: "Help with defining and managing content types and their fields",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/update/delete/publish/field configuration)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context about field types or validations",
        required: false,
      },
    ],
  },
  "ai-actions-overview": {
    name: "ai-actions-overview",
    description: "Comprehensive overview of AI Actions in Contentful",
    arguments: [],
  },
  "ai-actions-create": {
    name: "ai-actions-create",
    description: "Guide for creating and configuring AI Actions in Contentful",
    arguments: [
      {
        name: "useCase",
        description: "Purpose of the AI Action you want to create",
        required: true,
      },
      {
        name: "modelType",
        description: "AI model type (e.g., gpt-4, claude-3-opus)",
        required: false,
      },
    ],
  },
  "ai-actions-variables": {
    name: "ai-actions-variables",
    description: "Explanation of variable types and configuration for AI Actions",
    arguments: [
      {
        name: "variableType",
        description: "Type of variable (Text, Reference, StandardInput, etc)",
        required: false,
      },
    ],
  },
  "ai-actions-invoke": {
    name: "ai-actions-invoke",
    description: "Help with invoking AI Actions and processing results",
    arguments: [
      {
        name: "actionId",
        description: "ID of the AI Action (if known)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context about your invocation requirements",
        required: false,
      },
    ],
  },
  "bulk-operations": {
    name: "bulk-operations",
    description: "Guidance on performing actions on multiple entities simultaneously",
    arguments: [
      {
        name: "operation",
        description: "Bulk operation type (publish/unpublish/validate)",
        required: false,
      },
      {
        name: "entityType",
        description: "Type of entities to process (entries/assets)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context about operation requirements",
        required: false,
      },
    ],
  },
  "space-environment-management": {
    name: "space-environment-management",
    description: "Help with managing spaces, environments, and deployment workflows",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/list/manage environments/aliases)",
        required: false,
      },
      {
        name: "entity",
        description: "Entity type (space/environment)",
        required: false,
      },
      {
        name: "details",
        description: "Additional context about workflow requirements",
        required: false,
      },
    ],
  },
  "mcp-tool-usage": {
    name: "mcp-tool-usage",
    description: "Instructions for using Contentful MCP tools effectively",
    arguments: [
      {
        name: "toolName",
        description: "Specific tool name (e.g., invoke_ai_action, create_entry)",
        required: false,
      },
    ],
  },

  // Include GraphQL prompts
  ...GRAPHQL_PROMPTS,
}

