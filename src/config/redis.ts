import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
      });

      this.client.on('error', (err:any) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis connection closed');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }
}

export const redisClient = new RedisClient();


