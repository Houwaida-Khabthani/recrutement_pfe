const Candidate = require("./candidate.model");

exports.getMyProfile = async (userId) => {
  return await Candidate.findOne({ user: userId }).populate("user", "email role");
};

exports.updateMyProfile = async (userId, data) => {
  return await Candidate.findOneAndUpdate(
    { user: userId },
    { $set: data },
    { new: true, upsert: true }
  );
};

exports.deleteMyProfile = async (userId) => {
  return await Candidate.findOneAndDelete({ user: userId });
};