import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MessageSquare, Bot, User, CheckCheck, Loader2 } from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const ChatBox = ({ complaintId, complaintTitle }) => {
  const { user } = useAuth();
  const { socket, joinTicketRoom, leaveTicketRoom, sendTypingStatus, broadcastMessage } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load message history & join socket room
  useEffect(() => {
    if (!complaintId) return;

    joinTicketRoom(complaintId);

    const loadMessages = async () => {
      try {
        setLoading(true);
        const res = await messagesAPI.getMessages(complaintId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to load ticket messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    return () => {
      leaveTicketRoom(complaintId);
    };
  }, [complaintId]);

  // Socket listeners for real-time messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (newMsg) => {
      if (newMsg.complaintId === complaintId) {
        setMessages((prev) => {
          // Avoid duplicate insertion
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    const handleTypingEvent = ({ user: typer, isTyping }) => {
      if (isTyping && typer.name !== user?.name) {
        setTypingUser(typer);
      } else {
        setTypingUser(null);
      }
    };

    socket.on('receive_chat_message', handleIncomingMessage);
    socket.on('user_typing', handleTypingEvent);

    return () => {
      socket.off('receive_chat_message', handleIncomingMessage);
      socket.off('user_typing', handleTypingEvent);
    };
  }, [socket, complaintId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Broadcast typing event with debounce
    sendTypingStatus(complaintId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(complaintId, false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || sending) return;

    try {
      setSending(true);
      sendTypingStatus(complaintId, false);

      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('message', inputText || 'Attached file');
        formData.append('attachments', selectedFile);
        res = await messagesAPI.sendMessage(complaintId, formData);
      } else {
        res = await messagesAPI.sendMessage(complaintId, inputText.trim());
      }

      const createdMsg = res.data.message;

      // Broadcast to socket room
      broadcastMessage(createdMsg);

      // Local state update
      setMessages((prev) => [...prev, createdMsg]);
      setInputText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(124, 58, 237, 0.2)',
              color: 'var(--purple-400)',
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Live Support Conversation
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time communication between User & Assigned Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--green-500)',
              boxShadow: '0 0 8px var(--green-500)',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--green-500)', fontWeight: 600 }}>
            Live Sync
          </span>
        </div>
      </div>

      {/* Message History Feed */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center" style={{ height: '100%' }}>
            <Loader2 className="animate-spin" size={28} color="var(--purple-500)" />
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}
          >
            <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No messages yet in this ticket</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Send a message below to start communicating in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const isAgent = msg.senderRole === 'AGENT';
            const isAdmin = msg.senderRole === 'ADMIN';

            return (
              <div
                key={msg._id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender Name & Role Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {isMe ? 'You' : msg.sender?.name || 'Agent'}
                  </span>
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      background: isAdmin
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isAgent
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(139, 92, 246, 0.2)',
                      color: isAdmin ? '#f87171' : isAgent ? '#60a5fa' : '#a78bfa',
                      border: 'none',
                    }}
                  >
                    {msg.senderRole || 'USER'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe
                      ? 'var(--primary-gradient)'
                      : 'rgba(30, 41, 59, 0.85)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isMe
                      ? '0 4px 14px rgba(124, 58, 237, 0.3)'
                      : '0 2px 6px rgba(0, 0, 0, 0.2)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.message}

                  {/* Attachment if present */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {msg.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: '#e0e7ff',
                            textDecoration: 'underline',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          <Paperclip size={12} /> View Attachment
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--purple-400)',
              fontStyle: 'italic',
            }}
          >
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
            </div>
            {typingUser.name} ({typingUser.role}) is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File attachment preview pill */}
      {selectedFile && (
        <div
          style={{
            padding: '6px 16px',
            background: 'rgba(124, 58, 237, 0.15)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
          }}
        >
          <span className="flex items-center gap-2">
            <Paperclip size={14} color="var(--purple-400)" />
            {selectedFile.name}
          </span>
          <button
            onClick={() => setSelectedFile(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--red-500)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(15, 23, 42, 0.9)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary btn-sm"
          title="Attach file / screenshot"
          style={{ padding: '10px' }}
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message or inquiry to agent..."
          className="form-input"
          style={{ flex: 1, padding: '10px 14px' }}
        />

        <button
          type="submit"
          disabled={sending || (!inputText.trim() && !selectedFile)}
          className="btn btn-primary"
          style={{ padding: '10px 18px' }}
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
