import { Lucia, TimeSpan } from "lucia";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Singleton pattern for PrismaClient to avoid multiple instances
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

// Create connection pool
const pool = globalForPrisma.pool || new Pool({ connectionString: process.env.DATABASE_URL });
const pgAdapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter: pgAdapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

// Custom Prisma adapter for Lucia
class PrismaAdapter {
  async getSessionAndUser(sessionId: string): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { admin: true }
    });

    if (!result) {
      return [null, null];
    }

    const session: DatabaseSession = {
      id: result.id,
      userId: result.userId,
      expiresAt: result.expiresAt,
      attributes: {}
    };

    const user: DatabaseUser = {
      id: result.admin.id,
      attributes: {
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role,
        isActive: result.admin.isActive
      }
    };

    return [session, user];
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const sessions = await prisma.session.findMany({
      where: { userId }
    });

    return sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      attributes: {}
    }));
  }

  async setSession(session: DatabaseSession): Promise<void> {
    await prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt
      }
    });
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt }
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId }
    });
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId }
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      }
    });
  }
}

interface DatabaseSession {
  id: string;
  userId: string;
  expiresAt: Date;
  attributes: Record<string, any>;
}

interface DatabaseUser {
  id: string;
  attributes: {
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
}

const adapter = new PrismaAdapter();

export const lucia = new Lucia(adapter as any, {
  sessionExpiresIn: new TimeSpan(30, "d"), // 30 days
  sessionCookie: {
    name: "unity-vote-session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
      isActive: attributes.isActive
    };
  }
});

export const validateRequest = cache(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return {
      user: null,
      session: null
    };
  }

  const result = await lucia.validateSession(sessionId);
  
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
  } catch {
    // Next.js throws error when attempting to set cookies in Server Components
  }

  return result;
});

// Types
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUser["attributes"];
  }
}
