import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { eventAPI } from '../utils/api';
import { toast } from '../utils/toast';
import { ArrowLeft, Users, MessageCircle, Bell, CreditCard, Crown, Copy, Check } from 'lucide-react';

// Sub-page components
import CommitteesTab from '../components/Events/CommitteesTab';
import ChatTab from '../components/Chat/ChatTab';
import AnnouncementsTab from '../components/Events/AnnouncementsTab';
import PaymentsTab from '../components/Payments/PaymentsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: <Users size={16} /> },
  { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} /> },
  { id: 'announcements', label: 'Announcements', icon: <Bell size={16} /> },
  { id: 'committees', label: 'Committees', icon: <Users size={16} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
];

const EventPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { joinEventRoom } = useSocket();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    fetchEvent();
    joinEventRoom(eventId);
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data } = await eventAPI.getDetails(eventId);
      setEvent(data.data.event);
    } catch (err) {
      toast.error('Event not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(event.eventCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!event) return null;

  const isHead = event.head?._id === user._id || event.head === user._id;
  const participantRole = isHead ? 'head' : (event.participants?.find(p => (p.userId?._id || p.userId)?.toString() === user._id)?.role || 'volunteer');

  // Filter tabs: hide committees if not enabled
  const visibleTabs = tabs.filter(t => !(t.id === 'committees' && !event.hasCommittees));
  // Hide payments tab for small non-committee events if no payment announcements
  // (keep it visible always for simplicity - payment announcements will show "none" state)

  return (
    <div style={{ minHeight: '100vh', paddingTop: 64 }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        padding: '48px 24px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>{event.title}</h1>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                  {participantRole}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
                {event.description || 'No description'} · {event.participants?.length || 0} participants
              </p>
            </div>

            {/* Event code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px', backdropFilter: 'blur(8px)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600 }}>CODE</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em' }}>{event.eventCode}</span>
              <button onClick={copyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
                {codeCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 28, overflowX: 'auto', paddingBottom: 4 }}>
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'transparent',
                  border: 'none', borderRadius: 8,
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.6)',
                  padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-primary)',
                  fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 60px' }}>
        {activeTab === 'overview' && (
          <OverviewTab event={event} user={user} isHead={isHead} onRefresh={fetchEvent} />
        )}
        {activeTab === 'committees' && (
          <CommitteesTab event={event} user={user} isHead={isHead} onRefresh={fetchEvent} />
        )}
        {activeTab === 'chat' && (
          <ChatTab event={event} user={user} isHead={isHead} participantRole={participantRole} />
        )}
        {activeTab === 'announcements' && (
          <AnnouncementsTab event={event} user={user} isHead={isHead} />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab event={event} user={user} isHead={isHead} />
        )}
      </div>
    </div>
  );
};

/* ─── Overview Tab ─── */
const OverviewTab = ({ event, user, isHead, onRefresh }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHead) {
      eventAPI.getVolunteers(event._id).then(({ data }) => setVolunteers(data.data.volunteers)).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [event._id, isHead]);

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this participant?')) return;
    try {
      await eventAPI.removeParticipant(event._id, userId);
      toast.success('Participant removed');
      onRefresh();
      setVolunteers(prev => prev.filter(v => (v.userId?._id || v.userId) !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Participants', value: event.participants?.length || 0, color: 'var(--accent-primary)' },
          { label: 'Event Type', value: event.eventType === 'large' ? 'Large' : 'Small', color: 'var(--accent-secondary)' },
          { label: 'Committees', value: event.hasCommittees ? 'Enabled' : 'Disabled', color: 'var(--accent-success)' },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Volunteer list (Head only) */}
      {isHead && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>All Participants</h3>
          {loading ? <div className="spinner" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {volunteers.map((v) => {
                const uid = v.userId?._id || v.userId;
                const name = v.userId?.firstName && v.userId?.lastName
                  ? `${v.userId.firstName}${v.userId.middleName ? ' ' + v.userId.middleName : ''} ${v.userId.lastName}`
                  : 'Unknown';
                const email = v.userId?.email || '';
                return (
                  <div key={uid} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                      }}>
                        {name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge badge-${v.role}`}>{v.role}</span>
                      {v.role !== 'head' && (
                        <button className="btn btn-danger" onClick={() => handleRemove(uid)} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>Remove</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Non-head view */}
      {!isHead && (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            You are a <strong>{event.participants?.find(p => (p.userId?._id || p.userId)?.toString() === user._id)?.role || 'volunteer'}</strong> in this event. Use the tabs above to chat, view announcements, and more.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventPage;
