# 💍 Sureka & Deshan — Wedding Invitation Website

A fully digital wedding invitation website with personalized guest links, live RSVP tracking, and a real-time guest management dashboard for the couple.

🔗 **Live site:** https://hezio2002.github.io/Wedding-Invitation-site/

## ✨ Features

- **Elegant multi-page invitation** with smooth entrance animations
  - Hero / "We Do" welcome page with the couple's photo
  - Full-bleed photo gallery page
  - Venue details with Google Maps link
  - Wedding day programme / timeline
  - Personalized "Your Invitation" page (shows the guest's name & invite type)
  - "Save the Date" page
- **Personalized guest links** — each invitation link (`?code=WED1234`) automatically shows that guest's name and whether they're invited as an Individual, Couple, or Family
- **Live RSVP form** — guests confirm attendance, number of guests, names, and a special note
- **Wedding Guest Dashboard** for the couple:
  - Real-time stats (total invitations, invited guests, attending, not attending, pending)
  - Guest list with search & filters
  - One-click invitation creation with auto-generated WhatsApp share links
  - Guest detail view
- Fully responsive — works on mobile, tablet, and desktop

## 🛠️ Built With

- HTML, CSS, JavaScript (no frameworks)
- [Firebase](https://firebase.google.com/) — Firestore (database) & Authentication (couple login)
- Google Fonts (Cinzel, Cormorant Garamond, Alex Brush)
- Hosted on GitHub Pages

## 📁 Project Structure

wedding-invitation/
├── index.html # Main invitation (all pages)
├── rsvp.html # Guest RSVP form
├── admin/
│ ├── login.html # Couple login
│ └── dashboard.html # Guest management dashboard
├── css/
│ └── style.css
├── js/
│ ├── script.js
│ ├── rsvp.js
│ ├── dashboard.js
│ └── firebase-config.js
└── images/


## 🚀 Setup

1. Create a free [Firebase](https://console.firebase.google.com) project
2. Enable **Firestore Database** and **Authentication (Email/Password)**
3. Add your Firebase config to `js/firebase-config.js`
4. Add a login user for the couple in Firebase Authentication
5. Deploy the files (e.g. GitHub Pages, Netlify)

## 💌 Made with love for our wedding day
