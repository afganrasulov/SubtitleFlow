'use client';

import { useState, useEffect } from 'react';
import {
    Loader2, ChevronLeft, Sparkles, FileText,
    Linkedin, Globe, Copy, Check, Download, Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function VideoDetail({ params }: { params: { id: string } }) {
    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        fetchVideo();
        const interval = setInterval(() => {
            // Only pool if there's a pending job
            if (video?.aiJobs?.some((j: any) => j.status === 'pending' || j.status === 'processing')) {
                fetchVideo();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [video?.aiJobs]);

    const fetchVideo = async () => {
        try {
            const res = await fetch(`/api/videos/${params.id}`);
            const data = await res.json();
            setVideo(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startAiJob = async (type: 'linkedin' | 'blog') => {
        setGenerating(type);
        try {
            await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, videoItemId: params.id }),
            });
            fetchVideo();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(null);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading && !video) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const transcript = video?.subtitles?.[0]?.contentText || '';

    return (
        <main className="container animate-fade-in">
            <Link href={`/projects/${video?.projectId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '24px' }}>
                <ChevronLeft size={16} />
                <span>Back to Project</span>
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '12px' }}>{video?.title}</h1>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)' }}>
                        <a href={video?.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', textDecoration: 'none' }}>
                            <Youtube size={16} />
                            <span>Watch on YouTube</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={16} />
                            <span>{Math.round(transcript.split(' ').length)} words</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* Transcript Section */}
                <section>
                    <div className="premium-card" style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={20} color="var(--primary)" />
                                Transcript
                            </h3>
                            <button className="btn-secondary" onClick={() => copyToClipboard(transcript, 'transcript')}>
                                {copied === 'transcript' ? <Check size={16} color="var(--secondary)" /> : <Copy size={16} />}
                                <span style={{ marginLeft: '8px' }}>Copy Text</span>
                            </button>
                        </div>
                        <div style={{
                            flex: 1, color: 'rgba(255,255,255,0.8)', lineHeight: '1.7',
                            fontSize: '1rem', whiteSpace: 'pre-wrap', maxHeight: '70vh',
                            overflowY: 'auto', paddingRight: '12px'
                        }}>
                            {transcript || (video?.status === 'fetching' ? 'Fetching transcript...' : 'No transcript available for this video.')}
                        </div>
                    </div>
                </section>

                {/* AI Generator Section */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="premium-card" style={{ padding: '32px' }}>
                        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={20} color="var(--primary)" />
                            Generate Content
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                className="btn-primary"
                                onClick={() => startAiJob('linkedin')}
                                disabled={!!generating || !transcript}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px' }}
                            >
                                {generating === 'linkedin' ? <Loader2 size={24} className="animate-spin" /> : <Linkedin size={24} />}
                                <span>LinkedIn Post</span>
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => startAiJob('blog')}
                                disabled={!!generating || !transcript}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', background: 'linear-gradient(135deg, var(--secondary), #059669)' }}
                            >
                                {generating === 'blog' ? <Loader2 size={24} className="animate-spin" /> : <Globe size={24} />}
                                <span>SEO Blog</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Outputs</h4>
                        {video?.aiJobs?.filter((j: any) => j.type !== 'analyze').map((job: any) => (
                            <motion.div
                                key={job.id}
                                className="premium-card"
                                layout
                                style={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {job.type === 'linkedin' ? <Linkedin size={14} color="#0a66c2" /> : <Globe size={14} color="var(--secondary)" />}
                                        <span style={{ textTransform: 'capitalize' }}>{job.type} Post</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {job.status === 'completed' && (
                                            <button
                                                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                                                onClick={() => copyToClipboard(job.outputText, job.id)}
                                            >
                                                {copied === job.id ? <Check size={14} color="var(--secondary)" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {job.status === 'processing' || job.status === 'pending' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--primary)' }}>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>AI is writing...</span>
                                    </div>
                                ) : job.status === 'failed' ? (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>Failed to generate.</div>
                                ) : (
                                    <div style={{
                                        fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)',
                                        lineHeight: '1.5', maxHeight: '150px', overflow: 'hidden',
                                        display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical'
                                    }}>
                                        {job.outputText}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </aside>
            </div>
        </main>
    );
}
