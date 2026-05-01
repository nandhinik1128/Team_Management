import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Chat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [seenMsg, setSeenMsg] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);

  const canCreateGroup = ['captain', 'vice-captain'].includes(user?.role);

  useEffect(() => {
    fetchGroups();
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages();
      fetchMembers();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeGroup?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchGroups = () => {
    API.get('/chat/groups').then(r => {
      setGroups(r.data);
      if (!activeGroup && r.data.length > 0) setActiveGroup(r.data[0]);
    }).catch(() => {});
  };

  const fetchMessages = async () => {
    if (!activeGroup) return;
    try {
      const r = await API.get(`/chat/groups/${activeGroup.id}/messages`);
      setMessages(r.data);
    } catch {}
  };

  const fetchMembers = () => {
    if (!activeGroup) return;
    API.get(`/chat/groups/${activeGroup.id}/members`).then(r => setMembers(r.data)).catch(() => {});
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await API.post(`/chat/groups/${activeGroup.id}/messages`, { message: newMessage.trim() });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send!');
    }
  };

  const handleEdit = async (id) => {
    try {
      await API.put(`/chat/messages/${id}`, { message: editText });
      toast.success('Message edited!');
      setEditingId(null);
      await fetchMessages();
    } catch { toast.error('Failed!'); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/chat/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted!');
    } catch { toast.error('Failed to delete!'); }
  };

  const handleSeenBy = async (msgId) => {
    try {
      const r = await API.get(`/chat/messages/${msgId}/reads`);
      setSeenMsg({ id: msgId, readers: r.data });
    } catch {}
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0)
      return toast.error('Enter group name and select members!');
    try {
      await API.post('/chat/groups', { name: groupName, memberIds: selectedMembers });
      toast.success('Group created!');
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      fetchGroups();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN');

  return (
    <Layout>
      <div style={styles.container}>

        {/* Group Sidebar */}
        <div style={styles.groupSidebar}>
          <div style={styles.groupHeader}>
            <h3 style={styles.groupTitle}>💬 Chats</h3>
            {canCreateGroup && (
              <button style={styles.createBtn} onClick={() => setShowCreateGroup(true)}>
                + New
              </button>
            )}
          </div>
          {groups.map(g => (
            <div key={g.id}
              style={{ ...styles.groupItem, background: activeGroup?.id === g.id ? '#E3F0FF' : '#fff', borderLeft: activeGroup?.id === g.id ? '3px solid #1565C0' : '3px solid transparent' }}
              onClick={() => { setActiveGroup(g); setShowMembers(false); }}>
              <div style={styles.groupAvatar}>{g.name?.charAt(0)}</div>
              <div>
                <p style={styles.groupName}>{g.name}</p>
                {g.is_general && <span style={styles.generalBadge}>General</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {activeGroup ? (
            <>
              {/* Header */}
              <div style={styles.chatHeader}>
                <div style={styles.groupAvatar}>{activeGroup.name?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <p style={styles.chatGroupName}>{activeGroup.name}</p>
                  <p style={styles.chatGroupSub}>{members.length} members</p>
                </div>
                <button style={styles.membersBtn} onClick={() => setShowMembers(!showMembers)}>
                  👥 Members
                </button>
              </div>

              <div style={styles.chatBody}>
                {/* Messages */}
                <div style={styles.messagesArea}>
                  {messages.length === 0 ? (
                    <div style={styles.noMessages}>
                      <p style={styles.noMessagesText}>No messages yet. Say hello! 👋</p>
                    </div>
                  ) : messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const showDate = i === 0 || formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at);
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div style={styles.dateDivider}>
                            <span style={styles.dateDividerText}>{formatDate(msg.created_at)}</span>
                          </div>
                        )}
                        <div style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          {!isMe && <div style={styles.msgAvatar}>{msg.sender_name?.charAt(0)}</div>}
                          <div style={{ maxWidth: '60%', position: 'relative' }}>
                            {!isMe && <p style={styles.senderName}>{msg.sender_name}</p>}
                            {editingId === msg.id ? (
                              <div style={styles.editBox}>
                                <input style={styles.editInput} value={editText}
                                  onChange={e => setEditText(e.target.value)} autoFocus />
                                <button style={styles.editSaveBtn} onClick={() => handleEdit(msg.id)}>Save</button>
                                <button style={styles.editCancelBtn} onClick={() => setEditingId(null)}>✕</button>
                              </div>
                            ) : (
                              <div
                                style={{ ...styles.messageBubble, background: isMe ? '#1565C0' : '#fff', color: isMe ? '#fff' : '#333', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', cursor: 'pointer' }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({ x: e.clientX, y: e.clientY, msg, isMe });
                                }}
                              >
                                <p style={styles.messageText}>{msg.message}</p>
                                {msg.is_edited == 1 && (
                                  <p style={{ margin: 0, fontSize: '10px', fontStyle: 'italic', color: isMe ? 'rgba(255,255,255,0.6)' : '#aaa' }}>
                                    edited
                                  </p>
                                )}
                                <p style={{ ...styles.messageTime, color: isMe ? 'rgba(255,255,255,0.7)' : '#aaa' }}>
                                  {formatTime(msg.created_at)}
                                  {isMe && <span style={{ marginLeft: '4px' }}>✓✓</span>}
                                </p>
                              </div>
                            )}
                          </div>
                          {isMe && (
                            <div style={{ ...styles.msgAvatar, background: '#1565C0', color: '#fff' }}>
                              {user?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Members Panel */}
              {showMembers && (
  <div style={styles.membersPanel}>
    <h4 style={styles.membersPanelTitle}>👥 Members ({members.length})</h4>
    {canCreateGroup && !activeGroup?.is_general && (
      <div style={styles.addMemberSection}>
        <select style={styles.addMemberSelect}
          onChange={async (e) => {
            if (!e.target.value) return;
            try {
              await API.post(`/chat/groups/${activeGroup.id}/members`, { user_id: e.target.value });
              toast.success('Member added!');
              fetchMembers();
            } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
            e.target.value = '';
          }}>
          <option value="">+ Add member</option>
          {users.filter(u => !members.find(m => m.id === u.id)).map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <button style={styles.deleteGroupBtn}
          onClick={async () => {
            if (!window.confirm('Delete this group?')) return;
            try {
              await API.delete(`/chat/groups/${activeGroup.id}`);
              toast.success('Group deleted!');
              setActiveGroup(null);
              fetchGroups();
            } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
          }}>
          🗑️ Delete Group
        </button>
      </div>
    )}
    {members.map(m => (
      <div key={m.id} style={styles.memberRow}>
        <div style={{ ...styles.memberRowAvatar, background: m.id === user?.id ? '#1565C0' : '#E3F0FF', color: m.id === user?.id ? '#fff' : '#1565C0' }}>
          {m.name?.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.memberRowName}>
            {m.name}
            {m.id === user?.id && <span style={styles.youTag}> (You)</span>}
          </p>
          <p style={styles.memberRowRole}>{m.role}</p>
        </div>
        {canCreateGroup && !activeGroup?.is_general && m.id !== user?.id && (
          <button style={styles.removeMemberBtn}
            onClick={async () => {
              try {
                await API.delete(`/chat/groups/${activeGroup.id}/members/${m.id}`);
                toast.success('Member removed!');
                fetchMembers();
              } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
            }}>
            ✕
          </button>
        )}
      </div>
    ))}
  </div>
)}
              </div>

              {/* Input Area */}
              <div style={styles.inputArea}>
                <input
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button style={styles.sendBtn} onClick={handleSend}>Send ➤</button>
              </div>
            </>
          ) : (
            <div style={styles.noChat}>
              <p style={styles.noChatText}>Select a chat to start messaging</p>
            </div>
          )}
        </div>

        {/* WhatsApp-style Context Menu */}
        {contextMenu && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
            onClick={() => setContextMenu(null)}>
            <div
              style={{ position: 'fixed', top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 200), background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '6px', zIndex: 999, minWidth: '190px', border: '1px solid #E8EDF5' }}
              onClick={e => e.stopPropagation()}>
              <button style={styles.ctxBtn}
                onClick={() => { handleSeenBy(contextMenu.msg.id); setContextMenu(null); }}>
                <span style={styles.ctxIcon}>👁️</span> Seen by
              </button>
              <button style={styles.ctxBtn}
                onClick={() => { navigator.clipboard.writeText(contextMenu.msg.message); toast.success('Copied!'); setContextMenu(null); }}>
                <span style={styles.ctxIcon}>📋</span> Copy Text
              </button>
              {contextMenu.isMe && (
                <>
                  <div style={styles.ctxDivider} />
                  <button style={styles.ctxBtn}
                    onClick={() => { setEditingId(contextMenu.msg.id); setEditText(contextMenu.msg.message); setContextMenu(null); }}>
                    <span style={styles.ctxIcon}>✏️</span> Edit Message
                  </button>
                  <div style={styles.ctxDivider} />
                  <button style={{ ...styles.ctxBtn, color: '#C62828' }}
                    onClick={() => { handleDelete(contextMenu.msg.id); setContextMenu(null); }}>
                    <span style={styles.ctxIcon}>🗑️</span> Delete Message
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Seen By Modal */}
        {seenMsg && (
          <div style={styles.seenOverlay} onClick={() => setSeenMsg(null)}>
            <div style={styles.seenModal} onClick={e => e.stopPropagation()}>
              <h4 style={styles.seenTitle}>👁️ Seen by</h4>
              {seenMsg.readers.length === 0 ? (
                <p style={styles.seenEmpty}>No one has seen this yet.</p>
              ) : seenMsg.readers.map((r, i) => (
                <div key={i} style={styles.seenRow}>
                  <div style={styles.seenAvatar}>{r.name?.charAt(0)}</div>
                  <div>
                    <p style={styles.seenName}>{r.name}</p>
                    <p style={styles.seenTime}>
                      {new Date(r.read_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <button style={styles.seenClose} onClick={() => setSeenMsg(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Create New Group</h3>
              <input style={styles.modalInput} placeholder="Group name"
                value={groupName} onChange={e => setGroupName(e.target.value)} />
              <p style={styles.modalLabel}>Select Members:</p>
              <div style={styles.membersList}>
                {users.map(u => (
                  <div key={u.id}
                    style={{ ...styles.memberItem, background: selectedMembers.includes(u.id) ? '#E3F0FF' : '#F8FAFF', border: selectedMembers.includes(u.id) ? '1.5px solid #1565C0' : '1.5px solid #E8EDF5' }}
                    onClick={() => toggleMember(u.id)}>
                    <div style={styles.memberAvatar}>{u.name?.charAt(0)}</div>
                    <div>
                      <p style={styles.memberName}>{u.name}</p>
                      <p style={styles.memberRole}>{u.role}</p>
                    </div>
                    {selectedMembers.includes(u.id) && <span style={styles.checkmark}>✓</span>}
                  </div>
                ))}
              </div>
              <div style={styles.modalButtons}>
                <button style={styles.cancelModalBtn} onClick={() => setShowCreateGroup(false)}>Cancel</button>
                <button style={styles.createModalBtn} onClick={handleCreateGroup}>Create Group</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 48px)', background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF5', overflow: 'hidden', marginTop: '-24px', marginLeft: '-24px', marginRight: '-24px' },
  groupSidebar: { width: '240px', minWidth: '240px', borderRight: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  groupHeader: { padding: '16px', borderBottom: '1px solid #E8EDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  groupTitle: { margin: 0, fontSize: '15px', fontWeight: '600', color: '#333' },
  createBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  groupItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: 'pointer' },
  groupAvatar: { width: '38px', height: '38px', minWidth: '38px', background: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#fff' },
  groupName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
  generalBadge: { fontSize: '10px', background: '#E3F0FF', color: '#1565C0', padding: '1px 6px', borderRadius: '8px', fontWeight: '600' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '12px 16px', borderBottom: '1px solid #E8EDF5', display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFCFF' },
  chatGroupName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  chatGroupSub: { margin: 0, fontSize: '11px', color: '#888' },
  membersBtn: { background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  chatBody: { flex: 1, display: 'flex', overflow: 'hidden' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#F0F4F8' },
  membersPanel: { width: '200px', borderLeft: '1px solid #E8EDF5', padding: '16px', overflowY: 'auto', background: '#fff' },
  membersPanelTitle: { margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#333' },
  memberRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  memberRowAvatar: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', minWidth: '32px' },
  memberRowName: { margin: '0 0 2px', fontSize: '12px', fontWeight: '600', color: '#333' },
  memberRowRole: { margin: 0, fontSize: '10px', color: '#888', textTransform: 'capitalize' },
  youTag: { color: '#1565C0', fontSize: '10px' },
  noMessages: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noMessagesText: { color: '#aaa', fontSize: '14px' },
  dateDivider: { textAlign: 'center', margin: '8px 0' },
  dateDividerText: { background: '#D0D9E8', color: '#555', fontSize: '11px', padding: '3px 12px', borderRadius: '20px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: { width: '30px', height: '30px', minWidth: '30px', background: '#E3F0FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#1565C0' },
  senderName: { margin: '0 0 2px', fontSize: '11px', color: '#666', fontWeight: '600' },
  messageBubble: { padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  messageText: { margin: '0 0 4px', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' },
  messageTime: { margin: 0, fontSize: '11px', textAlign: 'right' },
  editBox: { display: 'flex', gap: '6px', alignItems: 'center' },
  editInput: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #D0DCF0', fontSize: '13px', outline: 'none' },
  editSaveBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  editCancelBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', cursor: 'pointer' },
  inputArea: { padding: '12px 16px', borderTop: '1px solid #E8EDF5', display: 'flex', gap: '10px', background: '#fff' },
  messageInput: { flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1.5px solid #E8EDF5', fontSize: '14px', outline: 'none', background: '#F8FAFF' },
  sendBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '24px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  noChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noChatText: { color: '#aaa', fontSize: '15px' },
  ctxBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#333', fontFamily: "'Segoe UI', sans-serif", fontWeight: '500', textAlign: 'left' },
  ctxIcon: { fontSize: '16px', minWidth: '20px' },
  ctxDivider: { height: '1px', background: '#F0F4F8', margin: '4px 0' },
  seenOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  seenModal: { background: '#fff', borderRadius: '12px', padding: '24px', width: '300px', maxHeight: '400px', overflowY: 'auto' },
  seenTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  seenEmpty: { color: '#aaa', fontSize: '14px', textAlign: 'center' },
  seenRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  seenAvatar: { width: '34px', height: '34px', background: '#E3F0FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#1565C0', minWidth: '34px' },
  seenName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  seenTime: { margin: 0, fontSize: '12px', color: '#888' },
  seenClose: { width: '100%', background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '400px', maxHeight: '80vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#1A1A2E' },
  modalInput: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D0DCF0', fontSize: '14px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' },
  modalLabel: { margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#444' },
  membersList: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  memberItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
  memberAvatar: { width: '34px', height: '34px', background: '#1565C0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', minWidth: '34px' },
  memberName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
  memberRole: { margin: 0, fontSize: '11px', color: '#888', textTransform: 'capitalize' },
  checkmark: { marginLeft: 'auto', color: '#1565C0', fontWeight: '700', fontSize: '16px' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelModalBtn: { background: '#F0F4F8', color: '#555', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  createModalBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  addMemberSection: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
addMemberSelect: { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #D0DCF0', fontSize: '12px', outline: 'none', background: '#F8FAFF', cursor: 'pointer' },
deleteGroupBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', width: '100%' },
removeMemberBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default Chat;