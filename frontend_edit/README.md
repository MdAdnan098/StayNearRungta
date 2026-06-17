# StayNearRungta — Frontend

A platform for students to find PGs, hostels, and lodges near Rungta College, Bhilai.

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`

---

## Project Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── GlobalStyles.jsx       # Injected CSS via <style> tag; driven by design tokens
│   ├── components/
│   │   ├── EmptyState.jsx         # Reusable empty state block
│   │   ├── FilterTabs.jsx         # All / Boys / Girls filter buttons
│   │   ├── Footer.jsx             # Sitewide footer
│   │   ├── FormField.jsx          # Label + input wrapper
│   │   ├── Navbar.jsx             # Sticky top nav with mobile menu
│   │   ├── PropertyCard.jsx       # Card used in Explore and Admin views
│   │   └── ThemeToggle.jsx        # Light/dark toggle button
│   ├── context/
│   │   ├── AuthContext.jsx        # Owner and admin auth state
│   │   └── ThemeContext.jsx       # Theme state + token resolution
│   ├── hooks/
│   │   ├── useAuth.js             # Re-export of useAuth
│   │   ├── useRouter.js           # Hash-based routing hook
│   │   └── useTheme.js            # Re-export of useTheme
│   ├── layouts/
│   │   └── MainLayout.jsx         # Navbar + children + Footer
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   ├── AddPropertyPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── OwnerLoginPage.jsx
│   │   ├── OwnerRegisterPage.jsx
│   │   └── PropertyDetailsPage.jsx
│   ├── utils/
│   │   ├── router.js              # navigate() helper
│   │   └── tokens.js              # Light/dark design tokens
│   ├── App.jsx                    # Root: providers + router
│   └── main.jsx                   # ReactDOM entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Routes

| Hash Route          | Page                   | Access             |
|---------------------|------------------------|--------------------|
| `#/`                | LandingPage            | Public             |
| `#/explore`         | ExplorePage            | Public             |
| `#/property/:id`    | PropertyDetailsPage    | Public             |
| `#/owner/login`     | OwnerLoginPage         | Guest              |
| `#/owner/register`  | OwnerRegisterPage      | Guest              |
| `#/dashboard`       | DashboardPage          | Owner (auth)       |
| `#/property/add`    | AddPropertyPage        | Owner (auth)       |
| `#/admin/login`     | AdminLoginPage         | Guest              |
| `#/admin`           | AdminDashboardPage     | Admin (auth)       |

---

## API Endpoints Expected by Frontend

Base URL: `https://api.staynearrungta.com/v1`

### Auth — Owner
```
POST   /auth/owner/register
POST   /auth/owner/login
POST   /auth/owner/logout
GET    /auth/owner/me
```

### Auth — Admin
```
POST   /auth/admin/login
```

### Properties — Public
```
GET    /properties                   List approved properties
GET    /properties?type=boys|girls   Filter by type
GET    /properties/:id               Single property
```

### Properties — Owner (auth required)
```
GET    /owner/properties
POST   /owner/properties
GET    /owner/properties/:id
PUT    /owner/properties/:id
DELETE /owner/properties/:id
```

### Properties — Admin (admin auth required)
```
GET    /admin/properties
GET    /admin/properties?status=pending|approved|rejected
PUT    /admin/properties/:id/approve
PUT    /admin/properties/:id/reject
```

### Media Upload
```
POST   /media/photos     multipart/form-data, max 10 files
POST   /media/video      multipart/form-data
```

---

## Request / Response Formats

### POST /auth/owner/register
```json
{
  "name": "Ramesh Sharma",
  "mobile": "9876543210",
  "password": "securepassword"
}
```

### POST /auth/owner/login
```json
{
  "mobile": "9876543210",
  "password": "securepassword"
}
```

### Auth Response
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "owner": {
    "id": "usr_01",
    "name": "Ramesh Sharma",
    "mobile": "9876543210",
    "createdAt": "2025-08-01T10:00:00Z"
  }
}
```

### POST /owner/properties (multipart/form-data)
```
name          string        required
rent          number        required
ownerName     string        required
phone         string        required  (10 digits)
type          string        required  "boys" | "girls"
description   string        optional
address       string        required
latitude      number        optional
longitude     number        optional
photos        File[]        optional  max 10
video         File          optional
```

### GET /properties — Response
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_01",
      "name": "Sharma Boys PG",
      "rent": 4500,
      "ownerName": "Ramesh Sharma",
      "phone": "9876543210",
      "type": "boys",
      "status": "approved",
      "description": "...",
      "address": "Near Rungta College, Sector 1, Bhilai",
      "latitude": 21.2024,
      "longitude": 81.4285,
      "photos": [
        "https://cdn.staynearrungta.com/photos/prop_01/1.jpg"
      ],
      "video": "https://cdn.staynearrungta.com/videos/prop_01/tour.mp4",
      "createdAt": "2025-08-01T10:00:00Z",
      "approvedAt": "2025-08-02T09:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### PUT /admin/properties/:id/approve — Response
```json
{
  "success": true,
  "message": "Property approved successfully.",
  "property": {
    "id": "prop_01",
    "status": "approved",
    "approvedAt": "2025-08-02T09:30:00Z"
  }
}
```

### Error Response (all endpoints)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action."
  }
}
```

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```
VITE_API_BASE_URL=https://api.staynearrungta.com/v1
VITE_CDN_BASE_URL=https://cdn.staynearrungta.com
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

---

Made with ❤️ by your seniors.
