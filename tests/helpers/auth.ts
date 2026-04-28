import jwt from "jsonwebtoken";

/**
 * Sign a JWT token for testing purposes
 */
export function signTestToken(userId: number, role: string = "user"): string {
  const secret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign({ id: userId, role }, secret, { expiresIn: "1h" });
}

/**
 * Set up JWT secret for tests
 */
export function setTestJwtSecret() {
  process.env.JWT_SECRET = "test-secret";
}
