import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Chat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [lastSeenByGroup, setLastSeenByGroup] = useState({});
  const [lastMessageAt, setLastMessageAt] = useState({});
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showUserListPanel, setShowUserListPanel] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [seenMsg, setSeenMsg] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const lastSeenByGroupRef = useRef({});

  const canCreateGroup = ['captain', 'vice-captain', 'strategist', 'manager'].includes(user?.role);
  const canManageGroups = canCreateGroup; // same roles can create and delete groups

  const normalizeGroupMemberIds = (group) => {
    const raw = group?.member_ids ?? group?.member_ids_csv ?? [];
    if (Array.isArray(raw)) return raw.map(Number).filter(Number.isFinite);
    if (typeof raw === 'string') {
      return raw.split(',').map(id => Number(id)).filter(Number.isFinite);
    }
    return [];
  };

  useEffect(() => {
    lastSeenByGroupRef.current = lastSeenByGroup;
  }, [lastSeenByGroup]);

  useEffect(() => {
    fetchGroups();
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
    // start background poller to detect new messages across groups
    let isActive = true;
    let pollId = null;
    const startPoll = async () => {
      if (!isActive) return;
      try {
        const g = await API.get('/chat/groups');
        const groupList = g.data || [];
        setGroups(groupList);
        // initialize lastSeenByGroup map
        const map = {};
        await Promise.all(groupList.map(async grp => {
          try {
            const msgs = await API.get(`/chat/groups/${grp.id}/messages`);
            const last = (msgs.data || []).slice(-1)[0];
            if (last) map[grp.id] = last.id;
          } catch (e) { }
        }));
        lastSeenByGroupRef.current = map;
        setLastSeenByGroup(map);
      } catch (e) { }

      pollId = setInterval(async () => {
        if (!isActive) return;
        try {
          const g2 = await API.get('/chat/groups');
          const groupList2 = (g2.data || []).map(g => ({ ...g, member_ids: normalizeGroupMemberIds(g) }));
          setGroups(groupList2);
          // check each group for new last message
          await Promise.all(groupList2.map(async grp => {
            try {
              const msgs = await API.get(`/chat/groups/${grp.id}/messages`);
              const last = (msgs.data || []).slice(-1)[0];
              if (last && last.id && last.sender_id !== user?.id) {
                const prev = lastSeenByGroupRef.current[grp.id];
                if (!prev || last.id !== prev) {
                  toast.info(`New message from ${last.sender_name}`, {
                    toastId: `chat-message-${grp.id}-${last.id}`,
                  });
                  lastSeenByGroupRef.current = { ...lastSeenByGroupRef.current, [grp.id]: last.id };
                  setLastSeenByGroup(prevMap => ({ ...prevMap, [grp.id]: last.id }));
                  // update lastMessageAt map
                  setLastMessageAt(prev => ({ ...prev, [last.sender_id]: last.created_at }));
                }
              }
              // also update lastMessageAt for all messages in group
              (msgs.data || []).forEach(m => {
                if (m && m.sender_id) {
                  setLastMessageAt(prev => ({ ...prev, [m.sender_id]: m.created_at }));
                }
              });
            } catch (e) { }
          }));
        } catch (e) { }
      }, 5000);
    };
    startPoll();
    return () => {
      isActive = false;
      if (pollId) clearInterval(pollId);
    };
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
      const mapped = (r.data || []).map(g => ({ ...g, member_ids: normalizeGroupMemberIds(g) }));
      setGroups(mapped);
      if (!activeGroup && mapped.length > 0) setActiveGroup(mapped[0]);
    }).catch(() => {});
  };

<<<<<<< Updated upstream
  const fetchMessages = async () => {
=======
  const handleDirectMessage = async (otherUser) => {
    if (!otherUser || otherUser.id === user?.id) return;
    try {
      // Fetch current groups and check for an existing 1:1 DM with this user
      const groupsRes = await API.get('/chat/groups');
      const groupsData = (groupsRes.data || []).map(g => ({ ...g, member_ids: normalizeGroupMemberIds(g) }));
      const existing = groupsData.find(g => {
        const ids = normalizeGroupMemberIds(g);
        return ids.includes(user?.id) && ids.includes(otherUser.id) && ids.length === 2;
      });
      if (existing) {
        setGroups(groupsData);
        setActiveGroup(existing);
        return;
      }

      // Create a 1:1 group with that user (backend will include member_ids in response)
      const createRes = await API.post('/chat/groups', { name: `DM: ${otherUser.name}`, memberIds: [otherUser.id] });
      if (createRes?.data?.group) {
        // backend returned full group
        const createdGroup = createRes.data.group;
        const all = await API.get('/chat/groups');
        setGroups((all.data || []).map(g => ({ ...g, member_ids: normalizeGroupMemberIds(g) })));
        // try to find the created group by matching member ids
        const found = (all.data || []).find(g => {
          const ids = normalizeGroupMemberIds(g);
          return ids.includes(user?.id) && ids.includes(otherUser.id) && ids.length === 2;
        });
        if (found) setActiveGroup(found);
        else setActiveGroup(createdGroup);
        return;
      }

      // Fallback: refresh groups and try to find the new DM (match both members)
      const r = await API.get('/chat/groups');
      setGroups((r.data || []).map(g => ({ ...g, member_ids: normalizeGroupMemberIds(g) })));
      const found = (r.data || []).find(g => {
        const ids = normalizeGroupMemberIds(g);
        return ids.includes(user?.id) && ids.includes(otherUser.id);
      });
      if (found) setActiveGroup(found);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!groupId) return;
    if (!window.confirm('Delete this group? This cannot be undone.')) return;
    try {
      await API.delete(`/chat/groups/${groupId}`);
      toast.success('Group deleted');
      fetchGroups();
      if (activeGroup?.id === groupId) setActiveGroup(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const fetchMessages = () => {
>>>>>>> Stashed changes
    if (!activeGroup) return;
    try {
      const r = await API.get(`/chat/groups/${activeGroup.id}/messages`);
      setMessages(r.data);
    } catch {}
  };
  
  // extend fetchMessages to update lastMessageAt map
  const fetchMessagesAndUpdate = () => {
    if (!activeGroup) return;
    API.get(`/chat/groups/${activeGroup.id}/messages`).then(r => {
      const msgs = r.data || [];
      setMessages(msgs);
      const newMap = {};
      msgs.forEach(m => { if (m && m.sender_id) newMap[m.sender_id] = m.created_at; });
      setLastMessageAt(prev => ({ ...prev, ...newMap }));
    }).catch(() => {});
  };

  const fetchMembers = () => {
    if (!activeGroup) return;
    API.get(`/chat/groups/${activeGroup.id}/members`).then(r => setMembers(r.data)).catch(() => {});
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!activeGroup?.id) {
      toast.error('Select a chat first');
      return;
    }
    try {
      await API.post(`/chat/groups/${activeGroup.id}/messages`, { message: newMessage.trim() });
      setNewMessage('');
<<<<<<< Updated upstream
      await fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send!');
    }
=======
      fetchMessages();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
>>>>>>> Stashed changes
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

  const isUserOnline = (userId) => {
    if (!userId) return false;
    if (userId === user?.id) return true; // yourself
    const ts = lastMessageAt[userId];
    if (!ts) return false;
    const delta = Date.now() - new Date(ts).getTime();
    return delta <= 60000; // online if message within last 60s
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
            <h3 style={styles.groupTitle}><Icon title="chat" /> Chats</h3>
            {canCreateGroup && (
              <button style={styles.createBtn} onClick={() => setShowCreateGroup(true)}>
                + New
              </button>
            )}
            <button style={styles.usersToggleBtn} onClick={() => setShowUserListPanel(prev => !prev)} title="Show users">Users</button>
          </div>
          {groups.map(g => (
<<<<<<< Updated upstream
            <div key={g.id}
              style={{ ...styles.groupItem, background: activeGroup?.id === g.id ? '#E3F0FF' : '#fff', borderLeft: activeGroup?.id === g.id ? '3px solid #1565C0' : '3px solid transparent' }}
=======
            <div key={g.id} style={{ ...styles.groupItem, background: activeGroup?.id === g.id ? 'var(--muted)' : 'var(--card-bg)', borderLeft: activeGroup?.id === g.id ? '3px solid var(--primary)' : '3px solid transparent' }}
>>>>>>> Stashed changes
              onClick={() => { setActiveGroup(g); setShowMembers(false); }}>
              <div style={styles.groupAvatar}>{g.name?.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <p style={styles.groupName}>{g.name}</p>
                {g.is_general && <span style={styles.generalBadge}>General</span>}
              </div>
              {(canManageGroups || ((g.member_ids || []).length <= 2 && (g.member_ids || []).includes(user?.id))) && (
                <button style={styles.groupDeleteBtn} onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }} title="Delete group"><Icon title="delete" /></button>
              )}
            </div>
          ))}

          {/* All users (quick DM) - hidden behind toggle button in header */}
          {showUserListPanel && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--card-border)' }}>
              <h4 style={{ margin: '8px 0', fontSize: '13px', fontWeight: '600' }}>All Users</h4>
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {users.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: activeGroup && (activeGroup.member_ids || activeGroup.members || []).includes(u.id) ? 'var(--muted-2)' : 'transparent' }}
                    onClick={() => handleDirectMessage(u)}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>{u.name?.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{u.name}</div>
                        <span style={{ ...styles.presenceDot, position: 'static', width: '9px', height: '9px', borderWidth: '1px', background: isUserOnline(u.id) ? 'var(--success)' : 'var(--danger)' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted-text)' }}>{u.role}</div>
                    </div>
                    <button style={styles.msgBtn} onClick={(e) => { e.stopPropagation(); handleDirectMessage(u); }}>Message</button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <Icon title="members" /> Members
                </button>
              </div>

              <div style={styles.chatBody}>
                {/* Messages */}
                <div style={styles.messagesArea}>
                  {messages.length === 0 ? (
                    <div style={styles.noMessages}>
                      <p style={styles.noMessagesText}>No messages yet. Say hello!</p>
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
<<<<<<< Updated upstream
                          {!isMe && <div style={styles.msgAvatar}>{msg.sender_name?.charAt(0)}</div>}
                          <div style={{ maxWidth: '60%', position: 'relative' }}>
=======
                          {!isMe && (
                            <div style={{ position: 'relative' }}>
                              <div style={styles.msgAvatar}>{msg.sender_name?.charAt(0)}</div>
                              <span style={{ ...styles.presenceDot, background: isUserOnline(msg.sender_id) ? 'var(--success)' : 'var(--danger)' }} />
                            </div>
                          )}
                          <div style={{ maxWidth: '60%' }}>
>>>>>>> Stashed changes
                            {!isMe && <p style={styles.senderName}>{msg.sender_name}</p>}
                            {editingId === msg.id ? (
                              <div style={styles.editBox}>
                                <input style={styles.editInput} value={editText}
                                  onChange={e => setEditText(e.target.value)} autoFocus />
                                <button style={styles.editSaveBtn} onClick={() => handleEdit(msg.id)}>Save</button>
                                <button style={styles.editCancelBtn} onClick={() => setEditingId(null)}><Icon title="close" /></button>
                              </div>
                            ) : (
<<<<<<< Updated upstream
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
=======
                              <div style={{ ...styles.messageBubble, background: isMe ? 'var(--primary)' : '#fff', color: isMe ? '#fff' : '#333', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                                <p style={styles.messageText}>{msg.message}</p>
                                {msg.is_edited && <p style={{ ...styles.editedLabel, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--muted-text)' }}>edited</p>}
                                <div style={styles.msgFooter}>
                                  <p style={{ ...styles.messageTime, color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--muted-text)' }}>{formatTime(msg.created_at)}</p>
                                  {isMe && (
                                    <div style={styles.msgActions}>
                                      <button style={styles.msgActionBtn} onClick={() => { setEditingId(msg.id); setEditText(msg.message); }}><Icon title="edit" /></button>
                                      <button style={styles.msgActionBtn} onClick={() => handleDelete(msg.id)}><Icon title="delete" /></button>
                                      <button style={styles.msgActionBtn} onClick={() => handleSeenBy(msg.id)}><Icon title="seen" /></button>
                                    </div>
                                  )}
                                </div>
>>>>>>> Stashed changes
                              </div>
                            )}
                          </div>
                          {isMe && (
<<<<<<< Updated upstream
                            <div style={{ ...styles.msgAvatar, background: '#1565C0', color: '#fff' }}>
                              {user?.name?.charAt(0)}
=======
                            <div style={{ position: 'relative' }}>
                              <div style={{ ...styles.msgAvatar, background: 'var(--primary)', color: '#fff' }}>{user?.name?.charAt(0)}</div>
                              <span style={{ ...styles.presenceDot, background: isUserOnline(user?.id) ? 'var(--success)' : 'var(--danger)' }} />
>>>>>>> Stashed changes
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Members Panel */}
<<<<<<< Updated upstream
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
=======
                {showMembers && (
                  <div style={styles.membersPanel}>
                    <h4 style={styles.membersPanelTitle}><Icon title="members" /> Group Members ({members.length})</h4>
                    {members.map(m => (
                      <div key={m.id} style={styles.memberRow}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ ...styles.memberRowAvatar, background: m.id === user?.id ? 'var(--primary)' : 'var(--muted)', color: m.id === user?.id ? '#fff' : 'var(--primary)' }}>{m.name?.charAt(0)}</div>
                          <span style={{ ...styles.presenceDot, background: isUserOnline(m.id) ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
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
                    <h4 style={styles.seenTitle}><Icon title="seen" /> Seen by</h4>
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

>>>>>>> Stashed changes
              <div style={styles.inputArea}>
                <input
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
<<<<<<< Updated upstream
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button style={styles.sendBtn} onClick={handleSend}>Send ➤</button>
=======
                  onKeyDown={e => e.key === 'Enter' && handleSend()} />
                <button style={styles.sendBtn} onClick={handleSend}><Icon title="send" /></button>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                  <div key={u.id}
                    style={{ ...styles.memberItem, background: selectedMembers.includes(u.id) ? '#E3F0FF' : '#F8FAFF', border: selectedMembers.includes(u.id) ? '1.5px solid #1565C0' : '1.5px solid #E8EDF5' }}
=======
                  <div key={u.id} style={{ ...styles.memberItem, background: selectedMembers.includes(u.id) ? 'var(--muted)' : 'var(--muted-2)', border: selectedMembers.includes(u.id) ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)' }}
>>>>>>> Stashed changes
                    onClick={() => toggleMember(u.id)}>
                    <div style={styles.memberAvatar}>{u.name?.charAt(0)}</div>
                    <div>
                      <p style={styles.memberName}>{u.name}</p>
                      <p style={styles.memberRole}>{u.role}</p>
                    </div>
                    {selectedMembers.includes(u.id) && <span style={styles.checkmark}><Icon title="check" /></span>}
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
<<<<<<< Updated upstream
  container: { display: 'flex', height: 'calc(100vh - 48px)', background: '#fff', borderRadius: '12px', border: '1px solid #E8EDF5', overflow: 'hidden', marginTop: '-24px', marginLeft: '-24px', marginRight: '-24px' },
  groupSidebar: { width: '240px', minWidth: '240px', borderRight: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  groupHeader: { padding: '16px', borderBottom: '1px solid #E8EDF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
=======
  container: { display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', overflow: 'hidden' },
  groupSidebar: { width: '240px', minWidth: '240px', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  groupHeader: { padding: '16px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
>>>>>>> Stashed changes
  groupTitle: { margin: 0, fontSize: '15px', fontWeight: '600', color: '#333' },
  createBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  usersToggleBtn: { background: 'var(--card-bg)', color: 'var(--primary)', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', marginLeft: '8px' },
  groupItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', cursor: 'pointer' },
  groupDeleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '6px', marginLeft: '6px' },
  msgBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  groupAvatar: { width: '38px', height: '38px', minWidth: '38px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#fff' },
  groupName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
  generalBadge: { fontSize: '10px', background: 'var(--muted)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '8px', fontWeight: '600' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '12px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--muted-2)' },
  chatGroupName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
  chatGroupSub: { margin: 0, fontSize: '11px', color: 'var(--muted-text)' },
  membersBtn: { background: 'var(--muted)', color: 'var(--primary)', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  chatBody: { flex: 1, display: 'flex', overflow: 'hidden' },
<<<<<<< Updated upstream
  messagesArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#F0F4F8' },
  membersPanel: { width: '200px', borderLeft: '1px solid #E8EDF5', padding: '16px', overflowY: 'auto', background: '#fff' },
=======
  messagesArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--muted-2)' },
  membersPanel: { width: '200px', borderLeft: '1px solid var(--card-border)', padding: '16px', overflowY: 'auto', background: 'var(--card-bg)' },
>>>>>>> Stashed changes
  membersPanelTitle: { margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#333' },
  memberRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  memberRowAvatar: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', minWidth: '32px' },
  memberRowName: { margin: '0 0 2px', fontSize: '12px', fontWeight: '600', color: '#333' },
  memberRowRole: { margin: 0, fontSize: '10px', color: 'var(--muted-text)', textTransform: 'capitalize' },
  youTag: { color: 'var(--primary)', fontSize: '10px' },
  noMessages: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noMessagesText: { color: 'var(--muted-text)', fontSize: '14px' },
  dateDivider: { textAlign: 'center', margin: '8px 0' },
<<<<<<< Updated upstream
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
=======
  dateDividerText: { background: 'var(--card-border)', color: 'var(--muted-text)', fontSize: '11px', padding: '2px 10px', borderRadius: '20px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgAvatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', minWidth: '36px', background: 'var(--card-bg)', color: 'var(--text)', border: '1px solid var(--card-border)' },
  presenceDot: { position: 'absolute', right: -4, bottom: -4, width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' },
  msgAvatar: { width: '30px', height: '30px', minWidth: '30px', background: 'var(--muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' },
  senderName: { margin: '0 0 2px', fontSize: '11px', color: 'var(--muted-text)', fontWeight: '600' },
  messageBubble: { padding: '10px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  messageText: { margin: '0 0 2px', fontSize: '13px', lineHeight: '1.4' },
  editedLabel: { margin: 0, fontSize: '10px', fontStyle: 'italic' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  messageTime: { margin: 0, fontSize: '10px' },
  msgActions: { display: 'flex', gap: '4px' },
  msgActionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: '2px' },
  editBox: { display: 'flex', gap: '6px', alignItems: 'center' },
  editInput: { flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1.5px solid var(--card-border)', fontSize: '13px', outline: 'none' },
  editSaveBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' },
  editCancelBtn: { background: '#FFEBEE', color: 'var(--danger)', border: 'none', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', cursor: 'pointer' },
>>>>>>> Stashed changes
  seenOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  seenModal: { background: '#fff', borderRadius: '12px', padding: '24px', width: '300px', maxHeight: '400px', overflowY: 'auto' },
  seenTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#333' },
  seenEmpty: { color: 'var(--muted-text)', fontSize: '14px', textAlign: 'center' },
  seenRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  seenAvatar: { width: '34px', height: '34px', background: 'var(--muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'var(--primary)', minWidth: '34px' },
  seenName: { margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#333' },
<<<<<<< Updated upstream
  seenTime: { margin: 0, fontSize: '12px', color: '#888' },
  seenClose: { width: '100%', background: '#E3F0FF', color: '#1565C0', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' },
=======
  seenTime: { margin: 0, fontSize: '12px', color: 'var(--muted-text)' },
  seenClose: { width: '100%', background: 'var(--muted)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' },
  inputArea: { padding: '12px 16px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '10px', background: 'var(--card-bg)' },
  messageInput: { flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1.5px solid var(--card-border)', fontSize: '13px', outline: 'none', background: 'var(--muted-2)' },
  sendBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  noChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noChatText: { color: 'var(--muted-text)', fontSize: '15px' },
>>>>>>> Stashed changes
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '400px', maxHeight: '80vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#1A1A2E' },
  modalInput: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--card-border)', fontSize: '14px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' },
  modalLabel: { margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#444' },
  membersList: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  memberItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
  memberAvatar: { width: '34px', height: '34px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', minWidth: '34px' },
  memberName: { margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#333' },
<<<<<<< Updated upstream
  memberRole: { margin: 0, fontSize: '11px', color: '#888', textTransform: 'capitalize' },
  checkmark: { marginLeft: 'auto', color: '#1565C0', fontWeight: '700', fontSize: '16px' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelModalBtn: { background: '#F0F4F8', color: '#555', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  createModalBtn: { background: '#1565C0', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  addMemberSection: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
addMemberSelect: { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1.5px solid #D0DCF0', fontSize: '12px', outline: 'none', background: '#F8FAFF', cursor: 'pointer' },
deleteGroupBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', width: '100%' },
removeMemberBtn: { background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
=======
  memberRole: { margin: 0, fontSize: '11px', color: 'var(--muted-text)', textTransform: 'capitalize' },
  checkmark: { marginLeft: 'auto', color: 'var(--primary)', fontWeight: '700' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelModalBtn: { background: '#F0F4F8', color: 'var(--muted-text)', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  createModalBtn: { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
>>>>>>> Stashed changes
};

export default Chat;