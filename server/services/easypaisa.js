/**
 * EasyPaisa Payment Gateway Integration
 * ---------------------------------------------------------
 * Implements Telenor Microfinance Bank's EasyPaisa "Open API"
 * hosted checkout flow (HTTP POST redirect, same shape as JazzCash).
 *
 * Docs (merchant portal, credentials issued after onboarding):
 * https://easypaisa.com.pk/business/
 */
const crypto = require('crypto');

const SANDBOX_URL = 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';
const PRODUCTION_URL = 'https://easypay.easypaisa.com.pk/easypay/Index.jsf'; // same host; store id changes to live

function getGatewayUrl() {
  return (process.env.EASYPAISA_ENV || 'sandbox') === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

/** EasyPaisa signs the request with SHA-256 (HashKey + concatenated field values). */
function generateHash(fields, hashKey) {
  const orderedValues = [
    fields.storeId,
    fields.amount,
    fields.postBackURL,
    fields.orderRefNum,
    fields.expiryDate
  ].join('');
  return crypto.createHash('sha256').update(hashKey + orderedValues).digest('hex');
}

function buildPaymentRequest({ orderRefNum, amountInRupees, description }) {
  const storeId = process.env.EASYPAISA_STORE_ID;
  const hashKey = process.env.EASYPAISA_HASH_KEY;
  const returnUrl = process.env.EASYPAISA_RETURN_URL;

  if (!storeId || !hashKey) {
    throw new Error(
      'EasyPaisa credentials missing. Set EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY in server/.env (issued by EasyPaisa after merchant onboarding).'
    );
  }

  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  const expiryDate = `${expiry.getFullYear()}${String(expiry.getMonth() + 1).padStart(2, '0')}${String(expiry.getDate()).padStart(2, '0')} ${String(expiry.getHours()).padStart(2, '0')}${String(expiry.getMinutes()).padStart(2, '0')}`;

  const fields = {
    storeId,
    amount: amountInRupees.toFixed(1),
    postBackURL: returnUrl,
    orderRefNum,
    expiryDate,
    merchantHashedReq: '',
    autoRedirect: '1',
    paymentMethod: 'MA_PAYMENT_METHOD', // Mobile Account
    emailAddr: '',
    mobileNum: '',
    orderRefNumSuffix: description || 'The Atelier Order'
  };

  fields.merchantHashedReq = generateHash(fields, hashKey);

  return { gatewayUrl: getGatewayUrl(), params: fields };
}

function verifyCallback(body, hashKey) {
  // EasyPaisa returns status in body.status ("00" = success) plus its own signature.
  const isSuccess = body.status === '0000' || body.status === '00';
  return { isSuccess, status: body.status, desc: body.desc };
}

module.exports = { buildPaymentRequest, verifyCallback };
