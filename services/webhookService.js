const axios = require('axios');
const crypto = require('crypto');

// Webhook service for sending payment notifications
class WebhookService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Send webhook notification
  async sendWebhook(webhookUrl, payload, secret = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'PaySSD-Webhook/1.0'
      };

      // Add signature if secret is provided
      if (secret) {
        const signature = this.generateSignature(payload, secret);
        headers['X-PaySSD-Signature'] = signature;
      }

      const response = await axios.post(webhookUrl, payload, {
        headers,
        timeout: 10000, // 10 seconds timeout
        validateStatus: (status) => status >= 200 && status < 300
      });

      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Webhook delivery failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // Send webhook with retry logic
  async sendWebhookWithRetry(webhookUrl, payload, secret = null, retryCount = 0) {
    const result = await this.sendWebhook(webhookUrl, payload, secret);
    
    if (!result.success && retryCount < this.maxRetries) {
      console.log(`Webhook retry ${retryCount + 1}/${this.maxRetries} for ${webhookUrl}`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
      
      return this.sendWebhookWithRetry(webhookUrl, payload, secret, retryCount + 1);
    }
    
    return result;
  }

  // Generate HMAC signature for webhook verification
  generateSignature(payload, secret) {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  // Verify webhook signature
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Format webhook payload for different events
  formatPaymentWebhook(transaction, event = 'payment.completed') {
    return {
      event,
      timestamp: new Date().toISOString(),
      data: {
        id: transaction._id,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        merchantId: transaction.merchantId,
        metadata: transaction.metadata,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    };
  }

  // Format payout webhook
  formatPayoutWebhook(payout, event = 'payout.completed') {
    return {
      event,
      timestamp: new Date().toISOString(),
      data: {
        id: payout._id,
        reference: payout.reference,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        paymentMethod: payout.paymentMethod,
        merchantId: payout.merchantId,
        recipientDetails: payout.recipientDetails,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt
      }
    };
  }
}

const webhookService = new WebhookService();

module.exports = {
  sendWebhook: (url, payload, secret) => webhookService.sendWebhookWithRetry(url, payload, secret),
  verifyWebhookSignature: (payload, signature, secret) => webhookService.verifySignature(payload, signature, secret),
  formatPaymentWebhook: (transaction, event) => webhookService.formatPaymentWebhook(transaction, event),
  formatPayoutWebhook: (payout, event) => webhookService.formatPayoutWebhook(payout, event)
};