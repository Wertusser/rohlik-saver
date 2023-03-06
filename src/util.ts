import got from "got";
import { ROHLIK_API_URL } from "./constant";
import { RohlikApiMethods, RohlikProduct } from "./types";
import { parse as parseHtml } from "node-html-parser";
import convert from "convert-units";

const SUPPORTED_UNITS: string[] = convert(0)
  .list()
  .map((i) => i.abbr as string);

export const safeConvertUnits = (
  amount: number,
  fromUnit: string,
  toUnit: string
): number => {
  return SUPPORTED_UNITS.includes(fromUnit)
    ? convert(amount)
        .from(fromUnit as any)
        .to(toUnit as any)
    : amount;
};

export const requestApi = <T>(
  method: RohlikApiMethods,
  productIds: number[]
): Promise<T[]> => {
  const url = new URL(`${ROHLIK_API_URL}/${method}`);
  url.search = productIds.map((id) => `products=${id}`).join("&");
  return got.get(url.href).then((data) => JSON.parse(data.body) as T[]);
};

export const loadRohlikProducts = async (): Promise<RohlikProduct[]> => {
  const html = await got
    .get("https://www.rohlik.cz/sitemap_products.xml")
    .then((data) => data.body);

  const urls = parseHtml(html)
    .querySelectorAll("loc")
    .map((item) => item.innerHTML);

  return urls.map((url) => {
    const [id, ...rest] = new URL(url).pathname.slice(1).split("-");

    return {
      id: Number(id),
      slug: rest.join("-"),
      url,
    };
  });
};
