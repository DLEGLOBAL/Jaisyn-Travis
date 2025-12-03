
import React, { useState, useRef, useEffect } from 'react';
import { Post, User } from '../types';
import { Edit2, Camera, MapPin, Calendar, Heart, Gift, Grid, Image as ImageIcon, Check, Code, Sparkles, RefreshCw, Trash2, Eye, ShieldCheck, Star, Crown, Zap, Flame, Bomb, Skull, Music, Upload, Plus, Video, Play, Pause, Loader2, UserPlus, UserCheck, X } from 'lucide-react';
import { generateProfileTheme } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';

interface ProfileViewProps {
  user: User; // The profile being viewed
  currentUserId?: string; // The ID of the person viewing (to check follow status)
  isSelf: boolean;
  onUpdateProfile: (updated: Partial<User>) => void;
  onSendGift?: (amount: number) => void;
  onCreatePost: (post: Post) => void;
  posts: Post[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, currentUserId, isSelf, onUpdateProfile, onSendGift, onCreatePost, posts }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user.bio || "No bio yet.");
  const [editUsername, setEditUsername] = useState(user.username);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl || "");
  const [editMusic, setEditMusic] = useState(user.profileMusicUrl || "");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  const [editMode, setEditMode] = useState<'STANDARD' | 'CUSTOM'>('STANDARD');
  const [customHtml, setCustomHtml] = useState(user.customProfileHtml || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewCount, setViewCount] = useState(user.profileViews || 0);

  const [isUploading, setIsUploading] = useState(false);
  
  // Follow System State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followers || 0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  // New Post State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [newPostMediaType, setNewPostMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setViewCount(prev => prev + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Check Follow Status on Mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || isSelf) return;
      
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id)
        .single();
      
      if (data) setIsFollowing(true);
    };

    checkFollowStatus();
  }, [currentUserId, user.id, isSelf]);

  useEffect(() => {
      if (user.profileMusicUrl && audioRef.current) {
          audioRef.current.volume = 0.3;
          audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {
              console.log("Autoplay blocked by browser policy");
              setIsPlayingMusic(false);
          });
      }
  }, [user.profileMusicUrl]);

  const toggleMusic = () => {
      if (audioRef.current) {
          if (isPlayingMusic) {
              audioRef.current.pause();
              setIsPlayingMusic(false);
          } else {
              audioRef.current.play();
              setIsPlayingMusic(true);
          }
      }
  };

  const handleSave = () => {
    onUpdateProfile({ 
      bio: editBio, 
      username: editUsername, 
      avatarUrl: editAvatar, 
      customProfileHtml: customHtml,
      profileMusicUrl: editMusic
    });
    setIsEditing(false);
  };

  const handleGift = () => {
    if (onSendGift) onSendGift(100);
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || isLoadingFollow) return;
    setIsLoadingFollow(true);

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id);
      
      if (!error) {
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: currentUserId, following_id: user.id }]);
      
      if (!error) {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    }
    setIsLoadingFollow(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const code = await generateProfileTheme(aiPrompt, user);
    setCustomHtml(code);
    setIsGenerating(false);
  };

  const uploadFileToSupabase = async (file: File, bucket: string): Promise<string | null> => {
      try {
          setIsUploading(true);
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return data.publicUrl;
      } catch (error) {
          console.error("Upload error:", error);
          alert("File upload failed");
          return null;
      } finally {
          setIsUploading(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Upload to 'media' bucket
        const publicUrl = await uploadFileToSupabase(file, 'media');
        if (publicUrl) setEditAvatar(publicUrl);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const publicUrl = await uploadFileToSupabase(file, 'media');
        if (publicUrl) setEditMusic(publicUrl);
    }
  };

  const handlePostMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const publicUrl = await uploadFileToSupabase(file, 'media');
          if (publicUrl) {
              setNewPostMedia(publicUrl);
              setNewPostMediaType(file.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
          }
      }
  };

  const handleSubmitPost = () => {
      if (!newPostContent && !newPostMedia) return;
      const post: Post = {
          id: Date.now().toString(), // Temp ID, FeedView/DB will assign real ID
          userId: user.id,
          username: user.username,
          userAvatar: user.avatarUrl || "",
          content: newPostContent,
          mediaUrl: newPostMedia || undefined,
          mediaType: newPostMediaType,
          likes: 0,
          comments: 0,
          timestamp: Date.now(),
          type: 'MEDIA'
      };
      onCreatePost(post);
      setShowCreatePost(false);
      setNewPostContent('');
      setNewPostMedia(null);
  };

  const renderBadge = (badge: string) => {
    const badgeStyles: Record<string, { bg: string, text: string, icon: React.ReactNode, effect: string }> = {
        'VERIFIED': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <ShieldCheck size={12}/>, effect: '' },
        'NEW_USER': { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Sparkles size={12}/>, effect: '' },
        'OG_PLAYER': { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <Flame size={12}/>, effect: 'animate-pulse' },
        'VIP': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Crown size={12}/>, effect: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
        'ELITE': { bg: 'bg-purple-600/20', text: 'text-purple-400', icon: <Zap size={12}/>, effect: 'animate-bounce' },
        'CHAOS_AGENT': { bg: 'bg-red-600/20', text: 'text-red-500', icon: <Bomb size={12}/>, effect: 'animate-pulse' },
        'HEARTBREAKER': { bg: 'bg-pink-600/20', text: 'text-pink-500', icon: <Skull size={12}/>, effect: '' },
    };

    const style = badgeStyles[badge] || { bg: 'bg-gray-800', text: 'text-gray-400', icon: <Star size={12}/>, effect: '' };

    return (
        <span key={badge} className={`${style.bg} ${style.text} border border-current text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 ${style.effect} select-none transform hover:scale-110 transition-transform cursor-help`}>
            {style.icon} {badge.replace('_', ' ')}
        </span>
    );
  };

  if (user.customProfileHtml && !isEditing) {
      return (
          <div className="flex-1 h-full overflow-y-auto bg-gray-900 custom-scrollbar relative">
            <audio ref={audioRef} src={user.profileMusicUrl} loop />
            <div dangerouslySetInnerHTML={{ __html: user.customProfileHtml }} />
            <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-50">
                 {user.profileMusicUrl && (
                     <button onClick={toggleMusic} className="bg-gray-900/80 backdrop-blur text-white p-3 rounded-full border border-gray-700 shadow-xl hover:bg-pink-600 transition-colors animate-pulse">
                         {isPlayingMusic ? <Pause size={20} /> : <Play size={20} />}
                     </button>
                 )}
                 {isSelf && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-gray-700 shadow-xl hover:bg-pink-600 transition-colors"
                    >
                        <Edit2 size={16} /> Edit Theme
                    </button>
                 )}
            </div>
          </div>
      );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-900 custom-scrollbar relative">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      <audio ref={audioRef} src={user.profileMusicUrl} loop />

      {isEditing && (
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4">
           <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex gap-2">
                 <button onClick={() => setEditMode('STANDARD')} className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${editMode === 'STANDARD' ? 'btn-brand text-white' : 'bg-gray-800 text-gray-400'}`}><Edit2 size={14} /> Basic Info</button>
                 <button onClick={() => setEditMode('CUSTOM')} className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${editMode === 'CUSTOM' ? 'btn-brand text-white' : 'bg-gray-800 text-gray-400'}`}><Code size={14} /> HTML & AI Theme</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:bg-gray-800">Cancel</button>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2"><Check size={14} /> Save Changes</button>
              </div>
           </div>
        </div>
      )}

      {isEditing && editMode === 'CUSTOM' ? (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="text-yellow-400" /> AI Theme Generator</h3>
                <div className="flex gap-2 mb-4">
                  <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. A retro 90s hacker terminal..." className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 text-white text-sm outline-none focus:border-pink-500" />
                  <button onClick={handleAiGenerate} disabled={isGenerating} className="btn-brand text-white px-6 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50">{isGenerating ? <RefreshCw size={18} className="animate-spin"/> : <Sparkles size={18} />} Generate</button>
                </div>
                <textarea value={customHtml} onChange={(e) => setCustomHtml(e.target.value)} className="w-full h-64 bg-gray-950 font-mono text-xs text-green-400 p-4 rounded-xl border border-gray-700 outline-none resize-y" placeholder="<h1>Hello World</h1>" />
            </div>
        </div>
      ) : (
        <>
          <div className="h-48 md:h-64 bg-gradient-to-r from-pink-600 to-purple-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            {isSelf && (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                </button>
            )}
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="-mt-16 sm:-mt-24 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative group">
                <img src={isEditing ? editAvatar : (user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`)} alt="Profile" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-900 bg-gray-800 object-cover"/>
              </div>

              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                    <div className="space-y-2">
                        <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="bg-gray-800 border border-gray-700 text-2xl font-black text-white px-2 py-1 rounded w-full" placeholder="Username" />
                        <div className="flex items-center gap-2">
                             <label className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded text-xs font-bold text-gray-300 flex items-center gap-2 cursor-pointer hover:bg-gray-700">
                                 {isUploading ? <Loader2 className="animate-spin text-pink-500" size={14} /> : <Music size={14} className="text-pink-500" />}
                                 {editMusic ? "Change Anthem (MP3)" : "Upload Anthem (MP3)"}
                                 <input type="file" accept="audio/mp3" onChange={handleMusicUpload} className="hidden" disabled={isUploading}/>
                             </label>
                             {editMusic && <span className="text-xs text-green-400 flex items-center gap-1"><Check size={12}/> Ready</span>}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h1 className="text-3xl font-black text-white">{user.username}</h1>
                        {user.isIdVerified && <ShieldCheck size={20} className="text-blue-400" />}
                        {user.subscriptionTier === 'GOLD' && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/50">GOLD</span>}
                        {user.subscriptionTier === 'PLATINUM' && <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/50">PLATINUM</span>}
                        {user.profileMusicUrl && (
                             <button onClick={toggleMusic} className={`ml-2 p-1.5 rounded-full ${isPlayingMusic ? 'bg-pink-600 text-white animate-spin' : 'bg-gray-800 text-gray-400'}`}>
                                 <Music size={14} />
                             </button>
                        )}
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                     <div className="bg-black/40 backdrop-blur border border-gray-700 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-mono text-gray-300">
                         <Eye size={14} className="text-pink-500 animate-pulse" />
                         <span className="text-white font-bold">{viewCount.toLocaleString()}</span> VIEWS
                     </div>
                     <div className="flex gap-2">
                         {user.badges.map(badge => renderBadge(badge))}
                         {user.badges.length === 0 && renderBadge('NEW_USER')}
                         {isSelf && user.earnings > 1000 && renderBadge('ELITE')}
                         {isSelf && user.profileViews > 500 && renderBadge('INFLUENCER')}
                     </div>
                </div>

              </div>

              <div className="flex gap-3">
                {isSelf ? (
                    !isEditing && <button onClick={() => setIsEditing(true)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 border border-gray-700"><Edit2 size={18} /> Edit Profile</button>
                ) : (
                    <>
                      <button 
                        onClick={handleFollowToggle}
                        disabled={isLoadingFollow}
                        className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all ${
                          isFollowing 
                            ? 'bg-gray-700 hover:bg-red-900/50 hover:text-red-400 text-white border border-gray-600' 
                            : 'btn-brand text-white'
                        }`}
                      >
                         {isLoadingFollow ? <Loader2 size={18} className="animate-spin" /> : (
                           isFollowing ? <><UserCheck size={18} /> Following</> : <><UserPlus size={18} /> Follow</>
                         )}
                      </button>
                      <button onClick={handleGift} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2"><Gift size={18} /> Gift</button>
                    </>
                )}
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">About Me</h3>
                      {isEditing ? <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 text-sm min-h-[100px]" /> : <p className="text-gray-300 text-sm leading-relaxed">{user.bio || "No bio yet."}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex justify-around text-center">
                      <div><div className="text-2xl font-black text-white">{followerCount}</div><div className="text-[10px] text-gray-500 font-bold uppercase">Followers</div></div>
                      <div><div className="text-2xl font-black text-white">{user.following || 0}</div><div className="text-[10px] text-gray-500 font-bold uppercase">Following</div></div>
                      <div><div className="text-2xl font-black text-green-400">${user.earnings.toFixed(0)}</div><div className="text-[10px] text-gray-500 font-bold uppercase">Earned</div></div>
                  </div>
                </div>
            </div>
            
            <div className="pb-32">
                 <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black italic text-white flex items-center gap-2"><Grid size={20} className="text-pink-500" /> POSTS</h3>
                      {isSelf && (
                          <button onClick={() => setShowCreatePost(!showCreatePost)} className="btn-brand px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                              {showCreatePost ? <Trash2 size={14} /> : <Plus size={14} />} {showCreatePost ? 'Cancel' : 'Create Post'}
                          </button>
                      )}
                 </div>

                 {showCreatePost && (
                     <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6 animate-fade-in-up">
                          <textarea 
                              value={newPostContent} 
                              onChange={(e) => setNewPostContent(e.target.value)} 
                              placeholder="Write something..." 
                              className="w-full bg-gray-900 rounded-lg p-3 text-white text-sm outline-none mb-3"
                          />
                          {newPostMedia && (
                              <div className="w-full h-40 bg-black rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                                  {newPostMediaType === 'VIDEO' ? (
                                      <video src={newPostMedia} className="h-full max-w-full" controls />
                                  ) : (
                                      <img src={newPostMedia} className="h-full object-contain" />
                                  )}
                                  <button onClick={() => setNewPostMedia(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><Trash2 size={14}/></button>
                              </div>
                          )}
                          <div className="flex justify-between items-center">
                              <label className="flex items-center gap-2 text-pink-500 text-xs font-bold cursor-pointer hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                                  {isUploading ? <Loader2 className="animate-spin" size={16}/> : (newPostMediaType === 'VIDEO' ? <Video size={16}/> : <ImageIcon size={16}/>)}
                                  Upload Media
                                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handlePostMediaUpload} disabled={isUploading}/>
                              </label>
                              <button onClick={handleSubmitPost} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-xs disabled:opacity-50">Post</button>
                          </div>
                     </div>
                 )}

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-800 hover:border-pink-500 transition-all">
                                {post.mediaUrl ? (
                                    post.mediaType === 'VIDEO' ? (
                                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.mediaUrl} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-gray-400 bg-gray-900">
                                        {post.content}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                    <span className="flex items-center gap-1"><Heart size={16} /> {post.likes}</span>
                                    <span className="flex items-center gap-1"><Video size={16} /></span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 md:col-span-3 py-10 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                            <ImageIcon size={48} className="mb-2 opacity-50" />
                            <p className="font-bold">No posts yet</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView;
