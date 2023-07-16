import App from "./app";
import dotenv from "dotenv";

import helloController from "./app/controllers/helloController";
import catalogController from "./app/controllers/catalog/catalogController";
import productController from "./app/controllers/product/productController";
import basketController from "./app/controllers/basket/basketController";

dotenv.config();

const port = process.env.PORT || "3000";

const controllers = [
  new helloController(),
  new catalogController(),
  new productController(),
  new basketController(),
];

const app = new App(controllers, port);

app.listen();
