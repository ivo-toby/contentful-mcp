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
    // Skip environment validation for environment creation and listing
    const skipValidation = ["create_environment", "list_environments"].includes(toolName);
    args = await ensureSpaceAndEnvironment({ ...args, skipEnvironmentValidation: skipValidation });
  }
  return args;
}
