const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./src/config/env');

async function seedAllMockData() {
  const connection = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
  });

  try {
    // Hash password for candidates
    const hashedPassword = await bcrypt.hash('candidate123', 10);

    // Mock candidates data (only for existing jobs)
    const candidates = [
      {
        name: 'Ahmed Ben Ali',
        email: 'ahmed.benali@email.com',
        title: 'Full-Stack Developer',
        score: 94,
        location: 'Tunis',
        experience: '5 years exp',
        appliedFor: 'Senior Full-Stack Developer',
        skills: ['React', 'TypeScript', 'Node.js'],
        status: 'New',
        phone: '+216 20 123 456',
        civilite: 'Mr'
      },
      {
        name: 'Fatma Khelifi',
        email: 'fatma.khelifi@email.com',
        title: 'Data Scientist',
        score: 87,
        location: 'Ariana',
        experience: '3 years exp',
        appliedFor: 'Data Scientist',
        skills: ['Python', 'Machine Learning', 'TensorFlow'],
        status: 'Screening',
        phone: '+216 21 234 567',
        civilite: 'Mme'
      },
      {
        name: 'Yasmine Mansouri',
        email: 'yasmine.mansouri@email.com',
        title: 'UX Designer',
        score: 89,
        location: 'Tunis',
        experience: '6 years exp',
        appliedFor: 'UX/UI Designer',
        skills: ['Figma', 'User Research', 'Prototyping'],
        status: 'New',
        phone: '+216 23 456 789',
        civilite: 'Mme'
      }
    ];

    // Map job titles to IDs (we'll get these after insertion)
    const jobTitleToId = {
      'Senior Full-Stack Developer': 2,
      'UX/UI Designer': 3,
      'Data Scientist': 4,
      'Project Manager': 5
    };

    // Insert candidates as users
    for (const candidate of candidates) {
      // Check if candidate user exists
      const [existingUser] = await connection.execute(
        'SELECT id_user FROM user WHERE email = ?',
        [candidate.email]
      );

      let candidateUserId;
      if (existingUser.length === 0) {
        // Create candidate user
        const [userResult] = await connection.execute(
          `INSERT INTO user (nom, email, mot_de_passe, role, telephone, pays, adresse, civilite, specialite, experience, is_verified, date_inscription)
           VALUES (?, ?, ?, 'CANDIDAT', ?, 'Tunisia', ?, ?, ?, ?, 1, NOW())`,
          [
            candidate.name,
            candidate.email,
            hashedPassword,
            candidate.phone,
            candidate.location,
            candidate.civilite,
            candidate.title,
            candidate.experience
          ]
        );
        candidateUserId = userResult.insertId;
      } else {
        candidateUserId = existingUser[0].id_user;
      }

      // Get job ID for the applied position
      const jobId = jobTitleToId[candidate.appliedFor];
      if (!jobId) {
        console.log(`Warning: Job "${candidate.appliedFor}" not found for candidate ${candidate.name}`);
        continue;
      }

      // Check if application already exists
      const [existingApplication] = await connection.execute(
        'SELECT id_candidature FROM candidature WHERE id_user = ? AND id_offre = ?',
        [candidateUserId, jobId]
      );

      if (existingApplication.length === 0) {
        // Create application
        const statusMap = {
          'New': 'NOUVELLE',
          'Screening': 'EN_COURS',
          'Interview': 'ENTRETIEN',
          'Offered': 'OFFRE'
        };

        const [appResult] = await connection.execute(
          `INSERT INTO candidature (date_postule, statut, lettre_motivation, id_user, id_offre)
           VALUES (NOW(), ?, 'Motivated candidate interested in this position', ?, ?)`,
          [statusMap[candidate.status] || 'NOUVELLE', candidateUserId, jobId]
        );

        const applicationId = appResult.insertId;

        // Create matching record
        await connection.execute(
          `INSERT INTO matching (score, note, date, id_candidature, id_offre)
           VALUES (?, ?, NOW(), ?, ?)`,
          [candidate.score, candidate.score, applicationId, jobId]
        );

        console.log(`Inserted application for ${candidate.name} -> ${candidate.appliedFor}`);
      }
    }

    // Insert some notifications (use the first company user)
    const [companyUsers] = await connection.execute(
      "SELECT id_user FROM user WHERE role = 'ENTREPRISE' LIMIT 1"
    );

    if (companyUsers.length > 0) {
      const companyUserId = companyUsers[0].id_user;

      const notifications = [
        { type: 'application_received', message: 'New application received for Senior Full-Stack Developer' },
        { type: 'interview_scheduled', message: 'Interview scheduled with candidate' },
        { type: 'offer_sent', message: 'Offer sent to candidate' }
      ];

      for (const notif of notifications) {
        await connection.execute(
          `INSERT INTO notification (type, date, lu, id_user)
           VALUES (?, NOW(), 0, ?)`,
          [notif.type, companyUserId]
        );
      }
    }

    console.log('All mock data inserted successfully!');
  } catch (error) {
    console.error('Error seeding mock data:', error);
  } finally {
    await connection.end();
  }
}

seedAllMockData();