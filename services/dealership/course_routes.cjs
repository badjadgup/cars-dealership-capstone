"use strict";
// Course-compatible, read-only REST routes; write routes stay authenticated.
module.exports = function createCourseRouter(express, store) {
  var router = express.Router();
  router.get(
    ["/fetchDealers", "/fetchDealers/:state"],
    async function (req, res, next) {
      try {
        var state = (req.params.state || "").trim().toLowerCase();
        var dealers = await store.dealers();
        if (state && state !== "all") {
          dealers = dealers.filter(function (dealer) {
            return (
              dealer.state.toLowerCase() === state ||
              dealer.st.toLowerCase() === state
            );
          });
        }
        res.json(dealers);
      } catch (error) {
        next(error);
      }
    },
  );
  async function findDealer(req, res, next) {
    try {
      var id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid dealer ID." });
      }
      var dealer = (await store.dealers()).find(function (item) {
        return item.id === id;
      });
      if (!dealer) {
        return res.status(404).json({ error: "Dealer not found." });
      }
      req.courseDealer = dealer;
      next();
    } catch (error) {
      next(error);
    }
  }
  router.get("/fetchDealer/:id", findDealer, function (req, res) {
    res.json([req.courseDealer]);
  });
  router.get(
    "/fetchReviews/dealer/:id",
    findDealer,
    async function (req, res, next) {
      try {
        res.json(await store.reviews(req.courseDealer.id));
      } catch (error) {
        next(error);
      }
    },
  );
  return router;
};
