import { ZodObject, ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors: error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            return next(error);
        }
    };
};
