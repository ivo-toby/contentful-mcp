import { expect } from '../setup.ts';
import { spaceHandlers } from '../../src/handlers/space-handlers';

describe('Space Handlers Integration Tests', () => {
  describe('listSpaces', () => {
    it('should list all available spaces', async () => {
      const result = await spaceHandlers.listSpaces();
      
      expect(result).to.have.property('content');
      expect(result.content).to.have.property('items');
      expect(Array.isArray(result.content.items)).to.be.true;
    });
  });
});
