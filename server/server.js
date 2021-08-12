const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const http = require("http");
const compression = require("compression");
const { resolve } = require("path");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();

const server = http.createServer(app);

const authRoutes = require("./routes/auth");

const mongoDb = process.env.MONGODB;
const port = process.env.PORT;

//middlewares
app.use(
  cors({ origin: "*", methods: "*", allowedHeaders: "*", credentials: true })
);
app.use(bodyParser.json({ limit: "5mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression({ level: 9, strategy: 4 }));

mongoose
  .connect(mongoDb, {
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to mongoDb");
  })
  .catch((err) => {
    console.log("Error conneting to mongoDb");
  });

//for prduction
if (process.env.NODE_ENV === "production") {
  app.use(express.static(resolve(process.cwd(), "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(resolve(process.cwd(), "client/build/index.html"));
  });
}

app.use("/api", authRoutes);

//for cpu performance increase
if (cluster.isMaster) {
  let cpuCore = os.cpus().length;
  for (let i = 0; i < cpuCore; i++) {
    cluster.fork();
  }
  cluster.on("online", (worker) => {
    if (worker.isConnected())
      console.log(`worker activated ${worker.process.pid}`);
  });
  cluster.on("exit", (worker) => {
    if (worker.isDead())
      console.log(`worker deactivated ${worker.process.pid}`);
  });
} else {
  server.listen(port, () => {
    console.log(`listing to port ${port}`);
  });
}
