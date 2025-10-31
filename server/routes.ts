import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { insertUserSchema, upgradeDemoSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "jade-royale-casino-secret-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
      });

      (req.session as any).userId = user.id;
      
      res.json({
        id: user.id,
        username: user.username,
        balance: user.balance,
        isDemo: user.isDemo || false,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
        balance: user.balance,
        isDemo: user.isDemo || false,
      });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
      isDemo: user.isDemo,
    });
  });

  app.post("/api/auth/demo", async (req, res) => {
    try {
      let user;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const randomId = Date.now() + Math.floor(Math.random() * 100000);
          const demoUsername = `Demo_Player_${randomId}`;
          const demoPassword = await bcrypt.hash(`demo_${randomId}`, 10);

          user = await storage.createDemoUser({
            username: demoUsername,
            password: demoPassword,
          });
          break;
        } catch (error: any) {
          if (error.message && error.message.includes("unique")) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw new Error("Could not create unique demo username");
            }
            continue;
          }
          throw error;
        }
      }

      if (!user) {
        throw new Error("Failed to create demo user");
      }

      (req.session as any).userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
        balance: user.balance,
        isDemo: user.isDemo,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create demo account" });
    }
  });

  app.post("/api/auth/upgrade-demo", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const data = upgradeDemoSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.isDemo) {
        return res.status(400).json({ message: "Only demo accounts can be upgraded" });
      }

      const trimmedUsername = data.username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
        return res.status(400).json({ message: "Username must be 3-20 characters" });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }

      if (data.password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(trimmedUsername);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const upgradedUser = await storage.upgradeDemoUser(userId, trimmedUsername, hashedPassword);

      res.json({
        id: upgradedUser.id,
        username: upgradedUser.username,
        balance: upgradedUser.balance,
        isDemo: upgradedUser.isDemo,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upgrade account" });
    }
  });

  app.post("/api/cashier/deposit", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = req.body;
      const amountNum = parseInt(amount);
      
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const result = await storage.deposit(userId, amountNum);
      res.json({
        user: {
          id: result.user.id,
          username: result.user.username,
          balance: result.user.balance,
        },
        transaction: result.transaction,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Deposit failed" });
    }
  });

  app.post("/api/cashier/withdraw", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount } = req.body;
      const amountNum = parseInt(amount);
      
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const result = await storage.withdraw(userId, amountNum);
      res.json({
        user: {
          id: result.user.id,
          username: result.user.username,
          balance: result.user.balance,
        },
        transaction: result.transaction,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Withdrawal failed" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/games/slot/spin", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { bet, machineNumber } = req.body;
      const betNum = parseInt(bet);
      const machineNum = parseInt(machineNumber) || 1;
      
      if (isNaN(betNum) || betNum <= 0) {
        return res.status(400).json({ message: "Invalid bet amount" });
      }

      const result = await storage.slotMachineSpin(userId, betNum, machineNum);
      res.json({
        user: {
          id: result.user.id,
          username: result.user.username,
          balance: result.user.balance,
        },
        symbols: result.symbols,
        winAmount: result.winAmount,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Spin failed" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/daily-checkin/status", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(now);
      monday.setDate(monday.getDate() - daysSinceMonday);
      monday.setHours(0, 0, 0, 0);
      const weekStartDate = monday.toISOString().split('T')[0];

      const checkIns = await storage.getWeeklyCheckIns(userId, weekStartDate);
      const claimedDays = checkIns.map(c => c.dayOfWeek);

      res.json({
        claimedDays,
        currentDay,
        weekStartDate,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch check-in status" });
    }
  });

  app.post("/api/daily-checkin/claim", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(now);
      monday.setDate(monday.getDate() - daysSinceMonday);
      monday.setHours(0, 0, 0, 0);
      const weekStartDate = monday.toISOString().split('T')[0];

      const REWARDS = {
        1: 300,  // Monday
        2: 400,  // Tuesday
        3: 500,  // Wednesday
        4: 600,  // Thursday
        5: 700,  // Friday
        6: 800,  // Saturday
        0: 900,  // Sunday
      };

      const reward = REWARDS[currentDay as keyof typeof REWARDS];

      const result = await storage.claimDailyCheckIn(userId, currentDay, weekStartDate, reward);
      
      res.json({
        user: {
          id: result.user.id,
          username: result.user.username,
          balance: result.user.balance,
        },
        checkIn: result.checkIn,
        reward,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to claim reward" });
    }
  });

  app.get("/api/spin-wheel/status", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const lastSpin = await storage.getLastSpin(userId);
      
      if (!lastSpin) {
        return res.json({
          canSpin: true,
          timeUntilNextSpin: 0,
        });
      }

      const now = new Date();
      const lastSpinTime = new Date(lastSpin.spunAt);
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      const timeSinceLastSpin = now.getTime() - lastSpinTime.getTime();
      const timeUntilNextSpin = Math.max(0, twelveHoursInMs - timeSinceLastSpin);

      res.json({
        canSpin: timeUntilNextSpin === 0,
        timeUntilNextSpin,
        lastSpin: lastSpin,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch spin status" });
    }
  });

  app.post("/api/spin-wheel/spin", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const lastSpin = await storage.getLastSpin(userId);
      
      if (lastSpin) {
        const now = new Date();
        const lastSpinTime = new Date(lastSpin.spunAt);
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        const timeSinceLastSpin = now.getTime() - lastSpinTime.getTime();
        
        if (timeSinceLastSpin < twelveHoursInMs) {
          return res.status(400).json({ message: "You must wait 12 hours between spins" });
        }
      }

      const prizes = [250, 300, 350, 400, 450, 500, 550, 600, 650, 700];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

      const result = await storage.spinWheel(userId, randomPrize);
      
      res.json({
        user: {
          id: result.user.id,
          username: result.user.username,
          balance: result.user.balance,
        },
        prize: randomPrize,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to spin wheel" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
