import { users, transactions, type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

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
}

export const storage = new DatabaseStorage();
