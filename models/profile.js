const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  userName: String,
  fname: String,
  lname: String,
  dob: String,
  bio: String,
  course: Array,
  employed: Boolean,
  skills: Array,
  linkedin: String,
  github: String,
  avatar: String,
  cv: String,
})

module.exports.Profile = mongoose.model('Profile', profileSchema, 'Profile')