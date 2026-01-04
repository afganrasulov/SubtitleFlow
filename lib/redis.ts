import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;

// Mock Redis client to prevent crash when REDIS_URL is missing
const createMockRedis = () => {
    console.warn('⚠️  REDIS_URL not found. Using Mock Redis (features will be disabled).');
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'status') return 'wait';
            return async () => {
                console.warn(`⚠️  Mock Redis: Call to ${String(prop)} ignored.`);
                return null;
            };
        }
    }) as unknown as Redis;
};

export const redisConnection = redisUrl ? new Redis(redisUrl, {
    maxRetriesPerRequest: null,
}) : createMockRedis();
