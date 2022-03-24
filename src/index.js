/// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
//npm  uuidv4
const { v4: uuidv4 } = require("uuid");
const { Profile } = require("../models/profile");
const { User } = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const createError = require("http-errors");

const uri =
  "mongodb+srv://admin:pAsSwOrD321@dev-cluster.fcuvf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri);

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.post("/register", async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    userName: req.body.username,
    password: newPassword,
    role: req.body.role,
  });

  await user.save();
  if (req.body.role == "Student") {
    const profile = await Profile.create({

      userName: req.body.username,
      fname: "",
      lname: "",
      dob: "",
      bio: "",
      course: "",
      employed: null,
      skills: [],
      //date since employment/graduation: String,
      linkedin: "",
      github: "",
      cv: "",
      avatar: "avatar_placeholder_1.jpg",
      email: "",
      location: ""

    });
    await profile.save();
  }
  res.send({ status: "ok" });

});

//auth
app.post("/auth", async (req, res) => {
  const user = await User.findOne({ userName: req.body.userName });
  if (!user) {
    return res.sendStatus(401);
  }
  //hash passwords never in plain text
  console.log(await bcrypt.compare(req.body.password, user.password));
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();

  res.send({ token: user.token, role: user.role, username: user.userName });
  return;
});

//gatekeeper function unless it passes auth

app.use(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const user = await User.findOne({ token: authHeader });

  if (user) {
    next();
  } else {
    res.sendStatus(403);
  }
});

// defining CRUD operations
app.get("/", async (req, res) => {
  res.send(await Profile.find());
});

app.get("/user/:username", async (req, res, next) => {
  await User.findOne({ userName: req.params.username }).then((item) => {
    if (!item) next(createError(404, "No profile with that name exists."));
    if (item) res.send(item);
  });
});

app.post("/profile", async (req, res) => {
  console.log(req.body);
  const newProfile = req.body;
  const profile = new Profile(newProfile);
  await profile.save();
  res.send({ message: "New profile added." });
});

// app.delete("/:id", async (req, res) => {
//   await Profile.deleteOne({ _id: ObjectId(req.params.id) });
//   res.send({ message: "Profile removed." });
// });

app.get("/profile/:username", async (req, res, next) => {
  await Profile.findOne({ userName: req.params.username }).then((item) => {
    if (!item) next(createError(404, "No profile for that username exists."));
    if (item) res.send(item);
  });
});

app.put("/profile/:username", async (req, res) => {
  await Profile.findOneAndUpdate({ userName: req.params.username }, req.body);
  res.send({ message: "Profile updated." });
});



//CRUD FOR TDA

// delete Profile TDA
app.delete("/delete/:id", async (req, res) => {
  await Profile.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Profile removed." });
});

//update profile TDA
app.put("/update/:id", async (req, res) => {
  await Profile.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Profile updated." });
});



app.post('/search/employer', async (req, res) => {
  const { Firstname, Lastname, sSkills, sCourse, Location} = req.body
  const query = {}
  if (Firstname) {
    query.fname = {$regex:Firstname,$options:'i'}
  }
  if (Lastname) {
    query.lname = {$regex: Lastname,$options:'i'}
  }

  if(sSkills != ""){
    query.skills = {$in: sSkills}
  }
  if(sCourse){
    query.course = {$regex: sCourse,$options:'i'}
  }
  if(Location){
    query.location = {$regex: Location,$options:'i'}
  }

  

  //console.log(query)
  res.send(await Profile.find(query).lean())
})




//multer
let storage = multer.memoryStorage();
let uploadDisk = multer({ storage: storage });

app.post("/file/new", uploadDisk.single("myfile"), async (req, res) => {
  let fileType = req.file.originalname.split(".");
  console.log(fileType[fileType.length - 1]);
  fs.writeFileSync(
    "./uploads/" + `${req.body.name}.${fileType[fileType.length - 1]}`,
    req.file.buffer
  );
  res.json({ message: "Upload Complete" });
});

app.get("/file/get/:filename", (req, res) => {
  try {
    const path = require("path");
    console.log("Got Here", __dirname + "./uploads/" + req.params.filename);
    res.sendFile(path.resolve("./uploads/" + req.params.filename));
  } catch (err) {
    console.log(err);
  }
});

app.use((error, req, res, next) => {
  const message = `this is the unexpected field; -> "${error.field}`;
  console.log(message);
  return res.status(500).send(message);
});


// starting the server
app.listen(process.env.PORT || 3001, () => {
  console.log("listening on port");
});


var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
});


