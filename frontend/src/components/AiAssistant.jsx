import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/aiApi';
import { 
  MessageSquare, Send, X, Bot, User, Sparkles, 
  Calendar, Star, Clock, CreditCard, ChevronDown, Scissors, AlertCircle, RotateCcw
} from 'lucide-react';

const AiAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Salon Luxe! ✨ I'm your appointment assistant. I can help you discover services, find salons, check availability, and book appointments. What are you looking for today?",
      type: 'TEXT',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Only show for authenticated CUSTOMER or ADMIN users
  if (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN')) {
    return null;
  }

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: "Welcome to Salon Luxe! ✨ I'm your appointment assistant. I can help you discover services, find salons, check availability, and book appointments. What are you looking for today?",
        type: 'TEXT',
      },
    ]);
    setError('');
  };

  const handleSend = async (messageText = null) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setError('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text, type: 'TEXT' }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(text, conversationId);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
          type: response.type || 'TEXT',
          options: response.options || [],
          bookingId: response.bookingId || null,
        },
      ]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Please log in to use the AI assistant.');
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I'm sorry, I encountered an issue: ${errorMsg}`,
            type: 'ERROR',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionSelect = (option) => {
    const confirmMsg = `Yes, please book the ${option.startTime?.slice(0, 5)} slot for ${option.serviceName} at ${option.shopName} on ${option.date}.`;
    handleSend(confirmMsg);
  };

  const handleViewBookings = () => {
    setIsOpen(false);
    navigate('/my-bookings');
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.role === 'user';

    return (
      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-[#2a1e16] border border-amber-600/40 flex items-center justify-center shrink-0 mr-2.5 mt-1">
            <Scissors className="w-4 h-4 text-amber-400" />
          </div>
        )}

        <div className={`max-w-[82%] ${isUser ? 'order-1' : ''}`}>
          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-stone-950 rounded-br-md'
                : msg.type === 'ERROR'
                ? 'bg-red-950/50 border border-red-800/60 text-red-200 rounded-bl-md'
                : 'bg-[#1e1914] border border-[#3d2e24] text-[#dcd0c0] rounded-bl-md'
            }`}
          >
            {/* Render text with line breaks */}
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>

          {/* Appointment Option Cards */}
          {msg.type === 'APPOINTMENT_OPTIONS' && msg.options && msg.options.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {msg.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className="bg-[#191410] border border-[#4a3828] rounded-xl p-3.5 hover:border-amber-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#fef3c7]">{opt.shopName}</span>
                        {opt.shopRating && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {opt.shopRating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-300 font-medium">{opt.serviceName}</p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-[#a39485]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500/60" />
                          {opt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500/60" />
                          {opt.startTime?.slice(0, 5)} - {opt.endTime?.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-400 font-mono">
                          ₹{opt.price}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOptionSelect(opt)}
                      className="px-3 py-2 retro-btn-brass rounded-lg text-[10px] font-cinzel font-bold tracking-wider uppercase shrink-0 cursor-pointer"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Confirmed Card */}
          {msg.type === 'BOOKING_CONFIRMED' && msg.bookingId && (
            <div className="mt-3 bg-[#162719] border border-emerald-600/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xs font-cinzel font-bold text-emerald-300 uppercase tracking-wider">
                  Booking Created
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mb-3">
                Complete payment to confirm your appointment.
              </p>
              <button
                onClick={handleViewBookings}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-cinzel font-bold rounded-lg transition tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Go to My Bookings & Pay
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center shrink-0 ml-2.5 mt-1">
            <User className="w-4 h-4 text-amber-300" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-toggle"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full retro-btn-brass flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 cursor-pointer group"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 text-stone-900 group-hover:scale-110 transition-transform" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] flex flex-col bg-[#12100e] border-2 border-[#574132] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="bg-[#15110e] border-b border-[#3d2e24] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#241b15] border border-amber-600/50 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-serif-vintage font-bold text-[#fef3c7] leading-tight">
                  Salon Luxe Assistant
                </h3>
                <span className="text-[10px] font-cinzel text-amber-400/80 tracking-widest uppercase font-semibold">
                  AI Concierge
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg text-[#a39485] hover:text-amber-400 hover:bg-amber-950/30 transition cursor-pointer border border-transparent hover:border-amber-900/40"
                title="Start New Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#a39485] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer border border-transparent hover:border-red-900/40"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barber Pole Accent */}
          <div className="h-0.5 w-full barber-pole-stripes" />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
            {messages.map((msg, idx) => renderMessage(msg, idx))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#2a1e16] border border-amber-600/40 flex items-center justify-center shrink-0 mr-2.5 mt-1">
                  <Scissors className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '2s' }} />
                </div>
                <div className="bg-[#1e1914] border border-[#3d2e24] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-4 mb-2 px-3 py-2 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-2 text-[11px] text-red-300">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-[#3d2e24] bg-[#15110e] px-3 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about services, salons, or book an appointment..."
                disabled={isLoading}
                className="flex-1 bg-[#1a1511] border border-[#3d2e24] rounded-xl px-3.5 py-2.5 text-sm text-[#fef3c7] placeholder-[#6b5c4f] focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50 transition"
                id="ai-chat-input"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 retro-btn-brass rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition hover:scale-105"
                title="Send message"
                id="ai-chat-send"
              >
                <Send className="w-4 h-4 text-stone-900" />
              </button>
            </div>
            <p className="text-[9px] font-retro-mono text-[#5a4d42] text-center mt-2">
              AI-powered • Prices & availability from Salon Luxe
            </p>
          </div>
        </div>
      )}

      {/* Animation Keyframe */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default AiAssistant;
