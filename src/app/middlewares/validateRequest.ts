import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
    }

    req.body = parseResult.data;

    next();
  };
};

export default validateRequest;
