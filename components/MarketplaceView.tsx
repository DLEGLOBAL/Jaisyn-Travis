
import React, { useState } from 'react';
import { ShoppingBag, Gift, Gem, Heart, Star, Coffee, Music, Zap, Crown, CreditCard, Shield, Check, Smartphone, Sparkles, Smile, Utensils, Dog, Flame } from 'lucide-react';
import { User, SubscriptionTier, GiftItem } from '../types';
import { PaymentService } from '../services/paymentService';

interface MarketplaceViewProps {
  user: User;
  onPurchase: (cost: number, itemName: string) => void;
}

// --- GENERATED GIFT INVENTORY (Simulating 200+ items via Categories) ---
const GIFT_CATEGORIES = [
    { id: 'REACTION', label: 'Reactions', icon: <Smile/> },
    { id: 'LUXURY', label: 'Luxury', icon: <Gem/> },
    { id: 'FOOD', label: 'Food & Drink', icon: <Utensils/> },
    { id: 'ANIMALS', label: 'Cute Animals', icon: <Dog/> },
    { id: 'CHAOS', label: 'Chaos Tools', icon: <Flame/> },
    { id: 'ROMANCE', label: 'Romance', icon: <Heart/> },
];

const GENERATE_GIFTS = (): GiftItem[] => {
    const items: GiftItem[] = [];
    const emojis: Record<string, string[]> = {
        REACTION: ['😂', '😍', '😭', '🤡', '🫡', '🤯', '🥶', '🫣', '💯', '🔥', '💩', '👻', '💀', '👽', '🤖', '🎃'],
        LUXURY: ['💍', '💎', '⌚', '🏎️', '🏰', '🚁', '🛥️', '🚀', '👑', '👜', '👠', '🍾', '🎨', '🗿', '🏝️', '🏦'],
        FOOD: ['🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥚', '🥯', '🥨', '🥐', '🌮', '🌯', '🍣', '🍤', '🍩', '🍪'],
        ANIMALS: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🦄', '🐝'],
        CHAOS: ['🧨', '💣', '🔪', '🛡️', '💊', '💉', '🧯', '🔨', '🪓', '📢', '🔔', '🎲', '🎰', '🕸️', '🌪️', '⚡'],
        ROMANCE: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖']
    };

    Object.keys(emojis).forEach(cat => {
        emojis[cat].forEach((emoji, index) => {
            const cost = (index + 1) * 50;
            items.push({
                id: `${cat}_${index}`,
                name: `${cat.charAt(0) + cat.slice(1).toLowerCase()} ${index + 1}`,
                cost: cost,
                category: cat as any,
                icon: <span className="text-2xl">{emoji}</span>,
                desc: `Send a ${emoji} to the stream.`,
                cashValue: cost * 0.01 // 1% cash value
            });
        });
    });
    return items;
};

const ALL_GIFTS = GENERATE_GIFTS();

const SUBSCRIPTION_PLANS = [
  { id: 'SILVER', name: 'Silver Tier', price: 499, currency: '$4.99/mo', credits: 500, badges: ['SUPPORTER'], theme: 'None', features: ['Ad-Free', 'Silver Badge'] },
  { id: 'GOLD', name: 'Gold Tier', price: 999, currency: '$9.99/mo', credits: 1200, badges: ['VIP'], theme: 'GOLD_SPARKLE', features: ['Ad-Free', 'VIP Badge', 'Gold Border', 'Priority Chat'] },
  { id: 'PLATINUM', name: 'Platinum Tier', price: 2499, currency: '$24.99/mo', credits: 3500, badges: ['ELITE', 'WHALE'], theme: 'NEON_BLAST', features: ['Ad-Free', 'Elite Badge', 'Neon Entrance', '4K Streaming', 'Dedicated Support'] },
];

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ user, onPurchase }) => {
  const [activeTab, setActiveTab] = useState<'CREDITS' | 'GIFTS' | 'SUBS' | 'CREATOR'>('CREDITS');
  const [selectedCategory, setSelectedCategory] = useState('REACTION');
  const [processing, setProcessing] = useState(false);
  
  // Stripe Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleBuyCredits = async (amount: number, cost: number) => {
      setProcessing(true);
      try {
        // 1. Create Intent
        const secret = await PaymentService.createPaymentIntent(cost);
        // 2. Confirm Payment (Passing mock card data)
        const result = await PaymentService.confirmPayment(secret, { number: cardNumber });
        
        if (result.success) {
            alert(`Successfully purchased ${amount} credits!`);
            // Note: In a real app, backend webhook updates the user credits. Here we simulate via prop.
            onPurchase(-amount, "CREDIT_TOPUP"); // Negative cost to ADD credits in the logic
        } else {
            alert(`Payment Failed: ${result.message}`);
        }
      } catch (e: any) {
        alert("Transaction failed: " + e.message);
      } finally {
        setProcessing(false);
      }
  };

  const handleSubscribe = async (plan: any) => {
      setProcessing(true);
      try {
        const result = await PaymentService.subscribeToPlan(plan.id, user.id);
        if (result.success) {
            alert(`Welcome to ${plan.name}! You received your monthly credits.`);
            onPurchase(-plan.credits, `SUB_${plan.id}`);
        } else {
             alert("Subscription failed.");
        }
      } catch (e: any) {
        alert("Subscription Error: " + e.message);
      } finally {
        setProcessing(false);
      }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-900 custom-scrollbar p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black italic text-white flex items-center gap-2">
                    <ShoppingBag className="text-pink-500" size={32} /> MARKETPLACE
                </h1>
                <p className="text-gray-400">The central hub for Credits, Gifts, and Subscriptions.</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Your Tier</span>
                    <span className={`font-black ${user.subscriptionTier === 'PLATINUM' ? 'text-purple-400' : user.subscriptionTier === 'GOLD' ? 'text-yellow-400' : 'text-gray-200'}`}>
                        {user.subscriptionTier}
                    </span>
                </div>
                <div className="bg-gray-800 px-6 py-2 rounded-full border border-yellow-500/50 flex items-center gap-2 shadow-lg shadow-yellow-900/20">
                    <Gem size={20} className="text-yellow-400" />
                    <span className="font-mono font-bold text-yellow-400 text-xl">{user.credits} CR</span>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
             <button onClick={() => setActiveTab('CREDITS')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'CREDITS' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}>BUY CREDITS</button>
             <button onClick={() => setActiveTab('GIFTS')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'GIFTS' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}>GIFT SHOP</button>
             <button onClick={() => setActiveTab('SUBS')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'SUBS' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}>SUBSCRIPTIONS</button>
             <button onClick={() => setActiveTab('CREATOR')} className={`px-6 py-3 font-bold text-sm whitespace-nowrap ${activeTab === 'CREATOR' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}>CREATOR STUDIO</button>
        </div>

        {activeTab === 'CREDITS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stripe Card Form */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                            <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-pink-500"/>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                                <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-pink-500"/>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                                <input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white font-mono text-sm outline-none focus:border-pink-500"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                             <Shield size={12} /> Encrypted via Stripe SSL
                        </div>
                    </div>
                </div>
                
                {/* Packs */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { amount: 500, price: 499, label: '$4.99' },
                        { amount: 1200, price: 999, label: '$9.99' },
                        { amount: 2500, price: 1999, label: '$19.99' },
                        { amount: 6500, price: 4999, label: '$49.99' },
                    ].map((pack, i) => (
                        <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center hover:border-yellow-500 transition-colors">
                            <Zap size={32} className="text-yellow-400 mb-2" />
                            <h3 className="text-2xl font-black text-white">{pack.amount} CR</h3>
                            <button 
                                onClick={() => handleBuyCredits(pack.amount, pack.price)}
                                disabled={processing}
                                className="mt-4 w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : `Buy for ${pack.label}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'GIFTS' && (
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {GIFT_CATEGORIES.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${selectedCategory === cat.id ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {ALL_GIFTS.filter(g => g.category === selectedCategory).map(gift => (
                        <button 
                            key={gift.id}
                            onClick={() => onPurchase(gift.cost, gift.name)}
                            className="bg-gray-800 p-3 rounded-xl border border-gray-700 hover:border-pink-500 transition-all flex flex-col items-center gap-2 group"
                        >
                            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                {gift.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-white truncate w-full">{gift.name}</div>
                                <div className="text-[10px] text-yellow-500 font-mono">{gift.cost} CR</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'SUBS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map(plan => (
                    <div key={plan.id} className={`bg-gray-800 rounded-2xl p-6 border-2 flex flex-col ${user.subscriptionTier === plan.id ? 'border-green-500' : 'border-gray-700 hover:border-pink-500'} transition-colors relative overflow-hidden`}>
                         {plan.id === 'PLATINUM' && <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-transparent w-full h-1/2 opacity-20 pointer-events-none"></div>}
                         <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                         <div className="text-3xl font-black text-pink-500 mb-4">{plan.currency}</div>
                         
                         <div className="flex-1 space-y-3 mb-6">
                             <div className="flex items-center gap-2 text-sm text-gray-300">
                                 <Zap size={16} className="text-yellow-400" /> 
                                 <span className="font-bold text-white">{plan.credits}</span> monthly credits
                             </div>
                             {plan.features.map((feat, i) => (
                                 <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                     <Check size={16} className="text-green-400" /> {feat}
                                 </div>
                             ))}
                         </div>
                         
                         <button 
                             onClick={() => handleSubscribe(plan)}
                             disabled={user.subscriptionTier === plan.id || processing}
                             className={`w-full py-3 rounded-xl font-bold ${user.subscriptionTier === plan.id ? 'bg-green-900/50 text-green-500 cursor-default' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
                         >
                             {user.subscriptionTier === plan.id ? 'Current Plan' : 'Subscribe'}
                         </button>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'CREATOR' && (
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
                <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Creator Earnings</h2>
                <p className="text-gray-400 mb-6">Cash out your gifts directly to your bank account via Stripe Connect.</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <div className="text-xs text-gray-500 uppercase font-bold">Available Cash</div>
                        <div className="text-2xl font-mono text-green-400">${user.earnings.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <div className="text-xs text-gray-500 uppercase font-bold">Lifetime Earned</div>
                        <div className="text-2xl font-mono text-white">$1,204.50</div>
                    </div>
                </div>
                
                <button 
                    disabled={user.earnings < 50}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {user.earnings < 50 ? 'Min $50 to Cashout' : 'Cash Out Now'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default MarketplaceView;
