import { contentfulClient } from "../config/client.js";

export const spaceHandlers = {
  listSpaces: async () => {
    const spaces = await contentfulClient.space.getMany({});
    return {
      content: spaces
    };
  },

  getSpace: async (args: any) => {
    const space = await contentfulClient.space.get({
      spaceId: args.spaceId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(space, null, 2) }],
    };
  },

  listEnvironments: async (args: any) => {
    const environments = await contentfulClient.environment.getMany({
      spaceId: args.spaceId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(environments, null, 2) }],
    };
  },

  createEnvironment: async (args: any) => {
    const params = {
      spaceId: args.spaceId,
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
    await contentfulClient.environment.delete({
      spaceId: args.spaceId,
      environmentId: args.environmentId,
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
