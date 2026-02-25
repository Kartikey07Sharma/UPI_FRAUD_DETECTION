// middleware/validation.middleware.js

/**
 * Generic validation middleware
 * @param {Array} requiredFields - list of required fields in req.body
 */
export function validateBody(requiredFields = []) {
    return (req, res, next) => {
        const missingFields = [];

        for (const field of requiredFields) {
            if (
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
            ) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                missing_fields: missingFields
            });
        }

        next(); // ✅ validation passed
    };
}
