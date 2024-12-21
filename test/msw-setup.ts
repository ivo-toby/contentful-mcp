import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Define handlers
export const handlers = [
  rest.get('https://api.contentful.com/spaces', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            sys: { id: 'test-space-id' },
            name: 'Test Space'
          }
        ]
      })
    );
  })
];

// Setup MSW Server
export const server = setupServer(...handlers);
