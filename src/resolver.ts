import _ from "lodash";
import { FoodComposition, FoodPrice, RohlikProduct } from "./types";
import { loadRohlikProducts, requestApi, safeConvertUnits } from "./util";

export class RohlikResolver {
  products: Map<number, RohlikProduct> = new Map();

  constructor() {}

  async update(): Promise<RohlikProduct[]> {
    const products = await this.getProductList();

    const chunks = _.chunk(products, 256);

    for (const chunk of chunks) {
      const ids = chunk.map((i) => Number(i.id));

      await Promise.all([
        this.getProducts(ids),
        this.getPrices(ids),
        this.getCompositions(ids),
      ]);
    }
    return [...this.products.values()];
  }

  async getProductList(): Promise<Partial<RohlikProduct>[]> {
    const products = await loadRohlikProducts();

    products.forEach((product) => {
      this.products.set(product.id, product);
    });

    return products;
  }

  async getProducts(productIds: number[]): Promise<Partial<RohlikProduct>[]> {
    const products = await requestApi<any>("", productIds);

    return productIds
      .filter((id) => {
        return products.some((i) => +i.id === +id);
      })
      .map((id) => {
        const { name, mainCategoryId, images, unit, textualAmount } =
          products.find((i) => +i.id === +id);

        const [amount, textUnit] = textualAmount.split(" ");
        const unitAmount = safeConvertUnits(+amount, textUnit, unit);

        const update = {
          name,
          categoryId: mainCategoryId,
          image: images[0],
          size: { unit, amount: unitAmount },
        };

        this.updateProduct(id, update);
        return update;
      });
  }

  async getCompositions(productIds: number[]): Promise<FoodComposition[]> {
    const compositions = await requestApi<any>("composition", productIds);

    return productIds
      .filter((id) => {
        return compositions.some((i) => +i.productId === +id);
      })
      .map((id) => {
        const { nutritionalValues } = compositions.find(
          (i) => +i.productId === +id
        )!;

        const update = {
          composition: nutritionalValues[0]
            ? nutritionalValues[0].values
            : undefined,
        };

        this.updateProduct(id, update);

        return update.composition;
      });
  }

  async getPrices(productIds: number[]): Promise<FoodPrice[]> {
    const prices = await requestApi<any>("prices", productIds);

    return productIds
      .filter((id) => {
        return prices.some((i) => +i.productId === +id);
      })
      .map((id) => {
        const { price, pricePerUnit } = prices.find(
          (i) => +i.productId === +id
        );

        const update = {
          price: {
            amount: Number(price.amount),
            amountPerUnit: Number(pricePerUnit.amount),
          },
        };

        this.updateProduct(id, update);

        return update.price;
      });
  }

  updateProduct(id: number, data: Partial<RohlikProduct>) {
    const prev = this.products.get(id);

    if (!prev) {
      throw new Error(`Product with id ${id} is not in cache`);
    }

    this.products.set(id, {
      ...prev,
      ...data,
    });
  }
}
