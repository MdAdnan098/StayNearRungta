# StayNearRungta – Setup Guide

A step-by-step guide to getting the backend running locally and deploying to production.

---

## 1. Prerequisites

- Node.js ≥ 18  (`node -v`)
- npm ≥ 9  (`npm -v`)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- A free [Cloudinary](https://cloudinary.com) account

---

## 2. MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a New Project** → give it a name (e.g. `staynearrungta`).
3. Click **Build a Cluster** → choose **Free (M0 Shared)** → select a region close to India (e.g. Mumbai / Singapore) → click **Create**.
4. Once the cluster is created, click **Database Access** → **Add New Database User**:
   - Authentication method: **Password**
   - Username: e.g. `snr_user`
   - Password: auto-generate or pick a strong one – **copy it**
   - Database user privileges: **Read and write to any database**
   - Click **Add User**
5. Click **Network Access** → **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`) for development. Restrict to your server IP in production.
6. Click **Clusters** → **Connect** → **Connect your application**:
   - Driver: **Node.js**, version **5.5 or later**
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://snr_user:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you set in step 4.
   - Add your database name before `?`:
     ```
     mongodb+srv://snr_user:yourpassword@cluster0.abc12.mongodb.net/staynearrungta?retryWrites=true&w=majority
     ```

---

## 3. Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and sign up / log in.
2. From your **Dashboard**, note down:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. These go into your `.env` file as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## 4. Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in every value:

```env
PORT=5000
JWT_SECRET=a_very_long_random_secret_string_at_least_32_characters
MONGODB_URI=mongodb+srv://snr_user:yourpassword@cluster0.abc12.mongodb.net/staynearrungta?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

---

## 5. Install & Run Locally

```bash
cd backend
npm install
npm run dev
```

You should see:
```
MongoDB Connected Successfully: cluster0.abc12.mongodb.net
StayNearRungta API running on port 5000
```

Visit `http://localhost:5000` – you should get:
```json
{ "status": "ok", "platform": "StayNearRungta API", "version": "1.0.0" }
```

---

## 6. Create the First Admin Account

Admin accounts are **never** created via a public API endpoint. You must create one manually using the Node REPL or a script.

**Option A – One-liner in your terminal:**

```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Admin.create({ username: 'admin', password: 'changeme123' });
  console.log('Admin created');
  process.exit(0);
});
"
```

Change `admin` / `changeme123` to your preferred credentials.

**Option B – MongoDB Atlas UI:**

1. Open your cluster → **Browse Collections** → `admins` collection.
2. Insert a document. The password field must already be **bcrypt-hashed** – use a tool like [bcrypt-generator.com](https://bcrypt-generator.com) with 10 rounds.

---

## 7. Verifying the Database Connection

After `npm run dev`, the console prints:
```
MongoDB Connected Successfully: cluster0.abc12.mongodb.net
```

If you see an error:
- Double-check `MONGODB_URI` – no trailing spaces, password is correct.
- Check **Network Access** in Atlas – your IP must be allowed.
- Check **Database Access** – the user must have read/write permissions.

---

## 8. Verifying the Cloudinary Connection

Upload a photo via `POST /api/properties` (after logging in as an owner). If the property is created with a `photos` array containing a `res.cloudinary.com` URL, Cloudinary is configured correctly.

Common errors:
- `Invalid API credentials` → check `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- `Cloud not found` → check `CLOUDINARY_CLOUD_NAME` (no spaces or capitals).

---

## 9. Running in Production

### Option A – Railway / Render / Fly.io

1. Push your backend folder to a GitHub repository.
2. Connect the repository to your hosting provider.
3. Set all environment variables in the provider's dashboard (same as `.env`).
4. Set the **start command** to `npm start`.
5. The provider will run `npm install` and `npm start` automatically.

### Option B – VPS (Ubuntu)

```bash
# Install Node.js 18+ via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18

# Clone your repo and install
git clone https://github.com/yourname/staynearrungta-backend.git
cd staynearrungta-backend
npm install

# Create .env from example
cp .env.example .env
nano .env   # fill in your values

# Install PM2 process manager
npm install -g pm2
pm2 start src/server.js --name staynearrungta
pm2 save
pm2 startup
```

Set `NODE_ENV=production` in your `.env` to suppress stack traces in error responses.

---

## 10. Connecting the Frontend

In the frontend's `src/utils/` or wherever API calls are made, set the base URL to your backend URL:

- **Local development:** `http://localhost:5000`
- **Production:** `https://your-backend-domain.com`

Update `CLIENT_URL` in the backend `.env` to match the frontend's origin (e.g. `https://staynearrungta.vercel.app`) to avoid CORS errors.

---

## 11. API Quick Reference

| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/auth/register | None |
| POST | /api/auth/login | None |
| GET | /api/properties | None |
| GET | /api/properties/:id | None |
| GET | /api/properties/my | Owner JWT |
| POST | /api/properties | Owner JWT |
| PUT | /api/properties/:id | Owner JWT |
| DELETE | /api/properties/:id | Owner JWT |
| POST | /api/admin/login | None |
| GET | /api/admin/pending | Admin JWT |
| GET | /api/admin/approved | Admin JWT |
| PATCH | /api/admin/:id/approve | Admin JWT |
| PATCH | /api/admin/:id/reject | Admin JWT |
| DELETE | /api/admin/:id | Admin JWT |

Full details in `API_DOCUMENTATION.md`.
