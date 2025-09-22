const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Concert A", date: "2025-10-01", ticketPrice: 50 },
    { id: 2, name: "Movie B", date: "2025-10-05", ticketPrice: 30 }
  ]);
});

module.exports = router;