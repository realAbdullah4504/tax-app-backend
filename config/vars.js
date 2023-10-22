require("dotenv").config(); // Load environment variables from .env file

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_COOKIE_EXPIRE_IN: process.env.JWT_COOKIE_EXPIRE_IN,

  // Your Twilio credentials
  ACCOUNT_SID: process.env.ACCOUNT_SID,
  AUTH_TOKEN: process.env.AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  VERIFY_SID: process.env.VERIFY_SID,

  //PDF Parser credentials
  PDF_PARSER: process.env.PDF_PARSER,
  PDF_API_EMP: process.env.PDF_API_EMP,
  PDF_ACC: process.env.PDF_ACC,
  // AWS
  BUCKET_NAME: process.env.BUCKET_NAME,
  DIRECTORY_NAME: process.env.DIRECTORY_NAME,
  BUCKET_NAME: process.env.BUCKET_NAME,
  DIRECTORY_NAME: process.env.DIRECTORY_NAME,

  // Add more variables as needed
};
