const axios = require('axios');
const crypto = require('crypto');

// MTN Mobile Money API Service
class MTNMoMoService {
  constructor() {
    this.baseURL = process.env.MTN_API_BASE_URL;
    this.apiKey = process.env.MTN_API_KEY;
    this.apiSecret = process.env.MTN_API_SECRET;
    this.subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    this.targetEnvironment = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';
  }

  // Generate UUID for MTN API
  generateUUID() {
    return crypto.randomUUID();
  }

  // Get access token
  async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'X-Target-Environment': this.targetEnvironment
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('MTN get access token error:', error.response?.data || error.message);
      throw new Error('Failed to get MTN access token');
    }
  }

  // Request payment
  async requestPayment(transaction) {
    try {
      const accessToken = await this.getAccessToken();
      const referenceId = this.generateUUID();
      
      const paymentData = {
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        externalId: transaction.transactionId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: transaction.customer.phoneNumber.replace('+211', '211') // Remove + for MTN API
        },
        payerMessage: `Payment for ${transaction.description}`,
        payeeNote: `PaySSD transaction ${transaction.transactionId}`
      };

      const response = await axios.post(
        `${this.baseURL}/collection/v1_0/requesttopay`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        providerTransactionId: referenceId,
        requestId: referenceId,
        responseCode: response.status.toString(),
        responseMessage: 'Payment request initiated',
        instructions: {
          message: `Please check your phone ${transaction.customer.phoneNumber} for MTN Mobile Money payment prompt`,
          steps: [
            'You will receive an SMS notification',
            'Enter your MTN Mobile Money PIN when prompted',
            'Confirm the payment details',
            'Payment will be processed automatically'
          ]
        },
        rawResponse: response.data
      };

    } catch (error) {
      console.error('MTN request payment error:', error.response?.data || error.message);
      
      return {
        success: false,
        responseCode: error.response?.status?.toString() || '500',
        responseMessage: error.response?.data?.message || 'Payment request failed',
        rawResponse: error.response?.data || { error: error.message }
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(referenceId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );

      return {
        status: response.data.status,
        reason: response.data.reason,
        financialTransactionId: response.data.financialTransactionId
      };

    } catch (error) {
      console.error('MTN check payment status error:', error.response?.data || error.message);
      throw new Error('Failed to check payment status');
    }
  }
}

// Digicash API Service
class DigicashService {
  constructor() {
    this.baseURL = process.env.DIGICASH_API_BASE_URL;
    this.apiKey = process.env.DIGICASH_API_KEY;
    this.apiSecret = process.env.DIGICASH_API_SECRET;
    this.merchantId = process.env.DIGICASH_MERCHANT_ID;
  }

  // Generate signature for Digicash API
  generateSignature(data, timestamp) {
    const payload = JSON.stringify(data) + timestamp;
    return crypto.createHmac('sha256', this.apiSecret).update(payload).digest('hex');
  }

  // Request payment
  async requestPayment(transaction) {
    try {
      const timestamp = Date.now().toString();
      const safeReturnUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/payment/success` : 'http://localhost:3000/payment/success';
      const paymentData = {
        merchant_id: this.merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        reference: transaction.transactionId,
        description: transaction.description,
        customer: {
          name: transaction.customer.name,
          phone: transaction.customer.phoneNumber,
          email: transaction.customer.email
        },
        callback_url: `${process.env.APP_URL}/api/payments/webhook/digicash`,
        return_url: (transaction.redirectUrls && transaction.redirectUrls.success) || safeReturnUrl
      };

      const signature = this.generateSignature(paymentData, timestamp);

      const response = await axios.post(
        `${this.baseURL}/payments/initiate`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        providerTransactionId: response.data.transaction_id,
        requestId: response.data.payment_id,
        responseCode: response.status.toString(),
        responseMessage: 'Payment request initiated',
        instructions: {
          message: `Please dial *185# and follow the prompts to complete your Digicash payment`,
          steps: [
            'Dial *185# on your phone',
            'Select "Pay Merchant"',
            `Enter merchant code: ${response.data.merchant_code}`,
            `Enter amount: ${transaction.amount} ${transaction.currency}`,
            'Enter your Digicash PIN to confirm'
          ],
          paymentCode: response.data.payment_code,
          merchantCode: response.data.merchant_code
        },
        rawResponse: response.data
      };

    } catch (error) {
      console.error('Digicash request payment error:', error.response?.data || error.message);
      
      return {
        success: false,
        responseCode: error.response?.status?.toString() || '500',
        responseMessage: error.response?.data?.message || 'Payment request failed',
        rawResponse: error.response?.data || { error: error.message }
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId) {
    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature({ transaction_id: transactionId }, timestamp);
      
      const response = await axios.get(
        `${this.baseURL}/payments/status/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Timestamp': timestamp,
            'X-Signature': signature
          }
        }
      );

      return {
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        completedAt: response.data.completed_at
      };

    } catch (error) {
      console.error('Digicash check payment status error:', error.response?.data || error.message);
      throw new Error('Failed to check payment status');
    }
  }
}

// Mock services for development/testing
class MockMTNService {
  async requestPayment(transaction) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate random success/failure for testing
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        providerTransactionId: 'mtn_' + crypto.randomBytes(8).toString('hex'),
        requestId: crypto.randomUUID(),
        responseCode: '200',
        responseMessage: 'Payment request initiated successfully',
        instructions: {
          message: `Please check your phone ${transaction.customer.phoneNumber} for MTN Mobile Money payment prompt`,
          steps: [
            'You will receive an SMS notification',
            'Enter your MTN Mobile Money PIN when prompted',
            'Confirm the payment details',
            'Payment will be processed automatically'
          ]
        },
        rawResponse: {
          status: 'PENDING',
          message: 'Payment request sent to customer'
        }
      };
    } else {
      return {
        success: false,
        responseCode: '400',
        responseMessage: 'Insufficient balance or invalid phone number',
        rawResponse: {
          error: 'INSUFFICIENT_BALANCE',
          message: 'Customer has insufficient balance'
        }
      };
    }
  }

  async checkPaymentStatus(referenceId) {
    // Simulate random status for testing
    const statuses = ['PENDING', 'SUCCESSFUL', 'FAILED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status,
      reason: status === 'FAILED' ? 'INSUFFICIENT_BALANCE' : null,
      financialTransactionId: status === 'SUCCESSFUL' ? 'mtn_fin_' + crypto.randomBytes(8).toString('hex') : null
    };
  }
}

class MockDigicashService {
  async requestPayment(transaction) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate random success/failure for testing
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        providerTransactionId: 'dc_' + crypto.randomBytes(8).toString('hex'),
        requestId: 'dc_req_' + crypto.randomBytes(6).toString('hex'),
        responseCode: '200',
        responseMessage: 'Payment request initiated successfully',
        instructions: {
          message: `Please dial *185# and follow the prompts to complete your Digicash payment`,
          steps: [
            'Dial *185# on your phone',
            'Select "Pay Merchant"',
            'Enter merchant code: 12345',
            `Enter amount: ${transaction.amount} ${transaction.currency}`,
            'Enter your Digicash PIN to confirm'
          ],
          paymentCode: Math.floor(100000 + Math.random() * 900000).toString(),
          merchantCode: '12345'
        },
        rawResponse: {
          status: 'PENDING',
          payment_code: Math.floor(100000 + Math.random() * 900000).toString(),
          merchant_code: '12345'
        }
      };
    } else {
      return {
        success: false,
        responseCode: '400',
        responseMessage: 'Payment initiation failed',
        rawResponse: {
          error: 'INVALID_PHONE',
          message: 'Invalid phone number or account not found'
        }
      };
    }
  }

  async checkPaymentStatus(transactionId) {
    // Simulate random status for testing
    const statuses = ['PENDING', 'COMPLETED', 'FAILED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status,
      amount: status === 'COMPLETED' ? 100 : null,
      currency: 'SSP',
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
    };
  }
}

// Initialize services based on environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.MTN_API_KEY;

const mtnService = isDevelopment ? new MockMTNService() : new MTNMoMoService();
const digicashService = isDevelopment ? new MockDigicashService() : new DigicashService();

// Export functions
const processMTNPayment = async (transaction) => {
  try {
    return await mtnService.requestPayment(transaction);
  } catch (error) {
    console.error('MTN payment processing error:', error);
    return {
      success: false,
      responseCode: '500',
      responseMessage: 'Internal server error',
      rawResponse: { error: error.message }
    };
  }
};

const processDigicashPayment = async (transaction) => {
  try {
    return await digicashService.requestPayment(transaction);
  } catch (error) {
    console.error('Digicash payment processing error:', error);
    return {
      success: false,
      responseCode: '500',
      responseMessage: 'Internal server error',
      rawResponse: { error: error.message }
    };
  }
};

const checkMTNPaymentStatus = async (referenceId) => {
  return await mtnService.checkPaymentStatus(referenceId);
};

const checkDigicashPaymentStatus = async (transactionId) => {
  return await digicashService.checkPaymentStatus(transactionId);
};

// Background job to check pending payments
const checkPendingPayments = async () => {
  try {
    const Transaction = require('../models/Transaction');
    
    // Get pending transactions older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingTransactions = await Transaction.find({
      status: { $in: ['pending', 'processing'] },
      createdAt: { $lt: fiveMinutesAgo }
    }).limit(50);

    for (const transaction of pendingTransactions) {
      try {
        let statusResult;
        
        if (transaction.paymentMethod === 'mtn_momo' && transaction.providerResponse?.providerTransactionId) {
          statusResult = await checkMTNPaymentStatus(transaction.providerResponse.providerTransactionId);
          
          if (statusResult.status === 'SUCCESSFUL') {
            transaction.status = 'successful';
            transaction.completedAt = new Date();
            
            // Update merchant balance
            const User = require('../models/User');
            const merchantReceives = transaction.amount - transaction.fees.totalFees;
            await User.findByIdAndUpdate(transaction.merchant, {
              $inc: { 'balance.available': merchantReceives }
            });
            
          } else if (statusResult.status === 'FAILED') {
            transaction.status = 'failed';
          }
          
        } else if (transaction.paymentMethod === 'digicash' && transaction.providerResponse?.providerTransactionId) {
          statusResult = await checkDigicashPaymentStatus(transaction.providerResponse.providerTransactionId);
          
          if (statusResult.status === 'COMPLETED') {
            transaction.status = 'successful';
            transaction.completedAt = new Date();
            
            // Update merchant balance
            const User = require('../models/User');
            const merchantReceives = transaction.amount - transaction.fees.totalFees;
            await User.findByIdAndUpdate(transaction.merchant, {
              $inc: { 'balance.available': merchantReceives }
            });
            
          } else if (statusResult.status === 'FAILED') {
            transaction.status = 'failed';
          }
        }
        
        if (statusResult) {
          transaction.providerResponse = {
            ...transaction.providerResponse,
            statusCheck: statusResult,
            lastChecked: new Date()
          };
          
          await transaction.save();
        }
        
      } catch (error) {
        console.error(`Error checking status for transaction ${transaction.transactionId}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error in checkPendingPayments:', error);
  }
};

// Run background job every 2 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(checkPendingPayments, 2 * 60 * 1000);
}

module.exports = {
  processMTNPayment,
  processDigicashPayment,
  checkMTNPaymentStatus,
  checkDigicashPaymentStatus,
  checkPendingPayments
};