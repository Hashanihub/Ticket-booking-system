const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
const eventsRoutes = require("./routes/events");
const bookingsRoutes = require("./routes/bookings");

app.use("/api/events", eventsRoutes);
app.use("/api/bookings", bookingsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));