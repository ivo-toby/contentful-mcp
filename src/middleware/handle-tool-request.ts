import { ensureSpaceAndEnvironment } from "../utils/ensure-space-env-id.js";

// Middleware to ensure tool arguments are complete
export async function handleToolRequest(toolName: string, args: any) {
  const toolsRequiringSpaceResolution = [
    "create_content_type",
    "update_content_type",
    "delete_content_type",
    "list_content_types",
    "create_entry",
    "update_entry",
    "delete_entry",
    "list_entries",
    "get_entry",
    "upload_asset",
    "update_asset",
    "delete_asset",
    "list_assets",
  ];

  if (toolsRequiringSpaceResolution.includes(toolName)) {
    // Operations that should skip environment validation
    const skipValidation = [
      "create_environment", 
      "list_environments",
      "list_spaces",
      "get_space",
      "list_content_types",
      "get_content_type"
    ].includes(toolName);
    
    args = await ensureSpaceAndEnvironment({ 
      ...args, 
      skipEnvironmentValidation: skipValidation 
    });
  }
  return args;
}
