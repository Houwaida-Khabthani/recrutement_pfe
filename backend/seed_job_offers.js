const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./src/config/env');

async function seedJobOffers() {
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
  });

  try {
    // Job offers data
    const jobOffers = [
      {
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp',
        salaryRange: '5000-8000 DT',
        applicants: 24,
        interviews: 5,
        status: 'Active',
        postedDate: '2026-02-12'
      },
      {
        title: 'UX/UI Designer',
        company: 'DesignHub',
        salaryRange: '3000-5000 DT',
        applicants: 18,
        interviews: 3,
        status: 'Active',
        postedDate: '2026-02-11'
      },
      {
        title: 'Data Scientist',
        company: 'DataTech',
        salaryRange: '4000-7000 DT',
        applicants: 31,
        interviews: 7,
        status: 'Active',
        postedDate: '2026-02-10'
      },
      {
        title: 'Project Manager',
        company: 'PM Solutions',
        salaryRange: '3500-6000 DT',
        applicants: 12,
        interviews: 4,
        status: 'Closed',
        postedDate: '2026-01-15'
      }
    ];

    // Hash password for companies
    const hashedPassword = await bcrypt.hash('company123', 10);

    for (const offer of jobOffers) {
      // Check if company user exists
      const [existingUser] = await connection.execute(
        'SELECT id_user FROM user WHERE nom_entreprise = ? AND role = "ENTREPRISE"',
        [offer.company]
      );

      let companyUserId;
      if (existingUser.length === 0) {
        // Create company user
        const [userResult] = await connection.execute(
          `INSERT INTO user (nom, email, mot_de_passe, role, nom_entreprise, description_entreprise, secteur, is_verified, date_inscription)
           VALUES (?, ?, ?, 'ENTREPRISE', ?, ?, 'Technology', 1, NOW())`,
          [`${offer.company} Contact`, `contact@${offer.company.toLowerCase()}.com`, hashedPassword, offer.company, `Leading company in ${offer.company} sector`]
        );
        companyUserId = userResult.insertId;

        // Create company entry
        await connection.execute(
          `INSERT INTO company (nom, description, email, secteur, id_user)
           VALUES (?, ?, ?, 'Technology', ?)`,
          [offer.company, `Leading company in ${offer.company} sector`, `contact@${offer.company.toLowerCase()}.com`, companyUserId]
        );
      } else {
        companyUserId = existingUser[0].id_user;
      }

      // Parse salary (take minimum)
      const minSalary = parseInt(offer.salaryRange.split('-')[0]);

      // Map status
      const status = offer.status === 'Active' ? 'OUVERT' : 'FERME';

      // Insert job offer
      await connection.execute(
        `INSERT INTO offre (titre, type_contrat, localisation, description, salaire, experience, id_entreprise, date_pub, statut)
         VALUES (?, 'CDI', 'Tunisia', ?, ?, '2+ years', ?, ?, ?)`,
        [offer.title, `Exciting opportunity for ${offer.title} position`, minSalary, companyUserId, offer.postedDate, status]
      );

      console.log(`Inserted job offer: ${offer.title} for ${offer.company}`);
    }

    console.log('All job offers inserted successfully!');
  } catch (error) {
    console.error('Error seeding job offers:', error);
  } finally {
    await connection.end();
  }
}

seedJobOffers();