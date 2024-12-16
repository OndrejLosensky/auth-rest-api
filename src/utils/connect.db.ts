import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

async function connect() {
  const dbUrl = config.get<string>("dbUrl");

  try {
    await mongoose.connect(dbUrl);
    logger.info("DB connected");
  } catch (error) {
    logger.error("Could not connect to db");
    process.exit(1);
  }
}

export default connect;