import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'client' | 'admin';
  content: string;
  timestamp: Date;
}

interface Conversation {
  clientId: string;
  clientName: string;
  ticketNumber: string;
  jobTitle: string;
  location: string;
  priority: 'emergency' | 'active' | 'normal';
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    clientId: 'c1',
    clientName: 'Alice M',
    ticketNumber: '#10',
    jobTitle: 'Plumbing Request at HQ – Floor 1',
    location: 'HQ Building',
    priority: 'active',
    messages: [
      {
        id: 'm1',
        sender: 'client',
        content: 'Hello, I need help with my account.',
        timestamp: new Date(),
      },
    ],
  },
  {
    clientId: 'c2',
    clientName: 'John K',
    ticketNumber: '#18',
    jobTitle: 'HVAC Request at Warehouse A',
    location: 'Warehouse A',
    priority: 'emergency',
    messages: [
      {
        id: 'm2',
        sender: 'client',
        content: 'My payment failed.',
        timestamp: new Date(),
      },
    ],
  },
];


const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.clientId === activeClientId);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: input,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.clientId === activeClientId
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    setInput('');
    toast.success('Message sent');
  };

  return (
    <div className="h-[80vh] border border-slate-200 rounded-2xl shadow-lg bg-white flex overflow-hidden">

      {/* LEFT: CLIENT LIST */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        <h2 className="font-bold text-slate-900 mb-4">Clients</h2>

        {conversations.map(client => (
          <button
            key={client.clientId}
            onClick={() => setActiveClientId(client.clientId)}
            className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
              activeClientId === client.clientId
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-slate-100'
            }`}
          >
            <p className="font-medium">{client.clientName}</p>
            <p className="text-xs opacity-70 truncate">
              {client.messages.at(-1)?.content}
            </p>
          </button>
        ))}
      </div>

      {/* RIGHT: CHAT WINDOW */}
      <div className="flex-1 flex flex-col p-6">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a client to start chatting
          </div>
        ) : (
          <>
           {/* CHAT HEADER */}
<div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-start">
  <div>
    <h1 className="text-xl font-black text-slate-900">
      {activeConversation.clientName}
    </h1>

    <p className="text-sm text-slate-600 mt-1">
      {activeConversation.jobTitle}
    </p>

    <p className="text-xs text-slate-500 mt-0.5">
      Ticket {activeConversation.ticketNumber}
    </p>
  </div>

  {/* PRIORITY BADGE */}
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      activeConversation.priority === 'emergency'
        ? 'bg-red-100 text-red-700'
        : activeConversation.priority === 'active'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-blue-100 text-blue-700'
    }`}
  >
    {activeConversation.priority.toUpperCase()}
  </span>
</div>


            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-xl border">
              {activeConversation.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'admin'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-900 rounded-bl-none'
                  }`}>
                    <p>{msg.content}</p>
                    <span className="text-[10px] opacity-60 block text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSend}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
