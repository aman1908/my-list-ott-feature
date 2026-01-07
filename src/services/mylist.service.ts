import { MyListModel } from '../models/MyList';
import { MovieModel } from '../models/Movie';
import { TVShowModel } from '../models/TVShow';
import { ContentType, PaginatedResponse, MyListItem } from '../types';
import { redisClient } from '../config/redis';

export class MyListService {
  private readonly CACHE_TTL = parseInt(process.env.CACHE_TTL || '300'); // 5 minutes default
  private readonly CACHE_ENABLED = process.env.CACHE_ENABLED === 'true';

  async addToMyList(
    userId: string,
    contentId: string,
    contentType: ContentType
  ): Promise<MyListItem> {
    await this.validateContent(contentId, contentType);

    const existing = await MyListModel.findOne({ userId, contentId });
    if (existing) {
      throw new Error('Item already exists in your list');
    }
    const listItem = new MyListModel({
      userId,
      contentId,
      contentType,
      addedAt: new Date(),
    });

    await listItem.save();
    await this.invalidateUserCache(userId);
    return listItem.toJSON() as MyListItem;
  }

  /**
   * Remove item from user's list
   */
  async removeFromMyList(userId: string, contentId: string): Promise<void> {
    const result = await MyListModel.findOneAndDelete({ userId, contentId });

    if (!result) {
      throw new Error('Item not found in your list');
    }

    // Invalidate user's cache
    await this.invalidateUserCache(userId);
  }

  /**
   * Get user's list with pagination
   * Uses Redis caching for optimal performance (<10ms)
   */
  async getMyList(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<MyListItem & { content: any }>> {
    const cacheKey = `mylist:${userId}:${page}:${limit}`;

    // Try to get from cache first
    if (this.CACHE_ENABLED && redisClient.isReady()) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get list items with content details
    const [items, totalItems] = await Promise.all([
      MyListModel.find({ userId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MyListModel.countDocuments({ userId }),
    ]);

    // Fetch content details for each item
    const itemsWithContent = await Promise.all(
      items.map(async (item) => {
        const content =
          item.contentType === 'movie'
            ? await MovieModel.findById(item.contentId).lean()
            : await TVShowModel.findById(item.contentId).lean();

        return {
          id: item._id.toString(),
          userId: item.userId,
          contentId: item.contentId,
          contentType: item.contentType,
          addedAt: item.addedAt,
          content: content
            ? {
                ...content,
                id: content._id.toString(),
                _id: undefined,
                __v: undefined,
              }
            : null,
        };
      })
    );

    // Build response
    const totalPages = Math.ceil(totalItems / limit);
    const response: PaginatedResponse<MyListItem & { content: any }> = {
      data: itemsWithContent,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Cache the response
    if (this.CACHE_ENABLED && redisClient.isReady()) {
      await redisClient.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    }

    return response;
  }

  /**
   * Check if content exists in user's list
   */
  async isInMyList(userId: string, contentId: string): Promise<boolean> {
    const item = await MyListModel.findOne({ userId, contentId });
    return !!item;
  }

  /**
   * Get count of items in user's list
   */
  async getMyListCount(userId: string): Promise<number> {
    return await MyListModel.countDocuments({ userId });
  }

  /**
   * Validate that content exists in database
   */
  private async validateContent(contentId: string, contentType: ContentType): Promise<void> {
    const Model = contentType === 'movie' ? MovieModel : TVShowModel;
    const exists = await Model.exists({ _id: contentId });

    if (!exists) {
      throw new Error(`${contentType} with id ${contentId} not found`);
    }
  }

  /**
   * Invalidate all cached entries for a user
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    if (this.CACHE_ENABLED && redisClient.isReady()) {
      await redisClient.delPattern(`mylist:${userId}:*`);
    }
  }
}

export const myListService = new MyListService();


