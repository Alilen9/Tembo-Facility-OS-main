import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

interface Message {
  id: string;
  sender: 'client' | 'admin' | 'system';
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
  status: string;
  messages: Message[];
  latestTicketId?: string;
}

const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [typingClientId, setTypingClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const prevActiveIdRef = useRef<string | null>(null);

  const activeConversation = conversations.find(c => c.clientId === activeClientId);

  const filteredConversations = conversations.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll
  useEffect(() => {
    if (!activeConversation) return;

    const isNewConversation = activeConversation.clientId !== prevActiveIdRef.current;
    const hasNewMessages = activeConversation.messages.length > prevMessageCountRef.current;
    const isTyping = !!typingClientId;

    if (isNewConversation || hasNewMessages || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevMessageCountRef.current = activeConversation.messages.length;
    prevActiveIdRef.current = activeConversation.clientId;
  }, [activeConversation?.messages, typingClientId, activeConversation?.clientId]);

  useEffect(() => {
     const loadMessages = async () => {
      try {
        const data = await adminService.getMessages();
        console.log("Admin Messaes: ", data);
        
        const groupedMap = new Map<string, any>();

        data.forEach((item: any) => {
          // Group by Job ID if available, otherwise use Ticket ID
          const key = item.job_id ? String(item.job_id) : `ticket-${item.id}`;
          
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              clientId: key,
              clientName: item.client_name,
              ticketNumber: `#${item.id}`,
              jobTitle: item.job_title || 'Support Request',
              location: item.client_company || 'Unknown',
              priority: (item.priority?.toLowerCase() as any) || 'active',
              status: item.status,
              latestTicketId: String(item.id),
              messages: [],
              lastTimestamp: new Date(item.created_at).getTime()
            });
          }

          const group = groupedMap.get(key);
          const itemTime = new Date(item.created_at).getTime();

          // Update metadata if this ticket is newer
          if (itemTime > group.lastTimestamp) {
            group.latestTicketId = String(item.id);
            group.status = item.status;
            group.lastTimestamp = itemTime;
          }

          // Add Client Message (Use 'description' as per API data)
          group.messages.push({
            id: `orig-${item.id}`,
            sender: 'client',
            content: item.description || item.message || 'No content',
            timestamp: new Date(item.created_at)
          });

          // Add Admin/System Responses
          if (item.responses && Array.isArray(item.responses)) {
            item.responses.forEach((r: any, idx: number) => {
              group.messages.push({
                id: `resp-${item.id}-${idx}`,
                sender: r.sender === 'Admin' ? 'admin' : 'system',
                content: r.message,
                timestamp: new Date(r.timestamp),
              });
            });
          }
        });

        const formatted = Array.from(groupedMap.values()).map(group => {
          // Sort messages chronologically
          group.messages.sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
          return group;
        });
        
        // Sort conversations by most recent activity
        formatted.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        setConversations(formatted);
      } catch (error) {
        console.error(error);
      }
    };
    loadMessages();

    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation || activeConversation.status === 'RESOLVED') return;
    const currentClientId = activeConversation.clientId;
    const targetTicketId = activeConversation.latestTicketId || currentClientId;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: input,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.clientId === currentClientId
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    setInput('');
    
    try {
      await adminService.replyToMessage(targetTicketId, input);
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleResolve = async () => {
    if (!activeConversation) return;
    if (activeConversation.status === 'RESOLVED') return;
    if (!window.confirm('Are you sure you want to mark this ticket as resolved?')) return;

    try {
      await adminService.resolveTicket(activeConversation.clientId);
      toast.success('Ticket resolved');
      setConversations(prev => prev.filter(c => c.clientId !== activeConversation.clientId));
      setActiveClientId(null);
    } catch (error) {
      toast.error('Failed to resolve ticket');
    }
  };

  return (
    <div className="h-[80vh] border border-slate-200 rounded-2xl shadow-lg bg-white flex overflow-hidden">

      {/* LEFT: CLIENT LIST */}
      <div className={`w-full md:w-1/3 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto ${activeClientId ? 'hidden md:block' : ''}`}>
        <h2 className="font-bold text-slate-900 mb-4">Clients</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {filteredConversations.map(client => (
          <button
            key={client.clientId}
            onClick={() => setActiveClientId(client.clientId)}
            className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition ${
              activeClientId === client.clientId
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <p className="font-medium truncate">{client.clientName}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 ${
                activeClientId === client.clientId 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {client.messages.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs opacity-70 truncate flex-1">
                {client.messages.at(-1)?.content}
              </p>
              {client.status === 'RESOLVED' && (
                <CheckCircle size={14} className={`ml-2 ${activeClientId === client.clientId ? 'text-white' : 'text-emerald-500'}`} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* RIGHT: CHAT WINDOW */}
      <div className={`flex-1 flex flex-col p-4 md:p-6 ${!activeClientId ? 'hidden md:flex' : ''}`}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a client to start chatting
          </div>
        ) : (
          <>
           {/* CHAT HEADER */}
<div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-start">
  <div className="flex items-start gap-3">
    <button onClick={() => setActiveClientId(null)} className="md:hidden mt-1 text-slate-500 hover:text-slate-700">
      <ArrowLeft size={20} />
    </button>
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
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={handleResolve}
      disabled={activeConversation.status === 'RESOLVED'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
        activeConversation.status === 'RESOLVED'
          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
      }`}
    >
      <CheckCircle size={14} />
      {activeConversation.status === 'RESOLVED' ? 'Resolved' : 'Resolve'}
    </button>

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
              {typingClientId === activeConversation.clientId && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1 items-center w-16">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {activeConversation.status === 'RESOLVED' && (
              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-center gap-2 text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle size={16} />
                This ticket has been marked as resolved.
              </div>
            )}

            {/* INPUT */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && activeConversation.status !== 'RESOLVED' && handleSend()}
                placeholder={activeConversation.status === 'RESOLVED' ? "Ticket Resolved" : "Type your message..."}
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                disabled={activeConversation.status === 'RESOLVED'}
              />
              <button
                onClick={handleSend}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                disabled={activeConversation.status === 'RESOLVED'}
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
