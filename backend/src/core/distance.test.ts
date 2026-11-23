import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm } from "./distance.ts";

test("samme punkt giver 0 km", () => {
  const point = { latitude: 55.6761, longitude: 12.5683 };
  assert.equal(distanceKm(point, point), 0);
});

// Håndregnet: én breddegrad langs samme længdegrad er en 360-del af Jordens omkreds,
// altså 2 * π * 6371 / 360 ≈ 111,19 km.
test("én breddegrad mod nord er ca. 111,19 km", () => {
  const from = { latitude: 55, longitude: 12 };
  const to = { latitude: 56, longitude: 12 };
  assert.ok(Math.abs(distanceKm(from, to) - 111.19) < 0.01);
});
