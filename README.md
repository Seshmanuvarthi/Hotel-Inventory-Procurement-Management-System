# Hotel Inventory Management System (HIMS)

A comprehensive full-stack application for managing hotel inventory, procurement, and operations.

## Features

- **Multi-role Authentication**: Support for Super Admin, MD, Procurement Officer, Store Manager, Hotel Manager, and Accounts roles
- **Inventory Management**: Track items, recipes, stock levels, and consumption
- **Procurement Workflow**: Create requests, orders, and manage vendor relationships
- **Reporting & Analytics**: Generate reports on consumption, sales, leakage, and financials
- **Real-time Dashboards**: Role-specific dashboards with relevant metrics

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Frontend**: React.js, Tailwind CSS, Axios
- **Testing**: Jest, Supertest, MongoDB Memory Server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-inventory-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - Update `MONGO_URI` in `.env` if needed

5. **Start the Application**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev

   # Start frontend (from frontend directory, in new terminal)
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5050

## Deployment

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend Configuration
PORT=5050
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/restaurant_erp

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend Configuration
REACT_APP_API_URL=http://your-backend-url:5050
```

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production**
   ```bash
   cd backend
   npm start
   ```

### Docker Deployment (Optional)

If you prefer containerized deployment, you can add Docker support:

1. Create `Dockerfile` and `docker-compose.yml`
2. Build and run with Docker Compose

## API Documentation

The backend provides RESTful APIs for all operations. Key endpoints include:

- `/auth` - Authentication
- `/users` - User management
- `/items` - Item management
- `/procurement` - Procurement operations
- `/store` - Stock management
- `/reports` - Reporting

## Testing

Run tests with:
```bash
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the ISC License.
