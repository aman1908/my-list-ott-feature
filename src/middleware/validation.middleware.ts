import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errorMessage,
      } as ApiResponse);
      return;
    }

    next();
  };
};

// Validation schemas
export const addToMyListSchema = Joi.object({
  contentId: Joi.string().required().trim().messages({
    'string.empty': 'Content ID is required',
    'any.required': 'Content ID is required',
  }),
  contentType: Joi.string().valid('movie', 'tvshow').required().messages({
    'string.empty': 'Content type is required',
    'any.required': 'Content type is required',
    'any.only': 'Content type must be either "movie" or "tvshow"',
  }),
});


