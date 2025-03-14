/* eslint-disable @typescript-eslint/no-explicit-any */
import { getContentfulClient } from "../config/client.js"
import { summarizeData } from "../utils/summarizer.js"
import { CreateEntryProps, EntryProps, QueryOptions } from "contentful-management"

export const entryHandlers = {
  searchEntries: async (args: { spaceId: string; environmentId: string; query: QueryOptions }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
    }

    const contentfulClient = await getContentfulClient()
    const entries = await contentfulClient.entry.getMany({
      ...params,
      query: {
        ...args.query,
        limit: Math.min(args.query.limit || 3, 3),
        skip: args.query.skip || 0
      },
    })

    const summarized = summarizeData(entries, {
      maxItems: 3,
      remainingMessage: "To see more entries, please ask me to retrieve the next page."
    })

    return {
      content: [{ type: "text", text: JSON.stringify(summarized, null, 2) }],
    }
  },
  createEntry: async (args: {
    spaceId: string
    environmentId: string
    contentTypeId: string
    fields: Record<string, any>
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      contentTypeId: args.contentTypeId,
    }

    const entryProps: CreateEntryProps = {
      fields: args.fields,
    }

    const contentfulClient = await getContentfulClient()
    const entry = await contentfulClient.entry.create(params, entryProps)
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    }
  },

  getEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      entryId: args.entryId,
    }

    const contentfulClient = await getContentfulClient()
    const entry = await contentfulClient.entry.get(params)
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    }
  },

  updateEntry: async (args: {
    spaceId: string
    environmentId: string
    entryId: string
    fields: Record<string, any>
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      entryId: args.entryId,
    }

    const contentfulClient = await getContentfulClient()
    const currentEntry = await contentfulClient.entry.get(params)

    const entryProps: EntryProps = {
      fields: args.fields,
      sys: currentEntry.sys,
    }

    const entry = await contentfulClient.entry.update(params, entryProps)
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    }
  },

  deleteEntry: async (args: { spaceId: string; environmentId: string; entryId: string }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const params = {
      spaceId,
      environmentId,
      entryId: args.entryId,
    }

    const contentfulClient = await getContentfulClient()
    await contentfulClient.entry.delete(params)
    return {
      content: [{ type: "text", text: `Entry ${args.entryId} deleted successfully` }],
    }
  },

  publishEntry: async (args: { 
    spaceId: string; 
    environmentId: string; 
    entryId: string | string[] 
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId
    
    // Handle case where entryId is a JSON string representation of an array
    let entryId = args.entryId
    if (typeof entryId === 'string' && entryId.startsWith('[') && entryId.endsWith(']')) {
      try {
        entryId = JSON.parse(entryId)
      } catch (e) {
        // If parsing fails, keep it as string
        console.error('Failed to parse entryId as JSON array:', e)
      }
    }
    
    // If entryId is an array, handle bulk publishing
    if (Array.isArray(entryId)) {
      // Get the bulkActionHandlers if they exist
      try {
        const { bulkActionHandlers } = await import("./bulk-action-handlers.js")
        
        // Map entry IDs to the expected format for bulkPublish
        const entities = entryId.map(id => ({
          sys: { id, type: "Entry" as const }
        }))
        
        return bulkActionHandlers.bulkPublish({
          spaceId,
          environmentId,
          entities
        })
      } catch (error) {
        // Fall back to our own implementation if the import fails
        console.warn("Failed to import bulk-action-handlers.js, using fallback implementation:", error)
        
        // Map entry IDs to the expected format for bulk publishing
        const entities = entryId.map(id => ({
          sys: { id, type: "Entry" as const }
        }))
        
        const contentfulClient = await getContentfulClient()
        
        // Get the current version of each entity
        const entityVersions = await Promise.all(
          entities.map(async (entity) => {
            try {
              // Get the current version of the entry
              const currentEntry = await contentfulClient.entry.get({
                spaceId,
                environmentId,
                entryId: entity.sys.id
              })
              
              // Create a versioned link
              return {
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: entity.sys.id,
                  version: currentEntry.sys.version
                }
              }
            } catch (error) {
              console.error(`Error fetching entry ${entity.sys.id}: ${error}`)
              throw new Error(`Failed to get version for entry ${entity.sys.id}. All entries must have a version.`)
            }
          })
        )
        
        // Create the collection object
        const entitiesCollection = {
          sys: {
            type: "Array"
          },
          items: entityVersions
        }
        
        // Create the bulk action
        const bulkAction = await contentfulClient.bulkAction.publish(
          {
            spaceId,
            environmentId,
          },
          {
            entities: entitiesCollection,
          }
        )
        
        // Wait for the bulk action to complete
        let action = await contentfulClient.bulkAction.get({
          spaceId,
          environmentId,
          bulkActionId: bulkAction.sys.id,
        })
        
        while (action.sys.status === "inProgress" || action.sys.status === "created") {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          action = await contentfulClient.bulkAction.get({
            spaceId,
            environmentId,
            bulkActionId: bulkAction.sys.id,
          })
        }
        
        return {
          content: [
            {
              type: "text",
              text: `Bulk publish completed with status: ${action.sys.status}. ${
                action.sys.status === "failed"
                  ? `Error: ${JSON.stringify(action.error)}`
                  : `Successfully processed ${action.succeeded?.length || 0} items.`
              }`,
            },
          ],
        }
      }
    }
    
    // Handle single entry publishing
    const params = {
      spaceId,
      environmentId,
      entryId: entryId as string,
    }

    const contentfulClient = await getContentfulClient()
    const currentEntry = await contentfulClient.entry.get(params)

    const entry = await contentfulClient.entry.publish(params, {
      sys: currentEntry.sys,
      fields: currentEntry.fields,
    })
    
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    }
  },

  unpublishEntry: async (args: { 
    spaceId: string; 
    environmentId: string; 
    entryId: string | string[] 
  }) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    // Handle case where entryId is a JSON string representation of an array
    let entryId = args.entryId
    if (typeof entryId === 'string' && entryId.startsWith('[') && entryId.endsWith(']')) {
      try {
        entryId = JSON.parse(entryId)
      } catch (e) {
        // If parsing fails, keep it as string
        console.error('Failed to parse entryId as JSON array:', e)
      }
    }
    
    // If entryId is an array, handle bulk unpublishing
    if (Array.isArray(entryId)) {
      // Get the bulkActionHandlers if they exist
      try {
        const { bulkActionHandlers } = await import("./bulk-action-handlers.js")
        
        // Map entry IDs to the expected format for bulkUnpublish
        const entities = entryId.map(id => ({
          sys: { id, type: "Entry" as const }
        }))
        
        return bulkActionHandlers.bulkUnpublish({
          spaceId,
          environmentId,
          entities
        })
      } catch (error) {
        // Fall back to our own implementation if the import fails
        console.warn("Failed to import bulk-action-handlers.js, using fallback implementation:", error)
        
        // Map entry IDs to the expected format for bulk unpublishing
        const entities = entryId.map(id => ({
          sys: { id, type: "Entry" as const }
        }))
        
        const contentfulClient = await getContentfulClient()
        
        // Get the current version of each entity
        const entityVersions = await Promise.all(
          entities.map(async (entity) => {
            try {
              // Get the current version of the entry
              const currentEntry = await contentfulClient.entry.get({
                spaceId,
                environmentId,
                entryId: entity.sys.id
              })
              
              // Create a versioned link
              return {
                sys: {
                  type: "Link",
                  linkType: "Entry",
                  id: entity.sys.id,
                  version: currentEntry.sys.version
                }
              }
            } catch (error) {
              console.error(`Error fetching entry ${entity.sys.id}: ${error}`)
              throw new Error(`Failed to get version for entry ${entity.sys.id}. All entries must have a version.`)
            }
          })
        )
        
        // Create the collection object
        const entitiesCollection = {
          sys: {
            type: "Array"
          },
          items: entityVersions
        }
        
        // Create the bulk action
        const bulkAction = await contentfulClient.bulkAction.unpublish(
          {
            spaceId,
            environmentId,
          },
          {
            entities: entitiesCollection,
          }
        )
        
        // Wait for the bulk action to complete
        let action = await contentfulClient.bulkAction.get({
          spaceId,
          environmentId,
          bulkActionId: bulkAction.sys.id,
        })
        
        while (action.sys.status === "inProgress" || action.sys.status === "created") {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          action = await contentfulClient.bulkAction.get({
            spaceId,
            environmentId,
            bulkActionId: bulkAction.sys.id,
          })
        }
        
        return {
          content: [
            {
              type: "text",
              text: `Bulk unpublish completed with status: ${action.sys.status}. ${
                action.sys.status === "failed"
                  ? `Error: ${JSON.stringify(action.error)}`
                  : `Successfully processed ${action.succeeded?.length || 0} items.`
              }`,
            },
          ],
        }
      }
    }
    
    // Handle single entry unpublishing
    const params = {
      spaceId,
      environmentId,
      entryId: entryId as string,
    }

    const contentfulClient = await getContentfulClient()
    const currentEntry = await contentfulClient.entry.get(params)

    // Add version to params for unpublish
    const entry = await contentfulClient.entry.unpublish({
      ...params,
      version: currentEntry.sys.version,
    })

    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }],
    }
  },
}
