import bodyParser from "body-parser";
import express, { Express } from "express";

class App {
  public app: express.Application;
  public port: string;

  constructor(controllers: any, port: string) {
    this.app = express();
    this.port = port;

    this.initMiddlewares();
    this.initControllers(controllers);
  }

  private initMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use("/api/", controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`API listening on the port ${this.port}`);
    });
  }
}

export default App;
