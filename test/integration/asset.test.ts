import { expect } from "../setup.js";
import { assetHandlers } from "../../src/handlers/asset-handlers.js";
import { server } from "../msw-setup.js";

describe("Asset Handlers Integration Tests", () => {
  // Start MSW Server before tests
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const testSpaceId = "test-space-id";
  const testAssetId = "test-asset-id";

  describe("uploadAsset", () => {
    it("should upload a new asset", async () => {
      const result = await assetHandlers.uploadAsset({
        spaceId: testSpaceId,
        title: "Test Asset",
        description: "Test Description",
        file: {
          fileName: "test.jpg",
          contentType: "image/jpeg",
          upload: "https://example.com/test.jpg"
        }
      });

      expect(result).to.have.property("content");
      const asset = JSON.parse(result.content[0].text);
      expect(asset.fields.title["en-US"]).to.equal("Test Asset");
      expect(asset.fields.description["en-US"]).to.equal("Test Description");
    });

    it("should throw error for invalid space ID", async () => {
      try {
        await assetHandlers.uploadAsset({
          spaceId: "invalid-space-id",
          title: "Test Asset",
          file: {
            fileName: "test.jpg",
            contentType: "image/jpeg",
            upload: "https://example.com/test.jpg"
          }
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("getAsset", () => {
    it("should get details of a specific asset", async () => {
      const result = await assetHandlers.getAsset({
        spaceId: testSpaceId,
        assetId: testAssetId
      });

      expect(result).to.have.property("content");
      const asset = JSON.parse(result.content[0].text);
      expect(asset.sys.id).to.equal(testAssetId);
    });

    it("should throw error for invalid asset ID", async () => {
      try {
        await assetHandlers.getAsset({
          spaceId: testSpaceId,
          assetId: "invalid-asset-id"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("updateAsset", () => {
    it("should update an existing asset", async () => {
      const result = await assetHandlers.updateAsset({
        spaceId: testSpaceId,
        assetId: testAssetId,
        title: "Updated Asset",
        description: "Updated Description"
      });

      expect(result).to.have.property("content");
      const asset = JSON.parse(result.content[0].text);
      expect(asset.fields.title["en-US"]).to.equal("Updated Asset");
      expect(asset.fields.description["en-US"]).to.equal("Updated Description");
    });
  });

  describe("deleteAsset", () => {
    it("should delete an asset", async () => {
      const result = await assetHandlers.deleteAsset({
        spaceId: testSpaceId,
        assetId: testAssetId
      });

      expect(result).to.have.property("content");
      expect(result.content[0].text).to.include("deleted successfully");
    });
  });

  describe("publishAsset", () => {
    it("should publish an asset", async () => {
      const result = await assetHandlers.publishAsset({
        spaceId: testSpaceId,
        assetId: testAssetId
      });

      expect(result).to.have.property("content");
      const asset = JSON.parse(result.content[0].text);
      expect(asset.sys.publishedVersion).to.exist;
    });
  });

  describe("unpublishAsset", () => {
    it("should unpublish an asset", async () => {
      const result = await assetHandlers.unpublishAsset({
        spaceId: testSpaceId,
        assetId: testAssetId
      });

      expect(result).to.have.property("content");
      const asset = JSON.parse(result.content[0].text);
      expect(asset.sys.publishedVersion).to.not.exist;
    });
  });
});
