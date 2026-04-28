const db = require("../../config/db");
const bcrypt = require("bcrypt");

/**
 * LOGIN
 */
exports.login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const [rows] = await db.query(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    throw new Error("Utilisateur non trouvé");
  }

  const user = rows[0];

  // ✅ Validate password field exists and is not null
  if (!user.mot_de_passe) {
    console.error('[AUTH] User password is null or empty for email:', email);
    throw new Error("Invalid user password data");
  }

  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password, user.mot_de_passe);
  } catch (bcryptError) {
    console.error('[AUTH] Bcrypt comparison error:', bcryptError.message);
    throw new Error("Password verification failed");
  }

  if (!isMatch) {
    throw new Error("Mot de passe incorrect");
  }

  // ✅ Check company approval status
  if (user.role === "ENTREPRISE" && user.status !== "approved") {
    throw new Error("Your account is pending admin approval");
  }

  return user;
};

/**
 * REGISTER (🔥 FULL VERSION)
 */
exports.register = async (data) => {
  const {
    nom,
    email,
    mot_de_passe,
    role,

    // candidat
    civilite,
    date_naissance,
    pays,
    adresse,

    // entreprise
    nom_entreprise,
    secteur,
    site_web,
    logo,
  } = data;

  // ✅ Enhanced validation for required fields
  if (!email || !mot_de_passe || !role) {
    throw new Error("Champs obligatoires manquants");
  }

  // ✅ Validate nom/nom_entreprise (required depending on role)
  if (role === "CANDIDAT" && !nom?.trim()) {
    throw new Error("Le nom est obligatoire");
  }

  if (role === "ENTREPRISE" && !nom_entreprise?.trim()) {
    throw new Error("Le nom d'entreprise est obligatoire");
  }

  // check existing user
  const [existing] = await db.query(
    "SELECT id_user FROM user WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email déjà utilisé");
  }

  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

  // ✅ Use trimmed values to avoid nulls for required fields
  const finalNom = role === "CANDIDAT" ? nom?.trim() : nom_entreprise?.trim();

  // ✅ Set status to 'pending' for companies, 'approved' for candidates
  const status = role === "ENTREPRISE" ? "pending" : "approved";

  await db.query(
    `
    INSERT INTO user (
      nom,
      email,
      mot_de_passe,
      role,
      civilite,
      date_naissance,
      pays,
      adresse,
      nom_entreprise,
      secteur,
      site_web,
      logo,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      finalNom,
      email,
      hashedPassword,
      role,
      civilite || null,
      date_naissance || null,
      pays || null,
      adresse || null,
      role === "ENTREPRISE" ? nom_entreprise?.trim() : null,
      secteur || null,
      site_web || null,
      logo || null,
      status,
    ]
  );
};

/**
 * FIND USER BY ID
 */
exports.findById = async (id) => {
  const [rows] = await db.query(
    "SELECT id_user, nom, email, role, civilite, date_naissance, pays, adresse, nom_entreprise, secteur, site_web, logo, status FROM user WHERE id_user = ?",
    [id]
  );

  return rows[0];
};

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM user WHERE email = ?",
    [email]
  );

  if (rows.length === 0) return;

  console.log(`Reset link sent to ${email}`);
};

/**
 * CHANGE PASSWORD
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await db.query(
    "SELECT * FROM user WHERE id_user = ?",
    [userId]
  );

  if (rows.length === 0) {
    throw new Error("Utilisateur non trouvé");
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.mot_de_passe
  );

  if (!isMatch) {
    throw new Error("Mot de passe actuel incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE user SET mot_de_passe = ? WHERE id_user = ?",
    [hashedPassword, userId]
  );
};