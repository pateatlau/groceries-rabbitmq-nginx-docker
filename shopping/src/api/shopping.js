const ShoppingService = require('../services/shopping-service');
const { PublishCustomerEvent } = require('../utils');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
  const service = new ShoppingService();

  app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello from Shopping service' });
  });

  app.post('/order', UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    try {
      const { data } = await service.PlaceOrder({ _id, txnNumber });
      const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');

      PublishCustomerEvent(payload);

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get('/orders', UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get('/cart', UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const { data } = await service.getCart({ _id });

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
