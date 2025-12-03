
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onLogin: (user: any) => void; 
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
           if (error.message.includes("Email not confirmed")) {
               throw new Error("Please check your email to confirm your account.");
           }
           throw error;
        }
        // The onAuthStateChange in App.tsx will detect the session and handle profile fetching
      } else {
        // --- SIGN UP ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }, // Pass username in metadata so App.tsx can use it
          },
        });

        if (authError) throw authError;

        if (authData.user) {
            // Check if email confirmation is required by Supabase settings
            if (authData.user.identities && authData.user.identities.length === 0) {
                 setError("This email is already in use. Please log in.");
            } else if (!authData.session) {
                 // Session is null -> Email confirmation required
                 alert("Account created successfully! \n\nPlease check your email inbox to confirm your account before logging in.");
                 setIsLogin(true); // Switch back to login view
            } else {
                 // Session exists -> Auto-login (Email confirm disabled in project)
                 // App.tsx will handle the profile creation automatically via onAuthStateChange
            }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <Logo size="xl" className="mx-auto animate-float" />
          </div>
          <p className="text-gray-400 text-sm mt-4">The high-stakes dating elimination game.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="CoolUser123"
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-pink-500 hover:text-pink-400 font-bold">Forgot Password?</button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-brand font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isLogin ? 'ENTER STUDIO' : 'JOIN THE GAME'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-white font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-[10px] text-gray-600 mt-6">
          By entering, you agree to our Terms of Service and Privacy Policy.
          <br />© 2024
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
