import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  DollarSign,
  ArrowRight,
  Check,
  ArrowLeftRight,
  LogIn,
  Copy,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { AdComponent } from "./components/AdComponent";

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

type GameState =
  | "setup"
  | "playing"
  | "redistribute"
  | "settlement";

type Session = {
  code: string;
  state: GameState;
  players: Player[];
  hostId: string;
  votes: string[];
  createdAt: number;
  updatedAt: number;
};

type AppState = "home" | "ad" | "enter-name" | "session";
type SessionAction = "create" | "join";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-77889bd7`;

export default function App() {
  const [appState, setAppState] = useState<AppState>("home");
  const [sessionAction, setSessionAction] =
    useState<SessionAction>("create");
  const [sessionCode, setSessionCode] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [contributionAmount, setContributionAmount] =
    useState("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const lastUpdateRef = useRef<number>(0);

  // API functions
  const apiCall = async (
    endpoint: string,
    options?: RequestInit,
  ) => {
    try {
      console.log(
        "Making request to:",
        `${API_BASE}${endpoint}`,
      );
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          ...options?.headers,
        },
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (err) {
      console.error("API call error:", err);
      throw err;
    }
  };

  const startCreateSession = () => {
    setSessionAction("create");
    setAppState("ad");
  };

  const skipAd = () => {
    setAppState("enter-name");
  };

  const startJoinSession = () => {
    if (!joinCode.trim()) {
      setError("Please enter a session code");
      return;
    }
    setSessionAction("join");
    setAppState("enter-name");
  };

  const createSessionWithPlayer = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      setError("");
      // Create session
      const { code, session: newSession } = await apiCall(
        "/session/create",
        {
          method: "POST",
        },
      );

      // Add player (only once)
      const playerId = `player_${Date.now()}`;
      const player = {
        id: playerId,
        name: playerName.trim(),
        contributed: 0,
        winnings: 0,
      };

      const { session: updatedSession } = await apiCall(
        `/session/${code}/player`,
        {
          method: "POST",
          body: JSON.stringify({ player }),
        },
      );

      setSessionCode(code);
      setSession(updatedSession);
      setMyPlayerId(playerId);
      localStorage.setItem(`pokerpal_player_${code}`, playerId);
      lastUpdateRef.current = updatedSession.updatedAt;
      setAppState("session");
    } catch (err) {
      setError(err.message);
      console.log("Error creating session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSessionWithPlayer = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      setError("");
      const code = joinCode.toUpperCase();

      // Join session
      const { session: joinedSession } = await apiCall(
        "/session/join",
        {
          method: "POST",
          body: JSON.stringify({ code }),
        },
      );

      // Check if this device already has a player in this session
      const savedPlayerId = localStorage.getItem(
        `pokerpal_player_${code}`,
      );
      const existingPlayer = joinedSession.players.find(
        (p) => p.id === savedPlayerId,
      );

      if (existingPlayer) {
        // Player already exists, just rejoin
        setSessionCode(code);
        setSession(joinedSession);
        setMyPlayerId(existingPlayer.id);
        lastUpdateRef.current = joinedSession.updatedAt;
        setAppState("session");
      } else {
        // Add new player
        const playerId = `player_${Date.now()}`;
        const player = {
          id: playerId,
          name: playerName.trim(),
          contributed: 0,
          winnings: 0,
        };

        const { session: updatedSession } = await apiCall(
          `/session/${code}/player`,
          {
            method: "POST",
            body: JSON.stringify({ player }),
          },
        );

        setSessionCode(code);
        setSession(updatedSession);
        setMyPlayerId(playerId);
        localStorage.setItem(
          `pokerpal_player_${code}`,
          playerId,
        );
        lastUpdateRef.current = updatedSession.updatedAt;
        setAppState("session");
      }
    } catch (err) {
      setError(err.message);
      console.log("Error joining session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSession = async () => {
    if (!sessionCode) return;

    try {
      const { session: updatedSession } = await apiCall(
        `/session/${sessionCode}`,
      );

      // Only update if the session was modified
      if (updatedSession.updatedAt > lastUpdateRef.current) {
        setSession(updatedSession);
        lastUpdateRef.current = updatedSession.updatedAt;
      }
    } catch (err) {
      console.log("Error fetching session:", err);
    }
  };

  const checkHealth = async () => {
    const healthUrl = `${API_BASE}/health`;
    console.log("Checking health at:", healthUrl);
    console.log("Using anon key:", publicAnonKey);
    setServerStatus("checking");
    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      console.log(
        "Health check response:",
        response.status,
        response.ok,
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Health check data:", data);
        setServerStatus("online");
        setError("");
      } else {
        const text = await response.text();
        console.error(
          "Health check failed with status:",
          response.status,
          "body:",
          text,
        );
        setServerStatus("offline");
      }
    } catch (err) {
      console.error("Server health check failed:", err);
      setServerStatus("offline");
    }
  };

  // Load global AdSense script and meta tag on mount
  useEffect(() => {
    // Add AdSense verification meta tag
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      meta.content = 'ca-pub-3884161160129129';
      document.head.appendChild(meta);
    }

    // Load AdSense script if not already present
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3884161160129129';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  // Check server status on mount
  useEffect(() => {
    checkHealth();
  }, []);

  // Load player ID from localStorage when session changes
  useEffect(() => {
    if (sessionCode && appState === "session") {
      const savedPlayerId = localStorage.getItem(
        `pokerpal_player_${sessionCode}`,
      );
      if (savedPlayerId) {
        setMyPlayerId(savedPlayerId);
      }
    }
  }, [sessionCode, appState]);

  // Poll for updates every 2 seconds
  useEffect(() => {
    if (appState === "session" && sessionCode) {
      const interval = setInterval(fetchSession, 2000);
      return () => clearInterval(interval);
    }
  }, [appState, sessionCode]);

  // Ad timer countdown
  useEffect(() => {
    if (appState === "ad") {
      setAdTimer(5);
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const players = session?.players || [];
  const gameState = session?.state || "setup";
  const totalPot = players.reduce(
    (sum, p) => sum + p.contributed,
    0,
  );
  const totalWinnings = players.reduce(
    (sum, p) => sum + p.winnings,
    0,
  );
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isHost = session?.hostId === myPlayerId;
  const votes = session?.votes || [];
  const hasVoted = votes.includes(myPlayerId || "");

  const addContribution = async (amount: number) => {
    if (!myPlayerId) return;
    try {
      setError("");
      const { session: updatedSession } = await apiCall(
        `/session/${sessionCode}/contribution`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: myPlayerId,
            amount,
          }),
        },
      );
      setSession(updatedSession);
      lastUpdateRef.current = updatedSession.updatedAt;
    } catch (err) {
      setError(err.message);
      console.log("Error adding contribution:", err);
    }
  };

  const updateWinnings = async (
    playerId: string,
    amount: number,
  ) => {
    try {
      setError("");
      const { session: updatedSession } = await apiCall(
        `/session/${sessionCode}/winnings`,
        {
          method: "PUT",
          body: JSON.stringify({ playerId, winnings: amount }),
        },
      );
      setSession(updatedSession);
      lastUpdateRef.current = updatedSession.updatedAt;
    } catch (err) {
      setError(err.message);
      console.log("Error updating winnings:", err);
    }
  };

  const updateGameState = async (newState: GameState) => {
    try {
      setError("");
      const { session: updatedSession } = await apiCall(
        `/session/${sessionCode}/state`,
        {
          method: "PUT",
          body: JSON.stringify({ state: newState }),
        },
      );
      setSession(updatedSession);
      lastUpdateRef.current = updatedSession.updatedAt;
    } catch (err) {
      setError(err.message);
      console.log("Error updating state:", err);
    }
  };

  const voteToAdvance = async () => {
    if (!myPlayerId) return;

    try {
      setError("");
      const { session: updatedSession } = await apiCall(
        `/session/${sessionCode}/vote`,
        {
          method: "POST",
          body: JSON.stringify({ playerId: myPlayerId }),
        },
      );
      setSession(updatedSession);
      lastUpdateRef.current = updatedSession.updatedAt;
    } catch (err) {
      setError(err.message);
      console.log("Error voting:", err);
    }
  };

  const copyCode = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: create a temporary input element
      const input = document.createElement("input");
      input.value = sessionCode;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error("Failed to copy:", copyErr);
        setError(
          "Failed to copy code. Code is: " + sessionCode,
        );
      }
      document.body.removeChild(input);
    }
  };

  const calculateSettlements = (): Settlement[] => {
    const balances = players.map((p) => ({
      id: p.id,
      name: p.name,
      balance: p.winnings - p.contributed,
    }));

    const settlements: Settlement[] = [];
    const debtors = balances
      .filter((b) => b.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    const creditors = balances
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);

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

  const settlements =
    gameState === "settlement" ? calculateSettlements() : [];

  return (
    <div className="size-full bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {appState === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight">
                  Poker Pal
                </h1>
                <p className="text-neutral-400">
                  Track contributions and settle up after the
                  game
                </p>
              </div>

              {serverStatus === "offline" && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-amber-500 font-semibold mb-2">
                      ⚠️ Connection Issue
                    </p>
                    <p className="text-amber-400 text-sm mb-2">
                      Unable to connect to the backend. If you
                      just deployed, try clicking "Retry" or
                      "Continue Anyway" to test if the API
                      works.
                    </p>
                    <p className="text-amber-400 text-xs">
                      URL: {API_BASE}/health
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={checkHealth}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 transition-colors text-sm"
                    >
                      Retry Connection
                    </button>
                    <button
                      onClick={() => setServerStatus("online")}
                      className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg px-4 py-2 transition-colors text-sm"
                    >
                      Continue Anyway
                    </button>
                  </div>
                </div>
              )}

              {serverStatus === "checking" && (
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 text-center">
                  <p className="text-neutral-400">
                    Checking server status...
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={startCreateSession}
                  disabled={serverStatus !== "online"}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create New Session
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-neutral-950 text-neutral-500">
                      or
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold">
                    Join Session
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(
                          e.target.value.toUpperCase(),
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        serverStatus === "online" &&
                        startJoinSession()
                      }
                      placeholder="Enter session code"
                      disabled={serverStatus !== "online"}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase disabled:opacity-50"
                      maxLength={6}
                    />
                    <button
                      onClick={startJoinSession}
                      disabled={serverStatus !== "online"}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg px-5 py-3 flex items-center gap-2 transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {appState === "ad" && (
            <motion.div
              key="ad"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Quick Message
                </h1>
                <p className="text-neutral-400 text-sm">
                  Creating your session...
                </p>
              </div>

              {/* Ad Component */}
              <AdComponent
                publisherId="pub-3884161160129129"
                adSlot="7793799535"
              />

              <div className="flex flex-col items-center gap-4">
                {adTimer > 0 ? (
                  <div className="bg-neutral-800 rounded-lg px-6 py-3 text-neutral-400">
                    Continue in {adTimer}...
                  </div>
                ) : (
                  <button
                    onClick={skipAd}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {appState === "enter-name" && (
            <motion.div
              key="enter-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {sessionAction === "create"
                    ? "Create Session"
                    : "Join Session"}
                </h1>
                <p className="text-neutral-400">
                  Enter your name to continue
                </p>
                {sessionAction === "join" && (
                  <p className="text-emerald-500 font-mono text-lg">
                    Code: {joinCode}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) =>
                    setPlayerName(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sessionAction === "create"
                        ? createSessionWithPlayer()
                        : joinSessionWithPlayer();
                    }
                  }}
                  placeholder="Your name"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAppState("home");
                      setPlayerName("");
                      setError("");
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-lg px-4 py-3 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={
                      sessionAction === "create"
                        ? createSessionWithPlayer
                        : joinSessionWithPlayer
                    }
                    disabled={isLoading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg px-4 py-3 transition-colors font-semibold"
                  >
                    {isLoading ? "Loading..." : "Continue"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === "session" && gameState === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Waiting for Players
                </h1>
                <p className="text-neutral-400">
                  Share the code for others to join
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-sm text-neutral-400 mb-1">
                  Session Code
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold tracking-wider text-emerald-500">
                    {sessionCode}
                  </div>
                  <button
                    onClick={copyCode}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Players ({players.length})
                </h2>

                {players.length > 0 ? (
                  <div className="space-y-2">
                    {players.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {player.name}
                          </span>
                          {player.id === session?.hostId && (
                            <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded">
                              Host
                            </span>
                          )}
                        </div>
                        {player.id === myPlayerId && (
                          <span className="text-emerald-500 text-sm">
                            You
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    Waiting for players to join...
                  </div>
                )}
              </div>

              {players.length >= 2 && isHost && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => updateGameState("playing")}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                >
                  Start Session
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}

              {players.length >= 2 && !isHost && (
                <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
                  Waiting for host to start the session...
                </div>
              )}

              {players.length < 2 && (
                <div className="bg-neutral-800 rounded-xl p-4 text-center text-neutral-400">
                  Waiting for at least 2 players...
                </div>
              )}

              <button
                onClick={() => {
                  setAppState("home");
                  setSessionCode("");
                  setSession(null);
                  setMyPlayerId("");
                }}
                className="w-full text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {appState === "session" &&
            gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="text-neutral-400 text-sm mb-1">
                    Session: {sessionCode}
                  </div>
                  <div className="text-neutral-400 text-sm mb-2">
                    Total Pot
                  </div>
                  <motion.div
                    key={totalPot}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-bold text-emerald-500"
                  >
                    ${totalPot.toFixed(2)}
                  </motion.div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}

                {/* My Contribution Section */}
                {myPlayer && (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Your Contribution
                      </h2>
                      <span className="text-emerald-500 font-mono text-xl">
                        ${myPlayer.contributed.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) =>
                          setContributionAmount(e.target.value)
                        }
                        onKeyDown={async (e) => {
                          if (
                            e.key === "Enter" &&
                            contributionAmount
                          ) {
                            await addContribution(
                              parseFloat(contributionAmount),
                            );
                            setContributionAmount("");
                          }
                        }}
                        placeholder="Amount"
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={async () => {
                          if (contributionAmount) {
                            await addContribution(
                              parseFloat(contributionAmount),
                            );
                            setContributionAmount("");
                          }
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 py-3 flex items-center gap-2 transition-colors font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Other Players Section */}
                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold">
                    Other Players
                  </h2>

                  <div className="space-y-2">
                    {players
                      .filter((p) => p.id !== myPlayerId)
                      .map((player) => (
                        <div
                          key={player.id}
                          className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between"
                        >
                          <span className="font-medium">
                            {player.name}
                          </span>
                          <span className="text-emerald-500 font-mono">
                            ${player.contributed.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Voting Section */}
                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      End Session & Redistribute
                    </h2>
                    <span className="text-neutral-400 text-sm">
                      {votes.length}/{players.length} voted
                    </span>
                  </div>

                  {hasVoted ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                      <p className="text-emerald-500">
                        ✓ You've voted to continue
                      </p>
                      <p className="text-neutral-400 text-sm mt-1">
                        Waiting for{" "}
                        {players.length - votes.length} more{" "}
                        {players.length - votes.length === 1
                          ? "player"
                          : "players"}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={voteToAdvance}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                    >
                      Vote to End Session
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (sessionCode) {
                      localStorage.removeItem(
                        `pokerpal_player_${sessionCode}`,
                      );
                    }
                    setAppState("home");
                    setSessionCode("");
                    setSession(null);
                    setMyPlayerId("");
                    setPlayerName("");
                  }}
                  className="w-full text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Leave Session
                </button>
              </motion.div>
            )}

          {appState === "session" &&
            gameState === "redistribute" && (
              <motion.div
                key="redistribute"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold">
                    Distribute Winnings
                  </h1>
                  <p className="text-neutral-400">
                    Enter final amounts for each player
                  </p>
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div>
                      <div className="text-neutral-500 text-sm">
                        Total Pot
                      </div>
                      <div className="text-2xl font-bold text-emerald-500">
                        ${totalPot.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-sm">
                        Distributed
                      </div>
                      <div
                        className={`text-2xl font-bold ${Math.abs(totalWinnings - totalPot) < 0.01 ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        ${totalWinnings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}

                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                  {isHost ? (
                    <>
                      <p className="text-neutral-400 text-sm">
                        You are the host - enter final amounts
                        for each player
                      </p>
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="bg-neutral-800 rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {player.name}
                              </span>
                              {player.id ===
                                session?.hostId && (
                                <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className="text-neutral-500 text-sm">
                              Contributed: $
                              {player.contributed.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-neutral-500" />
                            <input
                              type="number"
                              value={player.winnings || ""}
                              onChange={(e) =>
                                updateWinnings(
                                  player.id,
                                  parseFloat(e.target.value) ||
                                    0,
                                )
                              }
                              placeholder="0.00"
                              step="0.01"
                              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <p className="text-neutral-400 text-sm">
                        Waiting for host to enter final amounts
                      </p>
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="bg-neutral-800 rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {player.name}
                              </span>
                              {player.id ===
                                session?.hostId && (
                                <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className="text-neutral-500 text-sm">
                              Contributed: $
                              {player.contributed.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-neutral-500" />
                            <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50">
                              $
                              {player.winnings
                                ? player.winnings.toFixed(2)
                                : "0.00"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {Math.abs(totalWinnings - totalPot) > 0.01 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-amber-500">
                      Winnings don't match pot. Difference: $
                      {Math.abs(
                        totalWinnings - totalPot,
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Voting Section */}
                {Math.abs(totalWinnings - totalPot) < 0.01 && (
                  <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        Calculate Settlement
                      </h2>
                      <span className="text-neutral-400 text-sm">
                        {votes.length}/{players.length} voted
                      </span>
                    </div>

                    {hasVoted ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
                        <p className="text-emerald-500">
                          ✓ You've voted to calculate
                        </p>
                        <p className="text-neutral-400 text-sm mt-1">
                          Waiting for{" "}
                          {players.length - votes.length} more{" "}
                          {players.length - votes.length === 1
                            ? "player"
                            : "players"}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={voteToAdvance}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors font-semibold"
                      >
                        Vote to Calculate
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          {appState === "session" &&
            gameState === "settlement" && (
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
                  <h1 className="text-3xl font-bold">
                    Settlement
                  </h1>
                  <p className="text-neutral-400">
                    Who pays whom
                  </p>
                </div>

                <div className="bg-neutral-900 rounded-2xl p-6 space-y-3">
                  {settlements.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      No settlements needed - everyone is even!
                    </div>
                  ) : (
                    settlements.map((settlement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-neutral-50 font-semibold">
                            {settlement.from}
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-500" />
                          <div className="text-neutral-50 font-semibold">
                            {settlement.to}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-500">
                          ${settlement.amount.toFixed(2)}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    if (sessionCode) {
                      localStorage.removeItem(
                        `pokerpal_player_${sessionCode}`,
                      );
                    }
                    setAppState("home");
                    setSessionCode("");
                    setSession(null);
                    setJoinCode("");
                    setMyPlayerId("");
                    setPlayerName("");
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