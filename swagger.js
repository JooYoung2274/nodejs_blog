const swaggerUI = require("swagger-ui-express");
const swaggereJsdoc = require("swagger-jsdoc");
const options = {
  swaggerDefinition: {
    info: {
      title: "NodeJS_blog API",
      version: "1.0.0",
      description: "NodeJS_blog API",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  apis: ["./routes/*.js", "./swagger/*"],
};
const specs = swaggereJsdoc(options);
module.exports = { swaggerUI, specs };
