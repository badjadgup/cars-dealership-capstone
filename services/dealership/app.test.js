import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "./app.js";
import { createStore } from "./store.js";
test("dealers, Kansas filtering, authentication, review persistence and validation", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cars-test-"));
  const file = path.join(dir, "reviews.json");
  const store = await createStore({ mongoUrl: "", localFile: file });
  const server = createApp(store, "test-key").listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (p, options = {}) =>
    fetch(base + p, {
      ...options,
      headers: {
        "X-Service-Key": "test-key",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  try {
    assert.equal((await fetch(base + "/dealers")).status, 401);
    const all = await (await call("/dealers")).json();
    assert.equal(all.dealers.length, 50);
    const course = await (await fetch(base + "/fetchDealers")).json();
    assert.equal(course.length, 50);
    assert.ok(course.every((d) => d.short_name && d.zip && d.st && d.state));
    const kansas = await (await fetch(base + "/fetchDealers/Kansas")).json();
    assert.equal(kansas.length, 1);
    assert.equal(kansas[0].state, "Kansas");
    assert.equal(
      (await (await fetch(base + "/fetchDealer/8")).json())[0].id,
      8,
    );
    const reviews = await (await fetch(base + "/fetchReviews/dealer/15")).json();
    assert.ok(Array.isArray(reviews));
    assert.ok(reviews.length > 0);
    assert.ok(
      reviews.every(
        (r) => r.name && r.car_make && r.car_model && r.purchase_date,
      ),
    );
    assert.equal((await fetch(base + "/fetchDealer/999")).status, 404);
    const ks = await (await call("/dealers?state=Kansas")).json();
    assert.equal(ks.dealers.length, 1);
    assert.ok(ks.dealers.every((d) => d.state === "Kansas"));
    assert.equal((await call("/dealers/999")).status, 404);
    assert.equal(
      (await call("/dealers/1/reviews", { method: "POST", body: "{}" })).status,
      400,
    );
    const data = {
      name: "Test Driver",
      username: "tester",
      review: "Fantastic services and a very helpful team.",
      rating: 5,
      car_make: "Toyota",
      car_model: "Camry",
      car_year: 2024,
      purchase_date: "2025-01-01",
      sentiment: "positive",
    };
    const response = await call("/dealers/1/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
    assert.equal(response.status, 201);
    const saved = (await response.json()).review;
    const again = await createStore({ mongoUrl: "", localFile: file });
    assert.ok((await again.reviews(1)).some((r) => r.id === saved.id));
    await again.close();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await store.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test(
  "MongoDB store saves and reloads a review",
  { skip: !process.env.MONGODB_TEST_URI },
  async () => {
    process.env.MONGODB_DATABASE = "capstone_ci";
    const store = await createStore({ mongoUrl: process.env.MONGODB_TEST_URI });
    try {
      assert.equal(store.mode, "mongodb");
      assert.equal((await store.dealers()).length, 50);
      const review = {
        id: "ci-" + Date.now(),
        dealership: 1,
        name: "CI Driver",
        username: "ci",
        review: "Fantastic services",
        rating: 5,
        car_make: "Toyota",
        car_model: "Camry",
        car_year: 2024,
        purchase_date: "2025-01-01",
        sentiment: "positive",
        created_at: new Date().toISOString(),
      };
      await store.add(review);
      assert.ok((await store.reviews(1)).some((r) => r.id === review.id));
    } finally {
      await store.close();
    }
  },
);
