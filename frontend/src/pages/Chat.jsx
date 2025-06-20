import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import axios from 'axios';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      socket.on('message', handleNewMessage);
      socket.on('messageUpdate', handleMessageUpdate);
      
      return () => {
        socket.off('message');
        socket.off('messageUpdate');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/chat/messages');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleMessageUpdate = (updatedMessage) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        sender: user._id,
        timestamp: new Date(),
      };

      // Optimistic update
      const tempMessage = {
        ...messageData,
        _id: Date.now().toString(),
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        sending: true,
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send via socket
      if (socket) {
        socket.emit('sendMessage', messageData);
      } else {
        // Fallback to HTTP request
        const response = await axios.post('/api/chat/messages', messageData);
        // Remove temp message and add real one
        setMessages(prev => 
          prev.filter(msg => msg._id !== tempMessage._id).concat(response.data.message)
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Support Chat
            </h1>
            <p className="text-sm text-gray-500">
              Get help from our support team
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex flex-col h-screen">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {Object.keys(messageGroups).length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No messages yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start a conversation with our support team.
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">
                      {formatDate(date)}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="mt-6 space-y-4">
                  {dateMessages.map((message, index) => {
                    const isCurrentUser = message.sender._id === user._id;
                    const showAvatar = !isCurrentUser && (
                      index === 0 || 
                      dateMessages[index - 1]?.sender._id !== message.sender._id
                    );

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-3' : 'mr-3'}`}>
                            {showAvatar ? (
                              message.sender.avatar ? (
                                <img
                                  src={message.sender.avatar}
                                  alt={message.sender.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-gray-600" />
                                </div>
                              )
                            ) : (
                              <div className="h-8 w-8" />
                            )}
                          </div>

                          {/* Message */}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            } ${message.sending ? 'opacity-50' : ''}`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <p className="text-xs text-gray-500 mb-1">
                                {message.sender.name}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                              {message.sending && ' • Sending...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="block w-full border-gray-300 rounded-full px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <LoadingSpinner size="small" />
              ) : (
                <PaperAirplaneIcon className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
