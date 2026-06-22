import express from "express";
import { initDatabase } from "./database/database.js";

import apiRoutes from "./routes/api.js";
import pageRoutes from "./routes/pages.js";

const app = express();
const port = 3000;

await initDatabase();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", pageRoutes);
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});

// npm.cmd install express sqlite sqlite3 bcrypt
// Вводить: npm.cmd start