var express = require("express");
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser')

// Add cors headers
app.use(cors());

// Add body parser
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

// Establish connection to MongoDB
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connnection error:'));
db.once('open', () => {
    console.log("Connected to MongoDB!");
});

// Start app
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// APIs for comments
var Comment = require("./comment");

app.get("/comment", (req, res, next) => {
    Comment.find({ hash_val: req.query.val ? req.query.val : { $exists: true }, user: req.query.user ? req.query.user : { $exists: true } }, (err, result) => {
        if (err) console.log(err);
        res.json(result);
    })
});

app.post("/comment", (req, res, next) => {
    console.log(req.body.data.content);
    const comment = new Comment({
        user: req.body.data.user,
        content: req.body.data.content,
        hash_val: req.body.data.hash_val,
        course_number: req.body.data.course_number,
        course_subject: req.body.data.course_subject,
        course_name: req.body.data.course_name,
        instructor: req.body.data.instructor
    });

    let exist = false;

    Comment.find({ hash_val: req.body.data.hash_val, user: req.body.data.user }, (err, result) => {
        if (err) {
            console.log(err);
        } else if (result.length > 0) {
            exist = true;
        }

        if (exist == false) {
            comment.save((err, result) => {
                if (err) res.json({
                    message: err
                });
                else res.sendStatus(200);
            })
        } else {
            console.log("user: " + req.body.data.user + " trying to post comment to course " + req.body.data.hash_val + " multiple times");
            res.sendStatus(406);
        }
    })
});

app.delete("/comment", (req, res, next) => {
    Comment.deleteMany({ hash_val: req.body.hash_val, user: req.body.user }, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.sendStatus(200);
        }
    })
})

// APIs for courses
var Course = require("./course");

app.get("/course", (req, res, next) => {
    code = req.query.val;
    Course.find({ Hash_Val: code }, (err, result) => {
        if (err) console.log(err);
        res.json(result)
    })
});