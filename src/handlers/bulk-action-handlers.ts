import { getContentfulClient } from "../config/client.js"

type BulkPublishParams = {
  spaceId: string
  environmentId: string
  entities: Array<{
    sys: {
      id: string
      type: "Entry" | "Asset"
    }
  }>
}

// Define the correct types for bulk action responses
interface BulkActionResponse {
  sys: {
    id: string
    status: string
  }
  succeeded?: Array<{
    sys: {
      id: string
      type: string
    }
  }>
  error?: any
}

// Define the correct types for bulk action payloads
interface VersionedLink {
  sys: {
    type: "Link"
    linkType: "Entry" | "Asset"
    id: string
    version?: number
  }
}

type BulkUnpublishParams = BulkPublishParams

type BulkValidateParams = {
  spaceId: string
  environmentId: string
  entryIds: string[]
}

export const bulkActionHandlers = {
  bulkPublish: async (args: BulkPublishParams) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const contentfulClient = await getContentfulClient()

    // Get the current version of each entity
    const entityVersions: VersionedLink[] = await Promise.all(
      args.entities.map(async (entity) => {
        try {
          // Get the current version of the entity
          const currentEntity = entity.sys.type === "Entry" 
            ? await contentfulClient.entry.get({
                spaceId,
                environmentId,
                entryId: entity.sys.id
              })
            : await contentfulClient.asset.get({
                spaceId,
                environmentId,
                assetId: entity.sys.id
              });
          
          return {
            sys: {
              type: "Link",
              linkType: entity.sys.type,
              id: entity.sys.id,
              version: currentEntity.sys.version
            }
          };
        } catch (error) {
          console.error(`Error fetching entity ${entity.sys.id}: ${error}`);
          // Return without version if we can't get it
          return {
            sys: {
              type: "Link",
              linkType: entity.sys.type,
              id: entity.sys.id
            }
          };
        }
      })
    );

    // Create the bulk action
    const bulkAction = await contentfulClient.bulkAction.publish(
      {
        spaceId,
        environmentId,
      },
      {
        entities: {
          sys: {
            type: "Array",
          },
          items: entityVersions,
        },
      },
    )

    // Wait for the bulk action to complete
    let action = (await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id,
    })) as unknown as BulkActionResponse

    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      action = (await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id,
      })) as unknown as BulkActionResponse
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
  },

  bulkUnpublish: async (args: BulkUnpublishParams) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const contentfulClient = await getContentfulClient()

    // Get the current version of each entity
    const entityVersions: VersionedLink[] = await Promise.all(
      args.entities.map(async (entity) => {
        try {
          // Get the current version of the entity
          const currentEntity = entity.sys.type === "Entry" 
            ? await contentfulClient.entry.get({
                spaceId,
                environmentId,
                entryId: entity.sys.id
              })
            : await contentfulClient.asset.get({
                spaceId,
                environmentId,
                assetId: entity.sys.id
              });
          
          return {
            sys: {
              type: "Link",
              linkType: entity.sys.type,
              id: entity.sys.id,
              version: currentEntity.sys.version
            }
          };
        } catch (error) {
          console.error(`Error fetching entity ${entity.sys.id}: ${error}`);
          // Return without version if we can't get it
          return {
            sys: {
              type: "Link",
              linkType: entity.sys.type,
              id: entity.sys.id
            }
          };
        }
      })
    );

    // Create the bulk action
    const bulkAction = await contentfulClient.bulkAction.unpublish(
      {
        spaceId,
        environmentId,
      },
      {
        entities: {
          sys: {
            type: "Array",
          },
          items: entityVersions,
        },
      },
    )

    // Wait for the bulk action to complete
    let action = (await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id,
    })) as unknown as BulkActionResponse

    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      action = (await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id,
      })) as unknown as BulkActionResponse
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
  },

  bulkValidate: async (args: BulkValidateParams) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const contentfulClient = await getContentfulClient()

    // Get the current version of each entry
    const entityVersions: VersionedLink[] = await Promise.all(
      args.entryIds.map(async (id) => {
        try {
          // Get the current version of the entry
          const currentEntry = await contentfulClient.entry.get({
            spaceId,
            environmentId,
            entryId: id
          });
          
          return {
            sys: {
              type: "Link",
              linkType: "Entry",
              id,
              version: currentEntry.sys.version
            }
          };
        } catch (error) {
          console.error(`Error fetching entry ${id}: ${error}`);
          // Return without version if we can't get it
          return {
            sys: {
              type: "Link",
              linkType: "Entry",
              id
            }
          };
        }
      })
    );

    // Create the bulk action
    const bulkAction = await contentfulClient.bulkAction.validate(
      {
        spaceId,
        environmentId,
      },
      {
        entities: {
          sys: {
            type: "Array",
          },
          items: entityVersions,
        },
      },
    )

    // Wait for the bulk action to complete
    let action = (await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id,
    })) as unknown as BulkActionResponse

    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      action = (await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id,
      })) as unknown as BulkActionResponse
    }

    return {
      content: [
        {
          type: "text",
          text: `Bulk validation completed with status: ${action.sys.status}. ${
            action.sys.status === "failed"
              ? `Error: ${JSON.stringify(action.error)}`
              : `Successfully validated ${action.succeeded?.length || 0} entries.`
          }`,
        },
      ],
    }
  },
}
