const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    description: String,
    industry: String,
    location: String,
    website: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);