import dotenv from "dotenv";

dotenv.config();

export default {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_password,
  DB: process.env.DB_name,
};
