const { ShoppingRepository } = require('../database');
const { FormatData } = require('../utils');

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async getCart({ _id }) {
    try {
      const cartItems = await this.repository.Cart(_id);

      return FormatData(cartItems);
    } catch (err) {
      throw err;
    }
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    // Verify the txn number with payment logs

    try {
      const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);

      return FormatData(orderResult);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId);

      return FormatData(orders);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async ManageCart(customerId, item, qty, isRemove) {
    console.log('ManageCart: item = ', item);
    try {
      const cartResult = await this.repository.AddCartItem(
        customerId,
        item,
        qty,
        isRemove
      );

      return FormatData(cartResult);
    } catch (err) {
      throw err;
    }
  }

  async SubscribeEvents(payload) {
    const { event, data } = payload;
    const { userId, qty } = data;

    // TODO: Somehow product is not coming in payload data
    let { product } = data;
    if (!product) {
      product = {
        _id: '681ce26620e2cba031dc5b5b',
        name: 'Apples',
        desc: 'great Quality of Apple',
        banner: 'http://codergogoi.com/youtube/images/apples.jpeg',
        type: 'fruits',
        unit: 1,
        price: 140,
        available: true,
        supplier: 'Golden Seed Farming',
      };
    }

    switch (event) {
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true);
        break;
      default:
        break;
    }
  }

  async GetOrderPayload(userId, order, event) {
    if (order) {
      const payload = {
        event,
        data: { userId, order },
      };

      return payload;
    } else {
      return FormatData({ error: 'Order not found' });
    }
  }
}

module.exports = ShoppingService;
