const db = require("../../config/db");

exports.findByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );
  return rows[0];
};

exports.createUser = async (data) => {
  const [result] = await db.execute(
    "INSERT INTO user (nom,email,mot_de_passe,role) VALUES (?,?,?,?)",
    [data.nom, data.email, data.mot_de_passe, data.role]
  );
  return result;
};