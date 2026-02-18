import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const roomId = `student_${user?.id}`;

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const response = await API.get(`/chat/history/${roomId}`);
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to load chat history');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const msgText = input.trim();
        setInput('');
        setLoading(true);

        try {
            const response = await API.post('/chat/send', {
                content: msgText,
                roomId: roomId
            });
            // Response contains both user message and bot response
            setMessages(prev => [...prev, ...response.data]);
        } catch (err) {
            console.error('Failed to send message');
            // Show the user message locally even on error
            setMessages(prev => [...prev, {
                id: Date.now(),
                content: msgText,
                senderRole: 'STUDENT',
                senderName: user?.name,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: '👋 Say Hi', message: 'hello' },
        { label: '📋 Placement Process', message: 'Tell me about the placement process' },
        { label: '✅ Eligibility', message: 'What are the eligibility criteria?' },
        { label: '📄 Resume Tips', message: 'Give me resume tips' },
        { label: '🎤 Interview Prep', message: 'How should I prepare for interviews?' },
        { label: '🛠️ Skills', message: 'What skills should I develop?' },
    ];

    const handleQuickAction = (message) => {
        setInput(message);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg flex flex-col" style={{ height: '600px' }}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                <h2 className="text-lg font-bold">💬 PlaceEase Chat</h2>
                <p className="text-blue-100 text-sm">Ask me anything about placements!</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-4xl mb-3">🤖</p>
                        <p className="text-gray-600 font-medium">Welcome to PlaceEase Chat!</p>
                        <p className="text-gray-400 text-sm mt-1">Ask me about placements, eligibility, or interview tips</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickAction(action.message)}
                                    className="px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm text-blue-600 hover:bg-blue-50 transition"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.senderRole === 'STUDENT' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.senderRole === 'STUDENT'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : msg.senderRole === 'BOT'
                                    ? 'bg-white shadow-md rounded-bl-sm border'
                                    : 'bg-green-100 text-green-900 rounded-bl-sm'
                            }`}>
                            {msg.senderRole !== 'STUDENT' && (
                                <p className={`text-xs font-semibold mb-1 ${msg.senderRole === 'BOT' ? 'text-blue-600' : 'text-green-700'}`}>
                                    {msg.senderRole === 'BOT' ? '🤖 Bot' : `👤 ${msg.senderName}`}
                                </p>
                            )}
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.senderRole === 'STUDENT' ? 'text-blue-200' : 'text-gray-400'}`}>
                                {formatTime(msg.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (shown when there are messages) */}
            {messages.length > 0 && (
                <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto bg-white">
                    {quickActions.slice(0, 4).map((action, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickAction(action.message)}
                            className="px-3 py-1 bg-gray-50 border rounded-full text-xs text-gray-600 hover:bg-gray-100 whitespace-nowrap transition"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t bg-white rounded-b-lg flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium text-sm"
                >
                    {loading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
