import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-77889bd7/health", (c) => {
  return c.json({ status: "ok" });
});

// Generate a random 6-character session code
const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new session
app.post("/make-server-77889bd7/session/create", async (c) => {
  try {
    let code = generateSessionCode();
    let existing = await kv.get(`session:${code}`);

    // Ensure unique code
    while (existing) {
      code = generateSessionCode();
      existing = await kv.get(`session:${code}`);
    }

    const session = {
      code,
      state: 'setup',
      players: [],
      hostId: '',
      votes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await kv.set(`session:${code}`, session);
    return c.json({ code, session });
  } catch (error) {
    console.log(`Error creating session: ${error}`);
    return c.json({ error: `Error creating session: ${error.message}` }, 500);
  }
});

// Join a session (validate code)
app.post("/make-server-77889bd7/session/join", async (c) => {
  try {
    const { code } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({ session });
  } catch (error) {
    console.log(`Error joining session: ${error}`);
    return c.json({ error: `Error joining session: ${error.message}` }, 500);
  }
});

// Get session data
app.get("/make-server-77889bd7/session/:code", async (c) => {
  try {
    const code = c.req.param('code');
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({ session });
  } catch (error) {
    console.log(`Error getting session: ${error}`);
    return c.json({ error: `Error getting session: ${error.message}` }, 500);
  }
});

// Add a player to a session
app.post("/make-server-77889bd7/session/:code/player", async (c) => {
  try {
    const code = c.req.param('code');
    const { player } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    session.players.push(player);

    // Set the first player as host
    if (session.players.length === 1) {
      session.hostId = player.id;
    }

    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error adding player: ${error}`);
    return c.json({ error: `Error adding player: ${error.message}` }, 500);
  }
});

// Remove a player from a session
app.delete("/make-server-77889bd7/session/:code/player/:playerId", async (c) => {
  try {
    const code = c.req.param('code');
    const playerId = c.req.param('playerId');
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    session.players = session.players.filter(p => p.id !== playerId);
    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error removing player: ${error}`);
    return c.json({ error: `Error removing player: ${error.message}` }, 500);
  }
});

// Add a contribution
app.post("/make-server-77889bd7/session/:code/contribution", async (c) => {
  try {
    const code = c.req.param('code');
    const { playerId, amount } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    player.contributed += amount;
    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error adding contribution: ${error}`);
    return c.json({ error: `Error adding contribution: ${error.message}` }, 500);
  }
});

// Vote to change game state
app.post("/make-server-77889bd7/session/:code/vote", async (c) => {
  try {
    const code = c.req.param('code');
    const { playerId } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Add vote if not already voted
    if (!session.votes.includes(playerId)) {
      session.votes.push(playerId);
    }

    // Check if all players have voted
    if (session.votes.length === session.players.length) {
      // Move to next state
      if (session.state === 'playing') {
        session.state = 'redistribute';
      } else if (session.state === 'redistribute') {
        session.state = 'settlement';
      }
      // Clear votes for next transition
      session.votes = [];
    }

    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error voting: ${error}`);
    return c.json({ error: `Error voting: ${error.message}` }, 500);
  }
});

// Update game state (host only for setup -> playing)
app.put("/make-server-77889bd7/session/:code/state", async (c) => {
  try {
    const code = c.req.param('code');
    const { state } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    session.state = state;
    session.votes = [];
    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error updating state: ${error}`);
    return c.json({ error: `Error updating state: ${error.message}` }, 500);
  }
});

// Update player winnings
app.put("/make-server-77889bd7/session/:code/winnings", async (c) => {
  try {
    const code = c.req.param('code');
    const { playerId, winnings } = await c.req.json();
    const session = await kv.get(`session:${code}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    player.winnings = winnings;
    session.updatedAt = Date.now();
    await kv.set(`session:${code}`, session);

    return c.json({ session });
  } catch (error) {
    console.log(`Error updating winnings: ${error}`);
    return c.json({ error: `Error updating winnings: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);