const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3001;
app.use(express.static("public"));
const connectDb = require("./config/db");
connectDb();
// Template÷
app.use(express.json());
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
// Routes
app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));
app.use("/", (req, res) => {
    res.send({ success: "Succesfully Sent" });
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
