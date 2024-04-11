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
  URL
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
  URL
}

export default Config
