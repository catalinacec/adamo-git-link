import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Analytics API",
      version: "1.0.0",
      description:
        "API for user authentication, password recovery via OTP, and first login password change",
    },
    servers: [
      {
        url: "http://localhost:3500",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/adapters/http/routes/*.ts",
    "./src/adapters/http/controllers/*.ts",
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
