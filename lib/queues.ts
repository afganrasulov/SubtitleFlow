import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const youtubeQueue = new Queue('youtube-queue', {
    connection: redisConnection,
});

export const aiQueue = new Queue('ai-queue', {
    connection: redisConnection,
});
