import React, { useState, useEffect } from 'react';
import { committeeAPI } from '../../utils/api';
import { toast } from '../../utils/toast';
import { Plus, X, Users, Crown, Trash2, UserPlus } from 'lucide-react';

const CommitteesTab = ({ event, user, isHead, onRefresh }) => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedCommittees, setSelectedCommittees] = useState([]);

  useEffect(() => { fetchCommittees(); }, [event._id]);

  const fetchCommittees = async () => {
    try {
      const { data } = await committeeAPI.getByEvent(event._id);
      setCommittees(data.data.committees);
    } catch (err) {
      toast.error('Failed to load committees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return toast.error('Committee name is required');
    try {
      await committeeAPI.create({ eventId: event._id, ...createForm });
      toast.success('Committee created');
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      fetchCommittees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleAssignSubHead = async (committeeId, userId) => {
    try {
      await committeeAPI.assignSubHead(committeeId, { userId });
      toast.success('Sub-head assigned');
      fetchCommittees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (committeeId) => {
    if (!window.confirm('Delete this committee?')) return;
    try {
      await committeeAPI.delete(committeeId);
      toast.success('Committee deleted');
      fetchCommittees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveVolunteer = async (committeeId, userId) => {
    try {
      await committeeAPI.removeVolunteer(committeeId, userId);
      toast.success('Volunteer removed');
      fetchCommittees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleJoinCommittees = async (e) => {
    e.preventDefault();
    if (selectedCommittees.length === 0) return toast.error('Select at least one committee');
    try {
      await committeeAPI.joinCommittees({ eventId: event._id, committeeIds: selectedCommittees });
      toast.success('Joined committees successfully!');
      setShowJoinForm(false);
      setSelectedCommittees([]);
      fetchCommittees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedCommittees((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  // Check if current user is already in a committee
  const userCommittees = committees.filter((c) =>
    c.volunteers?.some((v) => (v._id || v).toString() === user._id) ||
    c.subHead?.toString() === user._id
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Committees ({committees.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isHead && userCommittees.length < committees.length && (
            <button className="btn btn-ghost" onClick={() => setShowJoinForm(true)}><UserPlus size={15} /> Join Committee</button>
          )}
          {isHead && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create</button>
          )}
        </div>
      </div>

      {committees.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No committees yet. {isHead ? 'Create one above!' : 'Wait for the Head to create committees.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {committees.map((c) => (
            <div key={c._id} className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</h3>
                  {c.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>{c.description}</p>}
                </div>
                {isHead && (
                  <button onClick={() => handleDelete(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Sub-head */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sub-Head</span>
                {c.subHead ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                      {(c.subHead.firstName || 'U').charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {c.subHead.firstName} {c.subHead.middleName ? c.subHead.middleName + ' ' : ''}{c.subHead.lastName}
                    </span>
                    <span className="badge badge-subhead">Sub-Head</span>
                  </div>
                ) : isHead ? (
                  <select
                    onChange={(e) => { if (e.target.value) handleAssignSubHead(c._id, e.target.value); }}
                    style={{ marginTop: 6, width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-primary)', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <option value="">— Assign Sub-Head —</option>
                    {event.participants?.filter((p) => p.role !== 'head').map((p) => (
                      <option key={(p.userId?._id || p.userId)} value={(p.userId?._id || p.userId)}>
                        {p.userId?.firstName} {p.userId?.middleName ? p.userId.middleName + ' ' : ''}{p.userId?.lastName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Not assigned yet</p>
                )}
              </div>

              {/* Volunteers */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Volunteers ({c.volunteers?.length || 0})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {c.volunteers?.map((v) => {
                    const name = v.firstName && v.lastName 
                      ? `${v.firstName}${v.middleName ? ' ' + v.middleName : ''} ${v.lastName}`
                      : 'Unknown';
                    const vid = v._id || v;
                    return (
                      <div key={vid} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', borderRadius: 20, padding: '4px 10px 4px 6px' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                          {(v.firstName || 'U').charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{name}</span>
                        {(isHead || c.subHead?.toString() === user._id) && (
                          <button onClick={() => handleRemoveVolunteer(c._id, vid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: 0 }}>
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {(!c.volunteers || c.volunteers.length === 0) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No volunteers yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Committee Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={() => setShowCreate(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '36px', background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Committee</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
              <input className="input-field" placeholder="Marketing" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} style={{ marginBottom: 14 }} />
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
              <textarea className="input-field" placeholder="Optional description..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={2} style={{ marginBottom: 18, resize: 'vertical' }} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Committee</button>
            </form>
          </div>
        </div>
      )}

      {/* Join Committees Modal (for volunteers) */}
      {showJoinForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={() => setShowJoinForm(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '36px', background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Join Committees</h2>
              <button onClick={() => setShowJoinForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 18 }}>Select committees you'd like to join. You'll be added instantly.</p>
            <form onSubmit={handleJoinCommittees}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {committees.map((c) => {
                  const alreadyIn = c.volunteers?.some((v) => (v._id || v).toString() === user._id);
                  return (
                    <label key={c._id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${selectedCommittees.includes(c._id) ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: selectedCommittees.includes(c._id) ? 'rgba(108,99,255,0.08)' : 'var(--bg-input)',
                      cursor: alreadyIn ? 'not-allowed' : 'pointer', opacity: alreadyIn ? 0.5 : 1,
                    }}>
                      <input type="checkbox" checked={selectedCommittees.includes(c._id)} onChange={() => !alreadyIn && toggleSelect(c._id)} disabled={alreadyIn} style={{ accentColor: 'var(--accent-primary)', width: 18, height: 18 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name} {alreadyIn && <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>(Already joined)</span>}</div>
                        {c.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.description}</div>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.volunteers?.length || 0} members</span>
                    </label>
                  );
                })}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Join {selectedCommittees.length} Committee{selectedCommittees.length !== 1 ? 's' : ''}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteesTab;
