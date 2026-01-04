'use client';

import { useState, useEffect, use } from 'react';
import {
    Plus, Youtube, FileText, CheckCircle2, XCircle, AlertCircle,
    Loader2, Download, Zap, BarChart3, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState('');
    const [adding, setAdding] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchProject();
        const interval = setInterval(fetchProject, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, []);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            setProject(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addVideo = async () => {
        if (!url) return;
        setAdding(true);
        try {
            await fetch(`/api/projects/${id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            setUrl('');
            fetchProject();
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'analyze', projectId: id }),
            });
            fetchProject();
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading && !project) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case 'fetched': return <CheckCircle2 size={16} color="var(--secondary)" />;
            case 'no_caption': return <XCircle size={16} color="var(--accent)" />;
            case 'error': return <AlertCircle size={16} color="var(--accent)" />;
            case 'pending':
            case 'fetching': return <Loader2 size={16} className="animate-spin" color="var(--primary)" />;
            default: return null;
        }
    };

    return (
        <main className="container animate-fade-in">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '24px' }}>
                <ChevronLeft size={16} />
                <span>Back to Dashboard</span>
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{project?.name}</h1>
                    <p style={{ color: 'var(--muted)' }}>{project?.videos?.length || 0} Videos in this project</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={runAnalysis} disabled={analyzing}>
                        {analyzing ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                        <span style={{ marginLeft: '8px' }}>Project Analysis</span>
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} />
                        <span>Export ZIP</span>
                    </button>
                </div>
            </div>

            <div className="premium-card" style={{ padding: '32px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>Add YouTube Content</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Youtube style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--muted)' }} size={20} />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste Video or Playlist URL"
                            style={{
                                width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
                                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                                color: 'white', outline: 'none'
                            }}
                        />
                    </div>
                    <button className="btn-primary" onClick={addVideo} disabled={adding}>
                        {adding ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                        <span style={{ marginLeft: '8px' }}>Add Content</span>
                    </button>
                </div>
            </div>

            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Video Title</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Subtitles</th>
                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project?.videos?.map((video: any) => (
                            <tr key={video.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{video.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Youtube size={12} />
                                        <span>{video.youtubeVideoId}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                        {statusIcon(video.status)}
                                        <span style={{ textTransform: 'capitalize' }}>{video.status.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    {video.subtitles?.[0] ? (
                                        <div style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                                            <FileText size={14} />
                                            <span>{video.subtitles[0].language.toUpperCase()} ({video.subtitles[0].format})</span>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>None</span>
                                    )}
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <Link href={`/videos/${video.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>Details</span>
                                            <ChevronRight size={14} />
                                        </Link>
                                        <a href={video.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px' }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {project?.videos?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                        <Youtube size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p>No content added yet. Paste a link above to get started.</p>
                    </div>
                )}
            </div>

            {project?.aiJobs?.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Project Analysis Reports</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                        {project.aiJobs.filter((j: any) => j.type === 'analyze').map((job: any) => (
                            <div key={job.id} className="premium-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BarChart3 size={18} color="var(--primary)" />
                                        <span style={{ fontWeight: 600 }}>Theme Analysis</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {job.status === 'completed' ? (
                                    <div style={{ height: '200px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 50%, transparent)', fontSize: '0.875rem', lineBreak: 'anywhere' }}>
                                        {job.outputText}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing analysis...</span>
                                    </div>
                                )}
                                {job.status === 'completed' && (
                                    <button className="btn-secondary" style={{ width: '100%', marginTop: '16px' }}>View Full Report</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
