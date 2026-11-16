// Kun de felter fra Tjek's API, vi faktisk bruger. Resten ignoreres.
export type TjekOffer = {
  id: string;
  heading: string;
  description: string | null;
  category_ids: string[];
  pricing: {
    price: number;
    pre_price: number | null;
  };
  quantity: {
    unit: { symbol: string } | null;
    size: { from: number; to: number };
    pieces: { from: number; to: number };
  };
  run_from: string;
  run_till: string;
  dealer: {
    name: string;
    description: string;
  };
};
