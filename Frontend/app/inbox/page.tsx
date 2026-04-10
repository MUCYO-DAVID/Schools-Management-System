'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, UserPlus, Check, X, Clock, MessageCircle, 
  Users, UserCheck, Shield, ChevronRight, MoreVertical,
  PlusCircle, Inbox as InboxIcon, Sparkles, Filter, Paperclip, Image as ImageIcon, FileText, UserX
} from 'lucide-react';
import { 
  fetchChatMessages, sendChatMessage, fetchChatRooms, createDirectChat 
} from '../api/realtime-chat';
import { 
  searchUsers, fetchSuggestedUsers, fetchAllUsers, sendConnectionRequest, fetchFriends, fetchPendingRequests, respondToConnectionRequest, removeConnection 
} from '../api/connections';
import { useAuth } from '../providers/AuthProvider';
import Navigation from '../components/Navigation';
import UserProfile from '../components/UserProfile';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

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
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'danger'|'warning'|'info',
    confirmText?: string
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Use individual try-catch or Promise.allSettled for robustness
      const results = await Promise.allSettled([
        fetchChatRooms(),
        fetchFriends(),
        fetchPendingRequests(),
        fetchSuggestedUsers(),
        fetchAllUsers()
      ]);

      if (results[0].status === 'fulfilled') setRooms(results[0].value);
      if (results[1].status === 'fulfilled') setFriends(results[1].value);
      if (results[2].status === 'fulfilled') setPendingRequests(results[2].value);
      if (results[3].status === 'fulfilled') setSuggestedUsers(results[3].value);
      if (results[4].status === 'fulfilled') setAllUsers(results[4].value);

      // Log errors if any failed
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          console.error(`Error loading data at index ${idx}:`, res.reason);
        }
      });
    } catch (err) {
      console.error('Fatal error loading inbox data:', err);
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
    if ((!messageInput.trim() && !selectedFile) || !selectedRoom) return;

    const text = messageInput.trim();
    const file = selectedFile;
    
    setMessageInput('');
    setSelectedFile(null);
    setIsUploading(true);

    try {
      let messageType = 'text';
      if (file) {
        messageType = file.type.startsWith('image/') ? 'image' : 'document';
      }

      const newMsg = await sendChatMessage(selectedRoom, text, messageType, file || undefined);
      setMessages(prev => [...prev, newMsg]);
      refreshRooms();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageInput(text);
      setSelectedFile(file);
      toast.error('Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File is too large (max 10MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
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
      console.log('Sending friend request to:', targetUserId);
      const res = await sendConnectionRequest(targetUserId);
      console.log('Friend request response:', res);
      
      // Refresh lists to show pending status
      const updateList = (list: any[]) => list.map(u => 
        Number(u.id) === Number(targetUserId) ? { ...u, connection_status: 'pending', request_sender_id: user?.id } : u
      );
      setSearchResults(prev => updateList(prev));
      setSuggestedUsers(prev => updateList(prev));
      setAllUsers(prev => updateList(prev));
      
      toast.success('Friend request sent!');
    } catch (err: any) {
      console.error('Error adding friend:', err);
      toast.error('Failed to send request: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRespondRequest = async (requestId: number, action: 'accepted' | 'rejected') => {
    try {
      await respondToConnectionRequest(requestId, action);
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId));
      if (action === 'accepted') {
        const updatedFriends = await fetchFriends();
        setFriends(updatedFriends);
        // Refresh rooms to see the new direct chat room
        refreshRooms();
        // Maybe even start chat immediately
        const acceptedReq = pendingRequests.find(r => r.request_id === requestId);
        if (acceptedReq) {
          startChat(acceptedReq.id);
        }
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

  const handleUnfollow = (targetUserId: number) => {
    setConfirmAction({
      title: 'Unfollow Person',
      message: 'Are you sure you want to unfollow this person? They will be removed from your connections.',
      confirmText: 'Unfollow',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await removeConnection(targetUserId);
          toast.success('Unfollowed successfully');
          
          const updateList = (list: any[]) => list.map(u => 
            Number(u.id) === Number(targetUserId) ? { ...u, connection_status: null, request_sender_id: null } : u
          );
          setSearchResults(prev => updateList(prev));
          setSuggestedUsers(prev => updateList(prev));
          setAllUsers(prev => updateList(prev));
          setFriends(prev => prev.filter(f => Number(f.id) !== Number(targetUserId)));
        } catch (err: any) {
          console.error('Error unfollowing:', err);
          toast.error('Failed to unfollow');
        }
      }
    });
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
                      placeholder="Find anyone in the system..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length === 0) setSearchResults([]);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition-all placeholder:text-slate-600"
                    />
                  </form>

                  {/* People Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pl-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {searchQuery.length > 0 ? 'Search Results' : 'Everyone'}
                      </p>
                      <span className="text-[10px] text-purple-500 font-bold">
                        {loading ? 'Fetching...' : `${(searchQuery.length > 0 ? searchResults : allUsers).length} People`}
                      </span>
                    </div>
                    
                    {loading && (searchQuery.length > 0 ? searchResults : allUsers).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-xs">Loading people...</p>
                      </div>
                    ) : (searchQuery.length > 0 ? searchResults : allUsers).length === 0 ? (
                      <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-20" />
                        <p className="text-xs text-slate-500">No one found in the system</p>
                        <button 
                          onClick={loadInitialData}
                          className="mt-4 text-[10px] text-purple-400 font-bold uppercase tracking-widest hover:text-purple-300 transition-colors"
                        >
                          Retry Refresh
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {(searchQuery.length > 0 ? searchResults : allUsers).map((u) => (
                          <div 
                            key={u.id} 
                            className="bg-[#1a1a1e] hover:bg-[#202024] rounded-3xl p-4 flex items-center gap-4 border border-white/5 transition-all group"
                          >
                            {/* Profile Pic with focus - CLICKABLE TO SEE PROFILE */}
                            <div 
                              className="relative shrink-0 cursor-pointer" 
                              onClick={() => setSelectedUserForDetail(u.id)}
                            >
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center font-bold text-xl text-purple-400 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} className="w-full h-full object-cover" alt={u.first_name} />
                                ) : (
                                  u.first_name[0].toUpperCase()
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1a1a1e]" />
                            </div>

                            {/* Info - CLICKABLE TO SEE PROFILE */}
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => setSelectedUserForDetail(u.id)}
                            >
                              <h4 className="text-sm font-black text-slate-200 truncate">
                                {u.first_name} {u.last_name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                                  u.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                                  u.role === 'teacher' ? 'bg-blue-500/10 text-blue-400' :
                                  u.role === 'parent' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-purple-500/10 text-purple-400'
                                }`}>
                                  {u.role}
                                </span>
                                {u.email && <span className="text-[9px] text-slate-500 truncate hidden sm:inline">{u.email}</span>}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0">
                              {u.connection_status === 'accepted' ? (
                              <button 
                                onClick={() => startChat(u.id)} 
                                className="p-3 rounded-2xl text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 transition-all hover:scale-110 active:scale-95"
                                title="Message"
                              >
                                <MessageCircle className="w-5 h-5" />
                              </button>
                            ) : u.connection_status === 'pending' ? (
                              Number(u.request_sender_id) === Number(user?.id) ? (
                                <div className="flex flex-col items-center px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                                  <Clock className="w-4 h-4 text-slate-500 mb-0.5" />
                                  <span className="text-[8px] text-slate-500 font-bold uppercase">Sent</span>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setActiveTab('requests')} 
                                  className="px-4 py-2 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                  Accept?
                                </button>
                              )
                            ) : (
                                <button 
                                  onClick={() => handleAddFriend(u.id)}
                                  className="p-3 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all hover:scale-110 active:scale-95 group-hover:shadow-purple-600/40"
                                  title="Add Friend"
                                >
                                  <UserPlus className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Friends section removed as it's now integrated or redundant with "Everyone" grid if they are friends */}
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
                  <div className="relative">
                    <button 
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showChatMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden text-sm">
                        <button 
                          onClick={() => {
                            setShowChatMenu(false);
                            if (currentRoom?.other_user) handleUnfollow(currentRoom.other_user.id);
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                          <UserX className="w-4 h-4" /> Unfollow
                        </button>
                      </div>
                    )}
                  </div>
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
                          
                          {msg.message_type === 'image' && msg.attachment_url && (
                            <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                              <img 
                                src={getImageUrl(msg.attachment_url)} 
                                alt="Attachment" 
                                className="max-w-full h-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                                onClick={() => window.open(getImageUrl(msg.attachment_url), '_blank')}
                              />
                            </div>
                          )}

                          {msg.message_type === 'document' && msg.attachment_url && (
                            <a 
                              href={getImageUrl(msg.attachment_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                isOwn ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-black/20 border-white/5 hover:bg-black/30'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Document</p>
                                <p className="text-xs font-bold truncate text-slate-200">View Attachment</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            </a>
                          )}

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
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                        {selectedFile.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-purple-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-slate-200">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-3xl p-2 pl-5 focus-within:border-purple-600/50 transition-all shadow-inner">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-purple-400 transition-colors"
                    title="Attach File"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder={selectedFile ? "Add a caption..." : "Type your message..."}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 placeholder:text-slate-600"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedFile) || isUploading}
                    className="bg-purple-600 p-3 rounded-2xl text-white disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
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

      {/* Profile Detail Modal */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setSelectedUserForDetail(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141418] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black">User Profile</h3>
                {(() => {
                  const target = [...allUsers, ...searchResults].find(u => u.id === selectedUserForDetail);
                  if (target?.connection_status === 'accepted') {
                    return (
                      <button 
                        onClick={() => {
                          startChat(selectedUserForDetail);
                          setSelectedUserForDetail(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Send Message
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              <button 
                onClick={() => setSelectedUserForDetail(null)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
              <UserProfile 
                userId={selectedUserForDetail} 
                onClose={() => setSelectedUserForDetail(null)} 
              />
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          variant={confirmAction.variant}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
