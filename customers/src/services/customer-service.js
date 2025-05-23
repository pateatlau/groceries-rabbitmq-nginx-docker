const { CustomerRepository } = require('../database');
const {
  FormatData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require('../utils');
const { APIError } = require('../utils/app-errors');

// All Business logic will be here
class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingCustomer = await this.repository.FindCustomer({ email });

      if (existingCustomer) {
        const validPassword = await ValidatePassword(
          password,
          existingCustomer.password,
          existingCustomer.salt
        );

        if (validPassword) {
          const token = await GenerateSignature({
            email: existingCustomer.email,
            _id: existingCustomer._id,
          });

          return FormatData({ id: existingCustomer._id, token });
        }
      }

      return FormatData(null);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs;

    try {
      // create salt
      let salt = await GenerateSalt();
      let userPassword = await GeneratePassword(password, salt);
      const existingCustomer = await this.repository.CreateCustomer({
        email,
        password: userPassword,
        phone,
        salt,
      });
      const token = await GenerateSignature({
        email: email,
        _id: existingCustomer._id,
      });

      return FormatData({
        id: existingCustomer._id,
        token,
        email,
        password: userPassword,
        phone,
        salt,
      });
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    try {
      const addressResult = await this.repository.CreateAddress({
        _id,
        street,
        postalCode,
        city,
        country,
      });

      return FormatData(addressResult);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async GetAllCustomers() {
    try {
      const customers = await this.repository.GetAllCustomers();

      return FormatData(customers);
    } catch (err) {
      throw new APIError('Customers Data Not found', err);
    }
  }

  async GetProfile(id) {
    try {
      const existingCustomer = await this.repository.FindCustomerById({ id });

      return FormatData(existingCustomer);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async GetShopingDetails(id) {
    try {
      const existingCustomer = await this.repository.FindCustomerById({ id });

      if (existingCustomer) {
        return FormatData(existingCustomer);
      }

      return FormatData({ msg: 'Error' });
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async GetWishList(customerId) {
    try {
      const wishListItems = await this.repository.Wishlist(customerId);

      return FormatData(wishListItems);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async AddToWishlist(customerId, product) {
    try {
      const wishlistResult = await this.repository.AddWishlistItem(
        customerId,
        product
      );

      return FormatData(wishlistResult);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async ManageCart(customerId, product, qty, isRemove) {
    try {
      const cartResult = await this.repository.AddCartItem(
        customerId,
        product,
        qty,
        isRemove
      );

      return FormatData(cartResult);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async ManageOrder(customerId, order) {
    try {
      const orderResult = await this.repository.AddOrderToProfile(
        customerId,
        order
      );

      return FormatData(orderResult);
    } catch (err) {
      throw new APIError('Data Not found', err);
    }
  }

  async SubscribeEvents(payload) {
    // payload = JSON.parse(payload);
    const { event, data } = payload;
    const { userId, order, qty } = data;

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
      case 'ADD_TO_WISHLIST':
      case 'REMOVE_FROM_WISHLIST':
        this.AddToWishlist(userId, product);
        break;
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true);
        break;
      case 'CREATE_ORDER':
        this.ManageOrder(userId, order);
        break;
      case 'TEST':
        console.log(`TEST event received: event = ${event}, data =`, data);
        break;
      default:
        break;
    }
  }
}

module.exports = CustomerService;
