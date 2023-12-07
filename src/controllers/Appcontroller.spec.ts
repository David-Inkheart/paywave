import AppController from './Appcontroller';

describe('AppController', () => {
  describe('getHome', () => {
    it('should return a welcome message', () => {
      const result = AppController.getHome();
      expect(result).toEqual({
        success: true,
        message: 'API is online, welcome!',
        data: {
          name: expect.any(String),
          purpose: expect.any(String),
          API: 'REST',
          version: expect.any(String),
          API_docs: expect.stringContaining('https:'),
        },
      });
    });
  });
});
