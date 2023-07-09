import express, { Request, Response } from "express";
import productModel from "../../models/product/productModel";
import { reg_number } from "../../helpers/regEx";
import throwGenericError from "../../helpers/throwGenericError";
import createProductValidation from "../../helpers/product/createProductValidation";
import { MysqlError, OkPacket } from "mysql";

import {
  product,
  createProductReqBody,
  updateProductReqBody,
} from "../../types/product/productTypes";
import updateProductValidation from "../../helpers/product/updateProductValidation";

class productController {
  public path = "/product";
  public router = express.Router();

  constructor() {
    this.initRoutes();
    console.log(`Controller ${this.path} initialized`);
  }

  public initRoutes() {
    this.router.get(`${this.path}/:product_id`, this.fetchProductById);
    this.router.post(`${this.path}/producer`, this.addProducer);
    this.router.post(`${this.path}`, this.addProduct);
    this.router.put(`${this.path}/:product_id`, this.updateProduct);
  }

  private ProductModel = new productModel();

  fetchProductById = (req: Request<{ product_id: string }>, res: Response) => {
    if (!reg_number.test(req.params.product_id)) {
      return throwGenericError(res, 400, "zły format pola product_id", null);
    }

    this.ProductModel.fetchProductById(
      Number(req.params.product_id),
      (err: MysqlError, rows: Array<product>) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json(rows);
      }
    );
  };

  addProducer = (
    req: Request<{}, {}, { producer_name: string }>,
    res: Response
  ) => {
    if (req.body.producer_name === undefined || req.body.producer_name === "") {
      return throwGenericError(
        res,
        400,
        "pole producer_name jest wymagane",
        null
      );
    }

    this.ProductModel.addProducer(
      req.body.producer_name,
      (err: MysqlError, result: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json({
          producer_id: result.insertId,
          producer_name: req.body.producer_name,
        });
      }
    );
  };

  addProduct = (req: Request<{}, {}, createProductReqBody>, res: Response) => {
    const validation = createProductValidation(req.body);
    if (validation[0]) {
      this.ProductModel.addProduct(
        req.body,
        (err: MysqlError | string, result: number) => {
          if (err) {
            if (String(err).includes("istnieje")) {
              return throwGenericError(res, 400, err, null);
            }
            return throwGenericError(res, 500, "Błąd serwera SQL", err);
          }

          return res.status(200).json({
            product_id: result,
          });
        }
      );
    } else {
      return throwGenericError(res, 400, validation[1], null);
    }
  };

  updateProduct = (
    req: Request<{ product_id: string }, {}, updateProductReqBody>,
    res: Response
  ) => {
    const validation = updateProductValidation(req.body);
    if (validation[0]) {
      this.ProductModel.updateProduct(
        Number(req.params.product_id),
        req.body,
        (err: MysqlError | string, result: OkPacket) => {
          if (err) {
            if (String(err).includes("istnieje")) {
              return throwGenericError(res, 400, err, null);
            }
            return throwGenericError(res, 500, "Błąd serwera SQL", err);
          }

          return res.status(200).json({});
        }
      );
    } else {
      return throwGenericError(res, 400, validation[1], null);
    }
  };
}

export default productController;
