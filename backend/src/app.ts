import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());

// Svarer kun, at serveren kører. Bruges til at tjekke, at backenden er oppe.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
