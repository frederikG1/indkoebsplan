// Typer, der deles mellem frontend og backend. Felterne svarer til tabellen list_item.
export type ListItem = {
  id: number;
  userId: number;
  categoryId: number | null;
  name: string;
  requiredBrand: string | null; // fx "Merrild" (user story 2)
  quantity: number;
};

// Én vare i en plan. Er alle tre felter null, er varen "uden pris" i planen.
export type PlanLine = {
  itemId: number;
  offerId: number | null;
  chainId: number | null;
  priceCents: number | null; // tilbudspris × antal på listen
};

export type Plan = {
  chainIds: number[];
  lines: PlanLine[];
  totalCents: number;
  coveredCount: number;
  savingsCents: number; // i forhold til referenceplanen; kan være negativ
};
