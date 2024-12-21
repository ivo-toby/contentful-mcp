import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define handlers
export const handlers = [
  http.get('https://api.contentful.com/spaces', () => {
    return HttpResponse.json({
        items: [
          {
            sys: { id: 'test-space-id' },
            name: 'Test Space'
          }
        ]
    });
  })
];

// Setup MSW Server
export const server = setupServer(...handlers);
