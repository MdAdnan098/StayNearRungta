# StayNearRungta – API Documentation

Base URL: `http://localhost:5000`

All protected endpoints require the header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## AUTH

### POST /api/auth/register

Register a new property owner.

**Body (JSON)**

```json
{
  "fullName": "Ramesh Sharma",
  "mobileNumber": "9876543210",
  "password": "secret123"
}
```

**Response 201**

```json
{
  "message": "Account created successfully",
  "owner": {
    "_id": "...",
    "fullName": "Ramesh Sharma",
    "mobileNumber": "9876543210"
  },
  "token": "<JWT>"
}
```

---

### POST /api/auth/login

Login as an existing owner.

**Body (JSON)**

```json
{
  "mobileNumber": "9876543210",
  "password": "secret123"
}
```

**Response 200**

```json
{
  "message": "Login successful",
  "owner": {
    "_id": "...",
    "fullName": "Ramesh Sharma",
    "mobileNumber": "9876543210"
  },
  "token": "<JWT>"
}
```

---

## PROPERTIES (Public)

### GET /api/properties

Returns all approved properties.

Optional query: `?category=Boys` or `?category=Girls`

**Response 200** – Array of property objects.

---

### GET /api/properties/:id

Returns a single approved property.

**Response 200** – Property object with `mapUrl` field.

---

## PROPERTIES (Owner – requires Bearer token)

### GET /api/properties/my

Returns all properties belonging to the logged-in owner (all statuses).

**Response 200** – Array of property objects.

---

### POST /api/properties

Create a new property listing.

**Content-Type:** `multipart/form-data`

| Field        | Type                 | Required |
| ------------ | -------------------- | -------- |
| propertyName | string               | ✅       |
| rent         | number               | ✅       |
| ownerName    | string               | ✅       |
| phoneNumber  | string (10 digits)   | ✅       |
| category     | "Boys" or "Girls"    | ✅       |
| address      | string               | ✅       |
| description  | string               | ❌       |
| latitude     | number               | ❌       |
| longitude    | number               | ❌       |
| photos       | image files (max 10) | ❌       |

**Response 201**

```json
{
  "message": "Property submitted successfully. Awaiting admin approval.",
  "property": { ... }
}
```

---

### PUT /api/properties/:id

Update an existing property (must be owner).

Same fields as POST. New photos are appended up to the 10-photo limit.

**Response 200** – Updated property (status reset to "pending").

---

### DELETE /api/properties/:id

Delete a property and remove all Cloudinary images.

**Response 200**

```json
{ "message": "Property deleted successfully" }
```

---

## ADMIN

### POST /api/admin/login

Login as admin (no registration – admin accounts are created manually).

**Body (JSON)**

```json
{
  "username": "admin",
  "password": "adminpass"
}
```

**Response 200**

```json
{
  "message": "Admin login successful",
  "admin": { "_id": "...", "username": "admin" },
  "token": "<JWT>"
}
```

---

### GET /api/admin/pending 🔒

Returns all properties with status `pending`.

---

### GET /api/admin/approved 🔒

Returns all properties with status `approved`.

---

### PATCH /api/admin/:id/approve 🔒

Approve a property.

**Response 200**

```json
{ "message": "Property approved successfully", "property": { ... } }
```

---

### PATCH /api/admin/:id/reject 🔒

Reject a property.

**Response 200**

```json
{ "message": "Property rejected", "property": { ... } }
```

---

### DELETE /api/admin/:id 🔒

Admin deletes any property (also cleans Cloudinary images).

**Response 200**

```json
{ "message": "Property deleted by admin" }
```

---

## Property Object Shape

```json
{
  "_id": "664abc...",
  "propertyName": "Sharma Boys PG",
  "rent": 4500,
  "ownerName": "Ramesh Sharma",
  "phoneNumber": "9876543210",
  "category": "Boys",
  "description": "Near gate 2, food included",
  "address": "Plot 12, Sector 6, Bhilai",
  "latitude": 21.2008,
  "longitude": 81.3504,
  "photos": ["https://res.cloudinary.com/your_cloud/image/upload/..."],
  "status": "approved",
  "ownerId": "663xyz...",
  "mapUrl": "https://www.google.com/maps?q=21.2008,81.3504",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
```

---

## Error Responses

All errors follow:

```json
{ "message": "Human-readable error description" }
```

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 400    | Bad request / validation failure        |
| 401    | Not authenticated                       |
| 403    | Authenticated but not authorised        |
| 404    | Resource not found                      |
| 409    | Conflict (e.g. duplicate mobile number) |
| 500    | Internal server error                   |
