import { Request, Response } from "express";
import Controller from "../utils/decorators/controller.decorator";
import { AuthToken, Get } from "../utils/decorators/handler.decorator";

@Controller("/auth")
export class Auth {
  @Get("/register")
  public async RegisterMember(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).send({ statusCode: res.statusCode, msg: "OK", data: [], err: null });
    } catch (err) {
      if (err.statusCode)
        return res.status(err.statusCode).send({ statusCode: res.statusCode, msg: "!OK", err: err.err });
      return res.status(500).send({ statusCode: res.statusCode, msg: "!OK", err: err.err });
    }
  }

  @Get("/login")
  @AuthToken()
  public async Login(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).send({ statusCode: res.statusCode, msg: "OK", data: [], err: null });
    } catch (err) {
      if (err.statusCode)
        return res.status(err.statusCode).send({ statusCode: res.statusCode, msg: "!OK", err: err.err });
      return res.status(500).send({ statusCode: res.statusCode, msg: "!OK", err: err.err });
    }
  }
}
