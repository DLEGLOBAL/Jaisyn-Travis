
import React, { useState, useEffect } from 'react';
import { Post, User } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Video, Image as ImageIcon, Plus, Loader2, Globe, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FeedViewProps {
    posts: Post[]; // Passed from App.tsx (default/global posts)
    onCreatePost: (post: Post) => void;
    user: User;
}

type FeedType = 'DISCOVER' | 'FOLLOWING';

const FeedView: React.FC<FeedViewProps> = ({ posts: initialPosts, onCreatePost, user }) => {
  const [activeTab, setActiveTab] = useState<FeedType>('DISCOVER');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [isUploading, setIsUploading] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // When props update (e.g. new global post from App), sync if we are in discover mode
  useEffect(() => {
    if (activeTab === 'DISCOVER') {
        setPosts(initialPosts);
    }
  }, [initialPosts, activeTab]);

  // Fetch Logic based on Tab
  useEffect(() => {
    const fetchFeed = async () => {
        setLoadingFeed(true);
        try {
            if (activeTab === 'DISCOVER') {
                // Discover: Fetch global recent posts
                const { data, error } = await supabase
                    .from('posts')
                    .select(`*, profiles:user_id (username, avatar_url)`)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (data) mapAndSetPosts(data);
            } else {
                // Following: Fetch only posts from followed users
                // 1. Get list of user IDs being followed
                const { data: follows } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', user.id);
                
                if (!follows || follows.length === 0) {
                    setPosts([]); // Following no one
                } else {
                    const followingIds = follows.map(f => f.following_id);
                    // 2. Fetch posts where user_id is in that list
                    const { data: postsData } = await supabase
                        .from('posts')
                        .select(`*, profiles:user_id (username, avatar_url)`)
                        .in('user_id', followingIds)
                        .order('created_at', { ascending: false })
                        .limit(20);
                    
                    if (postsData) mapAndSetPosts(postsData);
                }
            }
        } catch (e) {
            console.error("Feed error", e);
        } finally {
            setLoadingFeed(false);
        }
    };

    fetchFeed();
  }, [activeTab, user.id]);

  const mapAndSetPosts = (data: any[]) => {
      const mappedPosts: Post[] = data.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          username: p.profiles?.username || 'Unknown',
          userAvatar: p.profiles?.avatar_url || '',
          content: p.content,
          mediaUrl: p.media_url,
          mediaType: p.media_type || 'IMAGE',
          likes: p.likes || 0,
          comments: 0,
          timestamp: new Date(p.created_at).getTime(),
          type: 'MEDIA'
      }));
      setPosts(mappedPosts);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploading(true);
          try {
              const fileExt = file.name.split('.').pop();
              const fileName = `post-${user.id}-${Date.now()}.${fileExt}`;
              const { error } = await supabase.storage.from('media').upload(fileName, file);
              if (error) throw error;
              
              const { data } = supabase.storage.from('media').getPublicUrl(fileName);
              setMediaFile(data.publicUrl);
              setMediaType(file.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
          } catch (e) {
              console.error(e);
              alert("Upload failed");
          } finally {
              setIsUploading(false);
          }
      }
  };

  const handlePostSubmit = async () => {
      if (!newPostContent && !mediaFile) return;

      const newPostStub: Post = {
          id: 'temp-' + Date.now(),
          userId: user.id,
          username: user.username,
          userAvatar: user.avatarUrl || "",
          content: newPostContent,
          mediaUrl: mediaFile || undefined,
          mediaType: mediaType,
          likes: 0,
          comments: 0,
          timestamp: Date.now(),
          type: 'MEDIA'
      };

      // Optimistic Update
      setPosts([newPostStub, ...posts]);
      setNewPostContent('');
      setMediaFile(null);

      // Save to Supabase
      const { data, error } = await supabase.from('posts').insert([{
          user_id: user.id,
          content: newPostContent,
          media_url: mediaFile,
          media_type: mediaType
      }]).select().single();

      if (data) {
          onCreatePost({ ...newPostStub, id: data.id });
      }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-900 custom-scrollbar p-0 flex flex-col items-center">
      
      {/* Feed Tabs */}
      <div className="w-full sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 flex justify-center">
          <div className="flex gap-4 p-2">
              <button 
                  onClick={() => setActiveTab('DISCOVER')}
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-full transition-colors ${activeTab === 'DISCOVER' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <Globe size={16} /> Discover
              </button>
              <button 
                  onClick={() => setActiveTab('FOLLOWING')}
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-full transition-colors ${activeTab === 'FOLLOWING' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <Users size={16} /> Following
              </button>
          </div>
      </div>

      <div className="w-full max-w-xl space-y-6 pb-20 p-4">
        
        {/* Create Post */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
             <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                     <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-full h-full object-cover"/>
                 </div>
                 <div className="flex-1">
                    <input 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's popping?" 
                        className="w-full bg-transparent outline-none text-white text-sm mb-2" 
                    />
                    {mediaFile && (
                        <div className="relative mb-2 rounded-lg overflow-hidden max-h-40 bg-black">
                            {mediaType === 'VIDEO' ? (
                                <video src={mediaFile} className="w-full h-full object-contain" controls />
                            ) : (
                                <img src={mediaFile} className="w-full h-full object-cover" />
                            )}
                            <button onClick={() => setMediaFile(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><Plus className="rotate-45" size={16}/></button>
                        </div>
                    )}
                 </div>
             </div>
             <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                 <label className="flex items-center gap-2 text-pink-500 cursor-pointer text-xs font-bold hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                     {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />} 
                     Add Media
                     <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={isUploading} />
                 </label>
                 <button onClick={handlePostSubmit} disabled={isUploading} className="btn-brand text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg disabled:opacity-50">Post</button>
             </div>
        </div>

        {/* Loading State */}
        {loadingFeed && (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-pink-500" size={32} />
            </div>
        )}

        {/* Empty States */}
        {!loadingFeed && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <ImageIcon size={48} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
                <p className="text-sm text-gray-500">
                    {activeTab === 'FOLLOWING' ? "Follow people to see their posts here!" : "Be the first to share your win or fit check!"}
                </p>
            </div>
        )}

        {/* Feed */}
        {!loadingFeed && posts.length > 0 && (
            <>
                {posts.map(post => (
                <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-fade-in-up">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-gray-700" />
                            <div>
                                <h4 className="text-white font-bold text-sm">{post.username}</h4>
                                <p className="text-gray-500 text-xs">{new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                        <button className="text-gray-500 hover:text-white"><MoreHorizontal size={20} /></button>
                    </div>
                    
                    <div className="px-4 pb-2">
                        <p className="text-gray-200 text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {post.mediaUrl && (
                        <div className="mt-2 bg-black">
                            {post.mediaType === 'VIDEO' ? (
                                <video src={post.mediaUrl} className="w-full max-h-[500px] object-contain" controls />
                            ) : (
                                <img src={post.mediaUrl} className="w-full object-cover max-h-[500px]" />
                            )}
                        </div>
                    )}

                    {post.type === 'GAME_WIN' && (
                        <div className="mx-4 mt-2 mb-2 p-3 bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500 rounded-r">
                            <p className="text-yellow-400 text-xs font-bold flex items-center gap-2">🏆 WON A MATCH</p>
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-700 flex items-center justify-between text-gray-400">
                        <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
                            <Heart size={20} className="group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageCircle size={20} /> <span className="text-xs font-bold">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
                ))}
            </>
        )}
      </div>
    </div>
  );
};

export default FeedView;
