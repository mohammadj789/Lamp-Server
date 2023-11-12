require("dotenv").config();
const { Application } = require("./App/app");
const PORT = process.env.PORT || 3030;
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/Lamp";
new Application(PORT, DB_URL);
