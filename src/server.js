import express from "express";
import { StatusCodes } from "http-status-codes"
import Config from "./config/index.js"
import connectDB from "./config/db/index.js"
import logger from "./config/logger/index.js"
import allRoutes  from './routes/index.js'
import {middleware} from './utils/middleware.js'

const { PORT,FILE_UPLOAD_PATH } = Config
const app = express()
//* Error handling middleware
  app.get('/', (req, res) => {
    res.json("Api Testing");
  });
  

app.use('/api',middleware,allRoutes)

app.use('/pdf',express.static(`${FILE_UPLOAD_PATH}/PDF`));

  app.use((req, res, next) => {
    const error = new Error("Invalid request");
    res.status(StatusCodes.NOT_FOUND);
    next(error);
  });
  
  app.use((error, req, res, next) => {
    if (req.expiredToken) {
  
      delete req.headers.authorization;
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Your token has been removed. Please log in again.",
      });
    }
    res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return res.json({ message: error.message });
  });

 async  function startServer () {
    try {
      await connectDB()
      const server = app.listen(PORT, () => {
        logger.info(`Listening on port ${PORT}`)
      })
  
      // Error handling for EADDRINUSE
      server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          logger.error(
            `Port ${PORT} is already in use. Please choose another port.`
          )
        } else {
          logger.error("An error occurred:", error)
        }
        setTimeout(() => process.exit(1), 1000)
      })
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message)
        setTimeout(() => process.exit(1), 1000)
      }
    }
  }
  
  startServer()
  