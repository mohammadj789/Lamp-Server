class Application {
  #express = require("express");
  #app = this.#express();
  #PORT;
  #io;
  constructor(PORT, DB_URL) {
    this.#PORT = PORT;
    this.configApplication();
    this.configServer();
    this.configDB(DB_URL);
    this.configRoutes();
    this.errorHandler();
    this.configSocket();
  }
  configApplication() {
    const path = require("path");
    const morgan = require("morgan");
    const swaggerJSDoc = require("swagger-jsdoc");
    const swaggerUI = require("swagger-ui-express");
    const cors = require("cors");
    this.#app.use((req, res, next) => {
      req.io = this.#io;
      next();
    });
    this.#app.use(this.#express.json());
    this.#app.use(cors());
    this.#app.use(this.#express.urlencoded({ extended: true }));
    this.#app.use(
      this.#express.static(
        path.join(__dirname, "..", "static", "public")
      )
    );
    this.#app.use(morgan("dev"));
    this.#app.use(
      "/api-doc",
      swaggerUI.serve,
      swaggerUI.setup(
        swaggerJSDoc({
          swaggerDefinition: {
            info: {
              title: "Lamp",
              description:
                "Music player with sync lyrics called Lamp",
              version: "2.0.0",
              contact: {
                email: "mohammadsoltanian10@gmail.com",
                name: "Mohammadjavad Soltanian",
              },
            },
            openapi: "3.0.0",
            servers: [
              {
                url:
                  process.env.NODE_ENV === "production"
                    ? "https://lamp-server.iran.liara.run"
                    : `http://localhost:${this.#PORT}`,
              },
            ],

            components: {
              securitySchemes: {
                BearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                },
              },
            },
            security: [
              {
                BearerAuth: [],
              },
            ],
          },
          apis: ["./App/routers/docs/*.yml"],
        }),
        { explorer: true }
      )
    );
  }
  configDB(DB_URL) {
    const { default: mongoose } = require("mongoose");
    mongoose.connect(DB_URL);
    mongoose.connection.on("connected", () =>
      console.log("Connection to database is established")
    );
    mongoose.connection.on("error", (err) => {
      console.error(err);
    });
  }

  configSocket() {
    const { socketController } = require("./socket");

    this.#io
      .of("/socket")
      .on("connection", socketController(this.io));
  }

  configServer() {
    const socketIo = require("socket.io");
    const http = require("http");
    const server = http.createServer(this.#app);

    this.#io = socketIo(server, {
      cors: {
        origin: "*",
      },
    });

    server.listen(this.#PORT, () =>
      console.log(
        `Server is running on port ${this.#PORT}. http://localhost:${
          this.#PORT
        }/api-doc`
      )
    );
  }
  configRoutes() {
    const { AllRoutes } = require("./routers/routes");
    this.#app.use(AllRoutes);
  }
  errorHandler() {
    const {
      ErrorHandler,
      NotFoundError,
    } = require("./http/middleware/erroHandler");

    this.#app.use(NotFoundError);
    this.#app.use(ErrorHandler);
  }
}
module.exports = { Application };
