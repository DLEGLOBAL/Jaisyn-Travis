import React, { useState } from 'react';
import { GameSettings, Theme } from '../types';
import { X, Monitor, Eye, Palette, Wifi, Shield, Lock, Globe, Ghost, Radio, Battery, Database, LogOut } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdate: (key: keyof GameSettings, value: any) => void;
  onLogout?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'VIDEO' | 'PRIVACY' | 'NETWORK'>('VIDEO');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Monitor size={20} className="text-pink-500" /> Studio Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('VIDEO')} className={`flex-1 py-3 text-xs font-bold ${activeTab === 'VIDEO' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}>VIDEO & UI</button>
            <button onClick={() => setActiveTab('PRIVACY')} className={`flex-1 py-3 text-xs font-bold ${activeTab === 'PRIVACY' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}>PRIVACY</button>
            <button onClick={() => setActiveTab('NETWORK')} className={`flex-1 py-3 text-xs font-bold ${activeTab === 'NETWORK' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}>NETWORK</button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {activeTab === 'VIDEO' && (
            <>
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Wifi size={14} /> Streaming Quality</h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Quality (4K Mode)</label>
                        <select 
                        value={settings.videoQuality}
                        onChange={(e) => onUpdate('videoQuality', e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-sm border border-gray-600 focus:border-pink-500 outline-none"
                        >
                        <option value="720p">720p (Fast)</option>
                        <option value="1080p">1080p (HD)</option>
                        <option value="4K">4K (Ultra)</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300">Green Screen Mode</label>
                        <input type="checkbox" checked={settings.greenScreen} onChange={(e) => onUpdate('greenScreen', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                    </div>
                     {/* Feature #76: Battery Saver */}
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Battery size={16} className="text-gray-400" />
                            <label className="text-sm font-medium text-gray-300">Battery Saver (Low FPS)</label>
                        </div>
                        <input type="checkbox" checked={settings.batterySaver} onChange={(e) => onUpdate('batterySaver', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                    </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Palette size={14} /> Theme</h3>
                    <div className="grid grid-cols-3 gap-2">
                    {(['CYBERPUNK', 'RETRO', 'VICTORIAN'] as Theme[]).map(theme => (
                        <button key={theme} onClick={() => onUpdate('theme', theme)} className={`py-2 px-1 rounded-lg text-xs font-bold border-2 transition-all ${settings.theme === theme ? 'border-pink-500 bg-pink-500/20 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                        {theme}
                        </button>
                    ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Eye size={14} /> Accessibility</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Colorblind Mode</label>
                            <input type="checkbox" checked={settings.colorBlindMode} onChange={(e) => onUpdate('colorBlindMode', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Live Captions</label>
                            <input type="checkbox" checked={settings.captions} onChange={(e) => onUpdate('captions', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                        </div>
                    </div>
                </section>
            </>
          )}

          {activeTab === 'PRIVACY' && (
              <section className="space-y-4">
                  <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Ghost size={16} className="text-gray-400" />
                            <label className="text-sm font-medium text-gray-300">Incognito Mode</label>
                        </div>
                        <input type="checkbox" checked={settings.incognitoMode} onChange={(e) => onUpdate('incognitoMode', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                  </div>
                  <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                             <Eye size={16} className="text-gray-400" />
                             <label className="text-sm font-medium text-gray-300">Blur Background</label>
                        </div>
                        <input type="checkbox" checked={settings.blurBackground} onChange={(e) => onUpdate('blurBackground', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                  </div>
                   <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Globe size={16} className="text-gray-400" />
                             <label className="text-sm font-medium text-gray-300">Geo-Fencing (Local Only)</label>
                        </div>
                        <input type="checkbox" checked={settings.geoFencing} onChange={(e) => onUpdate('geoFencing', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                  </div>
                  <div className="bg-red-900/20 border border-red-900 p-3 rounded-lg mt-4">
                      <div className="flex items-center gap-2 mb-2">
                          <Shield size={16} className="text-red-500" />
                          <h4 className="font-bold text-red-500 text-sm">Emergency Protocol</h4>
                      </div>
                      <p className="text-xs text-red-300 mb-2">Say "PINEAPPLE" to instantly cut feed and report.</p>
                  </div>

                  {onLogout && (
                     <button 
                       onClick={onLogout}
                       className="w-full mt-4 bg-gray-700 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                     >
                       <LogOut size={14} /> LOG OUT
                     </button>
                  )}
              </section>
          )}

          {activeTab === 'NETWORK' && (
              <section className="space-y-4">
                   <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Globe size={16} className="text-gray-400" />
                            <label className="text-sm font-medium text-gray-300">Server Region</label>
                        </div>
                        <select 
                            value={settings.serverRegion}
                            onChange={(e) => onUpdate('serverRegion', e.target.value)}
                            className="bg-gray-700 rounded px-2 py-1 text-sm border border-gray-600 focus:border-pink-500 outline-none"
                        >
                            <option value="US-EAST">US East (Virginia)</option>
                            <option value="EU-WEST">EU West (London)</option>
                            <option value="ASIA">Asia (Tokyo)</option>
                        </select>
                  </div>
                  <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                             <Radio size={16} className="text-gray-400" />
                             <label className="text-sm font-medium text-gray-300">Bandwidth Saver (Audio Only)</label>
                        </div>
                        <input type="checkbox" checked={settings.bandwidthSaver} onChange={(e) => onUpdate('bandwidthSaver', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                  </div>
                  <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                             <Wifi size={16} className="text-gray-400" />
                             <label className="text-sm font-medium text-gray-300">Low Latency Mode</label>
                        </div>
                        <input type="checkbox" checked={settings.lowLatency} onChange={(e) => onUpdate('lowLatency', e.target.checked)} className="w-5 h-5 accent-pink-500" />
                  </div>
                   {/* Feature #79: Data Usage Tracker */}
                   <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                       <h4 className="text-xs font-bold text-gray-500 mb-2">NETWORK STATS</h4>
                       <div className="grid grid-cols-3 gap-2 text-center">
                           <div className="bg-gray-800 p-1 rounded">
                               <p className="text-[10px] text-gray-400">DATA USED</p>
                               <p className="text-xs font-bold text-blue-400 flex items-center justify-center gap-1"><Database size={10} /> 125 MB</p>
                           </div>
                           <div className="bg-gray-800 p-1 rounded">
                               <p className="text-[10px] text-gray-400">LATENCY</p>
                               <p className="text-xs font-bold text-green-400 flex items-center justify-center gap-1">24 ms</p>
                           </div>
                           <div className="bg-gray-800 p-1 rounded">
                               <p className="text-[10px] text-gray-400">PKT LOSS</p>
                               <p className="text-xs font-bold text-gray-400 flex items-center justify-center gap-1">0.1%</p>
                           </div>
                       </div>
                   </div>
              </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;