
import React, { useState } from 'react';
import { AdminStats } from '../types';
import { Shield, Activity, Users, Database, AlertTriangle, Play, RefreshCw, Eye } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const MOCK_STATS: AdminStats = {
  totalUsers: 0,
  activeGames: 0,
  serverLoad: 0,
  dataProcessed: '0 MB'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTIONS' | 'MODERATION'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
      <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-xl border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center gap-3">
            <Shield className="text-red-500" size={24} />
            <div>
              <h2 className="text-xl font-black text-red-500 tracking-wider">ADMIN GOD MODE</h2>
              <p className="text-[10px] text-gray-500 font-mono">v1.0.0-PROD | REGION: US-EAST</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">Close [ESC]</button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          {['OVERVIEW', 'ACTIONS', 'MODERATION'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-xs font-bold hover:bg-gray-800 transition-colors ${activeTab === tab ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20">
          
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Feature #98: Analytics Dashboard */}
               <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2"><Users size={16}/> Total Users</div>
                 <div className="text-2xl font-mono font-bold text-white">{MOCK_STATS.totalUsers.toLocaleString()}</div>
               </div>
               <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2"><Play size={16}/> Active Games</div>
                 <div className="text-2xl font-mono font-bold text-green-400">{MOCK_STATS.activeGames}</div>
               </div>
               <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2"><Activity size={16}/> Server Load</div>
                 <div className="text-2xl font-mono font-bold text-yellow-400">{MOCK_STATS.serverLoad}%</div>
               </div>
               <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <div className="flex items-center gap-2 text-gray-400 mb-2"><Database size={16}/> Data</div>
                 <div className="text-2xl font-mono font-bold text-blue-400">{MOCK_STATS.dataProcessed}</div>
               </div>
               
               <div className="col-span-2 md:col-span-4 mt-4 h-64 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
                   <p className="text-gray-500 font-mono">WAITING FOR TRAFFIC...</p>
               </div>
            </div>
          )}

          {activeTab === 'ACTIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2"><AlertTriangle size={16} /> EMERGENCY</h3>
                <div className="space-y-2">
                   <button onClick={() => onAction('MASS_POP')} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs">MASS POP (KILL ALL)</button>
                   <button onClick={() => onAction('FORCE_RESET')} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold text-xs">FORCE GAME RESET</button>
                </div>
              </div>
              
              <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><RefreshCw size={16} /> GAME STATE</h3>
                <div className="space-y-2">
                   <button onClick={() => onAction('ADD_CREDITS')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs">GIVE 1000 CREDITS</button>
                   <button onClick={() => onAction('UNLOCK_ALL')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs">UNLOCK ALL SKINS</button>
                </div>
              </div>

              <div className="p-4 border border-green-500/30 rounded-lg bg-green-900/10">
                <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2"><Eye size={16} /> DEBUG</h3>
                <div className="space-y-2">
                   <button onClick={() => onAction('TOGGLE_DEBUG')} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs">TOGGLE OVERLAY (#92)</button>
                   <button onClick={() => onAction('CRASH_TEST')} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-bold text-xs">TEST CRASH REPORT (#94)</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MODERATION' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                    <div>
                        <h4 className="font-bold text-white">Auto-Mod AI (#99)</h4>
                        <p className="text-xs text-gray-400">Automatically blur NSFW video frames.</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Banned Users (Recent)</h4>
                    <p className="text-xs text-gray-500 italic">No bans yet.</p>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
