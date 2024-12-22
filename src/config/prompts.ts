export const PROMPTS = {
  "get-asset-details": {
    name: "get-asset-details",
    description: "Retrieve detailed information about a specific asset in Contentful.",
    arguments: [
      {
        name: "assetId",
        description: "The ID of the asset to retrieve.",
        required: true
      }
    ]
  },
  "list-all-assets": {
    name: "list-all-assets",
    description: "List all assets available in a specified space.",
    arguments: [
      {
        name: "spaceId",
        description: "The ID of the space to list assets from.",
        required: true
      }
    ]
  },
  // Add more prompts as needed
};
