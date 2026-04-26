const File = require("./file.model");

exports.getAllFiles = async (req, res, next) => {
  try {
    const filters = req.query;
    const files = await File.findAll(filters);
    res.json(files);
  } catch (error) {
    next(error);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(file);
  } catch (error) {
    next(error);
  }
};

exports.createFile = async (req, res, next) => {
  try {
    const fileId = await File.create(req.body);
    res.status(201).json({ id: fileId, message: "File record created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateFile = async (req, res, next) => {
  try {
    const updated = await File.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ message: "File record updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const deleted = await File.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ message: "File record deleted successfully" });
  } catch (error) {
    next(error);
  }
};