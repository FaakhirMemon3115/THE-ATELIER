/**
 * JazzCash Payment Gateway Integration
 * ---------------------------------------------------------
 * Implements JazzCash's "Page Redirect" (Mobile Wallet) API —
 * the standard integration used by merchants in Pakistan.
 *
 * Flow:
 *   1. Server builds a signed `pp_*` parameter set (HMAC-SHA256
 *      "Secure Hash" using the Integrity Salt).
 *   2. Frontend auto-submits those params as an HTML form POST
 *      to JazzCash's hosted payment page.
 *   3. Customer completes payment on JazzCash's page (enters
 *      mobile account + verifies with OTP).
 *   4. JazzCash redirects back to our `pp_ReturnURL` with the
 *      result — we verify the secure hash again before trusting it.
 *
 * Docs: https://sandbox.jazzcash.com.pk/Sandbox/JazzCash-Sandbox-API-Doc.pdf
 */
const crypto = require('crypto');

const SANDBOX_URL = 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';
const PRODUCTION_URL = 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

function getGatewayUrl() {
  return (process.env.JAZZCASH_ENV || 'sandbox') === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function formatDateTime(date) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Builds the alphabetically-sorted secure hash required by JazzCash.
 * Algorithm: sort all pp_* fields (except pp_SecureHash) by key name,
 * join their VALUES with '&', prefix with the Integrity Salt, then HMAC-SHA256.
 */
function generateSecureHash(params, integritySalt) {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== 'pp_SecureHash' && params[k] !== undefined && params[k] !== '')
    .sort();
  const valueString = sortedKeys.map((k) => params[k]).join('&');
  const hashInput = `${integritySalt}&${valueString}`;
  return crypto.createHmac('sha256', integritySalt).update(hashInput).digest('hex').toUpperCase();
}

/**
 * Builds the full signed parameter set to render as an auto-submit
 * HTML form on the frontend (this is JazzCash's required flow —
 * there is no pure server-to-server JSON API for the wallet flow).
 */
function buildPaymentRequest({ txnRefNo, amountInRupees, billReference, description, customerMobile }) {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const returnUrl = process.env.JAZZCASH_RETURN_URL;

  if (!merchantId || !password || !integritySalt) {
    throw new Error(
      'JazzCash credentials missing. Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD and JAZZCASH_INTEGRITY_SALT in server/.env (get sandbox values from https://sandbox.jazzcash.com.pk).'
    );
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

  const params = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
    pp_Language: 'EN',
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(Math.round(amountInRupees * 100)), // JazzCash expects amount in paisa
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatDateTime(now),
    pp_BillReference: billReference || 'billRef',
    pp_Description: description || 'The Atelier Order Payment',
    pp_TxnExpiryDateTime: formatDateTime(expiry),
    pp_ReturnURL: returnUrl,
    pp_SubMerchantID: '',
    pp_CustomerMobileNumber: customerMobile || '',
    ppmpf_1: '1',
    ppmpf_2: '2',
    ppmpf_3: '3',
    ppmpf_4: '4',
    ppmpf_5: '5'
  };

  params.pp_SecureHash = generateSecureHash(params, integritySalt);

  return { gatewayUrl: getGatewayUrl(), params };
}

/** Verifies the secure hash JazzCash sends back on the callback/return URL. */
function verifyCallback(body) {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
  const receivedHash = body.pp_SecureHash;
  const expectedHash = generateSecureHash(body, integritySalt);
  const isValid = receivedHash && receivedHash.toUpperCase() === expectedHash;
  const isSuccess = body.pp_ResponseCode === '000';
  return { isValid, isSuccess, responseCode: body.pp_ResponseCode, responseMessage: body.pp_ResponseMessage };
}

module.exports = { buildPaymentRequest, verifyCallback, generateSecureHash };
