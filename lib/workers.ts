import { Worker, Job } from 'bullmq';
import { redisConnection } from './redis';
import { prisma } from './prisma';
import { fetchTranscript, fetchVideoDetails } from './youtube';
import { generateLinkedInPost, generateSEOBlog, analyzeProjectThemes } from './openai';

export const setupWorkers = () => {
    // YouTube Worker
    const youtubeWorker = new Worker('youtube-queue', async (job: Job) => {
        const { type, videoId, videoItemId, apiKey } = job.data;

        try {
            if (type === 'fetch-transcript') {
                const video = await prisma.video.findUnique({ where: { id: videoItemId } });
                if (!video) throw new Error('Video not found');

                await prisma.video.update({
                    where: { id: videoItemId },
                    data: { status: 'fetching' }
                });

                try {
                    const transcript = await fetchTranscript(videoId);

                    await prisma.subtitle.create({
                        data: {
                            videoItemId,
                            language: 'en', // For now default to en, can be improved
                            contentText: transcript.text,
                            format: 'txt'
                        }
                    });

                    await prisma.video.update({
                        where: { id: videoItemId },
                        data: { status: 'fetched' }
                    });
                } catch (error: any) {
                    await prisma.video.update({
                        where: { id: videoItemId },
                        data: {
                            status: error.message === 'Transcript not available' ? 'no_caption' : 'error',
                            errorMessage: error.message
                        }
                    });
                }
            }
        } catch (error: any) {
            console.error('YouTube Worker Error:', error);
            throw error;
        }
    }, { connection: redisConnection });

    // AI Worker
    const aiWorker = new Worker('ai-queue', async (job: Job) => {
        const { type, jobId, videoItemId, projectId, transcript } = job.data;

        try {
            await prisma.aIJob.update({
                where: { id: jobId },
                data: { status: 'processing' }
            });

            let result = '';

            if (type === 'linkedin') {
                result = await generateLinkedInPost(transcript) || '';
            } else if (type === 'blog') {
                result = await generateSEOBlog(transcript) || '';
            } else if (type === 'analyze') {
                const videos = await prisma.video.findMany({
                    where: { projectId },
                    include: { subtitles: true }
                });

                const transcripts = videos
                    .filter((v: any) => v.subtitles.length > 0)
                    .map((v: any) => ({ title: v.title, text: v.subtitles[0].contentText }));

                result = await analyzeProjectThemes(transcripts) || '';
            }

            await prisma.aIJob.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    outputText: result
                }
            });
        } catch (error: any) {
            console.error('AI Worker Error:', error);
            await prisma.aIJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    errorMessage: error.message
                }
            });
            throw error;
        }
    }, { connection: redisConnection });

    console.log('Workers started successfully');
};
