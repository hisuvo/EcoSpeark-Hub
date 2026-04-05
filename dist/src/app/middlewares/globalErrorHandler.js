import status from "http-status";
import z from "zod";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleZodError } from "../errorHelpers/handleZodError";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (err, req, res, next) => {
    if (envVars.NODE_ENV === 'development') {
        console.log("Error from Global Error Handler", err);
    }
    let errorSources = [];
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let stack = undefined;
    //Zod Error Patttern
    /*
     error.issues;
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' , 'password' ], => username password
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ]
    */
    if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = [...simplifiedError.errorSources];
        stack = err.stack;
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ];
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ];
    }
    const errorResponse = {
        success: false,
        message: message,
        errorSources,
        error: envVars.NODE_ENV === 'development' ? err : undefined,
        stack: envVars.NODE_ENV === 'development' ? stack : undefined,
    };
    res.status(statusCode).json(errorResponse);
};
