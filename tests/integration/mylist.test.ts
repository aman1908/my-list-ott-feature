import request from 'supertest';
import app from '../../src/server';
import { UserModel } from '../../src/models/User';
import { MovieModel } from '../../src/models/Movie';
import { TVShowModel } from '../../src/models/TVShow';
import { MyListModel } from '../../src/models/MyList';
import '../setup';

describe('My List API Integration Tests', () => {
  let testUserId: string;
  let testMovieId: string;
  let testTVShowId: string;

  beforeEach(async () => {
    // Create test user
    const user = await UserModel.create({
      username: 'testuser',
      preferences: {
        favoriteGenres: ['Action', 'SciFi'],
        dislikedGenres: ['Horror'],
      },
      watchHistory: [],
    });
    testUserId = user._id.toString();

    // Create test movie
    const movie = await MovieModel.create({
      title: 'Test Movie',
      description: 'A test movie description',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('2023-01-01'),
      director: 'Test Director',
      actors: ['Actor 1', 'Actor 2'],
    });
    testMovieId = movie._id.toString();

    // Create test TV show
    const tvShow = await TVShowModel.create({
      title: 'Test TV Show',
      description: 'A test TV show description',
      genres: ['Drama', 'Comedy'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2023-01-01'),
          director: 'Episode Director',
          actors: ['Actor 3', 'Actor 4'],
        },
      ],
    });
    testTVShowId = tvShow._id.toString();
  });

  describe('POST /api/v1/mylist - Add to My List', () => {
    it('should successfully add a movie to my list', async () => {
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: testMovieId,
          contentType: 'movie',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to your list successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.contentId).toBe(testMovieId);
      expect(response.body.data.contentType).toBe('movie');
      expect(response.body.data.userId).toBe(testUserId);
    });

    it('should successfully add a TV show to my list', async () => {
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: testTVShowId,
          contentType: 'tvshow',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contentType).toBe('tvshow');
    });

    it('should fail when missing user authentication', async () => {
      const response = await request(app).post('/api/v1/mylist').send({
        contentId: testMovieId,
        contentType: 'movie',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User authentication required');
    });

    it('should fail when missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: testMovieId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail when content type is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: testMovieId,
          contentType: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail when content does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: '507f1f77bcf86cd799439011', // Valid ObjectId but doesn't exist
          contentType: 'movie',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail when adding duplicate item', async () => {
      // Add first time
      await request(app).post('/api/v1/mylist').set('x-user-id', testUserId).send({
        contentId: testMovieId,
        contentType: 'movie',
      });

      // Try to add again
      const response = await request(app)
        .post('/api/v1/mylist')
        .set('x-user-id', testUserId)
        .send({
          contentId: testMovieId,
          contentType: 'movie',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/v1/mylist/:contentId - Remove from My List', () => {
    beforeEach(async () => {
      // Add an item to the list
      await MyListModel.create({
        userId: testUserId,
        contentId: testMovieId,
        contentType: 'movie',
        addedAt: new Date(),
      });
    });

    it('should successfully remove an item from my list', async () => {
      const response = await request(app)
        .delete(`/api/v1/mylist/${testMovieId}`)
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item removed from your list successfully');

      // Verify it's removed
      const item = await MyListModel.findOne({ userId: testUserId, contentId: testMovieId });
      expect(item).toBeNull();
    });

    it('should fail when missing user authentication', async () => {
      const response = await request(app).delete(`/api/v1/mylist/${testMovieId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail when item is not in the list', async () => {
      const response = await request(app)
        .delete(`/api/v1/mylist/${testTVShowId}`)
        .set('x-user-id', testUserId);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/v1/mylist - Get My List with Pagination', () => {
    beforeEach(async () => {
      // Add multiple items to the list
      const items = [];
      for (let i = 0; i < 25; i++) {
        const movie = await MovieModel.create({
          title: `Movie ${i}`,
          description: `Description ${i}`,
          genres: ['Action'],
          releaseDate: new Date('2023-01-01'),
          director: 'Director',
          actors: ['Actor'],
        });

        items.push({
          userId: testUserId,
          contentId: movie._id.toString(),
          contentType: 'movie',
          addedAt: new Date(Date.now() - i * 1000), // Different timestamps for ordering
        });
      }
      await MyListModel.insertMany(items);
    });

    it('should get my list with default pagination', async () => {
      const response = await request(app).get('/api/v1/mylist').set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.data.length).toBeLessThanOrEqual(20);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalItems).toBe(25);
      expect(response.body.data.pagination.totalPages).toBe(2);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
      expect(response.body.data.pagination.hasPrevPage).toBe(false);
    });

    it('should get my list with custom pagination', async () => {
      const response = await request(app)
        .get('/api/v1/mylist?page=2&limit=10')
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBeLessThanOrEqual(10);
      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.itemsPerPage).toBe(10);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
      expect(response.body.data.pagination.hasPrevPage).toBe(true);
    });

    it('should include content details in list items', async () => {
      const response = await request(app).get('/api/v1/mylist').set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      const firstItem = response.body.data.data[0];
      expect(firstItem).toHaveProperty('content');
      expect(firstItem.content).toHaveProperty('title');
      expect(firstItem.content).toHaveProperty('description');
      expect(firstItem.content).toHaveProperty('genres');
    });

    it('should fail with invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/mylist?page=0&limit=101')
        .set('x-user-id', testUserId);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail when missing user authentication', async () => {
      const response = await request(app).get('/api/v1/mylist');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return empty list for user with no items', async () => {
      // Create new user with no items
      const newUser = await UserModel.create({
        username: 'emptyuser',
        preferences: { favoriteGenres: [], dislikedGenres: [] },
        watchHistory: [],
      });

      const response = await request(app)
        .get('/api/v1/mylist')
        .set('x-user-id', newUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.pagination.totalItems).toBe(0);
    });
  });

  describe('GET /api/v1/mylist/check/:contentId - Check if in My List', () => {
    beforeEach(async () => {
      await MyListModel.create({
        userId: testUserId,
        contentId: testMovieId,
        contentType: 'movie',
        addedAt: new Date(),
      });
    });

    it('should return true when item is in list', async () => {
      const response = await request(app)
        .get(`/api/v1/mylist/check/${testMovieId}`)
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inList).toBe(true);
    });

    it('should return false when item is not in list', async () => {
      const response = await request(app)
        .get(`/api/v1/mylist/check/${testTVShowId}`)
        .set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inList).toBe(false);
    });
  });

  describe('GET /api/v1/mylist/count - Get My List Count', () => {
    it('should return correct count', async () => {
      // Add 3 items
      await MyListModel.insertMany([
        { userId: testUserId, contentId: testMovieId, contentType: 'movie', addedAt: new Date() },
        {
          userId: testUserId,
          contentId: testTVShowId,
          contentType: 'tvshow',
          addedAt: new Date(),
        },
        {
          userId: testUserId,
          contentId: '507f1f77bcf86cd799439011',
          contentType: 'movie',
          addedAt: new Date(),
        },
      ]);

      const response = await request(app).get('/api/v1/mylist/count').set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(3);
    });

    it('should return 0 for empty list', async () => {
      const response = await request(app).get('/api/v1/mylist/count').set('x-user-id', testUserId);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /health - Health Check', () => {
    it('should return server health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('Performance Tests', () => {
    it('should retrieve list in under 100ms (with database)', async () => {
      // Add 50 items
      const items = [];
      for (let i = 0; i < 50; i++) {
        const movie = await MovieModel.create({
          title: `Performance Movie ${i}`,
          description: `Description ${i}`,
          genres: ['Action'],
          releaseDate: new Date(),
          director: 'Director',
          actors: ['Actor'],
        });
        items.push({
          userId: testUserId,
          contentId: movie._id.toString(),
          contentType: 'movie',
          addedAt: new Date(),
        });
      }
      await MyListModel.insertMany(items);

      const start = Date.now();
      const response = await request(app).get('/api/v1/mylist').set('x-user-id', testUserId);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
      console.log(`List retrieval took ${duration}ms`);
    });
  });
});


