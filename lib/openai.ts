import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'missing_api_key',
});

export const generateLinkedInPost = async (transcript: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are an expert social media manager specializing in high-engagement LinkedIn posts. Transform the provided video transcript into a compelling LinkedIn post.',
            },
            {
                role: 'user',
                content: `Transcript: ${transcript.substring(0, 18000)}\n\nRequirements:\n1. Hook: Start with a strong statement or question.\n2. Body: Breakdown the key points into a readable, list-style format.\n3. CTA: End with a question to drive comments.\n4. Style: Use professional yet conversational tone with relevant emojis.`,
            },
        ],
    });

    return response.choices[0].message.content;
};

export const generateSEOBlog = async (transcript: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a professional content writer and SEO expert. Transform the provided video transcript into a high-quality, SEO-optimized blog post.',
            },
            {
                role: 'user',
                content: `Transcript: ${transcript.substring(0, 18000)}\n\nRequirements:\n1. Structure: Include an H1 title and multiple H2 sections.\n2. SEO: Include relevant keywords naturally.\n3. Meta: Provide a compelling meta description.\n4. Summary: Start with a brief "What you will learn" section.\n5. Content: Elaborate on points made in the transcript to provide value.`,
            },
        ],
    });

    return response.choices[0].message.content;
};

export const analyzeProjectThemes = async (transcripts: { title: string, text: string }[]) => {
    const combinedText = transcripts
        .map(t => `TITLE: ${t.title}\nCONTENT: ${t.text.substring(0, 3000)}`)
        .join('\n\n---\n\n');

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a data analyst and content strategist. Analyze the provided transcripts from multiple videos and identify common themes, recurring patterns, and topic clusters.',
            },
            {
                role: 'user',
                content: `Transcripts:\n${combinedText}\n\nProvide a comprehensive report including:\n1. Common Themes: The primary topics discussed across the videos.\n2. Recurring Patterns: Specific advice or concepts that appear frequently.\n3. Content Suggestions: New video/blog ideas based on the existing content gaps or successful themes.\n4. Executive Summary: A high-level overview of the entire project content.`,
            },
        ],
    });

    return response.choices[0].message.content;
};
