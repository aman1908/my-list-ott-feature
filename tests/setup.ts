import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { redisClient } from '../src/config/redis';
import { UserModel } from '../src/models/User';
import { MovieModel } from '../src/models/Movie';
import { TVShowModel } from '../src/models/TVShow';
import { MyListModel } from '../src/models/MyList';

// Use test database
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ott-platform-test';
process.env.CACHE_ENABLED = 'false'; // Disable cache for tests

beforeAll(async () => {
  await connectDatabase();
  await redisClient.connect();
});

afterAll(async () => {
  await disconnectDatabase();
  await redisClient.disconnect();
});

beforeEach(async () => {
  // Clean up all collections before each test
  await Promise.all([
    UserModel.deleteMany({}),
    MovieModel.deleteMany({}),
    TVShowModel.deleteMany({}),
    MyListModel.deleteMany({}),
  ]);
});


