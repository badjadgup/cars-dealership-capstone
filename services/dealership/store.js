import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
const here = path.dirname(fileURLToPath(import.meta.url));
export async function createStore({
  mongoUrl = process.env.MONGODB_URI,
  localFile = path.join(here, "data/local.json"),
} = {}) {
  const seed = JSON.parse(
    await fs.readFile(path.join(here, "data/seed.json"), "utf8"),
  );
  if (mongoUrl) {
    const client = new MongoClient(mongoUrl, {
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE || "dealerships");
    await db.collection("dealers").createIndex({ id: 1 }, { unique: true });
    await db.collection("reviews").createIndex({ id: 1 }, { unique: true });
    for (const dealer of seed.dealers)
      await db
        .collection("dealers")
        .updateOne(
          { id: dealer.id },
          { $setOnInsert: dealer },
          { upsert: true },
        );
    for (const review of seed.reviews)
      await db
        .collection("reviews")
        .updateOne(
          { id: review.id },
          { $setOnInsert: review },
          { upsert: true },
        );
    return {
      mode: "mongodb",
      dealers: () =>
        db
          .collection("dealers")
          .find({}, { projection: { _id: 0 } })
          .sort({ id: 1 })
          .toArray(),
      reviews: (id) =>
        db
          .collection("reviews")
          .find({ dealership: id }, { projection: { _id: 0 } })
          .sort({ created_at: -1 })
          .toArray(),
      add: async (review) => {
        await db.collection("reviews").insertOne({ ...review });
        return review;
      },
      close: () => client.close(),
    };
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("MONGODB_URI is required in production.");
  let data;
  try {
    data = JSON.parse(await fs.readFile(localFile, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    data = structuredClone(seed);
  }
  let queue = Promise.resolve();
  return {
    mode: "local-json",
    dealers: async () => structuredClone(data.dealers),
    reviews: async (id) =>
      structuredClone(
        data.reviews
          .filter((r) => r.dealership === id)
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      ),
    add(review) {
      const operation = queue.then(async () => {
        const next = { ...data, reviews: [...data.reviews, review] };
        await fs.mkdir(path.dirname(localFile), { recursive: true });
        await fs.writeFile(localFile + ".tmp", JSON.stringify(next, null, 2));
        await fs.rename(localFile + ".tmp", localFile);
        data = next;
        return review;
      });
      queue = operation.catch(() => {});
      return operation;
    },
    close: async () => {},
  };
}
