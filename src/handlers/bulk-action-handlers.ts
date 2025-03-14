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
    const contentfulClient = await getContentfulClient()
    const space = await contentfulClient.space.get({ spaceId: args.spaceId })
    const environment = await space.getEnvironment(args.environmentId)
    
    const bulkAction = await environment.createPublishBulkAction({
      entities: {
        sys: {
          type: "Array",
        },
        items: args.entities,
      },
    })
    
    // Wait for the bulk action to complete
    let action = await bulkAction.get()
    while (action.sys.status === "inProgress") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await bulkAction.get()
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
    const contentfulClient = await getContentfulClient()
    const space = await contentfulClient.space.get({ spaceId: args.spaceId })
    const environment = await space.getEnvironment(args.environmentId)
    
    const bulkAction = await environment.createUnpublishBulkAction({
      entities: {
        sys: {
          type: "Array",
        },
        items: args.entities,
      },
    })
    
    // Wait for the bulk action to complete
    let action = await bulkAction.get()
    while (action.sys.status === "inProgress") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await bulkAction.get()
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
    const contentfulClient = await getContentfulClient()
    const space = await contentfulClient.space.get({ spaceId: args.spaceId })
    const environment = await space.getEnvironment(args.environmentId)
    
    const bulkAction = await environment.createValidateBulkAction({
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
    })
    
    // Wait for the bulk action to complete
    let action = await bulkAction.get()
    while (action.sys.status === "inProgress") {
      await new Promise(resolve => setTimeout(resolve, 1000))
      action = await bulkAction.get()
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
