import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { server } from "../msw-setup"

// Mock these modules at the top level
vi.mock("@contentful/node-apps-toolkit", () => ({
  getManagementToken: vi.fn(),
}))
vi.mock("contentful-management", () => ({
  createClient: vi.fn(),
}))

describe("getContentfulClient", () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("uses CONTENTFUL_MANAGEMENT_ACCESS_TOKEN if available", async () => {
    process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = "test-token"
    process.env.CONTENTFUL_HOST = "api.contentful.com"

    const mockCreateClient = vi.fn()
    const { createClient } = await import("contentful-management")
    vi.mocked(createClient).mockImplementation(mockCreateClient)

    const { getContentfulClient } = await import("../../src/config/client")
    await getContentfulClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      {
        accessToken: "test-token",
        host: "api.contentful.com",
      },
      { type: "plain" },
    )
  })

  it("gets a token using PRIVATE_KEY and APP_ID if MANAGEMENT_ACCESS_TOKEN not available", async () => {
    delete process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    process.env.PRIVATE_KEY = "test-private-key"
    process.env.APP_ID = "test-app-id"
    process.env.SPACE_ID = "test-space-id"
    process.env.ENVIRONMENT_ID = "test-environment-id"
    process.env.CONTENTFUL_HOST = "api.contentful.com"

    const { getManagementToken } = await import("@contentful/node-apps-toolkit")
    const { createClient } = await import("contentful-management")

    vi.mocked(getManagementToken).mockResolvedValue("generated-token")
    const mockCreateClient = vi.fn()
    vi.mocked(createClient).mockImplementation(mockCreateClient)

    const { getContentfulClient } = await import("../../src/config/client")
    await getContentfulClient()

    expect(getManagementToken).toHaveBeenCalledWith(
      "-----BEGIN RSA PRIVATE KEY-----\ntest-private-key\n-----END RSA PRIVATE KEY-----",
      {
        appInstallationId: "test-app-id",
        spaceId: "test-space-id",
        environmentId: "test-environment-id",
        host: "https://api.contentful.com",
      },
    )

    expect(mockCreateClient).toHaveBeenCalledWith(
      {
        accessToken: "generated-token",
        host: "api.contentful.com",
      },
      { type: "plain" },
    )
  })
  it("throws if neither CONTENTFUL_MANAGEMENT_ACCESS_TOKEN nor PRIVATE_KEY is available", async () => {
    delete process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    delete process.env.PRIVATE_KEY

    vi.resetModules()

    const { getContentfulClient } = await import("../../src/config/client")

    await expect(() => getContentfulClient()).rejects.toThrow(
      "No Contentful management token or private key found...",
    )
  })
})
