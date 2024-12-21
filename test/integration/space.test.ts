import { expect } from "../setup.js";
import { spaceHandlers } from "../../src/handlers/space-handlers.js";

describe("Space Handlers Integration Tests", () => {
  // Store spaceId for use in other tests
  let testSpaceId: string;

  describe("listSpaces", () => {
    it("should list all available spaces", async () => {
      const result = await spaceHandlers.listSpaces();
      expect(result).to.have.property("content");
      expect(result.content).to.have.property("items");
      expect(Array.isArray(result.content.items)).to.be.true;
      
      // Store the first space ID for subsequent tests
      if (result.content.items.length > 0) {
        testSpaceId = result.content.items[0].sys.id;
      }
    });
  });

  describe("getSpace", () => {
    it("should get details of a specific space", async () => {
      // Skip if no test space is available
      if (!testSpaceId) {
        return;
      }

      const result = await spaceHandlers.getSpace({ spaceId: testSpaceId });
      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("type", "text");
      
      const spaceDetails = JSON.parse(result.content[0].text);
      expect(spaceDetails).to.have.property("sys");
      expect(spaceDetails.sys).to.have.property("id", testSpaceId);
    });

    it("should throw error for invalid space ID", async () => {
      try {
        await spaceHandlers.getSpace({ spaceId: "invalid-space-id" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("listEnvironments", () => {
    it("should list environments for a space", async () => {
      // Skip if no test space is available
      if (!testSpaceId) {
        return;
      }

      const result = await spaceHandlers.listEnvironments({ spaceId: testSpaceId });
      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("type", "text");
      
      const environments = JSON.parse(result.content[0].text);
      expect(environments).to.have.property("items");
      expect(Array.isArray(environments.items)).to.be.true;
      
      // Verify master environment exists
      const masterEnv = environments.items.find((env: any) => env.sys.id === "master");
      expect(masterEnv).to.exist;
    });

    it("should throw error for invalid space ID", async () => {
      try {
        await spaceHandlers.listEnvironments({ spaceId: "invalid-space-id" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });
});
