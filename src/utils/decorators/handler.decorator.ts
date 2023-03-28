import { NextFunction, Request, Response } from "express";
import { MetadataKeys } from "../metadata.keys";

export enum Methods {
  GET = "get",
  POST = "post",
}

export enum Middlewares {
  AUTHORIZATION = "authorization",
}

export interface IRouter {
  method: Methods;
  path: string;
  middleware: string | undefined;
  handlerName: string | symbol;
}

const methodDecoratorFactory = (method: Methods) => {
  return (path: string): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor;
      const routers: IRouter[] = Reflect.hasMetadata(MetadataKeys.ROUTERS, controllerClass)
        ? Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass)
        : [];

      routers.push({
        method,
        path,
        middleware: undefined,
        handlerName: propertyKey,
      });

      Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
    };
  };
};

function middlewareDecorator(middlewareFunction: any) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      middlewareFunction(args[0], args[1], (err: any) => {
        if (err) {
          args[2](err);
        } else {
          originalMethod.apply(this, args);
        }
      });
    };
    return descriptor;
  };
}

function middlewareFunction(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization)
    return res.status(401).send({ statusCode: res.statusCode, msg: "!OK", err: "authorization required.!" });
  if (authorization.split(" ")[0] !== "Bearer")
    return res.status(401).send({ statusCode: res.statusCode, msg: "!OK", err: "authorization jwt.!" });
  const token: string = authorization.split(" ")[1];
  if (!token || token === undefined)
    return res.status(401).send({ statusCode: res.statusCode, msg: "!OK", err: "authorization required.!" });
  try {
    // const decoded = verify(token, `${process.env.SIGNATURE}`);
    // const payload = decoded as iToken;
    // res.locals = payload;
    return next();
  } catch (error) {
    return res.status(401).send({ statusCode: res.statusCode, msg: "!OK", err: "middleware error" });
  }
}

export const Get = methodDecoratorFactory(Methods.GET);
export const Post = methodDecoratorFactory(Methods.POST);
export const AuthToken = () => middlewareDecorator(middlewareFunction);
