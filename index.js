require("dotenv").config();
require("express");
const { Application } = require("./App/app");
const PORT = process.env.PORT || 4000;
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/Lamp";
const app = new Application(PORT, DB_URL);

module.exports = { app };
