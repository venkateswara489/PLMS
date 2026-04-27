# PLMS - Personal Learning Management System

## Overview

PLMS (Personal Learning Management System) is a comprehensive full-stack web application designed to facilitate online learning. It supports multiple user roles including students, instructors, and administrators, providing features like course management, quizzes, progress tracking, and personalized recommendations powered by machine learning.

## Features

- **User Management**: Role-based access control for students, instructors, and admins
- **Course Management**: Create, manage, and enroll in courses with modules and content
- **Quizzes and Assessments**: Interactive quizzes with results tracking
- **Progress Tracking**: Monitor learning progress with charts and analytics
- **Recommendations**: AI-powered course recommendations based on user behavior
- **Admin Dashboard**: Comprehensive admin tools for system management
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### ML Service
- **Python** with Flask
- **Pandas** and **Scikit-learn** for data processing and recommendations

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PLMS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure your MongoDB connection in server.js or environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **ML Service Setup**
   ```bash
   cd ml_service
   pip install -r requirements.txt
   python app.py
   ```

## Usage

1. **Start all services** as described in the installation steps
2. **Access the application** at `http://localhost:5173` (frontend)
3. **API endpoints** are available at `http://localhost:3000` (backend)
4. **ML service** runs on `http://localhost:5000`

### User Roles

- **Student**: Enroll in courses, take quizzes, view progress
- **Instructor**: Create and manage courses, view student progress
- **Admin**: Manage users, courses, and system settings

## API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth`)
- User management (`/api/users`)
- Course management (`/api/courses`)
- Enrollment (`/api/enrollment`)
- Recommendations (`/api/recommendations`)

## Database Schema

- **Users**: User information and roles
- **Courses**: Course details and modules
- **Enrollments**: Student-course relationships
- **Quizzes**: Quiz questions and answers
- **Progress**: Learning progress tracking
- **Results**: Quiz results and scores
