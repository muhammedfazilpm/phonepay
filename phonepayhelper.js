const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const salt_key = process.env.SALT_KEY;

function payment(body) {
  return new Promise((resolve, reject) => {
    const { amount, tax } = body;
    const totalamount = amount + tax;

    try {
      const data = {
        merchantId: "PGTESTPAYUAT",
        merchantTransactionId: "MT7850590068188104",
        merchantUserId: "MUID123",
        amount: totalamount * 100,
        redirectUrl: "https://webhook.site/redirect-url",
        redirectMode: "REDIRECT",
        callbackUrl: "https://webhook.site/callback-url",
        mobileNumber: "9999999999",
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString("base64");
      const keyIndex = 1;
      const string = payloadMain + "/pg/v1/pay" + salt_key;
      const sha256 = crypto.createHash("sha256").update(string).digest("hex");
      const checksum = sha256 + "###" + keyIndex;

      const prod_URL =
        "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
      const options = {
        method: "POST",
        url: prod_URL,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
        data: {
          request: payloadMain,
        },
      };

      axios
        .request(options)
        .then(function (response) {
          const redirectUrl =
            response.data.data.instrumentResponse.redirectInfo.url;
          resolve(redirectUrl);
        })
        .catch(function (error) {
          reject(error);
        });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

module.exports = { payment };
