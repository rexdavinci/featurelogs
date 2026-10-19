import "server-only";
import { env } from "@/.env";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = env.rateLimit.url;
const redisToken = env.rateLimit.token;

let limiters: Map<string, Ratelimit> | null = null;

function getRedis() {
  if (!redisUrl || !redisToken) {
    throw new Error("Missing Upstash Redis credentials.");
  }

  return new Redis({ url: redisUrl, token: redisToken });
}

function getLimiters() {
  if (limiters) {
    return limiters;
  }

  const redis = getRedis();
  limiters = new Map([
    [
      "password-reset",
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "featurelogs:password-reset",
      }),
    ],
    [
      "generate",
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(8, "15 m"),
        analytics: true,
        prefix: "featurelogs:generate",
      }),
    ],
    [
      "newsletter",
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2, "1 h"),
        analytics: true,
        prefix: "featurelogs:newsletter",
      }),
    ],
  ]);

  return limiters;
}

export async function assertRateLimit(
  scope: "generate" | "newsletter" | "password-reset",
  id: string,
) {
  // Gracefully bypass rate limits during local development if Upstash keys are missing
  if (!redisUrl || !redisToken) {
    console.warn("⚠️ RATE LIMITING not configured. Bypassing rate limiter.");
    return {
      ok: true as const,
      remaining: 50,
      reset: Date.now() + 15 * 60 * 1000,
    };
  }

  try {
    const limiter = getLimiters().get(scope);

    if (!limiter) {
      throw new Error("Rate limiter not configured.");
    }

    const result = await limiter.limit(id);

    if (!result.success) {
      return {
        ok: false as const,
        error:
          "You are making requests too quickly. Please wait a moment and try again.",
        retryAfter: result.reset,
      };
    }

    return {
      ok: true as const,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limiter failure:", error);
    // Graceful fallback to let the request pass in case of Upstash network failures
    return {
      ok: true as const,
      remaining: 1,
      reset: Date.now() + 1000,
    };
  }
}
