import { contentfulClient } from "../config/client.js";
import { HandlerArgs } from "../types/tools.js";
import { getSpaceAndEnvironment } from "../utils/space-environment.js";

export const spaceHandlers = {
  listSpaces: async () => {
    const spaces = await contentfulClient.space.getMany();
    return {
      content: [{ type: "text", text: JSON.stringify(spaces, null, 2) }],
    };
  },

  getSpace: async (args: HandlerArgs) => {
    const space = await contentfulClient.space.get({
      spaceId: args.spaceId,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(space, null, 2) }],
    };
  },

  listEnvironments: async (args: HandlerArgs) => {
    const params = getSpaceAndEnvironment(args);
    const environments = await contentfulClient.environment.getMany(params);
    return {
      content: [{ type: "text", text: JSON.stringify(environments, null, 2) }],
    };
  },

  createEnvironment: async (args: HandlerArgs & { name: string; environmentId: string }) => {
    const params = getSpaceAndEnvironment(args);

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

  deleteEnvironment: async (args: HandlerArgs & { environmentId: string }) => {
    const params = getSpaceAndEnvironment(args);
    await contentfulClient.environment.delete(params);
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
