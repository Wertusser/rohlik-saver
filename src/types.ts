export type RohlikApiMethods = 'prices' | 'composition' | '';

export type UnitAmount = {
  unit: string;
  amount: number;
};

export type FoodComposition = {
  energyKJ: UnitAmount;
  energyKCal: UnitAmount;
  fats: UnitAmount;
  saturatedFats: UnitAmount;
  carbohydrates: UnitAmount;
  sugars: UnitAmount;
  protein: UnitAmount;
  salt: UnitAmount;
  fiber: UnitAmount;
};

export type FoodPrice = {
  amount: number;
  amountPerUnit: number;
};

export type RohlikProduct = {
  // fetched via sitemap.xml
  id: number;
  url: string;
  slug: string;

  // fetched via /api/product
  name?: string;
  image?: string;
  size?: UnitAmount;
  categoryId?: number;

  // fetched via /api/prices
  price?: FoodPrice;
  // fetched via /api/composition
  composition?: FoodComposition;
};
