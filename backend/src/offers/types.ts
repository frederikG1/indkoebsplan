// Vores eget tilbudsformat. Alle kilder (lige nu kun Tjek) oversættes til denne type,
// så resten af appen aldrig afhænger af en kildes feltnavne.
export type Offer = {
  chainName: string;
  chainDescription: string;
  productName: string;
  quantity: number | null;
  unit: string | null;
  priceCents: number;
  beforePriceCents: number | null;
  validFrom: string; // ISO 8601
  validTo: string; // ISO 8601
};
