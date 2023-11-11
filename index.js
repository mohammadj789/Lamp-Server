require("dotenv").config();
const { Application } = require("./App/app");
console.log(process.env);

new Application(process.env.PORT, process.env.DB_URL);
