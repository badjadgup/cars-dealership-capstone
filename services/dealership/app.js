import express from "express";
import createCourseRouter from "./course_routes.cjs";
import { timingSafeEqual, randomUUID } from "node:crypto";
export function createApp(
  store,
  key = process.env.SERVICE_API_KEY || "local-service-key",
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.get("/health", (_req, res) =>
    res.json({ status: "ok", service: "dealership", storage: store.mode }),
  );
  app.use(createCourseRouter(express, store));
  app.use((req, res, next) => {
    const a = Buffer.from(req.get("X-Service-Key") || ""),
      b = Buffer.from(key);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      return res
        .status(401)
        .json({ error: "Service authentication required." });
    next();
  });
  const getDealer = async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1)
      return res.status(400).json({ error: "Invalid dealer ID." });
    req.dealer = (await store.dealers()).find((d) => d.id === id);
    if (!req.dealer)
      return res.status(404).json({ error: "Dealer not found." });
    next();
  };
  app.get("/dealers", async (req, res) => {
    const state =
      typeof req.query.state === "string"
        ? req.query.state.trim().toLowerCase()
        : "";
    let dealers = await store.dealers();
    if (state)
      dealers = dealers.filter(
        (d) => d.state.toLowerCase() === state || d.st.toLowerCase() === state,
      );
    res.json({ dealers });
  });
  app.get("/dealers/:id", getDealer, (req, res) =>
    res.json({ dealer: req.dealer }),
  );
  app.get("/dealers/:id/reviews", getDealer, async (req, res) =>
    res.json({ reviews: await store.reviews(req.dealer.id) }),
  );
  app.post("/dealers/:id/reviews", getDealer, async (req, res) => {
    const data = req.body;
    if (
      !data ||
      !Number.isInteger(data.rating) ||
      data.rating < 1 ||
      data.rating > 5 ||
      !["positive", "negative", "neutral"].includes(data.sentiment) ||
      [
        "review",
        "name",
        "username",
        "car_make",
        "car_model",
        "purchase_date",
      ].some((k) => typeof data[k] !== "string" || !data[k].trim()) ||
      data.review.trim().length < 10 ||
      data.review.length > 5000 ||
      !Number.isInteger(data.car_year)
    )
      return res.status(400).json({ error: "Invalid review data." });
    const review = {
      id: randomUUID(),
      dealership: req.dealer.id,
      created_at: new Date().toISOString(),
    };
    for (const field of [
      "name",
      "username",
      "review",
      "rating",
      "car_make",
      "car_model",
      "car_year",
      "purchase_date",
      "sentiment",
    ])
      review[field] = data[field];
    res.status(201).json({ review: await store.add(review) });
  });
  app.use((_req, res) =>
    res.status(404).json({ error: "Endpoint not found." }),
  );
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed")
      return res.status(400).json({ error: "Invalid JSON." });
    if (err.type === "entity.too.large")
      return res.status(413).json({ error: "Request too large." });
    console.error(err.message);
    res.status(500).json({ error: "The request could not be completed." });
  });
  return app;
}
