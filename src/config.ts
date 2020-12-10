import dotenv from "dotenv";

dotenv.config();

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const SLEEP_TIME = parseInt(process.env.SLEEP_TIME || "2000", 10);
export const DOMAIN = process.env.DOMAIN;
