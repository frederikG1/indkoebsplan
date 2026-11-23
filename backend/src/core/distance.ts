// Afstand i luftlinje mellem to punkter (haversine). Se docs/planlaegning.md, afsnit 3.
export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceKm(from: Coordinates, to: Coordinates): number {
  // Forskellen i bredde- og længdegrad. Math.sin og Math.cos regner i radianer.
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  // a er et mål (0–1) for, hvor langt punkterne ligger fra hinanden på kuglen.
  // cos-leddet gør afstanden mellem længdegrader mindre, jo længere mod nord man er.
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  // Vinklen mellem punkterne set fra Jordens centrum, ganget med radius, giver buelængden i km.
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MAX_STOPS = 3;

// Alle rækkefølger af listen, fx [a, b] → [[a, b], [b, a]].
function permutations<T>(items: T[]): T[][] {
  // 0 eller 1 element kan kun stå i én rækkefølge.
  if (items.length <= 1) return [items];
  // Sæt hvert element forrest én gang, og læg alle rækkefølger af resten bagved.
  return items.flatMap((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    return permutations(rest).map((perm) => [item, ...perm]);
  });
}

// Korteste tur-retur fra start gennem alle stops. Med højst 3 stops er der
// højst 6 rækkefølger, så alle prøves. Tallet afrundes ikke; det gør visningen.
export function routeKm(start: Coordinates, stops: Coordinates[]): number {
  if (stops.length > MAX_STOPS) {
    throw new Error(`En rute kan højst have ${MAX_STOPS} butikker, fik ${stops.length}`);
  }
  if (stops.length === 0) return 0;

  // Regn længden ud for hver mulig rækkefølge, og tag den korteste.
  return Math.min(
    ...permutations(stops).map((order) => {
      // Ruten starter og slutter samme sted: hjem → butikker → hjem.
      const points = [start, ...order, start];
      // Læg afstanden mellem hvert par af nabopunkter sammen.
      let km = 0;
      for (let i = 1; i < points.length; i++) {
        km += distanceKm(points[i - 1], points[i]);
      }
      return km;
    }),
  );
}

// Ekstra km = planens rute minus referenceplanens rute (docs/planlaegning.md, afsnit 4).
// Kombinationerne finder først referenceplanen (billigste plan med én butik) og kalder
// så denne funktion for hver plan. Kan være negativ.
export function extraKm(
  start: Coordinates,
  planStops: Coordinates[],
  referenceStops: Coordinates[],
): number {
  return routeKm(start, planStops) - routeKm(start, referenceStops);
}
