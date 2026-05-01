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
  }, [activeGroup]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchGroups = () => {
    API.get('/chat/groups').then(r => {
      setGroups(r.data);
      if (!activeGroup && r.data.length > 0) setActiveGroup(r.data[0]);
    }).catch(() => {});
  };

  const fetchMessages = () => {
    if (!activeGroup) return;
    API.get(`/chat/groups/${activeGroup.id}/messages`).then(r => setMessages(r.data)).catch(() => {});
  };

  const fetchMembers = () => {
    if (!activeGroup) return;
    API.get(`/chat/groups/${activeGroup.id}/members`).then(r => setMembers(r.data)).catch(() => {});
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await API.post(`/chat/groups/${activeGroup.id}/messages`, { message: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch { toast.error('Failed!'); }
  };

  const handleEdit = async (id) => {
    try {
      await API.put(`/chat/messages/${id}`, { message: editText });
      toast.success('Edited!');
      setEditingId(null);
      fetchMessages();
    } catch { toast.error('Failed!'); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/chat/messages/${id}`);
      toast.success('Deleted!');
      fetchMessages();
    } catch { toast.error('Failed!'); }
  };

  const handleSeenBy = async (msgId) => {
    try {
      const r = await API.get(`/chat/messages/${msgId}/reads`);
      setSeenMsg({ id: msgId, readers: r.data });
    } catch { }
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
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
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
              <button style={styles.createBtn} onClick={() => setShowCreateGroup(true)}>+ New</button>
            )}
          </div>
          {groups.map(g => (
            <div key={g.id} style={{ ...styles.groupItem, background: activeGroup?.id === g.id ? '#E3F0FF' : '#fff', borderLeft: activeGroup?.id === g.id ? '3px solid #1565C0' : '3px solid transparent' }}
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
              {/* Chat Header — NO duplicate brand bar */}
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
                          <div style={{ maxWidth: '60%' }}>
                            {!isMe && <p style={styles.senderName}>{msg.sender_name}</p>}
                            {editingId === msg.id ? (
                              <div style={styles.editBox}>
                                <input style={styles.editInput} value={editText} onChange={e => setEditText(e.target.value)} autoFocus />
                                <button style={styles.editSaveBtn} onClick={() => handleEdit(msg.id)}>Save</button>
                                <button style={styles.editCancelBtn} onClick={() => setEditingId(null)}>✕</button>
                              </div>
                            ) : (
                              <div style={{ ...styles.messageBubble, background: isMe ? '#1565C0' : '#fff', color: isMe ? '#fff' : '#333', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                                <p style={styles.messageText}>{msg.message}</p>
                                {msg.is_edited && <p style={{ ...styles.editedLabel, color: isMe ? 'rgba(255,255,255,0.6)' : '#aaa' }}>edited</p>}
                                <div style={styles.msgFooter}>
                                  <p style={{ ...styles.messageTime, color: isMe ? 'rgba(255,255,255,0.7)' : '#aaa' }}>{formatTime(msg.created_at)}</p>
                                  {isMe && (
                                    <div style={styles.msgActions}>
                                      <button style={styles.msgActionBtn} onClick={() => { setEditingId(msg.id); setEditText(msg.message); }}>✏️</button>
                                      <button style={styles.msgActionBtn} onClick={() => handleDelete(msg.id)}>🗑️</button>
                                      <button style={styles.msgActionBtn} onClick={() => handleSeenBy(msg.id)}>👁️</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {isMe && <div style={{ ...styles.msgAvatar, background: '#1565C0', color: '#fff' }}>{user?.name?.charAt(0)}</div>}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Members Panel */}
                {showMembers && (
                  <div style={styles.membersPanel}>
                    <h4 style={styles.membersPanelTitle}>👥 Group Members ({members.length})</h4>
                    {members.map(m => (
                      <div key={m.id} style={styles.memberRow}>
                        <div style={{ ...styles.memberRowAvatar, background: m.id === user?.id ? '#1565C0' : '#E3F0FF', color: m.id === user?.id ? '#fff' : '#1565C0' }}>{m.name?.charAt(0)}</div>
                        <div>
                          <p style={styles.memberRowName}>{m.name}{m.id === user?.id && <span style={styles.youTag}> (You)</span>}</p>
                          <p style={styles.memberRowRole}>{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seen by modal */}
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
                          <p style={styles.seenTime}>{new Date(r.read_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                    <button style={styles.seenClose} onClick={() => setSeenMsg(null)}>Close</button>
                  </div>
                </div>
              )}

              <div style={styles.inputArea}>
                <input style={styles.messageInput} placeholder="Type a message..." value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button style={styles.sendBtn} onClick={handleSend}>Send ➤</button>
              </div>
            </>
          ) : (
            <div style={styles.noChat}>
              <p style={styles.noChatText}>Select a chat to start messaging</p>
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Create New Group</h3>
              <input style={styles.modalInput} placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />
              <p style={styles.modalLabel}>Select Members:</p>
              <div style={styles.membersList}>
                {users.map(u => (
                  <div key={u.id} style={{ ...styles.memberItem, background: selectedMembers.includes(u.id) ? '#E3F0FF' : '#F8FAFF', border: selectedMembers.includes(u.id) ? '1.5px solid #1565C0' : '1.5px solid #E8EDF5' }}
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
  container: { display: 'flex', height: 'calc(100vh - 64px)', background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF5', overflow: 'hidden' },
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
  messagesArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFF' },
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
  dateDividerText: { background: '#E8EDF5', color: '#888', fontSize: '11px', padding: '2px 10px', borderRadius: '20px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: { width: '30px', height: '30px', minWidth: '30px', background: '#E3F0FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#1565C0' },
  senderName: { margin: '0 0 2px', fontSize: '11px', color: '#888', fontWeight: '600' },
  messageBubble: { padding: '10px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  messageText: { margin: '0 0 2px', fontSize: '13px', lineHeight: '1.4' },
  editedLabel: { margin: 0, fontSize: '10px', fontStyle: 'italic' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  messageTime: { margin: 0, fontSize: '10px' },
  msgActions: { display: 'flex', gap: '4px' },
  msgActionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: '2px' },
  editBox: { display: 'flex', gap: '6px', alignItems: 'center' },
  editInput: { flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #D0DCF0', fontSize: '13px', outline: 'none' },
  editSaveBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' },
  editCancelBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', cursor: 'pointer' },
  seenOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  seenModal: { background: '#fff', borderRadius: '12px', padding: '24px', width: '300px', maxHeight: '400px', overflowY: 'auto' },
  seenTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  seenEmpty: { color: '#aaa', fontSize: '14px', textAlign: 'center' },
  seenRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  seenAvatar: { width: '34px', height: '34px', background: '#E3F0FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#1565C0', minWidth: '34px' },
  seenName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  seenTime: { margin: 0, fontSize: '12px', color: '#888' },
  seenClose: { width: '100%', background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' },
  inputArea: { padding: '12px 16px', borderTop: '1px solid #E8EDF5', display: 'flex', gap: '10px', background: '#fff' },
  messageInput: { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1.5px solid #E8EDF5', fontSize: '13px', outline: 'none', background: '#F8FAFF' },
  sendBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  noChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noChatText: { color: '#aaa', fontSize: '15px' },
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
  checkmark: { marginLeft: 'auto', color: '#1565C0', fontWeight: '700' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelModalBtn: { background: '#F0F4F8', color: '#555', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  createModalBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
};

export default Chat;