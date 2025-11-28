const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const PaymentLink = require('../models/PaymentLink');
const { supabase } = require('../services/supabaseRepo');
const User = require('../models/User');
const { auth, merchantAuth, kycVerified, apiKeyAuth, optionalAuth } = require('../middleware/auth');
const { requireEmailVerification } = require('../middleware/emailVerification');
const { processMTNPayment, processDigicashPayment } = require('../services/paymentService');
const { getFlutterwaveService } = require('../services/flutterwaveService');
const Settings = require('../models/Settings');
const { sendWebhook, verifyWebhookSignature } = require('../services/webhookService');
const { sendNotification } = require('../services/notificationService');

const router = express.Router();

// Middleware to allow either JWT merchant auth or API key auth
const merchantApiAuth = async (req, res, next) => {
  // Try API key first
  const key = req.header('X-API-Key');
  if (key) {
    return apiKeyAuth(req, res, next);
  }
  // Fallback to JWT merchant auth
  return auth(req, res, (err) => {
    if (err) return next(err);
    return merchantAuth(req, res, next);
  });
};

// @route   POST /api/payments/create-link
// @desc    Create a payment link
// @access  Private (Merchant, KYC Verified)
router.post('/create-link', auth, requireEmailVerification, merchantAuth, kycVerified, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('allowCustomAmount')
    .optional()
    .isBoolean()
    .withMessage('Allow custom amount must be a boolean'),
  body('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be at least 0'),
  body('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be at least 0'),
  body('currency')
    .optional()
    .isIn(['USD'])
    .withMessage('Currency must be USD'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('allowedPaymentMethods')
    .optional()
    .isArray()
    .withMessage('Allowed payment methods must be an array'),
  body('allowedPaymentMethods.*')
    .isIn(['flutterwave', 'card', 'mobilemoney', 'mpesa', 'bank_transfer'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      amount,
      allowCustomAmount = false,
      minAmount,
      maxAmount,
      currency = 'USD',
      expiresAt,
      allowedPaymentMethods = ['flutterwave'],
      isMultiUse = true,
      maxUses,
      customization = {},
      collectCustomerInfo = {},
      redirectUrls = {},
      webhookUrl
    } = req.body;

    // Additional validation for custom amounts
    if (!allowCustomAmount && (!amount || amount < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be at least 1 when custom amounts are not allowed'
      });
    }

    if (allowCustomAmount && minAmount && maxAmount && minAmount >= maxAmount) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount must be less than maximum amount'
      });
    }

    // Validate expiry date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }

    const paymentLink = new PaymentLink({
      merchant: req.user.id,
      title,
      description,
      amount: allowCustomAmount ? undefined : amount,
      allowCustomAmount,
      minAmount,
      maxAmount,
      currency,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      allowedPaymentMethods,
      isMultiUse,
      maxUses,
      customization,
      collectCustomerInfo,
      redirectUrls,
      webhookUrl,
      metadata: {
        source: 'dashboard'
      }
    });

    await paymentLink.save();

    res.status(201).json({
      success: true,
      message: 'Payment link created successfully',
      paymentLink: {
        id: paymentLink._id,
        linkId: paymentLink.linkId,
        title: paymentLink.title,
        description: paymentLink.description,
        amount: paymentLink.amount,
        allowCustomAmount: paymentLink.allowCustomAmount,
        minAmount: paymentLink.minAmount,
        maxAmount: paymentLink.maxAmount,
        currency: paymentLink.currency,
        fullUrl: paymentLink.fullUrl,
        shortUrl: paymentLink.shortUrl,
        status: paymentLink.status,
        isActive: paymentLink.isActive,
        expiresAt: paymentLink.expiresAt,
        createdAt: paymentLink.createdAt
      }
    });

  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment link'
    });
  }
});

// @route   GET /api/payments/links
// @desc    Get merchant's payment links
// @access  Private (Merchant)
router.get('/links', [merchantApiAuth], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let q = supabase
      .from('payment_links')
      .select('id,link_id,title,description,amount,currency,is_active,status,analytics,expires_at,created_at', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + (limit - 1));
    if (status) q = q.eq('status', status);
    const { data, error, count } = await q;
    if (error) throw error;

    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const links = (data || []).map(link => ({
      id: link.id,
      linkId: link.link_id,
      title: link.title,
      description: link.description,
      amount: link.amount,
      currency: link.currency,
      fullUrl: `${baseUrl}/pay/${link.link_id}`,
      shortUrl: `payssd.ss/p/${link.link_id}`,
      status: link.status,
      isActive: !!link.is_active,
      analytics: link.analytics || {},
      expiresAt: link.expires_at,
      createdAt: link.created_at
    }));

    res.json({
      success: true,
      links,
      pagination: {
        current: page,
        pages: Math.ceil((count || 0) / limit),
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Get payment links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/link/:linkId
// @desc    Get payment link details (public)
// @access  Public
router.get('/link/:linkId', optionalAuth, async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const paymentLink = await PaymentLink.findOne({ linkId })
      .populate('merchant', 'profile.businessName profile.firstName profile.lastName email');
    
    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    // Check if link is accessible
    if (!paymentLink.isAccessible()) {
      return res.status(400).json({
        success: false,
        message: 'Payment link is no longer available',
        reason: paymentLink.status === 'expired' ? 'expired' : 
                paymentLink.status === 'completed' ? 'completed' : 'inactive'
      });
    }

    // Increment view count (only for non-merchant views)
    if (!req.user || req.user.id !== paymentLink.merchant._id.toString()) {
      await paymentLink.incrementView(true);
    }

    res.json({
      success: true,
      paymentLink: {
        id: paymentLink._id,
        linkId: paymentLink.linkId,
        title: paymentLink.title,
        description: paymentLink.description,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        allowedPaymentMethods: paymentLink.allowedPaymentMethods,
        customization: paymentLink.customization,
        collectCustomerInfo: paymentLink.collectCustomerInfo,
        merchant: {
          businessName: paymentLink.merchant.profile.businessName || 
                       `${paymentLink.merchant.profile.firstName} ${paymentLink.merchant.profile.lastName}`,
          email: paymentLink.customization.showMerchantInfo ? paymentLink.merchant.email : undefined
        }
      }
    });

  } catch (error) {
    console.error('Get payment link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/process
// @desc    Process payment for a payment link
// @access  Public
router.post('/process', [
  body('linkId')
    .notEmpty()
    .withMessage('Payment link ID is required'),
  body('paymentMethod')
    .isIn(['mtn_momo', 'digicash'])
    .withMessage('Invalid payment method'),
  body('customer.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Customer name is required'),
  body('customer.phoneNumber')
    .matches(/^\+211[0-9]{9}$/)
    .withMessage('Valid South Sudan phone number is required'),
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { linkId, paymentMethod, customer } = req.body;

    // Get payment link
    const { PaymentLinks, Users, Transactions } = require('../services/supabaseRepo')
    const paymentLink = await PaymentLinks.getByLinkId(linkId)
    
    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found'
      });
    }

    // Check if link is accessible
    if (!paymentLink.isAccessible()) {
      return res.status(400).json({
        success: false,
        message: 'Payment link is no longer available'
      });
    }

    // Check if payment method is allowed
    if (!paymentLink.allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method not allowed for this link'
      });
    }

    // Generate transaction ID
    const transactionId = 'txn_' + uuidv4().replace(/-/g, '').substring(0, 16);

    // Calculate fees
    const platformFee = Transaction.calculatePlatformFee(paymentLink.amount);
    
    // Create transaction
    const transaction = new Transaction({
      transactionId,
      reference: transactionId, // Use transactionId as reference for uniqueness
      merchant: paymentLink.merchant._id,
      merchantEmail: paymentLink.merchant.email,
      merchantBusinessName: paymentLink.merchant.profile.businessName,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      description: paymentLink.description,
      paymentMethod,
      customer,
      paymentLink: paymentLink._id,
      fees: {
        platformFee,
        providerFee: 0, // Will be updated by payment service
        totalFees: platformFee
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'payment_link'
      },
      redirectUrls: paymentLink.redirectUrls
    });

    await transaction.save();

    // Process payment based on method
    let paymentResult;
    try {
      if (paymentMethod === 'mtn_momo') {
        paymentResult = await processMTNPayment(transaction);
      } else if (paymentMethod === 'digicash') {
        paymentResult = await processDigicashPayment(transaction);
      }

      // Update transaction with provider response
      transaction.providerResponse = paymentResult;
      transaction.status = paymentResult.success ? 'processing' : 'failed';
      
      if (paymentResult.providerTransactionId) {
        transaction.externalTransactionId = paymentResult.providerTransactionId;
      }

      await transaction.save();

      if (paymentResult.success) {
        res.json({
          success: true,
          message: 'Payment initiated successfully',
          transaction: {
            id: transaction.transactionId,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentMethod: transaction.paymentMethod,
            instructions: paymentResult.instructions
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment failed',
          transaction: {
            id: transaction.transactionId,
            status: transaction.status
          }
        });
      }

    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      
      transaction.status = 'failed';
      transaction.providerResponse = {
        error: paymentError.message
      };
      await transaction.save();

      res.status(500).json({
        success: false,
        message: 'Payment processing failed',
        transaction: {
          id: transaction.transactionId,
          status: transaction.status
        }
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
});

// Flutterwave Standard Checkout: initiate payment and return redirect link
router.post('/flutterwave/initiate', async (req, res) => {
  try {
    if (!process.env.FLW_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured (FLW_SECRET_KEY missing)' });
    }
    const { linkId, customer } = req.body;
    if (!linkId || !customer || !customer.name || !customer.phoneNumber) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const paymentLink = await PaymentLink.findOne({ linkId })
      .populate('merchant', 'profile email balance');

    if (!paymentLink) {
      return res.status(404).json({ success: false, message: 'Payment link not found' });
    }

    if (paymentLink.status && paymentLink.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Payment link is no longer available' });
    }

    const amount = paymentLink.amount;
    const currency = paymentLink.currency || 'USD';

    const tx_ref = 'flw_' + uuidv4().replace(/-/g, '').substring(0, 16);

    const merchantId = paymentLink.merchant_id || paymentLink.merchant?.id
    const transactionId = 'txn_' + uuidv4().replace(/-/g, '').substring(0, 16)
    const created = await Transactions.create({
      user_id: merchantId,
      tx_ref,
      transaction_id: transactionId,
      merchant_id: merchantId,
      amount,
      currency,
      description: paymentLink.description,
      payment_method: 'flutterwave',
      customer,
      payment_link_id: paymentLink.id
    })

    const preferUrl = paymentLink.redirect_urls?.success || paymentLink.redirectUrls?.success;
    const envFrontend = process.env.CLIENT_URL || process.env.APP_URL;
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    const derivedBase = host ? `${proto}://${host}` : 'http://localhost:5000';
    const baseUrl = preferUrl ? undefined : (envFrontend || derivedBase);
    const redirect_url = preferUrl || `${baseUrl}/payment/success`;

    const settings = await Settings.getSettings();
    const customizations = {
      title: settings.general.platformName || 'PaySSD',
      description: paymentLink.title,
      logo: paymentLink.customization?.logo || undefined,
    };

    // Build payment options based on admin toggles and link's allowed methods
    const enabledMethods = [];
    if (settings.payments?.flutterwaveCardEnabled) enabledMethods.push('card');
    if (settings.payments?.flutterwaveMobileMoneyEnabled) enabledMethods.push('mobilemoney');
    if (settings.payments?.flutterwaveMpesaEnabled) enabledMethods.push('mpesa');
    if (settings.payments?.flutterwaveBankTransferEnabled) enabledMethods.push('banktransfer');

    const allowed = Array.isArray(paymentLink.allowedPaymentMethods)
      ? paymentLink.allowedPaymentMethods.map(m => (m === 'bank_transfer' ? 'banktransfer' : m))
      : ['card'];
    const payment_options = enabledMethods.filter(m => allowed.includes(m)).join(',') || 'card';

    const service = getFlutterwaveService();
    const initResp = await service.createPayment({
      tx_ref,
      amount,
      currency,
      redirect_url,
      payment_options,
      customer: {
        email: customer.email,
        phone_number: customer.phoneNumber,
        name: customer.name,
      },
      meta: { linkId },
      customizations,
    });

    const link = initResp?.data?.link;
    if (!link) {
      return res.status(500).json({ success: false, message: 'Failed to create payment' });
    }

    await Transactions.updateStatusByRef(tx_ref, 'processing', { providerResponse: { payment_link: link, flw_tx_ref: tx_ref } })

    return res.json({ success: true, redirectLink: link, tx_ref });
  } catch (error) {
    const providerMsg = error?.response?.data?.message || error?.response?.data?.status || error?.response?.data || error.message;
    console.error('Flutterwave initiate error:', providerMsg);
    return res.status(500).json({ success: false, message: providerMsg || 'Failed to initiate payment' });
  }
});

// Flutterwave prepare: create local transaction and return tx_ref for popup checkout
router.post('/flutterwave/prepare', async (req, res) => {
  try {
    if (!process.env.FLW_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured (FLW_SECRET_KEY missing)' });
    }
    const { linkId, customer } = req.body;
    if (!linkId || !customer || !customer.name || !customer.phoneNumber) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const { PaymentLinks, Transactions } = require('../services/supabaseRepo')
    const paymentLink = await PaymentLinks.getByLinkId(linkId)

    if (!paymentLink) {
      return res.status(404).json({ success: false, message: 'Payment link not found' });
    }

    if (paymentLink.status && paymentLink.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Payment link is no longer available' });
    }

    const amount = paymentLink.amount;
    const currency = paymentLink.currency || 'USD';
    const tx_ref = 'flw_' + uuidv4().replace(/-/g, '').substring(0, 16);

    const merchantId = paymentLink.merchant_id || paymentLink.merchant?.id
    await Transactions.create({
      user_id: merchantId,
      tx_ref,
      transaction_id: 'txn_' + uuidv4().replace(/-/g, '').substring(0, 16),
      merchant_id: merchantId,
      amount,
      currency,
      description: paymentLink.description,
      payment_method: 'flutterwave',
      customer,
      payment_link_id: paymentLink.id
    })

    return res.json({ success: true, tx_ref, amount, currency });
  } catch (error) {
    const providerMsg = error?.response?.data?.message || error?.response?.data?.status || error?.response?.data || error.message;
    console.error('Flutterwave prepare error:', providerMsg);
    return res.status(500).json({ success: false, message: providerMsg || 'Failed to prepare payment' });
  }
});

// Flutterwave webhook
router.post('/webhook/flutterwave', async (req, res) => {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const verifHash = req.header('verif-hash');
    if (!secretHash || !verifHash || verifHash !== secretHash) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const data = event?.data;
    const tx_ref = data?.tx_ref;
    const flwId = data?.id;
    const status = data?.status;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Missing tx_ref' });
    }

    const { Users, Transactions: TxRepo, supabase } = require('../services/supabaseRepo')
    const { data: txRow } = await supabase
      .from('transactions')
      .select('user_id,amount,fees,metadata')
      .eq('reference', tx_ref)
      .limit(1)
      .maybeSingle()
    if (!txRow) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const merchant = await Users.getById(txRow.user_id)
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const oldStatus = status;
    if (status === 'successful') {
      const methodRaw = String((data?.payment_type || data?.channel || data?.source || '')).toLowerCase();
      if (methodRaw) {
        let method = 'flutterwave';
        if (methodRaw.includes('card')) method = 'card';
        else if (methodRaw.includes('mpesa')) method = 'mpesa';
        else if (methodRaw.includes('bank')) method = 'banktransfer';
        else if (methodRaw.includes('momo') || methodRaw.includes('mobile')) method = 'mobilemoney';
        transaction.paymentMethod = method;
      }
      await TxRepo.updateStatusByRef(tx_ref, 'successful', { completedAt: new Date().toISOString() })
      const merchantReceives = txRow.amount - (txRow.fees?.totalFees || 0)
      await supabase.from('users').update({ balance: { available: (merchant.balance?.available || 0) + merchantReceives } }).eq('id', merchant.id)
      if (paymentLink) await PaymentLinks.recordPayment(paymentLink.id, txRow.amount)
    } else if (status === 'failed' || status === 'cancelled') {
      await TxRepo.updateStatusByRef(tx_ref, 'failed')
    }

    await TxRepo.updateStatusByRef(tx_ref, status, { providerResponse: { flw_id: flwId, flw_event: event?.event, flw_status: status, lastChecked: new Date().toISOString() } })

    if (oldStatus !== transaction.status) {
      await sendNotification(transaction);
      if (transaction.merchant.apiKeys?.webhookUrl) {
        await sendWebhook(transaction.merchant.apiKeys.webhookUrl, transaction, transaction.merchant.apiKeys.webhookSecret);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/transaction/:transactionId
// @desc    Get transaction status
// @access  Public
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findOne({ transactionId })
      .select('transactionId status amount currency description paymentMethod customer createdAt completedAt');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        customer: transaction.customer,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/webhook/mtn
// @desc    MTN Mobile Money webhook
// @access  Public (but should be secured with signature verification)
router.post('/webhook/mtn', async (req, res) => {
  try {
    const signature = req.get('X-PaySSD-Signature');
    if (!signature) {
      return res.status(401).json({ message: 'Signature missing' });
    }
    const { transactionId, status, externalTransactionId } = req.body;
    const transaction = await Transaction.findOne({ 
      $or: [
        { transactionId },
        { externalTransactionId }
      ]
    }).populate('merchant', 'email profile balance apiKeys');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const secret = transaction.merchant?.apiKeys?.webhookSecret;
    if (!secret || !verifyWebhookSignature(req.body, signature, secret)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const oldStatus = transaction.status;
    transaction.status = status === 'SUCCESSFUL' ? 'successful' : 'failed';
    if (status === 'SUCCESSFUL') {
      transaction.completedAt = new Date();
      const merchantReceives = transaction.amount - transaction.fees.totalFees;
      await User.findByIdAndUpdate(transaction.merchant._id, {
        $inc: { 'balance.available': merchantReceives }
      });
      if (transaction.paymentLink) {
        const paymentLink = await PaymentLink.findById(transaction.paymentLink);
        if (paymentLink) await paymentLink.recordPayment(transaction.amount);
      }
    }

    await transaction.save();

    if (oldStatus !== transaction.status) {
      await sendNotification(transaction);
      if (transaction.merchant.apiKeys?.webhookUrl) {
        await sendWebhook(transaction.merchant.apiKeys.webhookUrl, transaction, transaction.merchant.apiKeys.webhookSecret);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('MTN webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   POST /api/payments/webhook/digicash
// @desc    Digicash webhook
// @access  Public (but should be secured with signature verification)
router.post('/webhook/digicash', async (req, res) => {
  try {
    const signature = req.get('X-PaySSD-Signature');
    if (!signature) {
      return res.status(401).json({ message: 'Signature missing' });
    }
    const { transactionId, status, externalTransactionId } = req.body;
    const transaction = await Transaction.findOne({ 
      $or: [
        { transactionId },
        { externalTransactionId }
      ]
    }).populate('merchant', 'email profile balance apiKeys');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const secret = transaction.merchant?.apiKeys?.webhookSecret;
    if (!secret || !verifyWebhookSignature(req.body, signature, secret)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const oldStatus = transaction.status;
    transaction.status = status === 'COMPLETED' ? 'successful' : 'failed';
    if (status === 'COMPLETED') {
      transaction.completedAt = new Date();
      const merchantReceives = transaction.amount - transaction.fees.totalFees;
      await User.findByIdAndUpdate(transaction.merchant._id, {
        $inc: { 'balance.available': merchantReceives }
      });
      if (transaction.paymentLink) {
        const paymentLink = await PaymentLink.findById(transaction.paymentLink);
        if (paymentLink) await paymentLink.recordPayment(transaction.amount);
      }
    }

    await transaction.save();

    if (oldStatus !== transaction.status) {
      await sendNotification(transaction);
      if (transaction.merchant.apiKeys?.webhookUrl) {
        await sendWebhook(transaction.merchant.apiKeys.webhookUrl, transaction, transaction.merchant.apiKeys.webhookSecret);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Digicash webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;
