# Payment Service Provider Dashboard

A comprehensive payment dashboard with role-based access control, built with Next.js 15, Prisma, and MongoDB As the assigment given to Nahom Tewodros

## Features

- **Role-based Authentication** (User, Admin, Super Admin)
- **User Dashboard**: Wallet balance, send payments, transaction history
- **Admin Dashboard**: User management, payment summaries
- **Super Admin Dashboard**: System statistics, admin management
- **Comprehensive Testing** with Jest
- **Docker Support** for containerization
- **CI/CD Pipeline** with GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd payment-dashboard
   \`\`\`

2. **Run setup script**
   \`\`\`bash
   npm run setup:dev
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the application**
   - Open http://localhost:3000
   - Use demo accounts (see login page for credentials)

### Docker Development

\`\`\`bash
# Start with Docker Compose
npm run docker:dev

# Or manually
docker-compose up
\`\`\`

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## Production Deployment

### Using Docker

1. **Build production image**
   \`\`\`bash
   docker build -t payment-dashboard .
   \`\`\`

2. **Run with Docker Compose**
   \`\`\`bash
   npm run docker:prod
   \`\`\`

### Manual Deployment

1. **Set environment variables**
   \`\`\`bash
   export DATABASE_URL="your-mongodb-url"
   export NEXTAUTH_SECRET="your-secret-key"
   export NEXTAUTH_URL="your-domain"
   \`\`\`

2. **Deploy**
   \`\`\`bash
   npm run deploy
   \`\`\`

## Environment Variables

\`\`\`env
DATABASE_URL="mongodb://localhost:27017/payment-dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
\`\`\`

## Demo Accounts

- **Super Admin**: superadmin@psp.com
- **Admin**: admin@psp.com
- **User**: user1@example.com
- **Password**: password123 (for all accounts)

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction

### User Management (Admin/Super Admin)
- `GET /api/users` - Get all users
- `PATCH /api/users/[id]/status` - Update user status

### Statistics (Super Admin)
- `GET /api/stats` - Get system statistics

## Testing Strategy

### Unit Tests
- Authentication logic
- API route handlers
- Component functionality

### Integration Tests
- Complete payment flows
- Role-based access control
- Database operations

### Component Tests
- User interface components
- Form submissions
- Data display

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. **Runs tests** on every push/PR
2. **Builds Docker image** on main branch
3. **Pushes to GitHub Container Registry**
4. **Deploys to production** (configure your deployment target)

## Docker Images

Images are automatically built and pushed to GitHub Container Registry:

\`\`\`bash
# Pull the latest image
docker pull ghcr.io/your-username/payment-dashboard:latest

# Run the container
docker run -p 3000:3000 ghcr.io/your-username/payment-dashboard:latest
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Authentication pages
├── components/            # React components
│   └── dashboard/         # Dashboard-specific components
├── lib/                   # Utility libraries
├── prisma/               # Database schema and seeds
├── __tests__/            # Test files
├── scripts/              # Deployment scripts
├── .github/workflows/    # CI/CD workflows
└── docker-compose.yml    # Docker configuration
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

Create GitHub issue templates:
