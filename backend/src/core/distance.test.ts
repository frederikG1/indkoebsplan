import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm, extraKm, routeKm } from "./distance.ts";

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

// Kvadrat ved ækvator: butikkerne gives i en rækkefølge, der krydser diagonalt.
// Funktionen skal finde ruten rundt langs siderne i stedet.
test("routeKm finder den korteste rækkefølge", () => {
  const home = { latitude: 0, longitude: 0 };
  const a = { latitude: 0, longitude: 1 };
  const b = { latitude: 1, longitude: 1 };
  const c = { latitude: 1, longitude: 0 };
  const aroundTheSides =
    distanceKm(home, a) + distanceKm(a, b) + distanceKm(b, c) + distanceKm(c, home);
  assert.ok(Math.abs(routeKm(home, [a, c, b]) - aroundTheSides) < 0.001);
});

// Håndregnet: referencen er én butik 1 breddegrad væk (tur-retur 2 grader),
// planen er én butik 2 breddegrader væk (tur-retur 4 grader), så ekstra = 2 grader.
test("extraKm er planens rute minus referencens", () => {
  const home = { latitude: 55, longitude: 12 };
  const near = { latitude: 56, longitude: 12 };
  const far = { latitude: 57, longitude: 12 };
  const kmPerDegree = (2 * Math.PI * 6371) / 360;
  assert.ok(Math.abs(extraKm(home, [far], [near]) - 2 * kmPerDegree) < 0.01);
  assert.ok(extraKm(home, [near], [far]) < 0);
});
