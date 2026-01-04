import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const youtube = google.youtube('v3');

export const parseYoutubeUrl = (url: string) => {
    const videoRegex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
    const playlistRegex = /[&?]list=([0-9A-Za-z_-]+).*/;

    const videoMatch = url.match(videoRegex);
    const playlistMatch = url.match(playlistRegex);

    return {
        videoId: videoMatch ? videoMatch[1] : null,
        playlistId: playlistMatch ? playlistMatch[1] : null,
    };
};

export const fetchVideoDetails = async (videoId: string, apiKey: string) => {
    const response = await youtube.videos.list({
        key: apiKey,
        part: ['snippet'],
        id: [videoId],
    });

    const item = response.data.items?.[0];
    if (!item) throw new Error('Video not found');

    return {
        videoId: videoId,
        title: item.snippet?.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
    };
};

export const fetchPlaylistVideos = async (playlistId: string, apiKey: string) => {
    let videos: any[] = [];
    let nextPageToken: string | undefined = undefined;

    try {
        do {
            const response: any = await youtube.playlistItems.list({
                key: apiKey,
                part: ['snippet', 'contentDetails'],
                playlistId: playlistId,
                maxResults: 50,
                pageToken: nextPageToken,
            });

            const items = response.data.items || [];
            videos = videos.concat(items.map((item: any) => ({
                videoId: item.contentDetails?.videoId,
                title: item.snippet?.title,
                url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
            })));

            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        throw error;
    }

    return videos;
};

export const fetchTranscript = async (videoId: string, lang: string = 'en') => {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        return {
            text: transcript.map(t => t.text).join(' '),
            segments: transcript.map(t => ({
                text: t.text,
                start: t.offset,
                duration: t.duration,
            })),
        };
    } catch (error: any) {
        if (error.message?.includes('Could not find transcript')) {
            // Try fetching without lang to get whatever is available
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                return {
                    text: transcript.map(t => t.text).join(' '),
                    segments: transcript.map(t => ({
                        text: t.text,
                        start: t.offset,
                        duration: t.duration,
                    })),
                };
            } catch (innerError) {
                throw new Error('Transcript not available');
            }
        }
        throw error;
    }
};
