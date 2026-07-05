/**
 * middleware/validate.js — Joi request validation middleware factory
 */

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

    const { error, value } = schema.validate(data, {
      abortEarly: false,    // Return all errors, not just the first
      stripUnknown: true,   // Remove unknown fields
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }

    // Replace original data with sanitized value
    if (source === 'body') req.body = value;
    else if (source === 'query') req.query = value;

    next();
  };
};

module.exports = validate;
