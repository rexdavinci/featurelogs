import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function validateEmail(email: string) {
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    throw new Error("Please enter a valid email address.");
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  if (typeof password !== "string" || password.length < 6)
    throw new Error("Password must be at least 6 characters.");
  if (password.length > 1024) throw new Error("Password is too long.");
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
) {
  validatePassword(password);
  if (typeof confirmation !== "string" || password !== confirmation)
    throw new Error("Passwords do not match.");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${digest}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, digest] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
