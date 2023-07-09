import { Response } from "express";
import { MysqlError } from "mysql";

interface error {
  status: number;
  message: string | MysqlError;
}

function throwGenericError(
  res: Response,
  error_code: number,
  error_msg: string | MysqlError,
  debug_msg: any = null
) {
  if (debug_msg !== null) console.log(debug_msg);
  const error: error = {
    status: error_code,
    message: error_msg,
  };

  res.status(error_code).json(error);
}

export default throwGenericError;
