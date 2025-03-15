export const CONTENTFUL_PROMPTS = {
  "explain-api-concepts": {
    name: "explain-api-concepts",
    description: "Explain Contentful API concepts and relationships",
    arguments: [
      {
        name: "concept",
        description: "Contentful concept (Space/Environment/ContentType/Entry/Asset)",
        required: true
      }
    ]
  },
  "space-identification": {
    name: "space-identification",
    description: "Guide for identifying the correct Contentful space for operations",
    arguments: [
      {
        name: "operation",
        description: "Operation you want to perform",
        required: true
      }
    ]
  },
  "content-modeling-guide": {
    name: "content-modeling-guide",
    description: "Guide through content modeling decisions and best practices",
    arguments: [
      {
        name: "useCase",
        description: "Description of the content modeling scenario",
        required: true
      }
    ]
  },
  "api-operation-help": {
    name: "api-operation-help",
    description: "Get detailed help for specific Contentful API operations",
    arguments: [
      {
        name: "operation",
        description: "API operation (CRUD, publish, archive, etc)",
        required: true
      },
      {
        name: "resourceType",
        description: "Type of resource (Entry/Asset/ContentType)",
        required: true
      }
    ]
  },
  "entry-management": {
    name: "entry-management",
    description: "Help with CRUD operations and publishing workflows for content entries",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/read/update/delete/publish/unpublish/bulk)",
        required: false
      },
      {
        name: "details",
        description: "Additional context or requirements",
        required: false
      }
    ]
  },
  "asset-management": {
    name: "asset-management",
    description: "Guidance on managing digital assets like images, videos, and documents",
    arguments: [
      {
        name: "task",
        description: "Specific task (upload/process/update/delete/publish)",
        required: false
      },
      {
        name: "details",
        description: "Additional context about asset types or requirements",
        required: false
      }
    ]
  },
  "content-type-operations": {
    name: "content-type-operations",
    description: "Help with defining and managing content types and their fields",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/update/delete/publish/field configuration)",
        required: false
      },
      {
        name: "details",
        description: "Additional context about field types or validations",
        required: false
      }
    ]
  },
  "ai-actions-help": {
    name: "ai-actions-help",
    description: "Assistance with creating and using AI-powered content operations",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/update/invoke/configure models)",
        required: false
      },
      {
        name: "details",
        description: "Additional context about AI requirements or variables",
        required: false
      }
    ]
  },
  "bulk-operations": {
    name: "bulk-operations",
    description: "Guidance on performing actions on multiple entities simultaneously",
    arguments: [
      {
        name: "operation",
        description: "Bulk operation type (publish/unpublish/validate)",
        required: false
      },
      {
        name: "entityType",
        description: "Type of entities to process (entries/assets)",
        required: false
      },
      {
        name: "details",
        description: "Additional context about operation requirements",
        required: false
      }
    ]
  },
  "space-environment-management": {
    name: "space-environment-management",
    description: "Help with managing spaces, environments, and deployment workflows",
    arguments: [
      {
        name: "task",
        description: "Specific task (create/list/manage environments/aliases)",
        required: false
      },
      {
        name: "entity",
        description: "Entity type (space/environment)",
        required: false
      },
      {
        name: "details",
        description: "Additional context about workflow requirements",
        required: false
      }
    ]
  }
};
