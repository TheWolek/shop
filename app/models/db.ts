import mysql from "mysql";
import dbConfig from "../config/db.config";

const connection = mysql.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.DB,
  multipleStatements: true,
});

export default connection;
