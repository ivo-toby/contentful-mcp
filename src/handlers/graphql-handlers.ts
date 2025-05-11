/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch } from "undici"
import { buildClientSchema, getIntrospectionQuery, validate, parse, GraphQLSchema } from "graphql"

// Store the GraphQL schema globally so it can be reused for validation
let graphqlSchema: GraphQLSchema | null = null

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

