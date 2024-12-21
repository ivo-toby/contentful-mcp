import { contentfulClient } from "../config/client.js";
import { ensureSpaceAndEnvironment } from "../utils/ensure-space-env-id.js";

export const spaceHandlers = {
  listSpaces: async () => {
    const spaces = await contentfulClient.space.getMany({});
    return spaces;
  },

  getSpace: async (args: any) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const space = await contentfulClient.space.get({
      spaceId: resolvedArgs.spaceId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(space, null, 2) }],
    };
  },

  listEnvironments: async (args: any) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const environments = await contentfulClient.environment.getMany({
      spaceId: resolvedArgs.spaceId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(environments, null, 2) }],
    };
  },

  createEnvironment: async (args: any) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    const params = {
      spaceId: resolvedArgs.spaceId,
    };

    const environmentProps = {
      name: args.name,
    };

    const environment = await contentfulClient.environment.create(
      params,
      args.environmentId,
      environmentProps,
    );
    return {
      content: [{ type: "text", text: JSON.stringify(environment, null, 2) }],
    };
  },

  deleteEnvironment: async (args: any) => {
    const resolvedArgs = await ensureSpaceAndEnvironment(args);
    await contentfulClient.environment.delete({
      spaceId: resolvedArgs.spaceId,
      environmentId: resolvedArgs.environmentId,
    });
    return {
      content: [
        {
          type: "text",
          text: `Environment ${args.environmentId} deleted successfully`,
        },
      ],
    };
  },
};
