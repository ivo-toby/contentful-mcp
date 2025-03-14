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
          items: args.entities,
        },
      }
    )
    
    // Wait for the bulk action to complete
    let action = await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id
    })
    
    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id
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
          }`
        }
      ],
    }
  },
  
  bulkUnpublish: async (args: BulkUnpublishParams) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const contentfulClient = await getContentfulClient()
    
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
          items: args.entities,
        },
      }
    )
    
    // Wait for the bulk action to complete
    let action = await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id
    })
    
    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id
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
          }`
        }
      ],
    }
  },
  
  bulkValidate: async (args: BulkValidateParams) => {
    const spaceId = process.env.SPACE_ID || args.spaceId
    const environmentId = process.env.ENVIRONMENT_ID || args.environmentId

    const contentfulClient = await getContentfulClient()
    
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
          items: args.entryIds.map(id => ({
            sys: {
              type: "Link",
              linkType: "Entry",
              id
            }
          })),
        },
      }
    )
    
    // Wait for the bulk action to complete
    let action = await contentfulClient.bulkAction.get({
      spaceId,
      environmentId,
      bulkActionId: bulkAction.sys.id
    })
    
    while (action.sys.status === "inProgress" || action.sys.status === "created") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await contentfulClient.bulkAction.get({
        spaceId,
        environmentId,
        bulkActionId: bulkAction.sys.id
      })
    }
    
    return {
      content: [
        { 
          type: "text", 
          text: `Bulk validation completed with status: ${action.sys.status}. ${
            action.sys.status === "failed" 
              ? `Error: ${JSON.stringify(action.error)}` 
              : `Successfully validated ${action.succeeded?.length || 0} entries.`
          }`
        }
      ],
    }
  }
}
