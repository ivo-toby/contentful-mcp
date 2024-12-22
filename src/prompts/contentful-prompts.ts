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
  }
};
