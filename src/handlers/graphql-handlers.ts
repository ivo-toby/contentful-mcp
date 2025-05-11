/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch } from "undici"
import { buildClientSchema, getIntrospectionQuery, validate, parse, GraphQLSchema } from "graphql"

// Store the GraphQL schema globally so it can be reused for validation
let graphqlSchema: GraphQLSchema | null = null

// Interfaces for GraphQL schema exploration tools
export interface ListContentTypesArgs {
  spaceId?: string
  environmentId?: string
  cdaToken?: string
}

export interface GetContentTypeSchemaArgs {
  contentType: string
  spaceId?: string
  environmentId?: string
  cdaToken?: string
}

export interface GetGraphQLExampleArgs {
  contentType: string
  includeRelations?: boolean
  spaceId?: string
  environmentId?: string
  cdaToken?: string
}

// Function to fetch the GraphQL schema via introspection
export async function fetchGraphQLSchema(
  spaceId: string,
  environmentId: string,
  accessToken: string,
): Promise<GraphQLSchema | null> {
  try {
    const introspectionQuery = getIntrospectionQuery()
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: introspectionQuery }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch GraphQL schema: ${errorText}`)
      return null
    }

    const introspectionResult = await response.json()

    if (introspectionResult.errors) {
      console.error(`GraphQL introspection errors: ${JSON.stringify(introspectionResult.errors)}`)
      return null
    }

    // Build a schema from the introspection result
    const schema = buildClientSchema(introspectionResult.data)

    // Log the schema types for debugging
    console.error(`GraphQL schema loaded with ${Object.keys(schema.getTypeMap()).length} types`)

    return schema
  } catch (error) {
    console.error(`Error fetching GraphQL schema: ${error}`)
    return null
  }
}

// Set the GraphQL schema for later use
export function setGraphQLSchema(schema: GraphQLSchema): void {
  graphqlSchema = schema

  // Count the available query fields as a sanity check
  const queryType = schema.getQueryType()
  if (queryType) {
    const fieldCount = Object.keys(queryType.getFields()).length
    console.error(`GraphQL schema contains ${fieldCount} query fields`)
  }
}

// Interface for GraphQL query arguments
export interface GraphQLQueryArgs {
  spaceId: string
  environmentId: string
  query: string
  variables?: Record<string, any>
  cdaToken?: string  // Content Delivery API token (preferred for GraphQL queries)
}

// Execute a GraphQL query against the Contentful GraphQL API
export const graphqlHandlers = {
  // List all content types available in the GraphQL schema
  listContentTypes: async (args: ListContentTypesArgs) => {
    try {
      const spaceId = process.env.SPACE_ID || args.spaceId
      const environmentId = process.env.ENVIRONMENT_ID || args.environmentId || "master"

      // Try to use a CDA token first (preferred for GraphQL queries), then fall back to CMA token
      const cdaToken = args.cdaToken || process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN
      const cmaToken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN

      // We need at least one type of token for GraphQL queries
      const accessToken = cdaToken || cmaToken

      if (!accessToken) {
        return {
          content: [{ type: "text", text: "Either a Contentful delivery token (CDA) or management token (CMA) is required for GraphQL queries" }],
          isError: true,
        }
      }

      if (!spaceId) {
        return {
          content: [{ type: "text", text: "Space ID is required" }],
          isError: true,
        }
      }

      const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}`

      // Query for root types that represent content types
      const query = `
        query {
          __schema {
            queryType {
              fields {
                name
                description
                type {
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          content: [{ type: "text", text: `HTTP Error ${response.status}: ${errorText}` }],
          isError: true,
        }
      }

      const result = await response.json()

      if (result.errors) {
        return {
          content: [{ type: "text", text: JSON.stringify({ errors: result.errors }, null, 2) }],
          isError: true,
        }
      }

      // Filter for collection fields which represent content types
      const contentTypeFields = result.data.__schema.queryType.fields
        .filter((field: any) =>
          field.name.endsWith("Collection") ||
          (field.type?.kind === "OBJECT" && field.type?.name?.endsWith("Collection"))
        )
        .map((field: any) => ({
          name: field.name.replace("Collection", ""),
          description: field.description || `Content type for ${field.name}`,
          queryName: field.name
        }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "Available content types in this Contentful space. Use graphql_get_content_type_schema to explore a specific content type.",
            contentTypes: contentTypeFields,
          }, null, 2)
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching content types: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true,
      }
    }
  },

  // Get schema details for a specific content type
  getContentTypeSchema: async (args: GetContentTypeSchemaArgs) => {
    try {
      const spaceId = process.env.SPACE_ID || args.spaceId
      const environmentId = process.env.ENVIRONMENT_ID || args.environmentId || "master"

      // Try to use a CDA token first (preferred for GraphQL queries), then fall back to CMA token
      const cdaToken = args.cdaToken || process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN
      const cmaToken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN

      // We need at least one type of token for GraphQL queries
      const accessToken = cdaToken || cmaToken

      if (!accessToken) {
        return {
          content: [{ type: "text", text: "Either a Contentful delivery token (CDA) or management token (CMA) is required for GraphQL queries" }],
          isError: true,
        }
      }

      if (!spaceId) {
        return {
          content: [{ type: "text", text: "Space ID is required" }],
          isError: true,
        }
      }

      const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}`

      // Query for type details
      const query = `
        query {
          __type(name: "${args.contentType}") {
            name
            description
            fields {
              name
              description
              type {
                kind
                name
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          content: [{ type: "text", text: `HTTP Error ${response.status}: ${errorText}` }],
          isError: true,
        }
      }

      const result = await response.json()

      if (result.errors) {
        return {
          content: [{ type: "text", text: JSON.stringify({ errors: result.errors }, null, 2) }],
          isError: true,
        }
      }

      // Check if type was not found
      if (!result.data.__type) {
        // Try again with "Collection" suffix if not already tried
        if (!args.contentType.endsWith("Collection")) {
          const modifiedArgs = {
            ...args,
            contentType: `${args.contentType}Collection`
          }
          return graphqlHandlers.getContentTypeSchema(modifiedArgs)
        }

        return {
          content: [{
            type: "text",
            text: `Content type "${args.contentType}" not found in the schema. Use graphql_list_content_types to see available content types.`
          }],
          isError: true,
        }
      }

      // Process fields information
      const fields = result.data.__type.fields.map((field: any) => ({
        name: field.name,
        description: field.description || `Field ${field.name}`,
        type: formatGraphQLType(field.type)
      }))

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            contentType: result.data.__type.name,
            description: result.data.__type.description,
            fields,
            note: "Use this schema to construct your GraphQL queries. For example queries, use the graphql_get_example tool."
          }, null, 2)
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching content type schema: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true,
      }
    }
  },

  // Get example GraphQL queries for a content type
  getExample: async (args: GetGraphQLExampleArgs) => {
    try {
      const spaceId = process.env.SPACE_ID || args.spaceId
      const environmentId = process.env.ENVIRONMENT_ID || args.environmentId || "master"

      // First get the schema
      const schemaResult = await graphqlHandlers.getContentTypeSchema({
        contentType: args.contentType,
        spaceId,
        environmentId,
        cdaToken: args.cdaToken
      })

      if (schemaResult.isError) {
        return schemaResult
      }

      // Parse the schema from the result
      const schemaData = JSON.parse(schemaResult.content[0].text)

      // Generate a query for collection
      const isCollection = schemaData.contentType.endsWith("Collection")
      const contentTypeName = isCollection ? schemaData.contentType : schemaData.contentType.replace(/^[A-Z]/, (c: string) => c.toLowerCase())
      const collectionName = isCollection ? contentTypeName : `${contentTypeName}Collection`
      const singularName = isCollection ? contentTypeName.replace("Collection", "") : contentTypeName

      // Get top-level scalar fields
      const scalarFields = schemaData.fields
        .filter((field: any) => isScalarType(field.type))
        .map((field: any) => field.name)

      // Get reference fields if requested
      const referenceFields = args.includeRelations ?
        schemaData.fields
          .filter((field: any) => isReferenceType(field.type))
          .map((field: any) => ({
            name: field.name,
            type: field.type.replace("!", "")
          })) : []

      // Build the example query
      let exampleQuery = `# Example query for ${schemaData.contentType}
query {
  ${collectionName}(limit: 5) {
    items {
${scalarFields.map((field: string) => `      ${field}`).join('\n')}`

      if (referenceFields.length > 0) {
        exampleQuery += `\n
      # Related content references
${referenceFields.map((field: any) => `      ${field.name} {
        ... on ${field.type} {
          # Add fields you want from ${field.type} here
        }
      }`).join('\n')}`
      }

      exampleQuery += `\n    }
  }
}

# You can also query a single item by ID
query GetSingle${singularName}($id: String!) {
  ${singularName}(id: $id) {
${scalarFields.map((field: string) => `    ${field}`).join('\n')}
  }
}

# Variables for the above query would be:
# {
#   "id": "your-entry-id-here"
# }`

      return {
        content: [{
          type: "text",
          text: exampleQuery
        }]
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error generating example query: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true,
      }
    }
  },

  // Execute a GraphQL query
  executeQuery: async (args: GraphQLQueryArgs) => {
    try {
      const spaceId = process.env.SPACE_ID || args.spaceId
      const environmentId = process.env.ENVIRONMENT_ID || args.environmentId || "master"

      // Try to use a CDA token first (preferred for GraphQL queries), then fall back to CMA token
      // The argument token takes precedence over environment variable
      const cdaToken = args.cdaToken || process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN
      const cmaToken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN

      // We need at least one type of token for GraphQL queries
      const accessToken = cdaToken || cmaToken

      if (!accessToken) {
        return {
          content: [{ type: "text", text: "Either a Contentful delivery token (CDA) or management token (CMA) is required for GraphQL queries" }],
          isError: true,
        }
      }

      if (!spaceId) {
        return {
          content: [{ type: "text", text: "Space ID is required" }],
          isError: true,
        }
      }

      // Validate the query against the schema if available
      if (graphqlSchema) {
        try {
          const queryDocument = parse(args.query)
          const validationErrors = validate(graphqlSchema, queryDocument)

          if (validationErrors.length > 0) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      errors: validationErrors.map((error) => ({ message: error.message })),
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            }
          }
        } catch (parseError) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    errors: [{ message: `GraphQL query parsing error: ${parseError}` }],
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          }
        }
      } else {
        console.warn("GraphQL schema not available for validation")
      }

      // Execute the query against the Contentful GraphQL API
      const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: args.query,
          variables: args.variables || {},
        }),
      })

      // Handle HTTP error responses
      if (!response.ok) {
        const errorText = await response.text()
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  errors: [{ message: `HTTP Error ${response.status}: ${errorText}` }],
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }

      const result = await response.json()

      console.error("GraphQL response:", JSON.stringify(result))

      // Check for GraphQL errors
      if (result.errors) {
        const errorResponse = {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  errors: result.errors,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
        console.error("Returning error response:", JSON.stringify(errorResponse))
        return errorResponse
      }

      // Return the successful result
      const successResponse = {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      }
      console.error("Returning success response:", JSON.stringify(successResponse))
      return successResponse
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                errors: [
                  {
                    message: `Error executing GraphQL query: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      }
    }
  },
}

// Helper functions for GraphQL type formatting
function formatGraphQLType(typeInfo: any): string {
  if (!typeInfo) return 'Unknown';

  if (typeInfo.kind === 'NON_NULL') {
    return `${formatGraphQLType(typeInfo.ofType)}!`;
  } else if (typeInfo.kind === 'LIST') {
    return `[${formatGraphQLType(typeInfo.ofType)}]`;
  } else if (typeInfo.name) {
    return typeInfo.name;
  } else if (typeInfo.ofType && typeInfo.ofType.name) {
    return typeInfo.ofType.name;
  }

  return 'Unknown';
}

function isScalarType(typeString: string): boolean {
  const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'JSON'];
  return scalarTypes.some(scalar => typeString.includes(scalar));
}

function isReferenceType(typeString: string): boolean {
  // Exclude scalar types, collections, connections, etc.
  return !isScalarType(typeString) &&
         !typeString.includes('Collection') &&
         !typeString.includes('Connection');
}

