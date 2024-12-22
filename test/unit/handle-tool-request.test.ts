import { expect } from "chai";
import { handleToolRequest } from "../../src/middleware/handle-tool-request.js";
import { describe, it } from "mocha";

// Mock implementation of ensureSpaceAndEnvironment
const mockEnsureSpaceAndEnvironment = async (args: Record<string, unknown>) => ({
  ...args,
  spaceId: "resolved-space-id",
  environmentId: "resolved-env-id",
});

// Mock the module
vi.mock("../../src/utils/ensure-space-env-id.js", () => ({
  ensureSpaceAndEnvironment: mockEnsureSpaceAndEnvironment
}));

describe("handleToolRequest", () => {

  it("should resolve space for tools requiring space resolution", async () => {
    const args = { spaceName: "test-space" };
    const result = await handleToolRequest("list_content_types", args);
    
    expect(result).to.deep.equal({
      spaceName: "test-space",
      spaceId: "resolved-space-id",
      environmentId: "resolved-env-id"
    });
  });

  it("should not modify args for tools not requiring space resolution", async () => {
    const args = { someArg: "value" };
    const result = await handleToolRequest("list_spaces", args);
    
    expect(result).to.deep.equal(args);
  });
});
