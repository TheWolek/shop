import express, { Request, Response } from "express";
import helloModel from "../models/helloModel";

class helloController {
  public path = "/hello";
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.fetchAll);
  }

  fetchAll = (req: Request, res: Response) => {
    const HelloModel = new helloModel();

    HelloModel.fetchAll((err: any, rows: any) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(rows);
    });
  };
}

export default helloController;
