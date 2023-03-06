import { RohlikResolver } from "./resolver";
const fs = require("fs");

const main = async () => {
  const r = new RohlikResolver();
  await r.update();
  await fs.writeFileSync("./rohlik.json", JSON.stringify([...r.products.values()]));
};

main();
