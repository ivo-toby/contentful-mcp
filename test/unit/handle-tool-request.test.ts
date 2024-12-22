import { expect } from "chai";
import { handleToolRequest } from "../../src/middleware/handle-tool-request";
import * as spaceEnvUtils from "../../src/utils/ensure-space-env-id";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";

describe("handleToolRequest", () => {
  let ensureSpaceAndEnvironmentStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub the ensureSpaceAndEnvironment function
    ensureSpaceAndEnvironmentStub = sinon.stub(spaceEnvUtils, "ensureSpaceAndEnvironment");
    ensureSpaceAndEnvironmentStub.callsFake(async (args: Record<string, unknown>) => ({
      ...args,
      spaceId: "resolved-space-id",
      environmentId: "resolved-env-id"
    }));
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  it("should call ensureSpaceAndEnvironment for tools requiring space resolution", async () => {
    const args = { spaceName: "test-space" };
    await handleToolRequest("list_content_types", args);
    
    expect(ensureSpaceAndEnvironmentStub.calledOnce).to.be.true;
    expect(ensureSpaceAndEnvironmentStub.calledWith(args)).to.be.true;
  });

  it("should not call ensureSpaceAndEnvironment for tools not requiring space resolution", async () => {
    const args = { someArg: "value" };
    await handleToolRequest("list_spaces", args);
    
    expect(ensureSpaceAndEnvironmentStub.called).to.be.false;
  });

  it("should return resolved arguments for tools requiring space resolution", async () => {
    const args = { spaceName: "test-space" };
    const result = await handleToolRequest("create_entry", args);
    
    expect(result).to.deep.equal({
      spaceName: "test-space",
      spaceId: "resolved-space-id",
      environmentId: "resolved-env-id"
    });
  });

  it("should return original arguments for tools not requiring space resolution", async () => {
    const args = { someArg: "value" };
    const result = await handleToolRequest("list_spaces", args);
    
    expect(result).to.deep.equal(args);
  });
});
