import { Router } from 'express';
import { myListController } from '../controllers/mylist.controller';
import { validateRequest, addToMyListSchema } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   POST /api/v1/mylist
 * @desc    Add item to My List
 * @access  Private (requires x-user-id header)
 */
router.post(
  '/',
  validateRequest(addToMyListSchema),
  myListController.addToMyList.bind(myListController)
);

/**
 * @route   DELETE /api/v1/mylist/:contentId
 * @desc    Remove item from My List
 * @access  Private (requires x-user-id header)
 */
router.delete('/:contentId', myListController.removeFromMyList.bind(myListController));

/**
 * @route   GET /api/v1/mylist
 * @desc    Get My List with pagination
 * @access  Private (requires x-user-id header)
 * @query   page (default: 1), limit (default: 20, max: 100)
 */
router.get('/', myListController.getMyList.bind(myListController));

/**
 * @route   GET /api/v1/mylist/check/:contentId
 * @desc    Check if item is in My List
 * @access  Private (requires x-user-id header)
 */
router.get('/check/:contentId', myListController.checkInMyList.bind(myListController));

/**
 * @route   GET /api/v1/mylist/count
 * @desc    Get My List count
 * @access  Private (requires x-user-id header)
 */
router.get('/count', myListController.getMyListCount.bind(myListController));

export default router;

