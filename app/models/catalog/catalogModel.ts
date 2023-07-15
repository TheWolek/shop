import db from "../db";
import {
  filterOnListingPage,
  group,
  groupRow,
  listingFilter,
  listingPage,
  producersByCategory,
  productOnListingPage,
} from "../../types/catalog";
import { MysqlError } from "mysql";

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

  private fetchDefaultFilters = function () {
    return new Promise<listingFilter[]>(function (resolve, reject) {
      const sql = `SELECT filter_id, filter_name, filter_type FROM catalog_category_default_filters ccdf;`;

      db.query(sql, function (err: MysqlError, result: listingFilter[]) {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  private fetchFiltersByCategory = function (category_id: number) {
    return new Promise<listingFilter[]>(function (resolve, reject) {
      const sql = `SELECT ccf.filter_id, ccf.filter_name, ccf.filter_type
      FROM catalog_categories cc 
      JOIN catalog_category_filters ccf ON cc.category_id = ccf.filter_category_id 
      WHERE cc.category_id = ${db.escape(category_id)};`;

      db.query(sql, function (err: MysqlError, result: listingFilter[]) {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  private fetchProducersByCategory = function (category_id: number) {
    return new Promise<producersByCategory[]>(function (resolve, reject) {
      const sql = `SELECT p2.producer_id, p2.producer_name, count(p.product_id) as "product_count"
      FROM products p
      JOIN producers p2 ON p.producer = p2.producer_id
      WHERE p.product_category_id = ${db.escape(category_id)}
      GROUP BY p2.producer_id;`;

      db.query(sql, function (err: MysqlError, result: producersByCategory[]) {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  fetchProductsByCategory(
    category_id: number,
    page: number = 1,
    pageSize: number = 5,
    sortBy: string = "product_id",
    sort: string = "desc",
    filters: filterOnListingPage | undefined,
    result: Function
  ) {
    this.fetchDefaultFilters()
      .then((defaultFilters) => {
        this.fetchFiltersByCategory(category_id)
          .then((cateogoryFilters) => {
            this.fetchProducersByCategory(category_id)
              .then((producers) => {
                this.fetchTotalResultCount(category_id)
                  .then(function (numberOfPages) {
                    const offset = (page - 1) * pageSize;
                    const totalPages = Math.ceil(
                      Number(numberOfPages) / pageSize
                    );

                    let filter_condition = " and ";

                    if (filters !== undefined) {
                      if (filters.producer_id !== undefined) {
                        filter_condition += ` p2.producer_id in (${filters.producer_id})`;
                      }

                      if (filters.priceRange !== undefined) {
                        if (filters.producer_id !== undefined)
                          filter_condition += " and ";
                        if (filters.priceRange.minValue !== undefined) {
                          filter_condition += ` p.product_price > ${filters.priceRange.minValue}`;
                        }
                        if (filters.priceRange.maxValue !== undefined) {
                          if (filters.priceRange.minValue !== undefined)
                            filter_condition += " and ";
                          filter_condition += ` p.product_price < ${filters.priceRange.maxValue}`;
                        }
                      }

                      if (filters.is_available !== undefined) {
                        if (
                          filters.producer_id !== undefined ||
                          filters.priceRange !== undefined
                        )
                          filter_condition += " and ";

                        filter_condition += ` p.is_available = (${filters.is_available})`;
                      }
                    }

                    const sql_productsInPage = `SELECT p.product_id, p.product_name, p.product_price, p2.producer_id, p2.producer_name, p.is_available, p.image, cc.category_id, cc.category_name
                    FROM products p 
                    JOIN catalog_categories cc ON p.product_category_id = cc.category_id 
                    JOIN producers p2 ON p.producer = p2.producer_id
                    WHERE cc.category_id = ${db.escape(category_id)} ${
                      filters !== undefined ? filter_condition : ""
                    }
                    ORDER BY p.${sortBy} ${sort}
                    LIMIT ${db.escape(offset)}, ${db.escape(pageSize)}`;

                    db.query(
                      sql_productsInPage,
                      (err: MysqlError, rows: Array<productOnListingPage>) => {
                        if (err) {
                          result(err, null);
                          return;
                        }

                        let filters = [...defaultFilters];

                        if (cateogoryFilters.length !== 0)
                          filters.push(...cateogoryFilters);

                        let output: listingPage = {
                          products: rows,
                          totalResults: Number(numberOfPages),
                          currentPage: page,
                          totalPages: totalPages,
                          pageSize: pageSize,
                          sortBy: sortBy,
                          sort: sort,
                          filters: filters,
                          producers: producers,
                        };

                        result(null, output);
                        return;
                      }
                    );
                  })
                  .catch((error) => result(error, null));
              })
              .catch((error) => result(error, null));
          })
          .catch((error) => result(error, null));
      })
      .catch((error) => result(error, null));
  }
}

export default catalogModel;
