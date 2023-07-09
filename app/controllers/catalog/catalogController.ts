import express, { Request, Response } from "express";
import catalogModel from "../../models/catalog/catalogModel";

import { groupRow, listingPage } from "../../types/catalog";
import { reg_number } from "../../helpers/regEx";
import throwGenericError from "../../helpers/throwGenericError";
import { MysqlError } from "mysql";

class catalogController {
  public path = "/catalog";
  public router = express.Router();

  constructor() {
    this.initRoutes();
    console.log(`Controller ${this.path} initialized`);
  }

  public initRoutes() {
    this.router.get(this.path, this.fetchActive);
    this.router.get(`${this.path}/all`, this.fetchAll);
    this.router.get(`${this.path}/:category_id`, this.fetchProductsByCategory);
  }

  private CatalogModel = new catalogModel();

  fetchActive = (req: Request, res: Response) => {
    this.CatalogModel.fetchActiveCategories(
      (err: MysqlError, rows: Array<groupRow>) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json(rows);
      }
    );
  };

  fetchAll = (req: Request, res: Response) => {
    this.CatalogModel.fetchAllCategories(
      (err: MysqlError, rows: Array<groupRow>) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json(rows);
      }
    );
  };

  fetchProductsByCategory = (
    req: Request<
      { category_id: string },
      {},
      { page: string; sortBy: string; sort: string }
    >,
    res: Response
  ) => {
    if (!reg_number.test(req.params.category_id)) {
      return throwGenericError(res, 400, "zły format pola category_id", null);
    }

    let page = 1;
    let sortBy = "product_id";
    let sort = "desc";
    const pageSize = 5;

    if (req.query.page !== undefined) {
      if (reg_number.test(req.query.page.toString())) {
        page = parseInt(req.query.page.toString());
      }
    }

    if (req.query.sortBy !== undefined) {
      if (req.query.sortBy === "product_price") {
        sortBy = "product_price";
      }
    }

    if (req.query.sort !== undefined) {
      if (req.query.sort === "asc" || req.query.sort === "desc") {
        sort = req.query.sort;
      }
    }

    this.CatalogModel.fetchProductsByCategory(
      parseInt(req.params.category_id),
      page,
      pageSize,
      sortBy,
      sort,
      (err: MysqlError, rows: Array<listingPage>) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json(rows);
      }
    );
  };
}

export default catalogController;
