# Trello Clone - MERN Stack Project

## Introduction
A full-stack web application clone of Trello built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. This project is part of the Full Stack MERN Pro Course, focusing on building a real-world application with modern web technologies.

## Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/trello-clone.git
   cd trello-clone
   ```

2. Environment Setup
   - Ensure you have the required versions installed:
     ```bash
     nodejs >= 18.16.0
     npm = v9.5.1
     yarn = v1.22.19
     ```
   - To check your versions:
     ```bash
     node --version
     npm --version
     yarn --version
     ```

3. Install Dependencies
   ```bash
   # Install frontend dependencies
   cd trello-web
   yarn install

   # Install backend dependencies
   cd ../trello-api
   yarn install
   ```

4. Configure Environment Variables
   - Create `.env` file in both frontend and backend directories
   - Copy the contents from `.env.example` files
   - Update the values according to your setup

5. Start the Application
   ```bash
   # Start backend server
   cd trello-api
   yarn dev

   # Start frontend development server (in a new terminal)
   cd trello-web
   yarn dev
   ```

6. Access the Application
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8017

### Common Issues
- If you encounter EACCES permission errors during installation, avoid using sudo. Instead, fix npm permissions.
- For port conflicts, modify the port numbers in the respective configuration files.

## Technologies Used
### Frontend
- React v18.2.0
- React DOM v18.2.0
- Vite v4.3.2
- Material UI

### Development Tools
- ESLint v8.38.0

## Special Thanks
Special thanks to **Trungquandev** for his excellent tutorials and guidance throughout this learning journey. His clear explanations and practical examples have been invaluable in understanding the MERN stack development process.
- **Blog**: [trungquandev.com](https://trungquandev.com/)
- **YouTube Channels**:
  - [Trungquandev - Một Lập Trình Viên](https://www.youtube.com/@trungquandev)
  - [CodeTQ - ASMR Programming](https://www.youtube.com/@code-tq)

