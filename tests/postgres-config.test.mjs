import test from "node:test";
import assert from "node:assert/strict";
import pgConnectionString from "pg-connection-string";
import { normalizePostgresUrl } from "../lib/config/postgres.mjs";

test("legacy SSL aliases explicitly retain certificate and hostname verification", () => {
  for (const mode of ["prefer", "require", "verify-ca"]) {
    const result = normalizePostgresUrl(`postgresql://user:p%40ss@db.example/app?sslmode=${mode}&application_name=featurelogs`);
    const url = new URL(result);
    assert.equal(url.searchParams.get("sslmode"), "verify-full");
    assert.equal(url.password, "p%40ss");
    assert.equal(url.searchParams.get("application_name"), "featurelogs");
    const { ssl } = pgConnectionString.parse(result);
    assert.notEqual(ssl.rejectUnauthorized, false);
    assert.equal(ssl.checkServerIdentity, undefined);
  }
});

test("local connections and explicit SSL choices remain unchanged", () => {
  for (const suffix of ["", "?sslmode=disable", "?sslmode=verify-full", "?sslmode=require&uselibpqcompat=true"]) {
    const url = `postgresql://localhost/app${suffix}`;
    assert.equal(normalizePostgresUrl(url), url);
  }
});
