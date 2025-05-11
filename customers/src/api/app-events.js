const CustomerService = require('../services/customer-service');

module.exports = (app) => {
  const service = new CustomerService();

  app.use('/app-events', async (req, res) => {
    const { payload } = req.body;

    service.SubscribeEvents(payload);

    console.log(
      '========== Customer Service received event ==========',
      payload
    );
    return res.status(200).json(payload);
  });
};
