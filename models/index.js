var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/zoo_app_assoc");

module.exports.Zoo = require("./zoo");
module.exports.Animal = require("./animal")