const Matching = require("./matching.model");

exports.getAllMatching = async (req, res, next) => {
  try {
    const filters = req.query;
    const matching = await Matching.findAll(filters);
    res.json(matching);
  } catch (error) {
    next(error);
  }
};

exports.getMatchingById = async (req, res, next) => {
  try {
    const matching = await Matching.findById(req.params.id);
    if (!matching) {
      return res.status(404).json({ message: "Matching record not found" });
    }
    res.json(matching);
  } catch (error) {
    next(error);
  }
};

exports.createMatching = async (req, res, next) => {
  try {
    const matchingId = await Matching.create(req.body);
    res.status(201).json({ id: matchingId, message: "Matching record created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateMatching = async (req, res, next) => {
  try {
    const updated = await Matching.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Matching record not found" });
    }
    res.json({ message: "Matching record updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteMatching = async (req, res, next) => {
  try {
    const deleted = await Matching.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Matching record not found" });
    }
    res.json({ message: "Matching record deleted successfully" });
  } catch (error) {
    next(error);
  }
};