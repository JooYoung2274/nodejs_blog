const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "NodeJS_blog API",
    description: "hanghae4W API",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
