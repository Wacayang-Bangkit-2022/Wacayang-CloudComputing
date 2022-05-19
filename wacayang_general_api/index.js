const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(express.json());
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Wacayang API is listening on port ${port}`);
});

app.get("/", async (req, res) => {
    res.json({ message: "Welcome to Wacayang API! Try: /wayangs, /wayangs/:id, /search?name=query" });
});

app.get("/wayangs", async(req, res) => {
    const query = "SELECT * FROM wayang_table";
    pool.query(query, (error, result) => {
        if (!result[0]) {
            res.json({ error: true, message: "No entries." });
        } else {
            res.json({ error: false, message: "Wayangs fetched successfully.", listWayang: result });
        }
    });
});

app.get("/wayangs/:id", async(req, res) => {
    const query = "SELECT * FROM wayang_table WHERE id = ?";
    pool.query(query, [req.params.id], (error, result) => {
        if (!result[0]) {
            res.json({ error: true, message: "Not found." });
        } else {
            res.json({ error: false, message: "A wayang fetched successfully.", wayang: result[0] });
        }
    });
});

app.get("/search", async(req, res) => {
    const keyword = '%' + req.query.name + '%';
    const query = "SELECT * FROM wayang_table WHERE name LIKE ?";
    pool.query(query, [keyword], (error, result) => {
        if (!result) {
            res.json({ error: true, message: "Not found." });
        } else {
            res.json({ error: false, message: "Search wayangs found fetched successfully.", wayangFound: result });
        }
    });
});

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
});