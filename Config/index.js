require("dotenv").config({ path: "./config.env" });
// All Config.env Variables will be called here. This will be create just because you dont have to need call all time process.env.variables. Many time this will not working For that reason this will benifical.
export const {
  PORT,
  DB_URL,
  DEBUG_MODE,
  JWT_SECRET,
  JWT_EXPIRE,
  COOKIE_EXPIRE,
  SMTP_MAIL,
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_PASS,
  FRONTEND_URL,
  AWS_BUCKET,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  ENC_DEC_KEY,
} = process.env;
