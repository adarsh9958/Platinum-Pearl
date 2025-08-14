# ✨ Platinum Pearl – Hotel Management System 🏨  

Platinum Pearl is a **full-stack hotel management application** that makes room booking and hotel operations smooth and efficient.  
Guests can easily book rooms online, while administrators get powerful tools to manage hotel operations seamlessly.  

> 🚀 Live Demo: [https://platinum-pearl-client.onrender.com/](https://platinum-pearl-client.onrender.com/)
---

## 📌 Features  

### 🧑‍💼 Guest Portal  
- 🔐 **User Authentication** – Register & login securely.  
- 🛏 **Browse Rooms** – View all available rooms & detailed descriptions.  
- 📅 **Check Availability** – Search for rooms by date range.  
- 📝 **Book a Room** – Instantly reserve and receive a **unique check-in key via email**.  
- 💳 **Manage Bookings** – Add extra charges for additional services.  
- 📧 **Secure Checkout** – Email bill summary upon checkout.  

### 🛠 Admin Dashboard  
- 🔑 **Admin Login** – Secure access for hotel staff.  
- 📊 **Room Management** – Update statuses (Available, Occupied, Under Maintenance).  
- 📂 **Booking Management** – View, edit, or cancel any booking.  
- 💹 **Reports** – Generate occupancy & revenue reports.  

---

## 📁 Project Structure

The project is organized into two main directories: `client` for the frontend application and `server` for the backend API.

```
Platinum-Pearl/
├── 📁 client/              # React frontend application
│   ├── 📁 public/          # Static assets
│   ├── 📁 src/             # Source files
│   │   ├── 📁 api/         # API service for communicating with the backend
│   │   ├── 📁 components/  # Reusable React components
│   │   ├── 📁 hooks/       # Custom React hooks
│   │   ├── 📁 pages/       # Page components for different routes
│   │   ├── App.jsx      # Main application component
│   │   └── main.jsx     # Entry point for the React application
│   ├── package.json     # Frontend dependencies and scripts
│   └── vite.config.js   # Vite configuration
│
└── 📁 server/              # Node.js/Express backend API
    ├── 📁 controllers/     # Logic for handling requests
    ├── 📁 middleware/      # Custom middleware (e.g., authentication)
    ├── 📁 models/          # Mongoose schemas for MongoDB
    ├── 📁 routes/          # API route definitions
    ├── 📁 utils/           # Utility functions (e.g., email service)
    ├── index.js         # Main entry point for the server
    └── package.json     # Backend dependencies and scripts
```

---

## 🛠 Tech Stack  

**Frontend** ⚡  
- React + Vite  
- React Router  
- Axios  

**Backend** ⚙  
- Node.js + Express  
- MongoDB + Mongoose  
- JSON Web Tokens (JWT) for authentication  
- Nodemailer for sending emails  

**Database** 🗄  
- MongoDB  

---

## 📋 Prerequisites  

Before running the project, make sure you have:  
- [Node.js](https://nodejs.org/en/) (includes npm)  
- [MongoDB](https://www.mongodb.com/try/download/community)  

---

## ⚙ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2️⃣. Backend Setup

```bash
cd server
npm install
```

 **📄 Create a .env file in the server directory:**
```bash
MONGO_URI=<your_mongodb_connection_string>
PORT=5000
JWT_SECRET=<your_jwt_secret_key>

# Gmail credentials for sending emails
EMAIL_USER=<your_gmail_address>
EMAIL_PASS=<your_gmail_app_password>
```
 
**Start the backend:**
```bash
npm start
```
The server should now be running on `http://localhost:5000`.

### 3️⃣ Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application should now be running and accessible at `http://localhost:5173` (or another port if 5173 is in use).

### 📧 Email Notifications – Important!
To receive booking confirmation emails and bills, you may need to connect to a personal mobile hotspot 📱.
Many ISPs block SMTP ports to reduce spam. A mobile hotspot bypasses these restrictions.
If emails aren’t arriving, try switching your network connection.


# 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

# 🛡️ License

This project is currently unlicensed but will likely adopt the MIT License soon.

# 🙋‍♂️ Author

- Adarsh Pathak 
- 🎓 NIT Hamirpur
- 🔗 [LinkedIn](https://www.linkedin.com/in/adarsh-pathak-a8bb5826a/) | 
      [GitHub](https://github.com/adarsh9958)
