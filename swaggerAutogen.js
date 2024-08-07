"use strict";

require("dotenv").config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const swaggerAutogen = require("swagger-autogen");
const packageJson = require("./package.json");

const document = {
  info: {
    version: packageJson.version,
    title: packageJson.name,
    description: packageJson.description,
    termsOfService: "https://www.ibrsec.com",
    license: { name: packageJson.license },
    contact: { name: packageJson.author, email: "ibr.seckin@gmail.com" },
  },
  host: `${HOST}:${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    Token: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        " Simple token authentication *  example: <b>Token ...tokenkey...</b>",
    },
    Bearer: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Jwt token authentication *  example : <b>Bearer ...jwt tokenkey...</b>",
    },
  },
  security: [{ Token: [] }, { Bearer: [] }],
  definitions: {
    User: require("./src/models/userModel").User.schema.obj,
    Token: require("./src/models/tokenModel").Token.schema.obj,
    Car: require("./src/models/carModel").Car.schema.obj,
    Error: {
      error: "true",
      message: "error message",
      body: "error body",
      stack: "errorstack info"
    },
  },
};

const routes = ["./index.js"];
const outputFile = "./src/configs/swagger.json";

swaggerAutogen(outputFile, routes, document);
