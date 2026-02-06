import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { chatAPI, committeeAPI } from '../../utils/api';
import { toast } from '../../utils/toast';
import { Send, MessageCircle } from 'lucide-react';

const chatTypes = [
  { id: 'global', label: 'Global Chat', icon: '🌍' },
  { id: 'head_subhead', label: 'Head & Sub-heads', icon: '👑' },
  { id: 'committee', label: 'Committee', icon: '👥' },
];

const ChatTab = ({ event, user, isHead, participantRole }) => {
  const { joinChatRoom, sendMessage: socketSend, onEvent } = useSocket();
  const [activeChatType, setActiveChatType] = useState('global');
  const [activeCommittee, setActiveCommittee] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Load committees
  useEffect(() => {
    if (event.hasCommittees) {
      committeeAPI.getByEvent(event._id).then(({ data }) => {
        setCommittees(data.data.committees);
        // Auto-select first committee user is in
        const userCommittee = data.data.committees.find((c) =>
          c.volunteers?.some((v) => (v._id || v).toString() === user._id) ||
          c.subHead?.toString() === user._id
        );
        if (userCommittee && activeChatType === 'committee') {
          setActiveCommittee(userCommittee._id);
        }
      }).catch(() => {});
    }
  }, [event._id]);

  // Join room & load history when chat type or committee changes
  useEffect(() => {
    const committeeId = activeChatType === 'committee' ? activeCommittee : null;
    joinChatRoom({ eventId: event._id, chatType: activeChatType, committeeId });
    loadHistory();
  }, [activeChatType, activeCommittee]);

  // Socket listeners
  useEffect(() => {
    const unsub1 = onEvent('new_message', (msg) => {
      const targetType = activeChatType;
      const targetCommittee = activeChatType === 'committee' ? activeCommittee : null;
      if (msg.chatType === targetType && (!targetCommittee || msg.committeeId === targetCommittee)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    const unsub2 = onEvent('user_typing', ({ userId, isTyping }) => {
      setTypingUsers((prev) => isTyping ? [...prev.filter((u) => u !== userId), userId] : prev.filter((u) => u !== userId));
    });

    return () => { unsub1?.(); unsub2?.(); };
  }, [activeChatType, activeCommittee]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeChatType === 'committee' && activeCommittee) params.committeeId = activeCommittee;
      const { data } = await chatAPI.getHistory(event._id, activeChatType, params);
      setMessages(data.data.messages);
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const committeeId = activeChatType === 'committee' ? activeCommittee : null;

    if (activeChatType === 'committee' && !committeeId) {
      return toast.error('Select a committee first');
    }

    socketSend({ eventId: event._id, chatType: activeChatType, committeeId, message: input.trim() });
    setInput('');
    // Clear typing
    clearTyping();
  };

  const emitTyping = useCallback(() => {
    const committeeId = activeChatType === 'committee' ? activeCommittee : null;
    // We'd call emitTyping here but simplify for now
  }, [activeChatType, activeCommittee]);

  const clearTyping = () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  // Filter visible chat types based on role
  const visibleChatTypes = chatTypes.filter((ct) => {
    if (ct.id === 'head_subhead') return isHead || participantRole === 'subhead';
    if (ct.id === 'committee') return event.hasCommittees;
    return true;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 300px)', minHeight: 400, gap: 16 }}>
      {/* Sidebar: chat type + committee selector */}
      <div style={{ width: 200, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>Chat Rooms</div>
        {visibleChatTypes.map((ct) => (
          <button
            key={ct.id}
            onClick={() => { setActiveChatType(ct.id); if (ct.id !== 'committee') setActiveCommittee(null); }}
            style={{
              background: activeChatType === ct.id ? 'rgba(108,99,255,0.12)' : 'transparent',
              border: `1px solid ${activeChatType === ct.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-primary)',
              color: activeChatType === ct.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.84rem', transition: 'all 0.2s',
            }}
          >
            <span>{ct.icon}</span> {ct.label}
          </button>
        ))}

        {/* Committee sub-selector */}
        {activeChatType === 'committee' && committees.length > 0 && (
          <>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 12, marginBottom: 4 }}>Committees</div>
            {committees.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveCommittee(c._id)}
                style={{
                  background: activeCommittee === c._id ? 'rgba(255,101,132,0.1)' : 'transparent',
                  border: `1px solid ${activeCommittee === c._id ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '8px 12px', cursor: 'pointer',
                  fontFamily: 'var(--font-primary)', color: activeCommittee === c._id ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                  fontWeight: 500, fontSize: '0.8rem', transition: 'all 0.2s', marginLeft: 16,
                }}
              >
                {c.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Chat area */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Chat header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageCircle size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            {activeChatType === 'global' && 'Global Chat'}
            {activeChatType === 'head_subhead' && 'Head & Sub-heads'}
            {activeChatType === 'committee' && (activeCommittee ? committees.find(c => c._id === activeCommittee)?.name || 'Committee' : 'Select a committee')}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <MessageCircle size={32} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No messages yet. Start the conversation!</span>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = (msg.sender?._id || msg.sender) === user._id;
              const senderName = msg.sender?.firstName && msg.sender?.lastName
                ? `${msg.sender.firstName}${msg.sender.middleName ? ' ' + msg.sender.middleName : ''} ${msg.sender.lastName}`
                : 'Unknown';
              const showAvatar = i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id;
              return (
                <div key={msg._id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                  {!isOwn && showAvatar && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      {senderName.charAt(0)}
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div style={{ width: 32, flexShrink: 0 }} />}

                  <div style={{ maxWidth: '70%' }}>
                    {!isOwn && showAvatar && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2, display: 'block' }}>{senderName}</span>
                    )}
                    <div style={{
                      background: isOwn ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-input)',
                      color: isOwn ? '#fff' : 'var(--text-primary)',
                      padding: '10px 14px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      {msg.message}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3, display: 'block', textAlign: isOwn ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: `bounce 1s ease ${i * 0.15}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Someone is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="input-field"
            placeholder={activeChatType === 'committee' && !activeCommittee ? 'Select a committee first...' : 'Type a message...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            disabled={activeChatType === 'committee' && !activeCommittee}
            style={{ flex: 1 }}
          />
          <button onClick={handleSend} className="btn btn-primary" style={{ padding: '10px 16px', minWidth: 0 }} disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @media (max-width: 640px) {
          .chat-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
};

export default ChatTab;
