class AppController {
  static getHome() {
    return {
      success: true,
      message: 'API is online, welcome!',
      data: {
        name: 'paywave',
        purpose: 'Simplifying Small Business Payments',
        API: 'REST',
        version: '1.0.0',
        API_docs: 'update',
      },
    };
  }
}

export default AppController;
