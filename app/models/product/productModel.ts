import db from "../db";
import { MysqlError, OkPacket } from "mysql";

import {
  product,
  createProductReqBody,
  updateProductReqBody,
} from "../../types/product/productTypes";

class productModel {
  fetchProductById(product_id: number, result: Function) {
    const sql = `SELECT p.product_id, p.product_name, p.product_price, p2.producer_id, p2.producer_name, p.is_available, p.producer_code, p.description, p.image,
    cc.category_id, cc.category_name
    FROM products p
    JOIN producers p2 ON p.producer = p2.producer_id 
    JOIN catalog_categories cc ON p.product_category_id = cc.category_id 
    WHERE product_id = ${db.escape(product_id)}`;

    db.query(sql, (err: MysqlError, rows: Array<product>) => {
      if (err) {
        result(err, null);
        return;
      }

      if (rows.length === 0) {
        result(null, rows);
        return;
      } else {
        rows[0].is_available = rows[0].is_available === 1 ? true : false;

        result(null, rows);
        return;
      }
    });
  }

  addProducer(producer_name: string, result: Function) {
    const sql = `INSERT INTO producers (producer_name) VALUES (${db.escape(
      producer_name
    )})`;

    db.query(sql, (err: MysqlError, res: OkPacket) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res);
      return;
    });
  }

  addProduct(product: createProductReqBody, result: Function) {
    this.checkIfCategoryExists(product.category_id)
      .then(() => {
        this.checkIfProducerExists(product.producer_id)
          .then(() => {
            const sql = `INSERT INTO products 
            (product_category_id, product_name, product_price, producer, is_available, producer_code, description, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
              product.category_id,
              product.product_name,
              product.product_price,
              product.producer_id,
              product.is_available,
              product.producer_code || null,
              product.description || null,
              product.image || null,
            ];

            db.query(
              sql,
              values,
              function (err: MysqlError | null, res: OkPacket) {
                if (err) {
                  result(err, null);
                  return;
                }

                result(null, res.insertId);
                return;
              }
            );
          })
          .catch((error) => result(error, null));
      })
      .catch((error) => result(error, null));
  }

  updateProduct(
    product_id: number,
    product: updateProductReqBody,
    result: Function
  ) {
    this.checkIfProductExists(product_id)
      .then(() => {
        const sql = `UPDATE products SET product_name=?, product_price=?, is_available=?, producer_code=?, description=?, image=? WHERE product_id = ?`;
        const values = [
          product.product_name,
          product.product_price,
          product.is_available,
          product.producer_code || null,
          product.description || null,
          product.image || null,
          product_id,
        ];

        db.query(sql, values, function (err: MysqlError | null, res: OkPacket) {
          if (err) {
            result(err, null);
            return;
          }

          result(null, res.insertId);
        });
      })
      .catch((error) => result(error, null));
  }

  private checkIfProductExists(product_id: number) {
    return new Promise(function (resolve, reject) {
      const sql = `SELECT product_id FROM products WHERE product_id = ${db.escape(
        product_id
      )}`;

      db.query(sql, (err: MysqlError, rows: Array<{ product_id: number }>) => {
        if (err) reject(err);
        if (rows.length === 0)
          reject(`podany produkt nie istnieje - ${product_id}`);
        resolve(null);
      });
    });
  }

  private checkIfCategoryExists(category_id: number) {
    return new Promise(function (resolve, reject) {
      const sql = `SELECT category_name FROM catalog_categories WHERE category_id = ${db.escape(
        category_id
      )}`;

      db.query(
        sql,
        (err: MysqlError, rows: Array<{ category_name: string }>) => {
          if (err) reject(err);
          if (rows.length === 0)
            reject(`podana kategoria nie istnieje - ${category_id}`);
          resolve(null);
        }
      );
    });
  }

  private checkIfProducerExists(producer_id: number) {
    return new Promise(function (resolve, reject) {
      const sql = `SELECT producer_name FROM producers WHERE producer_id = ${db.escape(
        producer_id
      )}`;

      db.query(
        sql,
        (err: MysqlError, rows: Array<{ producer_name: string }>) => {
          if (err) reject(err);
          if (rows.length === 0)
            reject(`podany producent nie istnieje - ${producer_id}`);
          resolve(null);
        }
      );
    });
  }
}

export default productModel;
