const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { user_id, event_id, ticket_type, quantity } = req.body;
  res.json({ message: "Booking received", data: { user_id, event_id, ticket_type, quantity } });
});

module.exports = router;