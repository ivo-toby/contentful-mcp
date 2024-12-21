import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define handlers
export const handlers = [
  // List spaces
  http.get('https://api.contentful.com/spaces', () => {
    return HttpResponse.json({
      items: [
        {
          sys: { id: 'test-space-id' },
          name: 'Test Space'
        }
      ]
    });
  }),

  // Get specific space
  http.get('https://api.contentful.com/spaces/:spaceId', ({ params }) => {
    const { spaceId } = params;
    if (spaceId === 'test-space-id') {
      return HttpResponse.json({
        sys: { id: 'test-space-id' },
        name: 'Test Space'
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // List environments
  http.get('https://api.contentful.com/spaces/:spaceId/environments', ({ params }) => {
    const { spaceId } = params;
    if (spaceId === 'test-space-id') {
      return HttpResponse.json({
        items: [
          {
            sys: { id: 'master' },
            name: 'master'
          }
        ]
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Create environment
  http.post('https://api.contentful.com/spaces/:spaceId/environments', async ({ params, request }) => {
    const { spaceId } = params;
    if (spaceId === 'test-space-id') {
      const envId = await request.text();
      return HttpResponse.json({
        sys: { id: envId },
        name: envId
      });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Delete environment
  http.delete('https://api.contentful.com/spaces/:spaceId/environments/:envId', ({ params }) => {
    const { spaceId, envId } = params;
    if (spaceId === 'test-space-id' && envId !== 'non-existent-env') {
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  })
];

// Setup MSW Server
export const server = setupServer(...handlers);
