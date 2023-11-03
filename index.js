require("dotenv").config();
const { Application } = require("./App/app");

const DB_URL = "mongodb://127.0.0.1:27017/Lamp";
new Application(4000, DB_URL);
