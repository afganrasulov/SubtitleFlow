'use client';

import { useState, useEffect } from 'react';
import { Plus, Folder, Video, ChevronRight, BarChart3, Loader2, Search, Calendar, MapPin, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });
      const data = await res.json();
      setProjects([data, ...projects]);
      setIsModalOpen(false);
      setNewProjectName('');
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['All', 'Recent', 'Transcribed', 'Analyzing'];

  return (
    <main className="container animate-fade-in">
      {/* Header Info - Similar to Reference Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', marginBottom: '8px', fontSize: '0.875rem' }}>
            <MapPin size={16} />
            <span>Project Workspace</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1.2' }}>
            Start Your First <span style={{ color: 'var(--primary)', position: 'relative' }}>
              Journey
              <svg style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '8px' }} viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5" stroke="var(--primary)" strokeWidth="2" fill="none" opacity="0.4" />
              </svg>
            </span><br />
            Enjoy Today.
          </h1>
        </div>
        <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '100px', boxShadow: 'var(--soft-shadow)' }}>
          <button style={{ padding: '8px', borderRadius: '100px', background: 'var(--foreground)', color: 'white', border: 'none' }}><Sun size={18} /></button>
          <button style={{ padding: '8px', borderRadius: '100px', background: 'transparent', color: 'var(--muted)', border: 'none' }}><Moon size={18} /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={20} color="var(--muted)" />
        <input type="text" placeholder="Search projects..." />
      </div>

      {/* Tabs / Categories */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button
          className="pill-tab"
          style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'white', fontWeight: '600' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} style={{ marginRight: '4px' }} />
          New Project
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>My Active Projects</h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {projects.map((project, idx) => (
            <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                className="premium-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ height: '160px', background: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Folder size={48} color="var(--primary)" opacity={0.2} />
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' }}>
                    Active
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{project.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Video size={14} />
                        <span>{project._count?.videos || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '100px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="premium-card"
              style={{ width: '100%', maxWidth: '450px', padding: '32px' }}
            >
              <h2 style={{ marginBottom: '8px' }}>Create New Project</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Enter a name to start your transcribe journey.</p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. YouTube Masterclass"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '16px',
                    background: '#f8f9fa', border: '1px solid var(--card-border)',
                    color: 'var(--foreground)', outline: 'none', fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={createProject}>Create Project</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
