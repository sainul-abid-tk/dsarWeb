import { hash, compare } from "bcryptjs";
import { prisma } from "./prisma";

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return compare(password, hash);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(email: string, password: string, role: string = "owner") {
  const hashedPassword = await hashPassword(password);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });
}

export async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dsar.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await getUserByEmail(adminEmail);
  if (existing) return existing;

  return createUser(adminEmail, adminPassword, "admin");
}