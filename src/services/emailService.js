const path = require('path');
const fs = require('fs');
const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = require('../../config/vars');

const emailService = async (resetUrl, email, userData) => {
  var api_key = MAILGUN_API_KEY;
  var domain = MAILGUN_DOMAIN;
  // var domain = 'www.ex.com';
  var hostMailgun = 'api.eu.mailgun.net';
  var mailgun = require('mailgun-js')({
    apiKey: api_key,
    domain: domain,
    host: hostMailgun,
    protocol: 'https:',
    port: 443,
  });

  const htmlFilePath = path.join(__dirname, '../../public', 'email-password-reset.html');
  // console.log(htmlFilePath, api_key, domain, hostMailgun);

  let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  htmlContent = htmlContent.replace('%URL_PLACEHOLDER%', resetUrl);
  htmlContent = htmlContent.replace('%First_Name%', userData?.firstName);

  return new Promise((resolve, reject) => {
    const data = {
      from: 'Tax Return Pro <noreply@taxreturnpro.ie>',
      to: email,
      subject: 'Reset your password',
      html: htmlContent,
    };

    mailgun.messages().send(data, function (error, body) {
      // console.log('body', body);
      // console.log('error', error);
      if (!error) {
        resolve(body);
      } else {
        const customError = new Error('Failed to send email');
        customError.mailgunError = error;
        reject(customError);
      }
    });
  });
};

module.exports = emailService;
