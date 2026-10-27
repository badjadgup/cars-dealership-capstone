import { createStore } from "./store.js";
import { createApp } from "./app.js";
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.SERVICE_API_KEY ||
    process.env.SERVICE_API_KEY === "local-service-key")
)
  throw new Error("Set SERVICE_API_KEY in production.");
const store = await createStore();
const server = createApp(store).listen(
  process.env.PORT || 3030,
  process.env.HOST || "127.0.0.1",
  () => console.log(`Dealership API ready; storage=${store.mode}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await store.close();
      process.exit(0);
    }),
  );
