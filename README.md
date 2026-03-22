# SalesBot – AI-Powered Car Service Booking Assistant

An intelligent full-stack web application that integrates **Google Gemini AI** with a **Spring Boot backend** and **React frontend** to provide a natural conversational car service booking experience.

This system allows users to:

- View available services (database grounded)
- Select service-specific add-ons
- Choose available time slots only
- Calculate total cost dynamically
- Complete booking and payment
- Receive AI-powered confirmation

---
![WhatsApp Image 2026-03-20 at 23 56 51](https://github.com/user-attachments/assets/62c42ba6-806c-4a1c-ab8b-01e8c53b36d1)

## 🌟 Features

### 🤖 AI Chatbot (Gemini Integration)

- Natural conversation powered by Google Gemini API
- Strictly grounded to your real catalog (no fake services)
- Smart context awareness (cart, booking page, billing page)
- Suggests services, add-ons, and time slots
- Handles full booking flow conversationally

---

### 🛠️ Service & Add-On Management

- Only database-defined services are shown
- Add-ons displayed only for selected service
- Add-on prices included in subtotal automatically
- Prevents hallucinated content from AI

---

### 🛒 Smart Cart System

- Add/remove services
- Add/remove add-ons per service
- Automatic subtotal calculation
- Syncs cart with chatbot context

---

### 📅 Booking System

- Users cannot manually type time
- Only selectable time slots allowed (09:00 – 16:30)
- Selected slot synced to chatbot
- Suggest next available slot

---

### 💳 Billing & Confirmation

- Total calculated via backend `/api/quote`
- Booking saved via `/api/book`
- Chatbot confirms booking after payment
- Displays:
  - Date
  - Time
  - Total amount
  - Booking ID

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API (CartContext)
- Tailwind / Custom CSS

### Backend
- Spring Boot (Java 21)
- REST APIs
- Google Gemini API (v1)
- OkHttp Client
- Jackson JSON
- CORS enabled

---

## 📂 Project Structure

# 🚗 SalesBot – AI-Powered Car Service Booking Assistant

An intelligent full-stack web application that integrates **Google Gemini AI** with a **Spring Boot backend** and **React frontend** to provide a natural conversational car service booking experience.

This system allows users to:

- View available services (database grounded)
- Select service-specific add-ons
- Choose available time slots only
- Calculate total cost dynamically
- Complete booking and payment
- Receive AI-powered confirmation

---

## 🌟 Features

### 🤖 AI Chatbot (Gemini Integration)

- Natural conversation powered by Google Gemini API
- Strictly grounded to your real catalog (no fake services)
- Smart context awareness (cart, booking page, billing page)
- Suggests services, add-ons, and time slots
- Handles full booking flow conversationally

---

### 🛠️ Service & Add-On Management

- Only database-defined services are shown
- Add-ons displayed only for selected service
- Add-on prices included in subtotal automatically
- Prevents hallucinated content from AI

---

### 🛒 Smart Cart System

- Add/remove services
- Add/remove add-ons per service
- Automatic subtotal calculation
- Syncs cart with chatbot context

---

### 📅 Booking System

- Users cannot manually type time
- Only selectable time slots allowed (09:00 – 16:30)
- Selected slot synced to chatbot
- Suggest next available slot

---

### 💳 Billing & Confirmation

- Total calculated via backend `/api/quote`
- Booking saved via `/api/book`
- Chatbot confirms booking after payment
- Displays:
  - Date
  - Time
  - Total amount
  - Booking ID

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API (CartContext)
- Tailwind / Custom CSS

### Backend
- Spring Boot (Java 21)
- REST APIs
- Google Gemini API (v1)
- OkHttp Client
- Jackson JSON
- CORS enabled

---

## 📂 Project Structure
salesbot-demo/
│
├── backend/
│ └── salesbot/
│ ├── controller/
│ ├── service/
│ ├── model/
│ ├── config/
│ └── resources/application.properties
│
└── frontend/
├── src/
│ ├── components/
│ │ └── Chatbot.jsx
│ ├── context/
│ │ └── CartContext.jsx
│ ├── pages/
│ │ ├── Services.jsx
│ │ ├── Booking.jsx
│ │ ├── Cart.jsx
│ │ └── Billing.jsx
│ └── api.js


---

## 🔑 Environment Setup

### 1️⃣ Get Gemini API Key

Create API key from:
https://aistudio.google.com/

---
If you want, I can now also give you:

- 🔥 Professional README with badges
- 📊 Architecture diagram markdown
- 📸 Demo GIF section
- 💼 Recruiter-optimized short README
- ⭐ Clean portfolio version

Just tell me 👌
