const express = require("express");
const mysql = require("mysql");
const app = express();

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

const port = process.env.PORT || 8080;
const badRequestJSON = { error: true, message: "Bad request, invalid token id."};

app.listen(port, () => {
    console.log(`Wacayang API is listening on port ${port}`);
});

app.get("/", verifyIdToken, async (req, res) => {
    res.status(200).send({ error: false, message: "Welcome to Wacayang API! Try: /wayangs, /wayangs/:id, /search?name=query" });
});

app.post("/sign", verifyIdToken, async (req, res) => {
    const query = "SELECT user_id FROM user_table WHERE user_id = ?";
    mysqlPool.query(query, [req.uid], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Error to sign user." });
        } else {
            if (result.length < 1) {
                const query2 = "INSERT INTO user_table VALUES (?, ?, ?, ?)";
                mysqlPool.query(query2, [req.uid, req.name, req.email, req.photo], (error, result2) => {
                    if (!result2) res.status(400).send({ error: true, message: "Error to sign user." });
                    else res.status(200).send({ error: false, message: "User signed in.", user: req.uid });
                });
            } else {
                const query3 = "UPDATE user_table SET user_id=?, user_name=?, user_email=?, user_photo=? WHERE user_id = ?";
                mysqlPool.query(query3, [req.uid, req.name, req.email, req.photo, req.uid], (error, result3) => {
                    if (!result3) res.status(400).send({ error: true, message: "Error to sign user." });
                    else res.status(200).send({ error: false, message: "User signed in.", user: req.uid });
                });
            }
        }
    });
});

app.post("/add-comment", verifyIdToken, async (req, res) => {
    const wayang_id = req.query.wayang;
    const comment = req.query.comment;

    const ISODate = new Date(Date.now());
    const formattedDate = ISODate.toJSON().slice(0, 19).replace('T', ' ');

    const query = "INSERT INTO user_comment (user_id, wayang_id, comment_content, created_at) VALUES (?, ?, ?, ?)";
    mysqlPool.query(query, [req.uid, wayang_id, comment, formattedDate], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Failed to post comment." });
        } else {
            res.status(200).send({ error: false, message: "Comment posted successfully.", user: req.uid, wayang: parseInt(wayang_id), content: comment});
        }
    });
});

app.post("/del-comment", verifyIdToken, async (req, res) => {
    const comment = req.query.comment;
    const query = "DELETE FROM user_comment WHERE comment_id = ?";
    mysqlPool.query(query, [comment], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Failed to delete comment." });
        } else {
            res.status(200).send({ error: false, message: "Comment deleted successfully.", comment_id: parseInt(comment) });
        }
    });
});

app.get("/comments", verifyIdToken, async (req, res) => {
    const wayang = req.query.wayang;
    const query = "SELECT comment_id, user_comment.user_id, user_name, user_photo, comment_content as comment, user_comment.created_at FROM user_comment " + 
        "INNER JOIN user_table ON user_comment.user_id = user_table.user_id WHERE wayang_id = ? ORDER BY created_at DESC";

    mysqlPool.query(query, [wayang], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Failed to fetch comments." });
        } else {
            res.status(200).send({ error: false, message: "Comments fetched successfully.", wayang_id: parseInt(wayang), comments: result});
        }
    });
});

app.get("/wayangs", verifyIdToken, async(req, res) => {
    const query = "SELECT * FROM wayang_table";
    mysqlPool.query(query, (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "No entries." });
        } else {
            res.status(200).send({ error: false, message: "Wayangs fetched successfully.", listWayang: result });
        }
    });
});

app.get("/wayangs/:id", verifyIdToken, async(req, res) => {
    const wayang_id = req.params.id;
    const user_id = req.uid;
    const query = "SELECT wayang_table.*, " +
    "(SELECT (COUNT(user_id) > 0) FROM favorite_wayang WHERE user_id = ? AND wayang_id = ?) as is_favorite," +
    "(SELECT COUNT(comment_id) FROM user_comment WHERE wayang_id = ?) as total_comments," +
    "(SELECT comment_id FROM user_comment WHERE wayang_id = ? ORDER BY created_at DESC LIMIT 1) as recent_comment_id," + 
    "(SELECT comment_content FROM user_comment WHERE comment_id = recent_comment_id LIMIT 1) as recent_comment," + 
    "(SELECT user_photo FROM user_table WHERE user_id = (SELECT user_id FROM user_comment WHERE comment_id = recent_comment_id LIMIT 1)) as commenter_photo " +
    "FROM wayang_table WHERE id = ?";

    mysqlPool.query(query, [user_id, wayang_id, wayang_id, wayang_id, wayang_id], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Not found." });
        } else {
            res.status(200).send({ error: false, message: "A wayang fetched successfully.", wayang: result[0] });
        }
    });
});

app.get("/search", verifyIdToken, async(req, res) => {
    const keyword = '%' + req.query.name + '%';
    const query = "SELECT * FROM wayang_table WHERE name LIKE ?";
    mysqlPool.query(query, [keyword], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Not found." });
        } else {
            res.status(200).send({ error: false, message: "Search wayangs found fetched successfully.", wayangFound: result });
        }
    });
});

app.post("/add-favorite", verifyIdToken, async(req, res) => {
    const uid = req.uid;
    const wayang_id = req.query.wayang;
    const query = "INSERT INTO favorite_wayang (user_id, wayang_id) VALUES (?, ?)";
    mysqlPool.query(query, [uid, wayang_id], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Failed to connect and insert new favorite." });
        } else {
            res.status(200).send({ error: false, message: "Favorite inserted successfully.", data: { user: uid, wayang: parseInt(wayang_id) } });
        }
    });
});

app.post("/del-favorite", verifyIdToken, async(req, res) => {
    const uid = req.uid;
    const wayang_id = req.query.wayang;
    const query = "DELETE FROM favorite_wayang WHERE user_id = ? AND wayang_id = ?";
    mysqlPool.query(query, [uid, wayang_id], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "Failed to connect and delete favorite." });
        } else {
            res.status(200).send({ error: false, message: "Favorite deleted successfully.", data: { user: uid, wayang: parseInt(wayang_id) } });
        }
    });
});

app.get("/favorites", verifyIdToken, async(req, res) => {
    const uid = req.uid;
    const keyword = '%' + (req.query.name || "") + '%';
    const query = "SELECT wayang_table.* FROM wayang_table INNER JOIN favorite_wayang ON id = wayang_id WHERE user_id = ? AND name LIKE ?";
    
    mysqlPool.query(query, [uid, keyword], (error, result) => {
        if (!result) {
            res.status(400).send({ error: true, message: "No favorite entries." });
        } else {
            res.status(200).send({ error: false, message: "Favorite wayangs fetched successfully.", favorite: result });
        }
    });
});

async function verifyIdToken(req, res, next) {
    try {
        const header = req.headers['authorization'];
        if (typeof header !== 'unidefined') {
            const bearer = header.split(` `);
            const token = bearer[1];
            const auth = admin.auth();
            const user = await auth.verifyIdToken(token);
            
            req.uid = user.uid;
            req.name = user.name;
            req.email = user.email;
            req.photo = user.picture;

            next();
        } else {
            res.status(403).send(badRequestJSON);
        }
    } catch(error) { 
        res.status(403).send(badRequestJSON);
    }
}

const mysqlPool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
});