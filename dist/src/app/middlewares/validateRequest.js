const validateRequest = (schema) => {
    return (req, res, next) => {
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
