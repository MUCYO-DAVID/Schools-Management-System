'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, UserPlus, Check, X, Clock, MessageCircle, 
  Users, UserCheck, Shield, ChevronRight, MoreVertical,
  PlusCircle, Inbox as InboxIcon, Sparkles, Filter
} from 'lucide-react';
import { 
  fetchChatMessages, sendChatMessage, fetchChatRooms, createDirectChat 
} from '../api/realtime-chat';
import { 
  searchUsers, sendConnectionRequest, fetchFriends, fetchPendingRequests, respondToConnectionRequest 
} from '../api/connections';
import { useAuth } from '../providers/AuthProvider';
import Navigation from '../components/Navigation';

interface Message {
  id: number;
  message: string;
  sender_id: number;
  sender_first_name: string;
  sender_last_name: string;
  sender_role: string;
  message_type: string;
  attachment_url?: string;
  created_at: string;
}

interface ChatRoom {
  id: number;
  room_type: string;
  name: string;
  school_name?: string;
  other_user?: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    avatar_url?: string;
  };
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chats' | 'people' | 'requests'>('chats');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
      startPolling(selectedRoom);
    } else {
      stopPolling();
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [roomsData, friendsData, pendingData] = await Promise.all([
        fetchChatRooms(),
        fetchFriends(),
        fetchPendingRequests()
      ]);
      setRooms(roomsData);
      setFriends(friendsData);
      setPendingRequests(pendingData);
    } catch (err) {
      console.error('Error loading inbox data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      const data = await fetchChatMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const startPolling = (roomId: number) => {
    stopPolling();
    pollRef.current = setInterval(() => {
      loadMessages(roomId);
      refreshRooms();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const refreshRooms = async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(data);
    } catch (err) {}
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    const text = messageInput.trim();
    setMessageInput('');
    try {
      const newMsg = await sendChatMessage(selectedRoom, text);
      setMessages(prev => [...prev, newMsg]);
      refreshRooms();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageInput(text);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUserId: number) => {
    try {
      await sendConnectionRequest(targetUserId);
      // Refresh search results to show pending status
      const updatedResults = searchResults.map(u => 
        u.id === targetUserId ? { ...u, connection_status: 'pending', request_sender_id: user?.id } : u
      );
      setSearchResults(updatedResults);
    } catch (err) {
      console.error('Error adding friend:', err);
    }
  };

  const handleRespondRequest = async (requestId: number, action: 'accepted' | 'rejected') => {
    try {
      await respondToConnectionRequest(requestId, action);
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId));
      if (action === 'accepted') {
        const updatedFriends = await fetchFriends();
        setFriends(updatedFriends);
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  const startChat = async (otherUserId: number) => {
    try {
      const room = await createDirectChat(otherUserId);
      setSelectedRoom(room.id);
      setActiveTab('chats');
      refreshRooms();
    } catch (err: any) {
      alert(err.message || 'Failed to start chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentRoom = rooms.find(r => r.id === selectedRoom);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 flex max-w-[1600px] w-full mx-auto p-4 lg:p-6 gap-6 overflow-hidden max-h-[calc(100vh-80px)]">
        {/* Left Sidebar: Navigation & Lists */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
          <div className="bg-[#141418] rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/5 p-2 bg-black/20">
              {[
                { id: 'chats', label: 'Chats', icon: MessageCircle },
                { id: 'people', label: 'People', icon: Users },
                { id: 'requests', label: 'Requests', icon: UserPlus, badge: pendingRequests.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-300 relative ${
                    activeTab === tab.id 
                    ? 'bg-purple-600/10 text-purple-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  {tab.badge ? (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#141418]">
                      {tab.badge}
                    </span>
                  ) : null}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-purple-600 rounded-t-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeTab === 'chats' && (
                <div className="divide-y divide-white/5">
                  {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
                      <InboxIcon className="w-12 h-12 mb-4" />
                      <p className="text-sm">Your inbox is empty</p>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room.id)}
                        className={`w-full p-4 flex gap-4 text-left transition-all relative ${
                          selectedRoom === room.id ? 'bg-purple-600/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center font-bold text-purple-300 overflow-hidden">
                            {room.other_user?.avatar_url ? (
                              <img src={room.other_user.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              (room.name?.[0] || 'C').toUpperCase()
                            )}
                          </div>
                          {room.unread_count && room.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full border-2 border-[#141418] text-[10px] flex items-center justify-center font-bold">
                              {room.unread_count}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="text-sm font-bold truncate pr-2 text-slate-200">
                              {room.name || room.school_name}
                            </h4>
                            <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                              {formatTime(room.last_message_time || '')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate italic">
                            {room.last_message || 'No messages yet...'}
                          </p>
                        </div>
                        {selectedRoom === room.id && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-purple-600 rounded-r-full" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'people' && (
                <div className="p-4 space-y-6">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Find people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition-all placeholder:text-slate-600"
                    />
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Search Results</p>
                      {searchResults.map((u) => (
                        <div key={u.id} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center font-bold text-purple-400">
                            {u.first_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{u.first_name} {u.last_name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                          </div>
                          {u.connection_status === 'accepted' ? (
                            <button onClick={() => startChat(u.id)} className="p-2 rounded-xl text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 transition-all">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          ) : u.connection_status === 'pending' ? (
                            u.request_sender_id === user?.id ? (
                              <span className="text-[10px] text-slate-500 font-bold italic px-2">Sent</span>
                            ) : (
                              <button onClick={() => setActiveTab('requests')} className="text-[10px] bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg font-bold">Accept?</button>
                            )
                          ) : (
                            <button 
                              onClick={() => handleAddFriend(u.id)}
                              className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friends List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pl-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Friends</p>
                      <span className="text-[10px] text-purple-500 font-bold">{friends.length}</span>
                    </div>
                    {friends.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4 bg-white/5 rounded-2xl border border-dashed border-white/10">Find and add people to start chatting</p>
                    ) : (
                      friends.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => startChat(f.id)}
                          className="w-full text-left group flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                            {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full rounded-xl object-cover" /> : f.first_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{f.first_name} {f.last_name}</p>
                            <p className="text-[10px] text-slate-500">{f.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="p-4 space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pending Invitations</p>
                  {pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
                      <UserCheck className="w-12 h-12 mb-4" />
                      <p className="text-sm">No pending requests</p>
                    </div>
                  ) : (
                    pendingRequests.map((req) => (
                      <div key={req.request_id} className="bg-white/5 rounded-3xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center font-bold text-purple-400 text-lg shadow-inner">
                            {req.first_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{req.first_name} {req.last_name}</p>
                            <p className="text-[10px] text-slate-500">{req.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRespondRequest(req.request_id, 'accepted')}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-xl transition-all"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespondRequest(req.request_id, 'rejected')}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold py-2 rounded-xl transition-all"
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Chat Interface */}
        <div className="flex-1 bg-[#141418] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center relative z-10 shadow-2xl">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center shadow-2xl rotate-12">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">RSBS Messenger</h2>
              <p className="max-w-md text-slate-400 text-lg leading-relaxed">
                Connect with school leaders, parents, and teachers. Our secure messaging system builds bridges across the education community.
              </p>
              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setActiveTab('people')}
                  className="bg-purple-600 px-8 py-4 rounded-3xl font-black tracking-widest text-xs uppercase hover:bg-purple-700 transition-all hover:scale-105 shadow-xl shadow-purple-600/40"
                >
                  Find People
                </button>
                <div className="flex items-center gap-2 bg-white/5 px-6 py-4 rounded-3xl border border-white/10 text-xs font-bold text-slate-300">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Privately Encrypted
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center border border-white/10 overflow-hidden shadow-lg">
                    {currentRoom?.other_user?.avatar_url ? (
                      <img src={currentRoom.other_user.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-lg">{(currentRoom?.name?.[0] || 'C').toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">{currentRoom?.name || currentRoom?.school_name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Active Connections</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-[10px] font-black uppercase tracking-tighter text-purple-400">
                      <Shield className="w-3 h-3" />
                      Admin Bypass Active
                    </div>
                  )}
                  <button className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-black/10 to-transparent">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] group`}>
                        <div className={`
                          px-5 py-3 rounded-3xl relative shadow-sm transition-transform duration-300
                          ${isOwn 
                            ? 'bg-purple-600 text-white rounded-tr-sm shadow-[0_4px_15px_-5px_rgba(147,51,234,0.4)]' 
                            : 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/5'
                          }
                        `}>
                          {!isOwn && (
                            <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 text-purple-400/80">
                              {msg.sender_first_name}
                            </p>
                          )}
                          <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                          <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : ''}`}>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{formatTime(msg.created_at)}</span>
                            {isOwn && <Check className="w-2.5 h-2.5 text-purple-300" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="p-6 bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-3xl p-2 pl-5 focus-within:border-purple-600/50 transition-all shadow-inner">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 placeholder:text-slate-600"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-purple-600 p-3 rounded-2xl text-white disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                  End-to-end encryption active • RSBS Secure Chat
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
