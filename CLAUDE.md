# Contentful MCP - Development Guide

## Common Commands
- Build: `npm run build`
- Type Check: `npm run typecheck`
- Lint: `npm run lint`
- Run Tests: `npm test`
- Run Single Test: `npx vitest run test/path/to/test.test.ts`
- Run Tests in Watch Mode: `npm run test:watch`
- Dev Mode (watch & rebuild): `npm run dev`

## Code Style Guidelines
- **Formatting**: Uses Prettier with 100 char width, no semicolons, double quotes
- **TypeScript**: Use strict typing, avoid `any` when possible
- **Imports**: Order from external to internal, group related imports
- **Naming**: Use camelCase for variables/functions, PascalCase for types/interfaces
- **Error Handling**: Always handle errors in async functions with try/catch blocks
- **Documentation**: Add JSDoc style comments for functions and interfaces

## Entity Structure
- Tools and handlers are organized by entity type (Entry, Asset, Content Type, etc.)
- Each handler should focus on a single responsibility
- Bulk actions should use the Contentful API's bulk operation endpoints

## Testing
Tests use Vitest with MSW for API mocking. Organize tests in:
- `test/unit/` - Unit tests for utility functions
- `test/integration/` - Tests that verify handler behavior