import db from "../db";
import {
  group,
  groupRow,
  listingPage,
  productOnListingPage,
} from "../../types/catalog";
import { MysqlError } from "mysql";
import { Resolver } from "dns";

class catalogModel {
  fetchActiveCategories(result: Function) {
    const sql = `SELECT cg.group_id, cg.group_name, cg.image, cc.category_id, cc.category_name
        FROM catalog_groups cg 
        JOIN catalog_categories cc ON cc.catalog_group_id = cg.group_id 
        WHERE cg.is_active = TRUE 
        ORDER BY cg.group_order asc, cc.category_order asc`;

    db.query(sql, (err: MysqlError, rows: Array<groupRow>) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, this.generateCategoriesOutput(rows));
      return;
    });
  }
  fetchAllCategories(result: Function) {
    const sql = `SELECT cg.group_id, cg.group_name, cg.image, cc.category_id, cc.category_name
    FROM catalog_groups cg 
    JOIN catalog_categories cc ON cc.catalog_group_id = cg.group_id 
    ORDER BY cg.group_order asc, cc.category_order asc`;

    db.query(sql, (err: MysqlError, rows: Array<groupRow>) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, this.generateCategoriesOutput(rows));
      return;
    });
  }

  private generateCategoriesOutput(rows: Array<groupRow>) {
    let output: Array<group> = [];
    rows.forEach((el: groupRow) => {
      let foundEl = output.find((o) => o.group_id === el.group_id);
      if (foundEl) {
        foundEl.categories.push({
          category_id: el.category_id,
          category_name: el.category_name,
        });
      } else {
        output.push({
          group_id: el.group_id,
          group_name: el.group_name,
          image: el.image,
          categories: [
            {
              category_id: el.category_id,
              category_name: el.category_name,
            },
          ],
        });
      }
    });

    return output;
  }

  private fetchTotalResultCount = function (category_id: number) {
    return new Promise(function (resolve, reject) {
      const sql_totalResults = `SELECT count(product_id) as "numberOfPages" from products p WHERE p.product_category_id = ${db.escape(
        category_id
      )};`;

      db.query(
        sql_totalResults,
        function (err: MysqlError, result: Array<{ numberOfPages: number }>) {
          if (err) return reject(err);
          resolve(result[0].numberOfPages);
        }
      );
    });
  };

  fetchProductsByCategory(
    category_id: number,
    page: number = 1,
    pageSize: number = 5,
    sortBy: string = "product_id",
    sort: string = "desc",
    result: Function
  ) {
    this.fetchTotalResultCount(category_id)
      .then(function (numberOfPages) {
        const offset = (page - 1) * pageSize;
        const totalPages = Math.ceil(Number(numberOfPages) / pageSize);

        const sql_productsInPage = `SELECT p.product_id, p.product_name, p.product_price, p2.producer_name, p.is_available, p.image, cc.category_id, cc.category_name
          FROM products p 
          JOIN catalog_categories cc ON p.product_category_id = cc.category_id 
          JOIN producers p2 ON p.producer = p2.producer_id
          WHERE cc.category_id = ${db.escape(category_id)}
          ORDER BY p.${sortBy} ${sort}
          LIMIT ${db.escape(offset)}, ${db.escape(pageSize)}`;

        db.query(
          sql_productsInPage,
          (err: MysqlError, rows: Array<productOnListingPage>) => {
            if (err) {
              result(err, null);
              return;
            }

            let output: listingPage = {
              products: rows,
              totalResults: Number(numberOfPages),
              currentPage: page,
              totalPages: totalPages,
              pageSize: pageSize,
              sortBy: sortBy,
              sort: sort,
            };

            result(null, output);
            return;
          }
        );
      })
      .catch(function (error) {
        result(error, null);
        return;
      });
  }
}

export default catalogModel;
