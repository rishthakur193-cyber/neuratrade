import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any, any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors: error.issues.map((err: any) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            return next(error);
        }
    };
};
