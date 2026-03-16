'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, Users, MessageCircle, Clock, Check, CheckCheck } from 'lucide-react';
import { fetchChatMessages, sendChatMessage, fetchChatRooms, createDirectChat } from '../api/realtime-chat';
import { useAuth } from '../providers/AuthProvider';

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
  };
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

interface ChatWindowProps {
  onClose: () => void;
  initialRoomId?: number;
  initialUserId?: number; // For starting a direct chat with a user
}

export default function ChatWindow({ onClose, initialRoomId, initialUserId }: ChatWindowProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(initialRoomId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showRooms, setShowRooms] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat rooms
  useEffect(() => {
    loadRooms();
  }, []);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
      startPolling(selectedRoom);
    } else if (initialUserId && user) {
      // Create direct chat with initial user
      handleCreateDirectChat(initialUserId);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedRoom, initialUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchChatRooms();
      setRooms(data);
      if (data.length > 0 && !selectedRoom && !initialUserId) {
        setSelectedRoom(data[0].id);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      const data = await fetchChatMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startPolling = (roomId: number) => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll for new messages every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      loadMessages(roomId);
      loadRooms(); // Also refresh rooms to update unread counts
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom || sending) return;

    const messageText = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const newMessage = await sendChatMessage(selectedRoom, messageText);
      setMessages((prev) => [...prev, newMessage]);
      // Reload rooms to update last message
      loadRooms();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      setMessageInput(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleCreateDirectChat = async (otherUserId: number) => {
    try {
      const room = await createDirectChat(otherUserId);
      setSelectedRoom(room.id);
      await loadRooms();
    } catch (error) {
      console.error('Error creating direct chat:', error);
      alert('Failed to start chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRooms(!showRooms)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            {currentRoom && (
              <span className="text-sm text-gray-500">
                {currentRoom.room_type === 'direct' 
                  ? `Chat with ${currentRoom.name}`
                  : currentRoom.name || currentRoom.school_name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms Sidebar */}
          {(showRooms || window.innerWidth >= 768) && (
            <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Chats</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading chats...</div>
                ) : rooms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No chats yet</div>
                ) : (
                  rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room.id);
                        if (window.innerWidth < 768) setShowRooms(false);
                      }}
                      className={`w-full p-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-200 ${
                        selectedRoom === room.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {room.name || room.school_name || 'Chat'}
                            </p>
                          </div>
                          {room.last_message && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {room.last_message}
                            </p>
                          )}
                          {room.last_message_time && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(room.last_message_time)}
                            </p>
                          )}
                        </div>
                        {room.unread_count && room.unread_count > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 ml-2">
                            {room.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold mb-1 opacity-75">
                                {message.sender_first_name} {message.sender_last_name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatTime(message.created_at)}
                              </span>
                              {isOwnMessage && (
                                <CheckCheck className="w-3 h-3 text-blue-100" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
