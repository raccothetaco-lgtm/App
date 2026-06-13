import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, DollarSign, ArrowRight, Check, ArrowLeftRight, Share2 } from 'lucide-react';
import { AdBanner } from './components/AdBanner';

type Player = {
  id: string;
  name: string;
  contributed: number;
  winnings: number;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

type GameState = 'playing' | 'settlement';

const SUITS = ['♠', '♥', '♦', '♣'];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => {
    return (localStorage.getItem('pokerpal_gamestate') as GameState) || 'playing';
  });
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('pokerpal_players');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [shareText, setShareText] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('pokerpal_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('pokerpal_gamestate', gameState);
  }, [gameState]);

  const totalPot = players.reduce((sum, p) => sum + p.contributed, 0);
  const totalWinnings = players.reduce((sum, p) => sum + p.winnings, 0);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        { id: Date.now().toString(), name: newPlayerName.trim(), contributed: 0, winnings: 0 },
      ]);
      setNewPlayerName('');
    }
  };

  const addContribution = (playerId: string, amount: number) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, contributed: p.contributed + amount } : p));
  };

  const updateWinnings = (playerId: string, amount: number) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, winnings: amount } : p));
  };

  const calculateSettlements = (): Settlement[] => {
    const balances = players.map(p => ({ id: p.id, name: p.name, balance: p.winnings - p.contributed }));
    const settlements: Settlement[] = [];
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(Math.abs(debtors[i].balance), creditors[j].balance);
      if (amount > 0) settlements.push({ from: debtors[i].name, to: creditors[j].name, amount });
      debtors[i].balance += amount;
      creditors[j].balance -= amount;
      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }
    return settlements;
  };

  const settlements = gameState === 'settlement' ? calculateSettlements() : [];
  const canCalculate = players.length >= 2 && totalPot > 0 && Math.abs(totalWinnings - totalPot) <= 0.01;
  const hasData = players.length > 0 || totalPot > 0;

  return (
    <div
      className="size-full flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, #0d2518 0%, #06080a 45%, #090c12 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #d4a843 0%, transparent 70%)' }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto pb-0 relative">
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="text-center select-none"
            >
              {/* Animated suits */}
              <div className="flex justify-center gap-8 mb-10">
                {SUITS.map((suit, i) => (
                  <motion.span
                    key={suit}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="text-3xl"
                    style={{ color: suit === '♥' || suit === '♦' ? '#c0392b' : '#f0ede8' }}
                  >
                    {suit}
                  </motion.span>
                ))}
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(3rem, 12vw, 6rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #d4a843 0%, #f0d080 40%, #d4a843 70%, #a07830 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                Poker Pal
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mx-auto mt-5 mb-4 h-px w-48"
                style={{ background: 'linear-gradient(90deg, transparent, #d4a843, transparent)' }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="tracking-[0.25em] uppercase"
                style={{ color: '#7a8a8a', fontSize: '0.7rem' }}
              >
                Track · Settle · Play
              </motion.p>
            </motion.div>
          ) : (
            <div className="w-full max-w-2xl my-auto">
              <AnimatePresence mode="wait">
                {gameState === 'playing' && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    className="space-y-5"
                  >
                    {/* Header */}
                    <div className="text-center space-y-2 pb-2">
                      <h1
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 900,
                          fontSize: 'clamp(2rem, 6vw, 3rem)',
                          background: 'linear-gradient(135deg, #d4a843 0%, #f0d080 50%, #d4a843 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                        }}
                      >
                        Poker Pal
                      </h1>

                      <div className="text-xs tracking-[0.2em] uppercase" style={{ color: '#7a8a8a' }}>Total Pot</div>

                      <motion.div
                        key={totalPot}
                        initial={{ scale: 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
                          fontWeight: 500,
                          color: '#10b981',
                          textShadow: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.15)',
                          lineHeight: 1,
                        }}
                      >
                        ${totalPot.toFixed(2)}
                      </motion.div>
                    </div>

                    {/* Calculate button — always visible */}
                    {Math.abs(totalWinnings - totalPot) > 0.01 && players.length >= 2 && totalPot > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(212, 168, 67, 0.08)', border: '1px solid rgba(212, 168, 67, 0.25)' }}
                      >
                        <p className="text-sm" style={{ color: '#d4a843' }}>
                          Winnings don't match pot — difference: ${Math.abs(totalWinnings - totalPot).toFixed(2)}
                        </p>
                      </motion.div>
                    )}

                    <button
                      onClick={() => canCalculate && setGameState('settlement')}
                      disabled={!canCalculate}
                      className="w-full rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300"
                      style={canCalculate ? {
                        background: 'linear-gradient(135deg, #0d8f5f 0%, #10b981 50%, #0d8f5f 100%)',
                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.35), 0 4px 16px rgba(0,0,0,0.4)',
                        color: '#ffffff',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                      } : {
                        background: '#0d1117',
                        color: '#2a3a3a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'not-allowed',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        letterSpacing: '0.02em',
                      }}>
                        Calculate Settlement
                      </span>
                      <ArrowRight className="w-4 h-4" style={{ opacity: canCalculate ? 1 : 0.3 }} />
                    </button>

                    {/* Add Players card */}
                    <div
                      className="rounded-2xl p-4 sm:p-6 space-y-4"
                      style={{
                        background: 'linear-gradient(160deg, #0d1117 0%, #0a0f14 100%)',
                        border: '1px solid rgba(212, 168, 67, 0.12)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: '#d4a843' }} />
                        <h2 className="tracking-wide uppercase" style={{ color: '#d4a843', fontSize: '0.7rem', letterSpacing: '0.18em' }}>
                          Players
                        </h2>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                          placeholder="Player name"
                          className="flex-1 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all"
                          style={{
                            background: '#0a0f14',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#f0ede8',
                            fontFamily: "'Inter', sans-serif",
                          }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                        <button
                          onClick={addPlayer}
                          className="rounded-lg px-4 sm:px-5 py-3 flex items-center gap-2 transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, #0d8f5f, #10b981)',
                            color: '#ffffff',
                            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <Plus className="w-5 h-5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {players.map((player, idx) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="rounded-xl p-3 sm:p-4 space-y-3"
                            style={{
                              background: 'linear-gradient(135deg, #0f1a14 0%, #0a0f14 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.1)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span style={{ color: '#d4a843', fontSize: '0.75rem' }}>
                                  {SUITS[idx % 4]}
                                </span>
                                <span className="font-semibold truncate" style={{ color: '#f0ede8' }}>
                                  {player.name}
                                </span>
                              </div>
                              <button
                                onClick={() => setPlayers(players.filter(p => p.id !== player.id))}
                                className="transition-all text-xs whitespace-nowrap rounded-md px-2 py-0.5 flex-shrink-0"
                                style={{ color: '#7a8a8a', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                                onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#ff6b6b'; el.style.background = 'rgba(192,57,43,0.15)'; el.style.borderColor = 'rgba(192,57,43,0.3)'; }}
                                onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#7a8a8a'; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                              >
                                Remove
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span style={{ color: '#7a8a8a' }}>Contributed</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 500 }}>
                                  ${player.contributed.toFixed(2)}
                                </span>
                              </div>

                              {selectedPlayerId === player.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && contributionAmount) {
                                        addContribution(player.id, parseFloat(contributionAmount));
                                        setContributionAmount('');
                                        setSelectedPlayerId(null);
                                      }
                                    }}
                                    placeholder="Amount"
                                    className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                    style={{ background: '#06080a', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#f0ede8' }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      if (contributionAmount) {
                                        addContribution(player.id, parseFloat(contributionAmount));
                                        setContributionAmount('');
                                        setSelectedPlayerId(null);
                                      }
                                    }}
                                    className="rounded-lg px-3 sm:px-4 py-2 flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #0d8f5f, #10b981)', color: '#fff' }}
                                  >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedPlayerId(null); setContributionAmount(''); }}
                                    className="rounded-lg px-2 sm:px-4 py-2 flex-shrink-0 text-xs sm:text-sm transition-colors"
                                    style={{ background: '#131a1f', color: '#7a8a8a', border: '1px solid rgba(255,255,255,0.06)' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSelectedPlayerId(player.id)}
                                  className="w-full rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.06)',
                                    border: '1px solid rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                  }}
                                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.12)')}
                                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.06)')}
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Contribution
                                </button>
                              )}

                              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <label className="text-xs tracking-widest uppercase mb-1.5 block" style={{ color: '#7a8a8a' }}>
                                  Final Winnings
                                </label>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#d4a843' }} />
                                  <input
                                    type="number"
                                    value={player.winnings || ''}
                                    onChange={(e) => updateWinnings(player.id, parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                    style={{
                                      background: '#06080a',
                                      border: '1px solid rgba(212, 168, 67, 0.15)',
                                      color: '#f0ede8',
                                      fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                    onFocus={e => (e.target.style.borderColor = 'rgba(212, 168, 67, 0.4)')}
                                    onBlur={e => (e.target.style.borderColor = 'rgba(212, 168, 67, 0.15)')}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {gameState === 'settlement' && (
                  <motion.div
                    key="settlement"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    className="space-y-5"
                  >
                    <div className="text-center space-y-2 pb-2">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        <ArrowLeftRight className="w-7 h-7" style={{ color: '#10b981' }} />
                      </div>
                      <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900,
                        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                        background: 'linear-gradient(135deg, #d4a843 0%, #f0d080 50%, #d4a843 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        Settlement
                      </h1>
                      <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#7a8a8a' }}>Who pays whom</p>
                    </div>

                    <div
                      className="rounded-2xl p-4 sm:p-6 space-y-3 max-h-96 overflow-y-auto"
                      style={{
                        background: 'linear-gradient(160deg, #0d1117 0%, #0a0f14 100%)',
                        border: '1px solid rgba(212, 168, 67, 0.12)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                        scrollbarWidth: 'none',
                      }}
                    >
                      {settlements.length === 0 ? (
                        <div className="text-center py-10" style={{ color: '#7a8a8a' }}>
                          <div className="text-3xl mb-3">♠</div>
                          <p className="text-sm">No settlements needed — everyone's even!</p>
                        </div>
                      ) : (
                        settlements.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            style={{
                              background: 'linear-gradient(135deg, #0f1a14 0%, #0a0f14 100%)',
                              border: '1px solid rgba(16, 185, 129, 0.1)',
                            }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className="font-semibold text-sm sm:text-base truncate" style={{ color: '#f0ede8' }}>
                                {s.from}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#d4a843' }} />
                              <span className="font-semibold text-sm sm:text-base truncate" style={{ color: '#f0ede8' }}>
                                {s.to}
                              </span>
                            </div>
                            <div
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                                fontWeight: 500,
                                color: '#10b981',
                                textShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ${s.amount.toFixed(2)}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const lines = settlements.length === 0
                          ? ['🃏 Poker Pal — No settlements needed, everyone is even!']
                          : ['🃏 Poker Pal Settlement Results', '', ...settlements.map(s => `${s.from} → ${s.to}: $${s.amount.toFixed(2)}`)];
                        const text = lines.join('\n');
                        if (navigator.share) {
                          navigator.share({ title: 'Poker Pal Settlement', text }).catch(() => setShareText(text));
                        } else if (navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(text).catch(() => setShareText(text));
                        } else {
                          setShareText(text);
                        }
                      }}
                      className="w-full rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #0d8f5f, #10b981)',
                        color: '#ffffff',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                        letterSpacing: '0.02em',
                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Results
                    </button>

                    <button
                      onClick={() => { setGameState('playing'); setPlayers([]); localStorage.removeItem('pokerpal_players'); localStorage.removeItem('pokerpal_gamestate'); }}
                      className="w-full rounded-xl px-6 py-4 transition-all duration-200"
                      style={{
                        background: '#0d1117',
                        border: '1px solid rgba(212, 168, 67, 0.2)',
                        color: '#d4a843',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 700,
                        fontSize: '1rem',
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(212, 168, 67, 0.06)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#0d1117';
                      }}
                    >
                      New Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
      <AdBanner />

      <AnimatePresence>
        {shareText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShareText(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5 space-y-4"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(212,168,67,0.2)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#d4a843', fontSize: '1.1rem' }}>
                Share Results
              </h3>
              <textarea
                readOnly
                value={shareText}
                rows={Math.min(shareText.split('\n').length + 1, 10)}
                onFocus={e => e.target.select()}
                className="w-full rounded-lg p-3 text-sm resize-none focus:outline-none"
                style={{
                  background: '#06080a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0ede8',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <p className="text-xs" style={{ color: '#7a8a8a' }}>Select all and copy, then paste into your group chat.</p>
              <button
                onClick={() => setShareText(null)}
                className="w-full rounded-xl py-3 transition-all"
                style={{ background: '#131a1f', border: '1px solid rgba(255,255,255,0.06)', color: '#7a8a8a' }}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
