<div align="center">

# 🚀 EventManager — Real-Time MERN Event Management Platform

⚡ **Create events. Join instantly. Coordinate seamlessly.**
A modern, real-time Event Management System built for speed, clarity, and magical user experience.

</div>

---

## 🌟 Overview

**EventManager** is a full-featured event coordination platform built using the **MERN Stack (MongoDB, Express, React, Node.js)**.

It enables users to **create, join, and manage events instantly using a unique event code**, eliminating approval delays and onboarding friction.

Designed to support both **small gatherings** and **large committee-driven events**, EventManager combines real-time communication, structured hierarchy, and secure payments into one powerful platform.

---

## ✨ Key Philosophy

✔ No approval delays
✔ Instant joining
✔ Clean role hierarchy
✔ Fast coordination
✔ Magical UI/UX

---

## 🎯 Core Features

### ⚡ Instant Event Joining

* Join events immediately with a unique event code
* No approval workflow
* Zero friction onboarding

### 👥 Smart Role Hierarchy

* **Event Head** — full control
* **Sub-head** — committee management
* **Volunteer** — automatic participation

Clear permissions ensure structured collaboration.

### 🧩 Committee System (Optional)

Perfect for large-scale events.

* Create committees
* Assign sub-heads
* Auto-join based on volunteer preferences
* Committee-specific chats & announcements

### 💬 Real-Time Chat (Socket.IO)

* Head ↔ Sub-head communication
* Committee group chats
* Global volunteer chat

Instant updates. Zero refresh.

### 🔔 Announcement System

* Global announcements
* Committee-only notices
* Payment alerts

Keep everyone informed effortlessly.

### 💳 Secure Payments (Razorpay)

* Release payment notices
* Track paid/unpaid status
* Transaction history
* Webhook verification

Built for reliability and security.

---

## 🎨 UI / UX Vision

✨ Clean, premium interface
✨ Smooth animations
✨ Glassmorphism & soft shadows
✨ Fully responsive
✨ Dark / Light mode ready

**Goal:** Zero confusion. Fast onboarding. Delightful interactions.

---

## 🛠 Tech Stack

### Frontend

* React.js
* Context API / Redux
* Tailwind CSS / Material UI
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.IO

### Payments

* Razorpay API

---

## 📸 Screenshots

> ⚡ A glimpse of EventManager in action

<p align="center">
  <img src="https://github.com/user-attachments/assets/8efa2e83-5602-4ae6-b258-1c22c79507be" width="90%" />
  <br><br>
  <img src="https://github.com/user-attachments/assets/14313514-d2dd-497b-bd5b-fde70646f7bc" width="90%" />
  <br><br>
  <img src="https://github.com/user-attachments/assets/9d80fbed-13af-43ca-8964-a28ae888e533" width="90%" />
  <br><br>
  <img src="https://github.com/user-attachments/assets/0ef515eb-0f9e-4a4d-a67b-c62c969dc32a" width="90%" />
  <br><br>
  <img src="https://github.com/user-attachments/assets/c74197b1-adb0-415a-ae33-379dfbcc5916" width="90%" />
</p>

---


## 📦 Clone & Install

```bash
git clone https://github.com/AnuragAtkare/EventManager-Realtime.git

cd eventmanager

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```


## ⚙️ Environment Setup

Create **`server/.env`** (copy from `.env.example`):

```env
# Server Configuration
PORT=5000
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=7d

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Client
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## ▶️ Running the Application

### Run both client & server

```bash
npm start
```

### Or run separately

**Server**

```bash
cd server
npm run dev
```

**Client**

```bash
cd client
npm start
```

---

## 🔐 Security

* JWT Authentication
* Role-based access control
* Protected API routes
* Razorpay webhook verification

---

## 🚀 Future Enhancements

* ✅ Committee task tracking
* ✅ Event analytics dashboard
* ✅ File & media sharing in chat
* ✅ Push notifications
* ✅ QR-based event joining

---

## 🎯 Perfect For

✔ College festivals
✔ Tech events
✔ NGOs
✔ Community programs
✔ Startups
✔ Large-scale collaborations

---

## 🤝 Contributing

Contributions are welcome!

If you'd like to improve EventManager:

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub — it helps others discover it!

---

> 🔥 **EventManager — Where Events Run Smarter.**
