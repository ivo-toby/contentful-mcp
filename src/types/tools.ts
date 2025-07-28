// Define interface for config parameter
interface ConfigSchema {
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>
  required?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export const getSpaceEnvProperties = (config: ConfigSchema): ConfigSchema => {
  const spaceEnvProperties = {
    spaceId: {
      type: "string",
      description:
        "The ID of the Contentful space. This must be the space's ID, not its name, ask for this ID if it's unclear.",
    },
    environmentId: {
      type: "string",
      description:
        "The ID of the environment within the space, by default this will be called Master",
      default: "master",
    },
  }

  if (!process.env.SPACE_ID && !process.env.ENVIRONMENT_ID) {
    return {
      ...config,
      properties: {
        ...config.properties,
        ...spaceEnvProperties,
      },
      required: [...(config.required || []), "spaceId", "environmentId"],
    }
  }

  return config
}

// Tool definitions for Entry operations
export const getEntryTools = () => {
  return {
    SEARCH_ENTRIES: {
      name: "search_entries",
      description:
        "Search for entries using query parameters. Returns a maximum of 3 items per request. Use skip parameter to paginate through results.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          query: {
            type: "object",
            description: "Query parameters for searching entries",
            properties: {
              content_type: { type: "string" },
              select: { type: "string" },
              limit: {
                type: "number",
                default: 3,
                maximum: 3,
                description: "Maximum number of items to return (max: 3)",
              },
              skip: {
                type: "number",
                default: 0,
                description: "Number of items to skip for pagination",
              },
              order: { type: "string" },
              query: { type: "string" },
            },
            required: ["limit", "skip"],
          },
        },
        required: ["query"],
      }),
    },
    CREATE_ENTRY: {
      name: "create_entry",
      description:
        "Create a new entry in Contentful. Before executing this function, you need to know the contentTypeId (not the content type NAME) and the fields of that contentType. You can get the fields definition by using the GET_CONTENT_TYPE tool. IMPORTANT: All field values MUST include a locale key (e.g., 'en-US') for each value, like: { title: { 'en-US': 'My Title' } }. Every field in Contentful requires a locale even for single-language content.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: {
            type: "string",
            description: "The ID of the content type for the new entry",
          },
          fields: {
            type: "object",
            description:
              "The fields of the entry with localized values. Example: { title: { 'en-US': 'My Title' }, description: { 'en-US': 'My Description' } }",
          },
        },
        required: ["contentTypeId", "fields"],
      }),
    },
    GET_ENTRY: {
      name: "get_entry",
      description: "Retrieve an existing entry",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
        },
        required: ["entryId"],
      }),
    },
    UPDATE_ENTRY: {
      name: "update_entry",
      description:
        "Update an existing entry. The handler will merge your field updates with the existing entry fields, so you only need to provide the fields and locales you want to change. IMPORTANT: All field values MUST include a locale key (e.g., 'en-US') for each value, like: { title: { 'en-US': 'My Updated Title' } }. Every field in Contentful requires a locale even for single-language content.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
          fields: {
            type: "object",
            description:
              "The fields to update with localized values. Example: { title: { 'en-US': 'My Updated Title' } }",
          },
        },
        required: ["entryId", "fields"],
      }),
    },
    DELETE_ENTRY: {
      name: "delete_entry",
      description: "Delete an entry",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
        },
        required: ["entryId"],
      }),
    },
    PUBLISH_ENTRY: {
      name: "publish_entry",
      description:
        "Publish an entry or multiple entries. Accepts either a single entryId (string) or an array of entryIds (up to 100 entries). For a single entry, it uses the standard publish operation. For multiple entries, it automatically uses bulk publishing.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: {
            oneOf: [
              { type: "string" },
              {
                type: "array",
                items: { type: "string" },
                maxItems: 100,
                description: "Array of entry IDs to publish (max: 100)",
              },
            ],
            description: "ID of the entry to publish, or an array of entry IDs (max: 100)",
          },
        },
        required: ["entryId"],
      }),
    },
    UNPUBLISH_ENTRY: {
      name: "unpublish_entry",
      description:
        "Unpublish an entry or multiple entries. Accepts either a single entryId (string) or an array of entryIds (up to 100 entries). For a single entry, it uses the standard unpublish operation. For multiple entries, it automatically uses bulk unpublishing.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: {
            oneOf: [
              { type: "string" },
              {
                type: "array",
                items: { type: "string" },
                maxItems: 100,
                description: "Array of entry IDs to unpublish (max: 100)",
              },
            ],
            description: "ID of the entry to unpublish, or an array of entry IDs (max: 100)",
          },
        },
        required: ["entryId"],
      }),
    },
  }
}

// Tool definitions for Asset operations
export const getAssetTools = () => {
  return {
    LIST_ASSETS: {
      name: "list_assets",
      description:
        "List assets in a space. Returns a maximum of 3 items per request. Use skip parameter to paginate through results.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          limit: {
            type: "number",
            default: 3,
            maximum: 3,
            description: "Maximum number of items to return (max: 3)",
          },
          skip: {
            type: "number",
            default: 0,
            description: "Number of items to skip for pagination",
          },
        },
        required: ["limit", "skip"],
      }),
    },
    UPLOAD_ASSET: {
      name: "upload_asset",
      description: "Upload a new asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          file: {
            type: "object",
            properties: {
              upload: { type: "string" },
              fileName: { type: "string" },
              contentType: { type: "string" },
            },
            required: ["upload", "fileName", "contentType"],
          },
        },
        required: ["title", "file"],
      }),
    },
    GET_ASSET: {
      name: "get_asset",
      description: "Retrieve an asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          assetId: { type: "string" },
        },
        required: ["assetId"],
      }),
    },
    UPDATE_ASSET: {
      name: "update_asset",
      description: "Update an asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          assetId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          file: {
            type: "object",
            properties: {
              url: { type: "string" },
              fileName: { type: "string" },
              contentType: { type: "string" },
            },
            required: ["url", "fileName", "contentType"],
          },
        },
        required: ["assetId"],
      }),
    },
    DELETE_ASSET: {
      name: "delete_asset",
      description: "Delete an asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          assetId: { type: "string" },
        },
        required: ["assetId"],
      }),
    },
    PUBLISH_ASSET: {
      name: "publish_asset",
      description: "Publish an asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          assetId: { type: "string" },
        },
        required: ["assetId"],
      }),
    },
    UNPUBLISH_ASSET: {
      name: "unpublish_asset",
      description: "Unpublish an asset",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          assetId: { type: "string" },
        },
        required: ["assetId"],
      }),
    },
  }
}

// Tool definitions for Content Type operations
export const getContentTypeTools = () => {
  return {
    LIST_CONTENT_TYPES: {
      name: "list_content_types",
      description:
        "List content types in a space. Returns a maximum of 10 items per request. Use skip parameter to paginate through results.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          limit: {
            type: "number",
            default: 10,
            maximum: 20,
            description: "Maximum number of items to return (max: 3)",
          },
          skip: {
            type: "number",
            default: 0,
            description: "Number of items to skip for pagination",
          },
        },
        required: ["limit", "skip"],
      }),
    },
    GET_CONTENT_TYPE: {
      name: "get_content_type",
      description: "Get details of a specific content type",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: { type: "string" },
        },
        required: ["contentTypeId"],
      }),
    },
    CREATE_CONTENT_TYPE: {
      name: "create_content_type",
      description: "Create a new content type",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          name: { type: "string" },
          fields: {
            type: "array",
            description: "Array of field definitions for the content type",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The ID of the field",
                },
                name: {
                  type: "string",
                  description: "Display name of the field",
                },
                type: {
                  type: "string",
                  description:
                    "Type of the field (Text, Number, Date, Location, Media, Boolean, JSON, Link, Array, etc)",
                  enum: [
                    "Symbol",
                    "Text",
                    "Integer",
                    "Number",
                    "Date",
                    "Location",
                    "Object",
                    "Boolean",
                    "Link",
                    "Array",
                  ],
                },
                required: {
                  type: "boolean",
                  description: "Whether this field is required",
                  default: false,
                },
                localized: {
                  type: "boolean",
                  description: "Whether this field can be localized",
                  default: false,
                },
                linkType: {
                  type: "string",
                  description:
                    "Required for Link fields. Specifies what type of resource this field links to",
                  enum: ["Entry", "Asset"],
                },
                items: {
                  type: "object",
                  description:
                    "Required for Array fields. Specifies the type of items in the array",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["Symbol", "Link"],
                    },
                    linkType: {
                      type: "string",
                      enum: ["Entry", "Asset"],
                    },
                    validations: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                    },
                  },
                },
                validations: {
                  type: "array",
                  description: "Array of validation rules for the field",
                  items: {
                    type: "object",
                  },
                },
              },
              required: ["id", "name", "type"],
            },
          },
          description: { type: "string" },
          displayField: { type: "string" },
        },
        required: ["name", "fields"],
      }),
    },
    UPDATE_CONTENT_TYPE: {
      name: "update_content_type",
      description:
        "Update an existing content type. The handler will merge your field updates with existing content type data, so you only need to provide the fields and properties you want to change.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: { type: "string" },
          name: { type: "string" },
          fields: {
            type: "array",
            items: { type: "object" },
          },
          description: { type: "string" },
          displayField: { type: "string" },
        },
        required: ["contentTypeId", "fields"],
      }),
    },
    DELETE_CONTENT_TYPE: {
      name: "delete_content_type",
      description: "Delete a content type",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: { type: "string" },
        },
        required: ["contentTypeId"],
      }),
    },
    PUBLISH_CONTENT_TYPE: {
      name: "publish_content_type",
      description: "Publish a content type",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: { type: "string" },
        },
        required: ["contentTypeId"],
      }),
    },
  }
}

// Tool definitions for Space & Environment operations
export const getSpaceEnvTools = () => {
  if (process.env.SPACE_ID && process.env.ENVIRONMENT_ID) {
    return {}
  }
  return {
    LIST_SPACES: {
      name: "list_spaces",
      description: "List all available spaces",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    GET_SPACE: {
      name: "get_space",
      description: "Get details of a space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: { type: "string" },
        },
        required: ["spaceId"],
      },
    },
    LIST_ENVIRONMENTS: {
      name: "list_environments",
      description: "List all environments in a space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: { type: "string" },
        },
        required: ["spaceId"],
      },
    },
    CREATE_ENVIRONMENT: {
      name: "create_environment",
      description: "Create a new environment",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: { type: "string" },
          environmentId: { type: "string" },
          name: { type: "string" },
        },
        required: ["spaceId", "environmentId", "name"],
      },
    },
    DELETE_ENVIRONMENT: {
      name: "delete_environment",
      description: "Delete an environment",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: { type: "string" },
          environmentId: { type: "string" },
        },
        required: ["spaceId", "environmentId"],
      },
    },
  }
}

// Tool definitions for Bulk Actions
export const getBulkActionTools = () => {
  return {
    BULK_VALIDATE: {
      name: "bulk_validate",
      description: "Validate multiple entries at once",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryIds: {
            type: "array",
            description: "Array of entry IDs to validate",
            items: {
              type: "string",
            },
          },
        },
        required: ["entryIds"],
      }),
    },
  }
}

// Tool definitions for AI Actions
export const getAiActionTools = () => {
  return {
    LIST_AI_ACTIONS: {
      name: "list_ai_actions",
      description: "List all AI Actions in a space",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          limit: {
            type: "number",
            default: 100,
            description: "Maximum number of AI Actions to return",
          },
          skip: {
            type: "number",
            default: 0,
            description: "Number of AI Actions to skip for pagination",
          },
          status: {
            type: "string",
            enum: ["all", "published"],
            description: "Filter AI Actions by status",
          },
        },
        required: [],
      }),
    },
    GET_AI_ACTION: {
      name: "get_ai_action",
      description: "Get a specific AI Action by ID",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to retrieve",
          },
        },
        required: ["aiActionId"],
      }),
    },
    CREATE_AI_ACTION: {
      name: "create_ai_action",
      description: "Create a new AI Action",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the AI Action",
          },
          description: {
            type: "string",
            description: "The description of the AI Action",
          },
          instruction: {
            type: "object",
            description: "The instruction object containing the template and variables",
            properties: {
              template: {
                type: "string",
                description: "The prompt template with variable placeholders",
              },
              variables: {
                type: "array",
                description: "Array of variable definitions",
                items: {
                  type: "object",
                },
              },
              conditions: {
                type: "array",
                description: "Optional array of conditions for the template",
                items: {
                  type: "object",
                },
              },
            },
            required: ["template", "variables"],
          },
          configuration: {
            type: "object",
            description: "The model configuration",
            properties: {
              modelType: {
                type: "string",
                description: "The type of model to use (e.g., gpt-4)",
              },
              modelTemperature: {
                type: "number",
                description: "The temperature setting for the model (0.0 to 1.0)",
                minimum: 0,
                maximum: 1,
              },
            },
            required: ["modelType", "modelTemperature"],
          },
          testCases: {
            type: "array",
            description: "Optional array of test cases for the AI Action",
            items: {
              type: "object",
            },
          },
        },
        required: ["name", "description", "instruction", "configuration"],
      }),
    },
    UPDATE_AI_ACTION: {
      name: "update_ai_action",
      description: "Update an existing AI Action",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to update",
          },
          name: {
            type: "string",
            description: "The name of the AI Action",
          },
          description: {
            type: "string",
            description: "The description of the AI Action",
          },
          instruction: {
            type: "object",
            description: "The instruction object containing the template and variables",
            properties: {
              template: {
                type: "string",
                description: "The prompt template with variable placeholders",
              },
              variables: {
                type: "array",
                description: "Array of variable definitions",
                items: {
                  type: "object",
                },
              },
              conditions: {
                type: "array",
                description: "Optional array of conditions for the template",
                items: {
                  type: "object",
                },
              },
            },
            required: ["template", "variables"],
          },
          configuration: {
            type: "object",
            description: "The model configuration",
            properties: {
              modelType: {
                type: "string",
                description: "The type of model to use (e.g., gpt-4)",
              },
              modelTemperature: {
                type: "number",
                description: "The temperature setting for the model (0.0 to 1.0)",
                minimum: 0,
                maximum: 1,
              },
            },
            required: ["modelType", "modelTemperature"],
          },
          testCases: {
            type: "array",
            description: "Optional array of test cases for the AI Action",
            items: {
              type: "object",
            },
          },
        },
        required: ["aiActionId", "name", "description", "instruction", "configuration"],
      }),
    },
    DELETE_AI_ACTION: {
      name: "delete_ai_action",
      description: "Delete an AI Action",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to delete",
          },
        },
        required: ["aiActionId"],
      }),
    },
    PUBLISH_AI_ACTION: {
      name: "publish_ai_action",
      description: "Publish an AI Action",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to publish",
          },
        },
        required: ["aiActionId"],
      }),
    },
    UNPUBLISH_AI_ACTION: {
      name: "unpublish_ai_action",
      description: "Unpublish an AI Action",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to unpublish",
          },
        },
        required: ["aiActionId"],
      }),
    },
    INVOKE_AI_ACTION: {
      name: "invoke_ai_action",
      description: "Invoke an AI Action with variables",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action to invoke",
          },
          variables: {
            type: "object",
            description: "Key-value pairs of variable IDs and their values",
            additionalProperties: {
              type: "string",
            },
          },
          rawVariables: {
            type: "array",
            description:
              "Array of raw variable objects (for complex variable types like references)",
            items: {
              type: "object",
            },
          },
          outputFormat: {
            type: "string",
            enum: ["Markdown", "RichText", "PlainText"],
            default: "Markdown",
            description: "The format of the output content",
          },
          waitForCompletion: {
            type: "boolean",
            default: true,
            description: "Whether to wait for the AI Action to complete before returning",
          },
        },
        required: ["aiActionId"],
      }),
    },
    GET_AI_ACTION_INVOCATION: {
      name: "get_ai_action_invocation",
      description: "Get the result of a previous AI Action invocation",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          aiActionId: {
            type: "string",
            description: "The ID of the AI Action",
          },
          invocationId: {
            type: "string",
            description: "The ID of the specific invocation to retrieve",
          },
        },
        required: ["aiActionId", "invocationId"],
      }),
    },
  }
}

// Tool definitions for Comment operations
export const getCommentTools = () => {
  return {
    GET_COMMENTS: {
      name: "get_comments",
      description:
        "Retrieve comments for an entry. Returns comments with their status and body content.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: {
            type: "string",
            description: "The unique identifier of the entry to get comments for",
          },
          bodyFormat: {
            type: "string",
            enum: ["plain-text", "rich-text"],
            default: "plain-text",
            description: "Format for the comment body content",
          },
          status: {
            type: "string",
            enum: ["active", "resolved", "all"],
            default: "active",
            description: "Filter comments by status",
          },
        },
        required: ["entryId"],
      }),
    },
    CREATE_COMMENT: {
      name: "create_comment",
      description:
        "Create a new comment on an entry. The comment will be created with the specified body and status.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: {
            type: "string",
            description: "The unique identifier of the entry to comment on",
          },
          body: {
            type: "string",
            description: "The content of the comment",
          },
          status: {
            type: "string",
            enum: ["active"],
            default: "active",
            description: "The status of the comment",
          },
        },
        required: ["entryId", "body"],
      }),
    },
    GET_SINGLE_COMMENT: {
      name: "get_single_comment",
      description: "Retrieve a specific comment by its ID for an entry.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: {
            type: "string",
            description: "The unique identifier of the entry",
          },
          commentId: {
            type: "string",
            description: "The unique identifier of the comment to retrieve",
          },
          bodyFormat: {
            type: "string",
            enum: ["plain-text", "rich-text"],
            default: "plain-text",
            description: "Format for the comment body content",
          },
        },
        required: ["entryId", "commentId"],
      }),
    },
  }
}

// Export combined tools
export const getTools = () => {
  return {
    ...getEntryTools(),
    ...getAssetTools(),
    ...getContentTypeTools(),
    ...getSpaceEnvTools(),
    ...getBulkActionTools(),
    ...getAiActionTools(),
    ...getCommentTools(),
  }
}
