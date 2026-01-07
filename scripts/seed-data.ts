import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { UserModel } from '../src/models/User';
import { MovieModel } from '../src/models/Movie';
import { TVShowModel } from '../src/models/TVShow';
import { MyListModel } from '../src/models/MyList';

dotenv.config();


const sampleMovies = [
  {
    title: 'The Dark Universe',
    description: 'A thrilling sci-fi adventure through space and time.',
    genres: ['SciFi', 'Action'],
    releaseDate: new Date('2023-03-15'),
    director: 'Christopher Nolan',
    actors: ['Tom Hardy', 'Anne Hathaway', 'Jessica Chastain'],
  },
  {
    title: 'Laugh Out Loud',
    description: 'A hilarious comedy about everyday life mishaps.',
    genres: ['Comedy'],
    releaseDate: new Date('2023-06-20'),
    director: 'Judd Apatow',
    actors: ['Seth Rogen', 'Jonah Hill', 'Emma Stone'],
  },
  {
    title: 'The Last Stand',
    description: 'An epic action movie with breathtaking stunts.',
    genres: ['Action', 'Drama'],
    releaseDate: new Date('2023-01-10'),
    director: 'Michael Bay',
    actors: ['Dwayne Johnson', 'Chris Evans', 'Scarlett Johansson'],
  },
  {
    title: 'Haunted Mansion',
    description: 'A spine-chilling horror story set in an old estate.',
    genres: ['Horror'],
    releaseDate: new Date('2022-10-31'),
    director: 'James Wan',
    actors: ['Vera Farmiga', 'Patrick Wilson', 'Taissa Farmiga'],
  },
  {
    title: 'Love in Paris',
    description: 'A romantic tale of two souls finding each other in the City of Love.',
    genres: ['Romance', 'Drama'],
    releaseDate: new Date('2023-02-14'),
    director: 'Richard Linklater',
    actors: ['Ryan Gosling', 'Emma Watson', 'Rachel McAdams'],
  },
  {
    title: 'The Dragon Kingdom',
    description: 'An epic fantasy adventure in a magical realm.',
    genres: ['Fantasy', 'Action'],
    releaseDate: new Date('2023-07-01'),
    director: 'Peter Jackson',
    actors: ['Ian McKellen', 'Cate Blanchett', 'Orlando Bloom'],
  },
  {
    title: 'Mission Impossible 10',
    description: 'Another impossible mission becomes possible.',
    genres: ['Action', 'SciFi'],
    releaseDate: new Date('2023-08-15'),
    director: 'Christopher McQuarrie',
    actors: ['Tom Cruise', 'Rebecca Ferguson', 'Simon Pegg'],
  },
  {
    title: 'The Comedy Club',
    description: 'Stand-up comedians navigate life and relationships.',
    genres: ['Comedy', 'Romance'],
    releaseDate: new Date('2023-04-01'),
    director: 'Judd Apatow',
    actors: ['Kevin Hart', 'Tiffany Haddish', 'Ali Wong'],
  },
];

const sampleTVShows = [
  {
    title: 'Stranger Adventures',
    description: 'A group of kids uncover supernatural mysteries in their town.',
    genres: ['SciFi', 'Horror', 'Drama'],
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: new Date('2023-01-01'),
        director: 'The Duffer Brothers',
        actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Gaten Matarazzo'],
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: new Date('2023-01-08'),
        director: 'The Duffer Brothers',
        actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Gaten Matarazzo'],
      },
      {
        episodeNumber: 3,
        seasonNumber: 1,
        releaseDate: new Date('2023-01-15'),
        director: 'The Duffer Brothers',
        actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Gaten Matarazzo'],
      },
    ],
  },
  {
    title: 'The Office Chronicles',
    description: 'The hilarious daily lives of office workers.',
    genres: ['Comedy'],
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: new Date('2023-02-01'),
        director: 'Greg Daniels',
        actors: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'],
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: new Date('2023-02-08'),
        director: 'Greg Daniels',
        actors: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'],
      },
    ],
  },
  {
    title: 'Breaking Boundaries',
    description: 'A chemistry teacher turns to crime to secure his family\'s future.',
    genres: ['Drama', 'Action'],
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: new Date('2023-03-01'),
        director: 'Vince Gilligan',
        actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: new Date('2023-03-08'),
        director: 'Vince Gilligan',
        actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
      },
      {
        episodeNumber: 3,
        seasonNumber: 1,
        releaseDate: new Date('2023-03-15'),
        director: 'Vince Gilligan',
        actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
      },
    ],
  },
  {
    title: 'Fantasy Realm',
    description: 'Warriors battle for control of magical kingdoms.',
    genres: ['Fantasy', 'Drama', 'Action'],
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: new Date('2023-04-01'),
        director: 'David Benioff',
        actors: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage'],
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: new Date('2023-04-08'),
        director: 'David Benioff',
        actors: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage'],
      },
    ],
  },
];

const sampleUsers = [
  {
    username: 'john_doe',
    preferences: {
      favoriteGenres: ['Action', 'SciFi'],
      dislikedGenres: ['Horror'],
    },
    watchHistory: [],
  },
  {
    username: 'jane_smith',
    preferences: {
      favoriteGenres: ['Romance', 'Comedy', 'Drama'],
      dislikedGenres: ['Horror', 'SciFi'],
    },
    watchHistory: [],
  },
  {
    username: 'mike_wilson',
    preferences: {
      favoriteGenres: ['Fantasy', 'Action', 'SciFi'],
      dislikedGenres: ['Romance'],
    },
    watchHistory: [],
  },
  {
    username: 'sarah_johnson',
    preferences: {
      favoriteGenres: ['Comedy', 'Drama'],
      dislikedGenres: [],
    },
    watchHistory: [],
  },
];

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      UserModel.deleteMany({}),
      MovieModel.deleteMany({}),
      TVShowModel.deleteMany({}),
      MyListModel.deleteMany({}),
    ]);

    // Create users
    console.log('Creating users...');
    const users = await UserModel.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create movies
    console.log('Creating movies...');
    const movies = await MovieModel.insertMany(sampleMovies);
    console.log(`Created ${movies.length} movies`);

    // Create TV shows
    console.log('Creating TV shows...');
    const tvShows = await TVShowModel.insertMany(sampleTVShows);
    console.log(`Created ${tvShows.length} TV shows`);

    // Add some items to users' lists
    console.log('Adding items to users\' lists...');
    const myListItems = [];

    // User 1 likes action and sci-fi
    myListItems.push({
      userId: users[0]._id.toString(),
      contentId: movies[0]._id.toString(), // The Dark Universe (SciFi)
      contentType: 'movie',
      addedAt: new Date(),
    });
    myListItems.push({
      userId: users[0]._id.toString(),
      contentId: movies[2]._id.toString(), // The Last Stand (Action)
      contentType: 'movie',
      addedAt: new Date(),
    });
    myListItems.push({
      userId: users[0]._id.toString(),
      contentId: tvShows[0]._id.toString(), // Stranger Adventures
      contentType: 'tvshow',
      addedAt: new Date(),
    });

    // User 2 likes romance and comedy
    myListItems.push({
      userId: users[1]._id.toString(),
      contentId: movies[4]._id.toString(), // Love in Paris
      contentType: 'movie',
      addedAt: new Date(),
    });
    myListItems.push({
      userId: users[1]._id.toString(),
      contentId: movies[1]._id.toString(), // Laugh Out Loud
      contentType: 'movie',
      addedAt: new Date(),
    });
    myListItems.push({
      userId: users[1]._id.toString(),
      contentId: tvShows[1]._id.toString(), // The Office Chronicles
      contentType: 'tvshow',
      addedAt: new Date(),
    });

    // User 3 likes fantasy and action
    myListItems.push({
      userId: users[2]._id.toString(),
      contentId: movies[5]._id.toString(), // The Dragon Kingdom
      contentType: 'movie',
      addedAt: new Date(),
    });
    myListItems.push({
      userId: users[2]._id.toString(),
      contentId: tvShows[3]._id.toString(), // Fantasy Realm
      contentType: 'tvshow',
      addedAt: new Date(),
    });

    await MyListModel.insertMany(myListItems);
    console.log(`Created ${myListItems.length} list items`);

    // Print summary
    console.log('Seeding Summary:');
    console.log('==================');
    console.log(`Users: ${users.length}`);
    console.log(`Movies: ${movies.length}`);
    console.log(`TV Shows: ${tvShows.length}`);
    console.log(`My List Items: ${myListItems.length}`);
    console.log('Sample User IDs (use in x-user-id header):');
    users.forEach((user, index) => {
      console.log(`  ${sampleUsers[index].username}: ${user._id.toString()}`);
    });
    console.log('\n Data seeding completed successfully!');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();


