import { config } from "dotenv"

config()

const {
  APP_NAME,
  PORT,
  MONGODB_URI,
  NODE_ENV,
  CORS_ORIGIN,
  COMMON_JWT_KEY,
  LOGIN,
  FILE_UPLOAD_PATH,
  URL,
  PUPPETEER_EXECUTABLE_PATH
} = process.env

const Config = {
  APP_NAME,
  PORT,
  MONGODB_URI,
  NODE_ENV,
  CORS_ORIGIN,
  COMMON_JWT_KEY,
  LOGIN,
  FILE_UPLOAD_PATH,
  URL,
  PUPPETEER_EXECUTABLE_PATH
}

export default Config
