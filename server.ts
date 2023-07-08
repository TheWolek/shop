import App from "./app";
import dotenv from "dotenv";

import helloController from "./app/controllers/helloController";

dotenv.config();

const port = process.env.PORT || "3000";

const app = new App([new helloController()], port);

app.listen();
