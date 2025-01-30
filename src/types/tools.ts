export const getSpaceEnvProperties = (config) => {
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
      description: "Search for entries using query parameters",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          query: {
            type: "object",
            description: "Query parameters for searching entries",
            properties: {
              content_type: { type: "string" },
              select: { type: "string" },
              limit: { type: "number" },
              skip: { type: "number" },
              order: { type: "string" },
              query: { type: "string" },
            },
          },
        },
        required: ["query"],
      }),
    },
    CREATE_ENTRY: {
      name: "create_entry",
      description: "Create a new entry in Contentful",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          contentTypeId: {
            type: "string",
            description: "The ID of the content type for the new entry",
          },
          fields: { type: "object", description: "The fields of the entry" },
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
        "Update an existing entry, always send all field values, also the fields values that have not been updated",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
          fields: { type: "object" },
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
      description: "Publish an entry",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
        },
        required: ["entryId"],
      }),
    },
    UNPUBLISH_ENTRY: {
      name: "unpublish_entry",
      description: "Unpublish an entry",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {
          entryId: { type: "string" },
        },
        required: ["entryId"],
      }),
    },
  }
}

// Tool definitions for Asset operations
export const getAssetTools = () => {
  return {
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
        "List content types in a space. Requires either spaceId parameter to identify the target space.",
      inputSchema: getSpaceEnvProperties({
        type: "object",
        properties: {},
        required: [],
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
      description: "Update an existing content type",
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
        required: ["contentTypeId", "name", "fields"],
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

// Export combined tools
export const getTools = () => {
  return {
    ...getEntryTools(),
    ...getAssetTools(),
    ...getContentTypeTools(),
    ...getSpaceEnvTools(),
  }
}
