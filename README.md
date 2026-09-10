🌊 TaskFlow
A modern, full‑stack task management application with JWT authentication, built with Flask (API), MySQL (database), and HTML/CSS/JS (frontend). TaskFlow features a beautiful glass‑morphism UI, dark/light mode, real‑time progress tracking, and complete user isolation.

✨ Features
🔐 Authentication & Security
User registration and login with JWT

Passwords securely hashed using Werkzeug

Protected CRUD endpoints — todos are per‑user

Tokens expire after 24 hours (configurable)

⚙️ Backend (Flask API)
Complete REST API with GET, POST, PUT, DELETE

MySQL connection pooling with context manager and retry logic

Environment variables validated on startup

CORS enabled for cross‑origin requests

Comprehensive error handling with JSON responses

🎨 Frontend (HTML/CSS/JS)
Login / Register modal with smooth transitions

Token‑based authentication (JWT stored in localStorage)

Beautiful glass‑morphism UI with floating gradient shapes

Dark / Light mode toggle (saved in localStorage)

Real‑time progress ring and stats

Filter tasks (All / Pending / Done)

Fully responsive — works on mobile, tablet, and desktop

🛠️ Technologies Used
Technology	Purpose
Python 3.14+	Backend
Flask 2.3.3	Web framework
MySQL 8.0+	Database
mysql-connector-python	MySQL driver
PyJWT	JWT authentication
python-dotenv	Environment variables
HTML5 / CSS3	Frontend
Vanilla JavaScript	Frontend logic
Font Awesome	Icons
📦 Installation & Setup
1. Clone the repository
bash
git clone https://github.com/ChetanaGujare/TaskFlow.git
cd TaskFlow
2. Create and activate virtual environment
bash
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
3. Install dependencies
bash
pip install -r requirements.txt
4. Set up MySQL database
Run these SQL commands in MySQL:

sql
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
5. Configure environment variables
Create a .env file in the project root:

text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_db
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
6. Run the application
bash
python app.py
Server will start at http://localhost:5000.

7. Open the frontend
Double‑click index.html in your browser, or use VS Code Live Server.

📡 API Endpoints
Method	Endpoint	Description	Auth Required
POST	/api/register	Register a new user	No
POST	/api/login	Login and get JWT	No
GET	/api/me	Get current user info	Yes
GET	/api/todos	Get all todos for user	Yes
POST	/api/todos	Create a new todo	Yes
PUT	/api/todos/<id>	Update a todo	Yes
DELETE	/api/todos/<id>	Delete a todo	Yes
Example Request & Response
POST /api/register

json
// Request
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1
}
🧪 Testing with cURL
bash
# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"secret123"}'

# Login (get token)
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"secret123"}'

# Use token for subsequent requests (replace <TOKEN>)
curl http://localhost:5000/api/todos \
  -H "Authorization: Bearer <TOKEN>"

# Create a todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Learn Flask"}'
📁 Project Structure
text
TaskFlow/
├── app.py              # Main Flask application entry point
├── config.py           # Configuration with environment variables
├── db.py               # MySQL connection pool manager
├── auth.py             # JWT authentication helpers
├── routes.py           # All API endpoints and route handlers
├── index.html          # Frontend UI (HTML + CSS)
├── app.js              # Frontend logic (JavaScript)
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (gitignored)
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
🎨 UI Highlights
Glass‑morphism cards with backdrop blur effect

Floating gradient shapes animating in the background

Progress ring and progress bar that update in real‑time

Dark / Light mode toggle with localStorage persistence

Smooth transitions and micro‑interactions

Responsive layout for mobile, tablet, and desktop

🔒 Security Notes
Passwords hashed using werkzeug.security

JWT tokens expire after 24 hours (configurable)

All database queries use parameterized statements (SQL injection prevention)

Sensitive configuration stored in .env and gitignored

Environment variables validated on startup

🚀 Future Improvements
□ User profile management
□ Task categories and labels
□ Due dates and reminders
□ Drag and drop reordering
□ Search and filter functionality
□ Email verification on registration
□ Password reset flow
□ Deploy to production (Heroku / Railway / AWS)
📄 License
This project is open source and available under the MIT License.

🙋‍♀️ Author
Chetana Gujare

GitHub

LinkedIn

<p align="center">Made with ❤️ by Chetana Gujare</p> <p align="center"><strong>TaskFlow</strong> — Where your tasks flow to completion.</p>
github pe kaise dalu
We need to answer: "github pe kaise dalu" meaning how to put this project on GitHub. The user has been working on a project "TaskFlow" (formerly Flask-CRUD-Todo). They likely have the files locally and want to push to GitHub. We should give step-by-step instructions for pushing to GitHub, assuming they have Git installed. Also mention creating a new repository on GitHub, initializing git, committing, adding remote, pushing. Since they have been working with VS Code, we can mention using the integrated terminal.


