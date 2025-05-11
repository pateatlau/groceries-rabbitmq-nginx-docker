const ShoppingService = require('../services/shopping-service');

module.exports = (app) => {
  const service = new ShoppingService();

  app.use('/app-events', async (req, res) => {
    const { payload } = req.body;

    service.SubscribeEvents(payload);
    console.log('========== Shopping Service received event ==========');

    return res.status(200).json(payload);
  });
};
