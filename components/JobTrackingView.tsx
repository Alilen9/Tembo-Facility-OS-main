
import React, { useState, useEffect } from 'react';
import { Job, Technician, JobStatus } from '../types';
import { clientService } from '../services/clientService';
import toast from 'react-hot-toast';
// Add Activity to the Icons import
import { Clock, Phone, MessageSquare, CheckCircle2, Send, AlertTriangle, ChevronRight, List, Activity } from './Icons';

interface JobTrackingViewProps {
  job: Job;
  technician?: Technician;
}

const SLATimer: React.FC<{ deadline?: string }> = ({ deadline }) => {
  if (!deadline) return null;

  const now = new Date();
  const dead = new Date(deadline);
  const diffMs = dead.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const isBreached = diffMs < 0;
  const isClose = diffHrs < 2;

  return (
    <div className={`rounded-lg border p-4 mb-6 flex items-center justify-between shadow-sm ${
      isBreached ? 'bg-red-50 border-red-200 text-red-700' :
      isClose ? 'bg-orange-50 border-orange-200 text-orange-700' :
      'bg-blue-50 border-blue-200 text-blue-700'
    }`}>
      <div className="flex items-center space-x-3">
        <Clock size={20} className={isBreached ? 'animate-pulse' : ''} />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            {isBreached ? 'SLA Breached' : 'SLA Target'}
          </span>
          <span className="text-lg font-bold font-mono">
            {isBreached 
              ? `Overdue: ${Math.abs(diffHrs)}h ${Math.abs(diffMins)}m` 
              : `${diffHrs}h ${diffMins}m remaining`}
          </span>
        </div>
      </div>
    </div>
  );
};

export const JobTrackingView: React.FC<JobTrackingViewProps> = ({ job, technician }) => {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showFullLog, setShowFullLog] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [activeTicket, setActiveTicket] = useState<{id: string} | null>(null);

  // Poll for new messages (Admin replies)
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const data = await clientService.getTickets(job.id);

        console.log('Fetched tickets data: ', data);

        if (data && data.length > 0) {
          const latestTicket = data.reduce((prev: any, current: any) => 
            new Date(current.created_at).getTime() > new Date(prev.created_at).getTime() ? current : prev
          );
          setIsResolved(latestTicket.status === 'RESOLVED');
          setActiveTicket(latestTicket.status !== 'RESOLVED' ? latestTicket : null);
        }
        
        // Transform tickets/alerts into flat chat history
        const history = data.flatMap((ticket: any) => {
          const createdDate = new Date(ticket.created_at);
          const isCreatedValid = !isNaN(createdDate.getTime());

          const clientMsg = {
            id: `t-${ticket.id}`,
            sender: 'me',
            text: ticket.description,
            time: isCreatedValid ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            timestamp: isCreatedValid ? createdDate.getTime() : 0
          };

          const replies = (ticket.responses || []).map((r: any, idx: number) => {
            const replyDate = new Date(r.timestamp);
            const isReplyValid = !isNaN(replyDate.getTime());
            return {
              id: `r-${ticket.id}-${idx}`,
              sender: r.sender === 'Admin' ? 'system' : 'me',
              text: r.message,
              time: isReplyValid ? replyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              timestamp: isReplyValid ? replyDate.getTime() : 0
            };
          });

          return [clientMsg, ...replies];
        }).sort((a: any, b: any) => a.timestamp - b.timestamp);

        if (history.length > 0) setMessages(history);
      } catch (error) {
        console.error('Failed to poll messages', error);
      }
    };

    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 5000);
    return () => clearInterval(interval);
  }, [job.id]);

  const handleSend = async () => {
    if(!chatInput.trim() || isResolved || activeTicket) return;
    
    const messageContent = chatInput;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'me',
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
    }]);
    setChatInput('');

    try {
      await clientService.createTicket({
        title: 'Live Chat Message',
        description: messageContent,
        type: 'INQUIRY',
        jobId: job.id
      });
    } catch (error: any) {
      if (error.response?.data?.message === 'An active ticket already exists for this job. Please reply to the existing ticket.') {
        toast.error('An active ticket exists. Please wait for it to be resolved.');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* 1. CURRENT CONTEXT / BLOCKERS */}
      <section className="bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-800">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Context</h3>
            <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>
         </div>
         <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Activity size={18} /></div>
            <div>
               <p className="text-xs font-bold">Technician En-Route</p>
               <p className="text-[10px] text-slate-400 mt-1">Last Update: GPS Ping at HQ North Perimeter</p>
            </div>
         </div>
      </section>

      {job.slaDeadline && <SLATimer deadline={job.slaDeadline} />}

      {/* 2. ASSIGNED SPECIALIST */}
      <section>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={technician?.avatarUrl} className="w-12 h-12 rounded-full border border-slate-100" />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{technician?.name || 'Searching...'}</p>
              <p className="text-xs text-slate-500 font-medium">{technician?.status || 'Pending'}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><MessageSquare size={18} /></button>
            <button className="p-2.5 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><Phone size={18} /></button>
          </div>
        </div>
      </section>

      {/* 3. LIVE SUPPORT CHAT */}
      <section>
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-56">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                   <div className={`px-3 py-1.5 rounded-lg text-xs max-w-[85%] ${
                     msg.sender === 'me' 
                       ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                       : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                   }`}>
                     {msg.text}
                   </div>
                   <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                 </div>
               ))}
            </div>
            {isResolved && (
               <div className="bg-emerald-50 border-y border-emerald-100 p-2 flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 size={14} />
                  This ticket has been marked as resolved.
               </div>
            )}
            {activeTicket && (
               <div className="bg-blue-50 border-y border-blue-100 p-2 flex items-center justify-center gap-2 text-blue-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                  <Clock size={14} />
                  Ticket #{activeTicket.id} is active. Please wait for resolution.
               </div>
            )}
            <div className="p-2 border-t border-slate-100 bg-slate-50 flex gap-2">
               <input 
                 type="text" 
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && !isResolved && !activeTicket && handleSend()}
                 placeholder={isResolved ? "Ticket Resolved" : activeTicket ? "Ticket Active - Please wait" : "Message dispatch..."}
                 className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                 disabled={isResolved || !!activeTicket}
               />
               <button onClick={handleSend} disabled={isResolved || !!activeTicket} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"><Send size={16} /></button>
            </div>
         </div>
      </section>

      {/* 4. COLLAPSIBLE DETAILED LOG */}
      <section className="border-t border-slate-200 pt-4">
        <button 
          onClick={() => setShowFullLog(!showFullLog)}
          className="w-full flex items-center justify-between group py-2"
        >
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors flex items-center gap-2">
            <List size={14} /> Full Audit Trail
          </h3>
          <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${showFullLog ? 'rotate-90' : ''}`} />
        </button>
        
        {showFullLog && (
          <div className="mt-4 relative pl-4 border-l-2 border-slate-100 space-y-6 ml-2 animate-slide-in">
            {job.timeline?.map((event, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                  event.isCompleted ? 'border-emerald-500' : 'border-slate-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${event.isCompleted ? 'bg-emerald-500' : 'bg-transparent'}`} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">{event.status}</p>
                  <p className="text-[10px] text-slate-400">{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
