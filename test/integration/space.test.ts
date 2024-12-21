import { expect } from "../setup.js";
import { spaceHandlers } from "../../src/handlers/space-handlers.js";
import { server } from "../msw-setup.js";

describe("Space Handlers Integration Tests", () => {
  // Store spaceId for use in other tests
  let testSpaceId: string;

  // Start MSW Server before tests
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  describe("listSpaces", () => {
    it("should list all available spaces", async () => {
      const result = await spaceHandlers.listSpaces();
      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("type", "text");
      
      const spaces = JSON.parse(result.content[0].text);
      expect(spaces).to.have.property("items");
      expect(Array.isArray(spaces.items)).to.be.true;
      
      // Store the first space ID for subsequent tests
      if (spaces.items.length > 0) {
        testSpaceId = spaces.items[0].sys.id;
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

  describe("createEnvironment", () => {
    it("should create a new environment", async () => {
      // Skip if no test space is available
      if (!testSpaceId) {
        return;
      }

      const envName = `test-env-${Date.now()}`;
      const result = await spaceHandlers.createEnvironment({
        spaceId: testSpaceId,
        environmentId: envName,
        name: envName
      });

      expect(result).to.have.property('content');
      expect(result.content[0]).to.have.property('type', 'text');
      
      const environment = JSON.parse(result.content[0].text);
      expect(environment).to.have.property('sys');
      expect(environment.sys).to.have.property('id', envName);
      expect(environment).to.have.property('name', envName);

      // Store environment ID for deletion test
      return envName;
    });

    it("should throw error for invalid space ID", async () => {
      try {
        await spaceHandlers.createEnvironment({
          spaceId: "invalid-space-id",
          environmentId: "test-env",
          name: "Test Environment"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("deleteEnvironment", () => {
    it("should delete an environment", async () => {
      // Skip if no test space is available
      if (!testSpaceId) {
        return;
      }

      // Create a temporary environment
      const envName = `temp-env-${Date.now()}`;
      await spaceHandlers.createEnvironment({
        spaceId: testSpaceId,
        environmentId: envName,
        name: envName
      });

      // Delete the environment
      const result = await spaceHandlers.deleteEnvironment({
        spaceId: testSpaceId,
        environmentId: envName
      });

      expect(result).to.have.property('content');
      expect(result.content[0]).to.have.property('type', 'text');
      expect(result.content[0].text).to.include('deleted successfully');
    });

    it("should throw error for invalid environment ID", async () => {
      if (!testSpaceId) {
        return;
      }

      try {
        await spaceHandlers.deleteEnvironment({
          spaceId: testSpaceId,
          environmentId: "non-existent-env"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("space name resolution", () => {
    it("should resolve space name to space ID", async () => {
      const result = await spaceHandlers.getSpace({ spaceName: "Test Space" });
      expect(result).to.have.property('content');
      expect(result.content[0]).to.have.property('type', 'text');
      
      const spaceDetails = JSON.parse(result.content[0].text);
      expect(spaceDetails).to.have.property('sys');
      expect(spaceDetails.sys).to.have.property('id', 'test-space-id');
    });

    it("should throw error for non-existent space name", async () => {
      try {
        await spaceHandlers.getSpace({ spaceName: "Non Existent Space" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).to.exist;
        expect(error.message).to.include('not found');
      }
    });
  });
});
