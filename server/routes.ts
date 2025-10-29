import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { insertUserSchema } from "@shared/schema";
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
    });
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

  const httpServer = createServer(app);

  return httpServer;
}
