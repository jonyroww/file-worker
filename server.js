require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const db = require("./DB/models");
const swaggerUi = require("swagger-ui-express"),
	swaggerDocument = require("./swagger.json");
db.sequelize.sync();

app.use(express.json());
app.use(cors());
app.use(fileUpload());

const authRouter = require("./app/routes/auth");
const filesRouter = require("./app/routes/files");
app.use("/auth", authRouter);
app.use("/files", filesRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.API_PORT, () => {
	console.log("Server has started");
});
