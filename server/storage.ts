import { users, transactions, dailyCheckIns, spinHistory, type User, type InsertUser, type Transaction, type InsertTransaction, type DailyCheckIn, type InsertDailyCheckIn, type SpinHistory, type InsertSpinHistory } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export interface GameStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalWinAmount: number;
  totalBetAmount: number;
  netProfit: number;
  gamesPlayed: number;
  winRate: number;
  biggestWin: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<void>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  deposit(userId: number, amount: number, description?: string): Promise<{ user: User; transaction: Transaction }>;
  withdraw(userId: number, amount: number, description?: string): Promise<{ user: User; transaction: Transaction }>;
  slotMachineSpin(userId: number, bet: number, machineNumber: number): Promise<{ user: User; symbols: string[]; winAmount: number }>;
  getUserStats(userId: number): Promise<GameStats>;
  getWeeklyCheckIns(userId: number, weekStartDate: string): Promise<DailyCheckIn[]>;
  claimDailyCheckIn(userId: number, dayOfWeek: number, weekStartDate: string, reward: number): Promise<{ user: User; checkIn: DailyCheckIn }>;
  getLastSpin(userId: number): Promise<SpinHistory | undefined>;
  spinWheel(userId: number, prize: number): Promise<{ user: User; spin: SpinHistory }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<void> {
    await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    return result;
  }

  async deposit(userId: number, amount: number, description: string = "Deposit"): Promise<{ user: User; transaction: Transaction }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const newBalance = user.balance + amount;
    await this.updateUserBalance(userId, newBalance);

    const transaction = await this.createTransaction({
      userId,
      type: "deposit",
      amount,
      balanceBefore: user.balance,
      balanceAfter: newBalance,
      description,
    });

    const updatedUser = await this.getUser(userId);
    return { user: updatedUser!, transaction };
  }

  async withdraw(userId: number, amount: number, description: string = "Withdrawal"): Promise<{ user: User; transaction: Transaction }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    if (user.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const newBalance = user.balance - amount;
    await this.updateUserBalance(userId, newBalance);

    const transaction = await this.createTransaction({
      userId,
      type: "withdraw",
      amount,
      balanceBefore: user.balance,
      balanceAfter: newBalance,
      description,
    });

    const updatedUser = await this.getUser(userId);
    return { user: updatedUser!, transaction };
  }

  async slotMachineSpin(userId: number, bet: number, machineNumber: number): Promise<{ user: User; symbols: string[]; winAmount: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (bet <= 0) {
      throw new Error("Bet amount must be positive");
    }

    if (user.balance < bet) {
      throw new Error("Insufficient balance");
    }

    const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "7️⃣"];
    const symbols: string[] = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

    let winMultiplier = 0;
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      if (symbols[0] === "7️⃣") winMultiplier = 100;
      else if (symbols[0] === "💎") winMultiplier = 50;
      else if (symbols[0] === "⭐") winMultiplier = 25;
      else if (symbols[0] === "🍇") winMultiplier = 15;
      else if (symbols[0] === "🍊") winMultiplier = 10;
      else if (symbols[0] === "🍋") winMultiplier = 8;
      else if (symbols[0] === "🍒") winMultiplier = 5;
    } else if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      winMultiplier = 2;
    }

    const winAmount = bet * winMultiplier;
    let balanceAfterBet = user.balance - bet;

    await this.createTransaction({
      userId,
      type: "bet",
      amount: bet,
      balanceBefore: user.balance,
      balanceAfter: balanceAfterBet,
      description: `Slot Machine #${machineNumber} - Spin`,
    });

    if (winAmount > 0) {
      const finalBalance = balanceAfterBet + winAmount;
      await this.createTransaction({
        userId,
        type: "win",
        amount: winAmount,
        balanceBefore: balanceAfterBet,
        balanceAfter: finalBalance,
        description: `Slot Machine #${machineNumber} - Win (${symbols.join(" ")})`,
      });
      await this.updateUserBalance(userId, finalBalance);
    } else {
      await this.updateUserBalance(userId, balanceAfterBet);
    }

    const updatedUser = await this.getUser(userId);
    return { user: updatedUser!, symbols, winAmount };
  }

  async getUserStats(userId: number): Promise<GameStats> {
    const userTransactions = await this.getUserTransactions(userId, 1000);
    
    const bets = userTransactions.filter(t => t.type === "bet");
    const wins = userTransactions.filter(t => t.type === "win");
    
    const totalBetAmount = bets.reduce((sum, t) => sum + t.amount, 0);
    const totalWinAmount = wins.reduce((sum, t) => sum + t.amount, 0);
    const totalBets = bets.length;
    const totalWins = wins.length;
    const totalLosses = totalBets - totalWins;
    const netProfit = totalWinAmount - totalBetAmount;
    const gamesPlayed = totalBets;
    const winRate = gamesPlayed > 0 ? (totalWins / gamesPlayed) * 100 : 0;
    const biggestWin = wins.length > 0 ? Math.max(...wins.map(t => t.amount)) : 0;

    return {
      totalBets,
      totalWins,
      totalLosses,
      totalWinAmount,
      totalBetAmount,
      netProfit,
      gamesPlayed,
      winRate,
      biggestWin,
    };
  }

  async getWeeklyCheckIns(userId: number, weekStartDate: string): Promise<DailyCheckIn[]> {
    const result = await db
      .select()
      .from(dailyCheckIns)
      .where(
        and(
          eq(dailyCheckIns.userId, userId),
          eq(dailyCheckIns.weekStartDate, weekStartDate)
        )
      );
    return result;
  }

  async claimDailyCheckIn(userId: number, dayOfWeek: number, weekStartDate: string, reward: number): Promise<{ user: User; checkIn: DailyCheckIn }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingCheckIn = await db
      .select()
      .from(dailyCheckIns)
      .where(
        and(
          eq(dailyCheckIns.userId, userId),
          eq(dailyCheckIns.dayOfWeek, dayOfWeek),
          eq(dailyCheckIns.weekStartDate, weekStartDate)
        )
      );

    if (existingCheckIn.length > 0) {
      throw new Error("Already claimed today");
    }

    const newBalance = user.balance + reward;
    await this.updateUserBalance(userId, newBalance);

    await this.createTransaction({
      userId,
      type: "deposit",
      amount: reward,
      balanceBefore: user.balance,
      balanceAfter: newBalance,
      description: "Daily Check-In Reward",
    });

    const checkInResult = await db
      .insert(dailyCheckIns)
      .values({
        userId,
        dayOfWeek,
        weekStartDate,
      })
      .returning();

    const updatedUser = await this.getUser(userId);
    return { user: updatedUser!, checkIn: checkInResult[0] };
  }

  async getLastSpin(userId: number): Promise<SpinHistory | undefined> {
    const result = await db
      .select()
      .from(spinHistory)
      .where(eq(spinHistory.userId, userId))
      .orderBy(desc(spinHistory.spunAt))
      .limit(1);
    return result[0];
  }

  async spinWheel(userId: number, prize: number): Promise<{ user: User; spin: SpinHistory }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.balance + prize;
    await this.updateUserBalance(userId, newBalance);

    await this.createTransaction({
      userId,
      type: "deposit",
      amount: prize,
      balanceBefore: user.balance,
      balanceAfter: newBalance,
      description: "Spin Wheel Prize",
    });

    const spinResult = await db
      .insert(spinHistory)
      .values({
        userId,
        prize,
      })
      .returning();

    const updatedUser = await this.getUser(userId);
    return { user: updatedUser!, spin: spinResult[0] };
  }
}

export const storage = new DatabaseStorage();
