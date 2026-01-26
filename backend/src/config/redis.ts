import Redis from 'ioredis';
import { logger } from '@/utils/logger';
import { getEnv } from './env';

// Mock Redis client for development without Redis server
class MockRedis {
  private store: Map<string, { value: string; expiry?: number }> = new Map();

  async connect(): Promise<void> {
    // Mock connect
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, { value });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, { value, expiry: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    keys.forEach(key => {
      if (this.store.delete(key)) deleted++;
    });
    return deleted;
  }

  async exists(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return 0;
    }
    
    return 1;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    
    item.expiry = Date.now() + seconds * 1000;
    return 1;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async incr(key: string): Promise<number> {
    const item = this.store.get(key);
    const currentValue = item ? parseInt(item.value) || 0 : 0;
    const newValue = currentValue + 1;
    this.store.set(key, { value: newValue.toString() });
    return newValue;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return -2; // Key doesn't exist
    if (!item.expiry) return -1; // Key exists but has no expiry
    
    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  // Redis Set operations
  private sets: Map<string, Set<string>> = new Map();

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    const set = this.sets.get(key)!;
    let added = 0;
    members.forEach(member => {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    });
    return added;
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key);
    if (!set) return 0;
    
    let removed = 0;
    members.forEach(member => {
      if (set.delete(member)) {
        removed++;
      }
    });
    
    if (set.size === 0) {
      this.sets.delete(key);
    }
    
    return removed;
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async scard(key: string): Promise<number> {
    const set = this.sets.get(key);
    return set ? set.size : 0;
  }

  async sismember(key: string, member: string): Promise<number> {
    const set = this.sets.get(key);
    return set && set.has(member) ? 1 : 0;
  }

  async quit(): Promise<'OK'> {
    this.store.clear();
    this.sets.clear();
    return 'OK';
  }

  on(event: string, callback: Function): void {
    // Mock event handlers
    if (event === 'connect' || event === 'ready') {
      setTimeout(callback, 10);
    }
  }
}

let redis: Redis | MockRedis;

export { redis };

export async function connectRedis(): Promise<Redis | MockRedis> {
  try {
    const env = getEnv();
    
    // Always use mock Redis for local development
    logger.warn('Using mock Redis for local development');
    redis = new MockRedis();
    await redis.connect();
    await redis.ping();
    logger.info('Mock Redis initialized successfully');

    return redis;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    redis = new MockRedis();
    return redis;
  }
}

export function getRedis(): Redis | MockRedis {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redis;
}

// Simple cache service for local development
export class CacheService {
  private store: Map<string, { value: any; expiry?: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.store.get(key);
      if (!item) return null;
      
      if (item.expiry && Date.now() > item.expiry) {
        this.store.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      this.store.set(key, { value, expiry });
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      this.store.delete(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const item = this.store.get(key);
      if (!item) return false;
      
      if (item.expiry && Date.now() > item.expiry) {
        this.store.delete(key);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const item = this.store.get(key);
      if (!item) return false;
      
      item.expiry = Date.now() + ttlSeconds * 1000;
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(this.store.keys()).filter(key => regex.test(key));
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.keys(pattern);
      keys.forEach(key => this.store.delete(key));
      return true;
    } catch (error) {
      logger.error(`Cache flush pattern error for ${pattern}:`, error);
      return false;
    }
  }

  // Session management
  async setSession(sessionId: string, userId: string, ttlSeconds: number = 86400): Promise<boolean> {
    return this.set(`session:${sessionId}`, { userId, createdAt: new Date() }, ttlSeconds);
  }

  async getSession(sessionId: string): Promise<{ userId: string; createdAt: Date } | null> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`);
  }

  // Translation cache
  async cacheTranslation(
    text: string,
    fromLang: string,
    toLang: string,
    translation: string,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    const key = `translation:${Buffer.from(`${text}:${fromLang}:${toLang}`).toString('base64')}`;
    return this.set(key, { translation, timestamp: new Date() }, ttlSeconds);
  }

  async getCachedTranslation(text: string, fromLang: string, toLang: string): Promise<string | null> {
    const key = `translation:${Buffer.from(`${text}:${fromLang}:${toLang}`).toString('base64')}`;
    const cached = await this.get<{ translation: string; timestamp: Date }>(key);
    return cached ? cached.translation : null;
  }

  // Price insights cache
  async cachePriceInsights(
    productName: string,
    location: string,
    insights: any,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    const key = `price:${productName}:${location}`;
    return this.set(key, insights, ttlSeconds);
  }

  async getCachedPriceInsights(productName: string, location: string): Promise<any | null> {
    const key = `price:${productName}:${location}`;
    return this.get(key);
  }
}

export const cacheService = new CacheService();

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
  try {
    if (redis) {
      await redis.quit();
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
}