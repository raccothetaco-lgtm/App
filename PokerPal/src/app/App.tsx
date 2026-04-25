import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, DollarSign, ArrowRight, Check, ArrowLeftRight } from 'lucide-react';
import { AdInterstitial } from './components/AdInterstitial';

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

type GameState = 'setup' | 'ad' | 'playing' | 'redistribute' | 'settlement';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const totalPot = players.reduce((sum, p) => sum + p.contributed, 0);
  const totalWinnings = players.reduce((sum, p) => sum + p.winnings, 0);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        {
          id: Date.now().toString(),
          name: newPlayerName.trim(),
          contributed: 0,
          winnings: 0,
        },
      ]);
      setNewPlayerName('');
    }
  };

  const addContribution = (playerId: string, amount: number) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, contributed: p.contributed + amount } : p
    ));
  };

  const updateWinnings = (playerId: string, amount: number) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, winnings: amount } : p
    ));
  };

  const calculateSettlements = (): Settlement[] => {
    const balances = players.map(p => ({
      id: p.id,
      name: p.name,
      balance: p.winnings - p.contributed,
    }));

    const settlements: Settlement[] = [];
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debt = Math.abs(debtors[i].balance);
      const credit = creditors[j].balance;
      const amount = Math.min(debt, credit);

      if (amount > 0) {
        settlements.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: amount,
        });
      }

      debtors[i].balance += amount;
      creditors[j].balance -= amount;

      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }

    return settlements;
  };

  const settlements = gameState === 'settlement' ? calculateSettlements() : [];

  return (
    <div className="size-full bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Poker Pal</h1>
                <p className="text-sm sm:text-base text-neutral-400">Track contributions and settle up after the game</p>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-4 sm:p-6 space-y-4">
                <h2 className="text-base sm:text-lg font-semibold">Add Players</h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                    placeholder="Player name"
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={addPlayer}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-3 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {players.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {players.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3 gap-2"
                      >
                        <span className="font-medium truncate">{player.name}</span>
                        <button
                          onClick={() => setPlayers(players.filter(p => p.id !== player.id))}
                          className="text-neutral-500 hover:text-red-400 transition-colors text-sm whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {players.length >= 2 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setGameState('ad')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                >
                  Start Session
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {gameState === 'ad' && (
            <AdInterstitial onComplete={() => setGameState('playing')} />
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-neutral-400 text-sm mb-1">Total Pot</div>
                <motion.div
                  key={totalPot}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-4xl sm:text-6xl font-bold text-emerald-500 break-words"
                >
                  ${totalPot.toFixed(2)}
                </motion.div>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-4 sm:p-6 space-y-4">
                <h2 className="text-base sm:text-lg font-semibold">Players</h2>

                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-neutral-800 rounded-lg p-3 sm:p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">{player.name}</span>
                        <span className="text-emerald-500 font-mono text-sm sm:text-base whitespace-nowrap">
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
                            className="flex-1 min-w-0 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm sm:text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 sm:px-4 py-2 transition-colors flex-shrink-0"
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlayerId(null);
                              setContributionAmount('');
                            }}
                            className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg px-2 sm:px-4 py-2 transition-colors text-xs sm:text-sm flex-shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPlayerId(player.id)}
                          className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Contribution
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setGameState('redistribute')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
              >
                End Session & Redistribute
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {gameState === 'redistribute' && (
            <motion.div
              key="redistribute"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Distribute Winnings</h1>
                <p className="text-sm sm:text-base text-neutral-400">Enter final amounts for each player</p>
                <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2">
                  <div>
                    <div className="text-neutral-500 text-xs sm:text-sm">Total Pot</div>
                    <div className="text-lg sm:text-2xl font-bold text-emerald-500 break-words">${totalPot.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs sm:text-sm">Distributed</div>
                    <div className={`text-lg sm:text-2xl font-bold break-words ${Math.abs(totalWinnings - totalPot) < 0.01 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      ${totalWinnings.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-4 sm:p-6 space-y-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-neutral-800 rounded-lg p-3 sm:p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">{player.name}</span>
                      <span className="text-neutral-500 text-xs sm:text-sm whitespace-nowrap">
                        Contributed: ${player.contributed.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-neutral-500" />
                      <input
                        type="number"
                        value={player.winnings || ''}
                        onChange={(e) => updateWinnings(player.id, parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {Math.abs(totalWinnings - totalPot) > 0.01 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-amber-500 text-sm sm:text-base break-words">
                    Winnings don't match pot. Difference: ${Math.abs(totalWinnings - totalPot).toFixed(2)}
                  </p>
                </div>
              )}

              <button
                onClick={() => setGameState('settlement')}
                disabled={Math.abs(totalWinnings - totalPot) > 0.01}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
              >
                Calculate Settlement
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {gameState === 'settlement' && (
            <motion.div
              key="settlement"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <ArrowLeftRight className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Settlement</h1>
                <p className="text-sm sm:text-base text-neutral-400">Who pays whom</p>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-4 sm:p-6 space-y-3">
                {settlements.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm sm:text-base">
                    No settlements needed - everyone is even!
                  </div>
                ) : (
                  settlements.map((settlement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="text-neutral-50 font-semibold text-sm sm:text-base truncate">{settlement.from}</div>
                        <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="text-neutral-50 font-semibold text-sm sm:text-base truncate">{settlement.to}</div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-emerald-500 whitespace-nowrap">
                        ${settlement.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  setGameState('setup');
                  setPlayers([]);
                }}
                className="w-full bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl px-6 py-4 transition-colors font-semibold"
              >
                New Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
