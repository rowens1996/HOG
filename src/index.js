/// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
//npm  uuidv4
const { v4: uuidv4 } = require("uuid");
const { Profile } = require("../models/profile");
const { User } = require("../models/user");

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

//Register Function
// app.post("/register", async (req, res) => {
//   const newPassword = await bcrypt.hash(req.body.password, 10);
//   const user = await User.create({
//     userName: req.body.username,
//     password: newPassword,
//   });
//   await user.save();
//   res.send({ status: "ok" });
// });


/* //Signup Example!!
app.post('/register', async (req, res) => {
  const user = await User.findOne({ userName: req.body.username })
  if(user) {
    return res.sendStatus(401, "user already exists");
  }
  else {
    const newPassword = await bcrypt.hash(req.body.password, 10);
    const user= new User.create({
      userName: req.body.username,
      password: newPassword,
      role: req.body.role 
    })
  await user.save()
  res.send({message: "new user added"})
}})


//auth
app.post("/auth", async (req, res) => {
  const user = await User.findOne({ userName: req.body.username });
  if (!user) {
    return res.sendStatus(401);
  }
  //hash passwords never in plain text
  console.log(await bcrypt.compare(req.body.password, user.password))
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();

  res.send({ token: user.token });return 
}); */

app.post("/register", async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    userName: req.body.username,
    password: newPassword,
    role: req.body.role
  });
  await user.save();
  res.send({ status: "ok" });
});

//auth
app.post("/auth", async (req, res) => {
  const user = await User.findOne({ userName: req.body.userName });
  if (!user) {
    return res.sendStatus(401);
  }
  //hash passwords never in plain text
  console.log(await bcrypt.compare(req.body.password, user.password))
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();

  res.send({ token: user.token, role: user.role });return 
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

app.post("/profile", async (req, res) => {
  console.log(req.body);
  const newProfile = req.body;
  const profile = new Profile(newProfile);
  await profile.save();
  res.send({ message: "New profile added." });
});

app.delete("/:id", async (req, res) => {
  await Profile.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Profile removed." });
});

app.put("/:id", async (req, res) => {
  await Profile.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Profile updated." });
});

app.get("/search/id/:id", async (req, res) => {
  await Profile.findOne({ _id: ObjectId(req.params.id) }).then((item) => {
    if (!item) next(createError(404, "No profile with that id exists."));
    if (item) res.send(item);
  });
});

app.get("/search/location/:location", async (req, res) => {
  await Profile.find({ location: req.params.location }).then((item) => {
    if (!item) next(createError(404, `There are no profiles with ${req.params.location}.`));
    if (item) res.send(item);
  });
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
});
