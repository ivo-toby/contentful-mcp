import { getManagementToken } from "@contentful/node-apps-toolkit"
import { createClient } from "contentful-management"

const {
  CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  CONTENTFUL_HOST = "api.contentful.com",
  PRIVATE_KEY,
  APP_ID,
  SPACE_ID,
  ENVIRONMENT_ID,
} = process.env

export const getContentfulClient = async () => {
  let formattedKey = ""
  if (!CONTENTFUL_MANAGEMENT_ACCESS_TOKEN && !PRIVATE_KEY) {
    throw new Error("No Contentful management token or private key found...")
  }
  if (PRIVATE_KEY) {
    const formatKey = (key: string) => {
      // Remove existing headers, spaces, and line breaks
      const cleanKey = key
        .replace("-----BEGIN RSA PRIVATE KEY-----", "")
        .replace("-----END RSA PRIVATE KEY-----", "")
        .replace(/\s/g, "")

      // Split into 64-character lines
      const chunks = cleanKey.match(/.{1,64}/g) || []

      // Reassemble with proper format
      return ["-----BEGIN RSA PRIVATE KEY-----", ...chunks, "-----END RSA PRIVATE KEY-----"].join(
        "\n",
      )
    }

    formattedKey = formatKey(PRIVATE_KEY!)
  }

  const accessToken =
    CONTENTFUL_MANAGEMENT_ACCESS_TOKEN ||
    (await getManagementToken(formattedKey!, {
      appInstallationId: APP_ID!,
      spaceId: SPACE_ID!,
      environmentId: ENVIRONMENT_ID!,
      host: "https://" + CONTENTFUL_HOST,
    }))

  return createClient(
    {
      accessToken,
      host: CONTENTFUL_HOST,
      headers: {
        "X-Contentful-user-agent": "contentful-community-mcp/1.0.0",
      },
    },
    { type: "plain" },
  )
}
