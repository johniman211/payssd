const axios = require('axios');

const FLW_BASE_URL = process.env.FLW_BASE_URL || 'https://api.flutterwave.com';

class FlutterwaveService {
  constructor() {
    this.secretKey = process.env.FLW_SECRET_KEY;
    if (!this.secretKey) {
      throw new Error('FLW_SECRET_KEY not configured');
    }
    this.client = axios.create({
      baseURL: FLW_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createPayment({ tx_ref, amount, currency, redirect_url, customer, meta, customizations }) {
    const payload = {
      tx_ref,
      amount,
      currency,
      redirect_url,
      customer,
      meta,
      customizations,
    };
    const res = await this.client.post('/v3/payments', payload);
    return res.data;
  }

  async verifyTransaction(id) {
    const res = await this.client.get(`/v3/transactions/${id}/verify`);
    return res.data;
  }
}

let instance;
function getFlutterwaveService() {
  if (!instance) instance = new FlutterwaveService();
  return instance;
}

module.exports = {
  getFlutterwaveService,
};

