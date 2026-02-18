import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminChatDashboard = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom);
        }
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchRooms = async () => {
        try {
            const response = await API.get('/admin/chat/rooms');
            setRooms(response.data);
        } catch (err) {
            console.error('Failed to load chat rooms');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const response = await API.get(`/chat/history/${roomId}`);
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to load messages');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedRoom) return;

        try {
            const response = await API.post('/chat/send', {
                content: input.trim(),
                roomId: selectedRoom
            });
            setMessages(prev => [...prev, ...response.data]);
            setInput('');
        } catch (err) {
            console.error('Failed to send message');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString([], {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg flex" style={{ height: '600px' }}>
            {/* Rooms Sidebar */}
            <div className="w-72 border-r flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-800">💬 Student Chats</h2>
                    <p className="text-xs text-gray-500 mt-1">{rooms.length} conversations</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="p-4 text-center text-gray-400">Loading...</p>
                    ) : rooms.length === 0 ? (
                        <p className="p-4 text-center text-gray-400">No conversations yet</p>
                    ) : (
                        rooms.map((room) => (
                            <div
                                key={room.roomId}
                                onClick={() => setSelectedRoom(room.roomId)}
                                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${selectedRoom === room.roomId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <p className="font-medium text-gray-800 text-sm">
                                    👤 {room.studentName || room.roomId}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                    {room.lastMessage || 'No messages yet'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(room.lastTimestamp)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {!selectedRoom ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <p className="text-4xl mb-3">💬</p>
                            <p>Select a conversation to view</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800">
                                {rooms.find(r => r.roomId === selectedRoom)?.studentName || selectedRoom}
                            </h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map((msg, i) => (
                                <div key={msg.id || i} className={`flex ${msg.senderRole === 'ADMIN' ? 'justify-end' :
                                        msg.senderRole === 'STUDENT' ? 'justify-start' : 'justify-center'
                                    }`}>
                                    {msg.senderRole === 'BOT' ? (
                                        <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                                            <p className="text-xs text-yellow-700 font-medium mb-1">🤖 Bot Response</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.senderRole === 'ADMIN'
                                                ? 'bg-green-600 text-white rounded-br-sm'
                                                : 'bg-white shadow-md rounded-bl-sm border'
                                            }`}>
                                            <p className={`text-xs font-semibold mb-1 ${msg.senderRole === 'ADMIN' ? 'text-green-100' : 'text-blue-600'
                                                }`}>
                                                {msg.senderName}
                                            </p>
                                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.senderRole === 'ADMIN' ? 'text-green-200' : 'text-gray-400'
                                                }`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Reply to student..."
                                className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 transition font-medium text-sm"
                            >
                                Send
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminChatDashboard;
