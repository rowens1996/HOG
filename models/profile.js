const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  userId: String,
  fname: String,
  lname: String,
  age: Number,
  bio: String,
  linkedin: String,
  github: String,
  cv: String,
})

module.exports.Profile = mongoose.model('Profile', profileSchema, 'Profile')