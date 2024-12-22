import { describe, it, expect, vi } from 'vitest';
import { ensureSpaceAndEnvironment } from "../../src/utils/ensure-space-env-id.js";
import { client } from "../../src/config/client.js";

// Mock the Contentful client
vi.mock("../../src/config/client.js", () => ({
  client: {
    getSpaces: vi.fn(),
    getSpace: vi.fn(),
    getEnvironment: vi.fn(),
  }
}));

describe("ensureSpaceAndEnvironment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return existing spaceId and environmentId if provided", async () => {
    const args = {
      spaceId: "existing-space",
      environmentId: "master"
    };

    const result = await ensureSpaceAndEnvironment(args);
    expect(result).to.deep.equal(args);
    expect(client.getSpaces).not.toHaveBeenCalled();
  });

  it("should resolve spaceName to spaceId", async () => {
    const mockSpace = {
      sys: { id: "resolved-space-id" },
      name: "Test Space"
    };

    client.getSpaces.mockResolvedValue({
      items: [mockSpace]
    });

    const result = await ensureSpaceAndEnvironment({
      spaceName: "Test Space"
    });

    expect(result).to.deep.equal({
      spaceName: "Test Space",
      spaceId: "resolved-space-id",
      environmentId: "master"
    });
    expect(client.getSpaces).toHaveBeenCalledOnce();
  });

  it("should throw error if space not found", async () => {
    client.getSpaces.mockResolvedValue({
      items: []
    });

    await expect(ensureSpaceAndEnvironment({
      spaceName: "Non-existent Space"
    })).rejects.toThrow("Space 'Non-existent Space' not found");
  });

  it("should use default environment if not specified", async () => {
    const args = {
      spaceId: "test-space"
    };

    const result = await ensureSpaceAndEnvironment(args);
    expect(result).to.deep.equal({
      ...args,
      environmentId: "master"
    });
  });

  it("should validate environment exists", async () => {
    const mockEnv = {
      sys: { id: "staging" }
    };

    client.getSpace.mockResolvedValue({
      getEnvironment: vi.fn().mockResolvedValue(mockEnv)
    });

    const result = await ensureSpaceAndEnvironment({
      spaceId: "test-space",
      environmentId: "staging"
    });

    expect(result).to.deep.equal({
      spaceId: "test-space",
      environmentId: "staging"
    });
  });

  it("should throw error if environment not found", async () => {
    client.getSpace.mockResolvedValue({
      getEnvironment: vi.fn().mockRejectedValue(new Error("Environment not found"))
    });

    await expect(ensureSpaceAndEnvironment({
      spaceId: "test-space",
      environmentId: "non-existent"
    })).rejects.toThrow("Environment not found");
  });
});
