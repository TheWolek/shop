import generateToken from "../../helpers/basket/generateToken";
import {
  basket,
  product,
  productInBasket,
} from "../../types/basket/basketTypes";
import db from "../db";
import { MysqlError, OkPacket } from "mysql";

class basketModel {
  returnBasket(basketToken: string, result: Function) {
    this.getBasket(basketToken)
      .then((rows) => result(null, rows))
      .catch((error) => result(error, null));
  }

  private getBasket(basketToken: string) {
    return new Promise(function (resolve, reject) {
      const sql = `SELECT b.basket_token, bi.basket_item_id, bi.product_id, bi.count, bi.price, p.product_name, p2.producer_name, p.product_category_id, p.product_price as "catalog_price", p.is_available, p.image
      FROM baskets b 
      JOIN basket_items bi ON b.basket_token = bi.basket_token
      JOIN products p ON bi.product_id = p.product_id
      JOIN producers p2 ON p.producer = p2.producer_id
      WHERE b.basket_token = ${db.escape(basketToken)};`;

      db.query(sql, (err: MysqlError, rows: any) => {
        if (err) reject(err);
        let basket: basket = {
          basket_token: "",
          items: [],
          selectedShipmentMethod: null,
          selectedPaymentMethod: null,
          comment: "",
          totalPrice: 0,
        };

        rows.forEach((row: any) => {
          if (basket.basket_token === "")
            basket.basket_token = row.basket_token;
          delete row.basket_token;
          basket.items.push(row);
        });

        const totalPrice: number = basket.items.reduce(
          (sum: number, item: productInBasket) => sum + item.price * item.count,
          0
        );

        basket.totalPrice = totalPrice;
        resolve(basket);
      });
    });
  }

  private createBasketRow = function () {
    return new Promise<string>(function (resolve, reject) {
      const token = generateToken();
      const sql_createBasket = `INSERT INTO baskets (basket_token) VALUES (${db.escape(
        token
      )})`;
      db.query(sql_createBasket, function (err: MysqlError) {
        if (err) reject(err);
        resolve(token);
      });
    });
  };

  private checkIfItemsCanBeAdded = function (product_ids: number[]) {
    return new Promise<product[]>(function (resolve, reject) {
      const placeholders = product_ids.map(() => "?").join(",");

      const sql = `SELECT product_id, product_name, product_price 
      FROM products WHERE product_id in (${placeholders}) AND is_available = 1`;

      db.query(sql, product_ids, (error, results) => {
        if (error) reject(error);

        const existingIds = results.map((row: any) => row.product_id);
        const missingIds = product_ids.filter(
          (id) => !existingIds.includes(id)
        );

        if (missingIds.length > 0) {
          return reject(missingIds);
        }
        resolve(results);
      });
    });
  };

  createBasket(products: productInBasket[], result: Function) {
    this.createBasketRow()
      .then((token) => {
        const productIds = products.map((product) => product.product_id);
        this.checkIfItemsCanBeAdded(productIds)
          .then((existing) => {
            let sql = `INSERT INTO basket_items (product_id, count, price, basket_token) VALUES `;

            products.forEach((item, index) => {
              if (index > 0) sql += ",";
              sql += `(${db.escape(item.product_id)},${db.escape(item.count)},${
                existing[index].product_price
              },${db.escape(token)})`;
            });

            db.query(sql, (err: MysqlError) => {
              if (err) return result(err, null);
              this.getBasket(token)
                .then((rows) => result(null, rows))
                .catch((err) => result(err, null));
            });
          })
          .catch((error) => {
            if (Number.isInteger(error[0])) {
              return result(
                `Podane produkty nie mogą być dodane do koszyka: ${error}`,
                null
              );
            }
          })
          .catch((error) => result(error, null));
      })
      .catch((error) => result(error, null));
  }
}

export default basketModel;
