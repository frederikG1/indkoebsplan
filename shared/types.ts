// Typer, der deles mellem frontend og backend. Felterne svarer til tabellen list_item.
export type ListItem = {
  id: number;
  userId: number;
  categoryId: number | null;
  name: string;
  requiredBrand: string | null; // fx "Merrild" (user story 2)
  quantity: number;
};
