# Project Architecture: YouthCamping

This document defines the strictly locked 3-tier architecture for the YouthCamping platform. All future development must adhere to this structure.

## 1. Frontend (Public Site)
- **Location**: `/frontend`
- **Role**: Customer-facing portal for browsing tours, making inquiries, and managing user profiles.
- **Tech Stack**: React (Vite) + Tailwind CSS + Framer Motion.

## 2. Admin Panel
- **Location**: `/admin` (or `/ADMIN-PANEL`)
- **Role**: Internal "Control Tower" for managing tours, bookings, content (Page Builder), and inquiries.
- **Tech Stack**: React + Tailwind CSS.

## 3. Backend API
- **Location**: `/backend` (or `/bD/youthcamping-backend`)
- **Role**: Centralized API server managing database (MongoDB), authentication, and business logic.
- **Tech Stack**: Node.js + Express + Mongoose.

---

### Strict Rules:
1. **No Mixed Logic**: Frontend must never talk directly to the database; it must go through the Backend API.
2. **Unified Data**: All content managed in the Admin Panel must be reflected on the Frontend via normalized API endpoints.
3. **Environment Separation**: Each tier must have its own `.env` configuration.
