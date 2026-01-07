import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ContentType } from '../types';
import { myListService } from '../services/mylist.service';

export class MyListController {
  /**
   * Add item to My List
   * POST /api/v1/mylist
   */
  async addToMyList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId, contentType } = req.body;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          error: 'Missing x-user-id header',
        } as ApiResponse);
        return;
      }

      if (!contentId || !contentType) {
        res.status(400).json({
          success: false,
          message: 'Content ID and type are required',
          error: 'Missing required fields',
        } as ApiResponse);
        return;
      }

      if (!['movie', 'tvshow'].includes(contentType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid content type',
          error: 'Content type must be either "movie" or "tvshow"',
        } as ApiResponse);
        return;
      }

      const item = await myListService.addToMyList(userId, contentId, contentType as ContentType);

      res.status(201).json({
        success: true,
        message: 'Item added to your list successfully',
        data: item,
      } as ApiResponse);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
          error: 'Duplicate item',
        } as ApiResponse);
      } else if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'Content not found',
        } as ApiResponse);
      } else {
        next(error);
      }
    }
  }

  /**
   * Remove item from My List
   * DELETE /api/v1/mylist/:contentId
   */
  async removeFromMyList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          error: 'Missing x-user-id header',
        } as ApiResponse);
        return;
      }

      if (!contentId) {
        res.status(400).json({
          success: false,
          message: 'Content ID is required',
          error: 'Missing content ID',
        } as ApiResponse);
        return;
      }

      await myListService.removeFromMyList(userId, contentId);

      res.status(200).json({
        success: true,
        message: 'Item removed from your list successfully',
      } as ApiResponse);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
          error: 'Item not found',
        } as ApiResponse);
      } else {
        next(error);
      }
    }
  }

  /**
   * Get My List with pagination
   * GET /api/v1/mylist?page=1&limit=20
   */
  async getMyList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          error: 'Missing x-user-id header',
        } as ApiResponse);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
          error: 'Page must be >= 1, limit must be between 1 and 100',
        } as ApiResponse);
        return;
      }

      const result = await myListService.getMyList(userId, page, limit);

      res.status(200).json({
        success: true,
        message: 'My list retrieved successfully',
        data: result,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if item is in My List
   * GET /api/v1/mylist/check/:contentId
   */
  async checkInMyList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          error: 'Missing x-user-id header',
        } as ApiResponse);
        return;
      }

      const isInList = await myListService.isInMyList(userId, contentId);

      res.status(200).json({
        success: true,
        message: 'Check completed',
        data: { inList: isInList },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get My List count
   * GET /api/v1/mylist/count
   */
  async getMyListCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          error: 'Missing x-user-id header',
        } as ApiResponse);
        return;
      }

      const count = await myListService.getMyListCount(userId);

      res.status(200).json({
        success: true,
        message: 'Count retrieved successfully',
        data: { count },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const myListController = new MyListController();


