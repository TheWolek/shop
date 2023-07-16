import express, { Request, Response } from "express";

import throwGenericError from "../../helpers/throwGenericError";
import { MysqlError, OkPacket } from "mysql";
import basketModel from "../../models/basket/basketModel";
import { createBasketReq } from "../../types/basket/basketTypes";

class basketController {
  public path = "/basket";
  public router = express.Router();

  constructor() {
    this.initRoutes();
    console.log(`Controller ${this.path} initialized`);
  }

  public initRoutes() {
    this.router.post(this.path, this.createBasket);
    this.router.get(this.path, this.getBasket);
  }

  private BasketModel = new basketModel();

  createBasket = (req: Request<{}, {}, createBasketReq>, res: Response) => {
    this.BasketModel.createBasket(
      req.body.items,
      (err: MysqlError | string, basket: any) => {
        if (err) {
          if (String(err).includes("Podane"))
            return throwGenericError(res, 400, err);

          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        return res.status(200).json(basket);
      }
    );
  };

  getBasket = (
    req: Request<{}, {}, {}, { basketToken: string }>,
    res: Response
  ) => {
    if (req.query.basketToken === undefined || req.query.basketToken === "") {
      return throwGenericError(res, 400, "Pole basketToken jest wymagane");
    }

    this.BasketModel.returnBasket(
      req.query.basketToken,
      (err: MysqlError, basket: any) => {
        if (err) {
          return throwGenericError(res, 500, "Błąd serwera SQL", err);
        }

        if (basket.basket_token === "") {
          return throwGenericError(res, 404, "Nieznaleziono koszyka");
        }
        return res.status(200).json(basket);
      }
    );
  };
}

export default basketController;
