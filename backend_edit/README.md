# StayNearRungta – Backend API

Production-ready REST API for the **StayNearRungta** platform – helping students find PGs, hostels, and lodges near Rungta College, Bhilai.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Media | Cloudinary (images only) |
| Upload | Multer + multer-storage-cloudinary |

---

## Quick Start

```bash
npm install
cp .env.example .env
# fill in .env values
npm run dev
```

See `SETUP_GUIDE.md` for full instructions including MongoDB Atlas, Cloudinary, and production deployment.

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary SDK config
│   ├── controllers/
│   │   ├── authController.js   # Owner register/login
│   │   ├── propertyController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── Owner.js
│   │   ├── Property.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # Protects owner routes
│   │   ├── adminMiddleware.js  # Protects admin routes
│   │   ├── uploadMiddleware.js # Multer + Cloudinary
│   │   └── errorMiddleware.js  # Global error handler
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── mapUtils.js
│   ├── app.js
│   └── server.js
├── uploads/                    # (local temp – not used in prod)
├── .env.example
├── package.json
├── API_DOCUMENTATION.md
├── SETUP_GUIDE.md
└── README.md
```

---

## Key Design Decisions

- **Database starts empty.** No seed data, no dummy properties, no sample users.
- **Admin accounts are created manually** – there is no public registration endpoint for admins.
- **Only approved properties are public.** Pending and rejected listings are invisible to students.
- **Images stored in Cloudinary** – only URLs are kept in MongoDB.
- **Property deletion cleans up Cloudinary** – no orphaned images.
- **Phone numbers are stored as-is** – the frontend uses them for WhatsApp and call links.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Production start |
