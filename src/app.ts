import { config as dotenv } from "dotenv";
import express, { Application as ExApplication, Handler } from "express";
import { readdirSync } from "fs";
import path from "path";
import { IRouter } from "./utils/decorators/handler.decorator";
import { MetadataKeys } from "./utils/metadata.keys";

class App {
  private readonly _instance: ExApplication;
  private classController = [];

  get instance(): ExApplication {
    return this._instance;
  }

  constructor() {
    console.clear();
    dotenv();
    this._instance = express();
    this._instance.use(express.json());
    this.RegisterRouters();
  }

  private async RegisterRouters() {
    this._instance.get("/", (req, res) => {
      res.send({ statusCode: 200, msg: "OK", data: [], err: null });
    });

    const basename = path.basename(__filename);
    const info: Array<{ api: string; handler: string }> = [];
    readdirSync(__dirname + "/controllers")
      .filter((file) => {
        return file.indexOf(".") !== 0 && file !== basename && !file.includes("d.ts");
      })
      .forEach((file: string) => {
        const data = require("./controllers/" + file);
        this.classController.push(data);
      });

    this.classController.forEach((c, idx) => {
      Object.keys(c).forEach((k) => {
        const controllerClass = this.classController[idx][k];
        const controllerInstance: { [handleName: string]: Handler } = new controllerClass() as any;
        const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
        const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);
        const exRouter = express.Router();
        routers.forEach(({ method, path, handlerName }) => {
          exRouter[method](path, controllerInstance[String(handlerName)].bind(controllerInstance));

          info.push({
            api: `${method.toLocaleUpperCase()} ${basePath + path}`,
            handler: `${controllerClass.name}.${String(handlerName)}`,
          });
        });

        this._instance.use(basePath, exRouter);
      });
    });
    console.table(info);
  }
}

export default App;
