import { describe, it, expect, vi } from 'vitest';
import { handleToolRequest } from "../../src/middleware/handle-tool-request.js";

vi.mock("../../src/utils/ensure-space-env-id.js", () => ({
  ensureSpaceAndEnvironment: async (args: Record<string, unknown>) => ({
    ...args,
    spaceId: "resolved-space-id",
    environmentId: "resolved-env-id",
  })
}));

describe("handleToolRequest", () => {

  it("should resolve space for tools requiring space resolution", async () => {
    const args = { spaceName: "test-space" };
    const result = await handleToolRequest("list_content_types", args);
    
    expect(result).to.deep.equal({
      spaceName: "test-space",
      spaceId: "resolved-space-id",
      environmentId: "resolved-env-id",
      skipEnvironmentValidation: true
    });
  });

  it("should not modify args for tools not requiring space resolution", async () => {
    const args = { someArg: "value" };
    const result = await handleToolRequest("list_spaces", args);
    
    expect(result).to.deep.equal(args);
  });
});
