# PFE - Recruitment Platform

A full-stack recruitment platform with AI-powered CV analysis and optimization. This project includes a backend API, React frontend, and Python-based CV analysis module.

## Project Structure

```
├── backend/                    # Node.js/Express backend
│   ├── src/                   # Source code
│   │   ├── modules/           # Feature modules (jobs, companies, recruiters, etc.)
│   │   ├── routes.js          # API routes
│   │   ├── config/            # Configuration files
│   │   └── middlewares/       # Express middlewares
│   ├── database/              # Database schemas and migrations
│   └── server.js              # Main server file
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── routes/            # Routing configuration
│   │   └── store/             # State management
│   └── package.json
│
└── backend/AI Model for CV Analysis and Optimization/  # Python CV analyzer
    ├── main.py
    ├── cv_analyzer.py
    ├── cv_parser.py
    └── requirements.txt
```

## Features

- **Job Management**: Create, read, update, and delete job postings
- **Company Management**: Manage company profiles and information
- **Recruiter Management**: Handle recruiter accounts and profiles
- **CV Analysis**: AI-powered CV parsing and optimization
- **Applications**: Application workflow management
- **Authentication**: Secure login and authorization system

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **MySQL** or **MariaDB**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/waeleeee/PFE.git
cd PFE
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pfe_recruitment
PORT=5000
NODE_ENV=development
```

#### Initialize Database

```bash
# Update database credentials in backend/database/schema.sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

#### Start Backend Server

```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. CV Analysis Module Setup (Optional)

```bash
cd ../backend/AI\ Model\ for\ CV\ Analysis\ and\ Optimization
python -m venv venv

# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get specific job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get specific company

### Recruiters
- `GET /api/recruiters` - Get all recruiters
- `POST /api/recruiters` - Create recruiter profile
- `GET /api/recruiters/profile` - Get current recruiter profile

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## Testing

### Backend API Testing

```bash
cd backend
npm run test
```

### Manual Testing

Use the provided test files:
- `test-api.js` - General API tests
- `test-login-flow.js` - Authentication tests
- `test-get-my-jobs.js` - Job retrieval tests

Run with:
```bash
node test-api.js
```

## Troubleshooting

### Database Connection Issues

Check the connection string in `backend/src/config/db.js`

### Backend Not Starting

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Frontend Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run dev
```

## Documentation

- [Backend Startup Guide](./BACKEND_STARTUP_GUIDE.md)
- [CRUD Operations Guide](./CRUD_OPERATIONS_SUMMARY.md)
- [Testing Guide](./CRUD_TESTING_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)

## Project Status

✅ Core CRUD operations implemented
✅ Authentication system
✅ Job management features
✅ Company management
✅ Recruiter profiles
🔄 CV Analysis integration (in progress)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a PFE (Projet de Fin d'Études) and is not under a standard open-source license.

## Contact

For questions or issues, please reach out to the project maintainer.

---

**Happy coding! 🚀**
