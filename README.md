# MediTrack HelpDesk 🏥

## 📋 Project Overview

MediTrack HelpDesk is a full-stack hospital support ticketing system built with a **Flutter** frontend and a **Node.js/Express + MongoDB** backend. It streamlines communication between patients and hospital staff by providing a structured, role-based ticket management platform with real-time dashboards and secure authentication.

## 🎯 Business Objective

- Provide patients with an easy channel to submit and track support tickets
- Enable hospital admins to manage, assign, and resolve tickets efficiently
- Empower super users with full system oversight across all hospitals
- Deliver a secure, scalable, and production-ready healthcare helpdesk solution
- Support data-driven decisions through role-specific dashboards and analytics

## 📁 Project Structure

```
MediTrack-HelpDesk/
├── README.md                        # Project documentation
├── Pass.txt                         # Credential notes (do NOT commit)
├── Py.py                            # Utility Python script
│
├── backend/                         # Node.js / Express API server
│   ├── package.json                 # Backend dependencies & scripts
│   ├── .env                         # Environment variables (gitignored)
│   ├── .env.example                 # Environment variable template
│   └── src/
│       ├── server.js                # Application entry point
│       ├── seed.js                  # Database seeder (default users)
│       ├── config/
│       │   ├── dbMock.js            # In-memory/mock DB config
│       │   └── firebase.js          # Firebase Admin SDK setup
│       ├── controllers/             # Request handlers (MVC)
│       │   ├── authController.js    # Register / login / profile
│       │   ├── chatController.js    # Send & fetch ticket messages
│       │   ├── hospitalController.js# Hospital CRUD
│       │   ├── ticketController.js  # Full ticket lifecycle
│       │   └── userController.js    # User & admin management
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT protect + role authorize guards
│       │   └── errorMiddleware.js   # Global 404 & error handler
│       ├── models/                  # Mongoose schemas
│       │   ├── User.js              # Patient, admin, super roles
│       │   ├── Hospital.js          # Hospital entity
│       │   └── Ticket.js            # Ticket with status & doctor reply
│       ├── routes/                  # Express route definitions
│       │   ├── authRoutes.js
│       │   ├── chatRoutes.js
│       │   ├── hospitalRoutes.js
│       │   ├── ticketRoutes.js
│       │   └── userRoutes.js
│       ├── services/                # Business logic services
│       └── utils/                   # Shared helper utilities
│
└── frontend/                        # Flutter cross-platform client
    ├── pubspec.yaml                 # Flutter dependencies
    ├── analysis_options.yaml        # Dart lint rules
    ├── android/ ios/ web/           # Mobile & web platform configs
    ├── windows/ macos/ linux/       # Desktop platform configs
    ├── test/                        # Widget & unit tests
    └── lib/
        ├── main.dart                # App entry point
        ├── core/
        │   ├── constants/
        │   │   ├── app_constants.dart   # Base URL & API endpoints
        │   │   ├── app_colors.dart      # Color palette
        │   │   ├── app_routes.dart      # Route name constants
        │   │   └── app_strings.dart     # UI string constants
        │   ├── theme/
        │   │   └── app_theme.dart       # Light/dark theme definitions
        │   └── utils/                   # Shared Dart utilities
        ├── data/
        │   ├── models/
        │   │   ├── user_model.dart
        │   │   ├── api_user_model.dart
        │   │   ├── ticket_model.dart
        │   │   ├── hospital_model.dart
        │   │   ├── message_model.dart
        │   │   ├── case_model.dart
        │   │   └── product_model.dart
        │   └── repositories/
        │       ├── auth_repository.dart
        │       ├── ticket_repository.dart
        │       ├── user_repository.dart
        │       ├── hospital_repository.dart
        │       └── chat_repository.dart
        ├── presentation/
        │   ├── screens/
        │   │   ├── splash/              # Splash / loading screen
        │   │   ├── auth/                # Login & register screens
        │   │   ├── patient/             # Patient dashboard & history
        │   │   ├── admin/               # Admin dashboard & ticket mgmt
        │   │   ├── super_user/          # Super user hospital & admin mgmt
        │   │   ├── tickets/             # Ticket detail screen
        │   │   ├── settings/            # App settings screen
        │   │   ├── admin_dashboard.dart
        │   │   ├── super_admin_dashboard.dart
        │   │   └── ticket_reply_screen.dart
        │   └── widgets/                 # Reusable UI components
        ├── providers/                   # Provider state management
        │   ├── auth_provider.dart
        │   ├── ticket_provider.dart
        │   ├── hospital_provider.dart
        │   ├── user_provider.dart
        │   ├── chat_provider.dart
        │   └── theme_provider.dart      # Light / dark mode toggle
        ├── routes/
        │   └── app_router.dart          # Named route generator with auth guard
        └── services/
            ├── api_service.dart         # Dio HTTP client with interceptors
            ├── auth_service.dart        # Auth token helpers
            ├── preference_service.dart  # SharedPreferences wrapper
            ├── navigation_service.dart  # Global navigation key
            ├── case_number_service.dart # Case/ticket ID generation
            └── database_service.dart   # Local DB service
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local instance or MongoDB Atlas)
- **Flutter** SDK (stable channel, 3.x+)
- **Dart** SDK ^3.10.7

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables — copy `.env.example` to `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/meditrack
JWT_SECRET=your_super_secret_jwt_key

# Optional: Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. Start the development server:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`

> Health check: `GET http://localhost:5000/` → `{ "message": "MediTrack Pro API is running" }`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Set the API base URL in `frontend/lib/core/constants/app_constants.dart`:
```dart
// Web → http://localhost:5000
// Android Emulator → http://10.0.2.2:5000
// Physical Device → http://192.168.x.x:5000  (your LAN IP)
static String get baseUrl =>
    kIsWeb ? "http://localhost:5000" : "http://10.0.2.2:5000";
```

4. Run the app:
```bash
# Mobile / Desktop
flutter run

# Web (Chrome)
flutter run -d chrome
```

## 👥 Roles & Features

### 🧑‍⚕️ Patient
- Register and log in securely
- Submit new support tickets with title, description, and hospital
- Track ticket status (`pending → assigned → resolved`)
- View full ticket history and doctor reply details

### 🏥 Hospital Admin
- View all tickets assigned to their hospital
- Reply to tickets with doctor name, phone, specialization, and message
- Resolve patient tickets with detailed medical responses
- Dashboard with ticket statistics and charts

### 👑 Super User
- Full system oversight across all hospitals
- Create and manage hospitals
- Assign admin roles to users
- Assign pending tickets to specific hospital admins
- System-wide analytics dashboard with charts

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Flutter 3.x** | Cross-platform UI framework (Android, iOS, Web, Desktop) |
| **Dart ^3.10.7** | Programming language |
| **Provider ^6.1.2** | State management |
| **Dio ^5.7.0** | HTTP client with interceptors for API calls |
| **flutter_secure_storage ^9.2.2** | Secure token storage (mobile) |
| **shared_preferences ^2.3.2** | Persistent token storage (web) |
| **firebase_core ^3.6.0** | Firebase SDK initialization |
| **fl_chart ^1.1.1** | Charts & data visualizations |
| **google_fonts ^6.2.1** | Custom typography |
| **intl ^0.19.0** | Date/time formatting & localization |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18+** | JavaScript runtime |
| **Express ^4.21.0** | Web framework (ES Modules) |
| **MongoDB + Mongoose ^9.2.1** | NoSQL database & ODM |
| **JWT (jsonwebtoken ^9.0.2)** | Stateless authentication |
| **bcryptjs ^2.4.3** | Password hashing |
| **cors ^2.8.5** | Cross-origin resource sharing |
| **dotenv ^16.4.5** | Environment variable management |
| **morgan ^1.10.0** | HTTP request logging |
| **express-async-errors ^3.1.1** | Async error propagation |
| **firebase-admin ^12.5.0** | Optional Firebase server SDK |

## 📡 API Reference

Base URL: `http://localhost:5000`

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new patient |
| `POST` | `/api/auth/login` | Public | Login (all roles) — returns JWT |
| `GET` | `/api/auth/me` | 🔒 Protected | Get current user profile |

### 🏥 Hospitals — `/api/hospitals`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/hospitals` | Public | List all hospitals |
| `POST` | `/api/hospitals` | 🔒 Super | Create a new hospital |
| `DELETE` | `/api/hospitals/:id` | 🔒 Super | Delete a hospital |

### 👤 Users — `/api/users`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/users` | 🔒 Super | List all users |
| `GET` | `/api/users/admins` | 🔒 Super | List all admin users |
| `POST` | `/api/users/assign-admin` | 🔒 Super | Promote user to hospital admin |

### 🎫 Tickets — `/api/tickets`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tickets` | 🔒 Protected | Get tickets (role-filtered) |
| `POST` | `/api/tickets` | 🔒 Patient | Create a new ticket |
| `GET` | `/api/tickets/stats` | 🔒 Protected | Get ticket count statistics |
| `GET` | `/api/tickets/pending` | 🔒 Super | Get all unassigned tickets |
| `GET` | `/api/tickets/:id` | 🔒 Protected | Get full ticket details |
| `PATCH` | `/api/tickets/:id/assign` | 🔒 Super | Assign ticket to an admin |
| `PATCH` | `/api/tickets/:id/reply` | 🔒 Admin | Reply to / resolve a ticket |
| `DELETE` | `/api/tickets/:id` | 🔒 Admin/Super | Delete a ticket |

### 💬 Chat — `/api/chat`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/chat/:ticketId` | 🔒 Protected | Send a message on a ticket |
| `GET` | `/api/chat/:ticketId` | 🔒 Protected | Fetch all messages for a ticket |

## 🗂️ Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt-hashed password |
| `role` | Enum | `patient` \| `admin` \| `super` |
| `hospital` | ObjectId (ref) | Assigned hospital (admin only) |

### Hospital
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Hospital name |
| `location` | String | Physical location |
| `contactEmail` | String | Contact email |
| `assignedAdmin` | ObjectId (ref) | Linked admin user |

### Ticket
| Field | Type | Description |
|-------|------|-------------|
| `patientId` | ObjectId (ref) | Ticket-raising patient |
| `hospitalId` | String | Target hospital |
| `assignedAdminId` | ObjectId (ref) | Admin handling the ticket |
| `issueTitle` | String | Short issue summary |
| `description` | String | Detailed issue description |
| `status` | Enum | `pending` \| `assigned` \| `resolved` |
| `reply.doctorName` | String | Doctor's name in response |
| `reply.doctorPhone` | String | Doctor's contact number |
| `reply.specialization` | String | Doctor's medical specialization |
| `reply.replyMessage` | String | Admin's reply message |
| `reply.repliedBy` | ObjectId (ref) | Admin who replied |
| `reply.repliedAt` | Date | Timestamp of reply |
| `createdAt` / `updatedAt` | Date | Auto-managed timestamps |

### Message (Chat)
| Field | Type | Description |
|-------|------|-------------|
| `ticketId` | ObjectId (ref) | Parent ticket |
| `senderId` | ObjectId (ref) | Message sender |
| `content` | String | Message text |
| `createdAt` | Date | Auto timestamp |

## 🔀 App Routes (Frontend)

| Route Name | Path | Access | Screen |
|---|---|---|---|
| `splash` | `/` | Public | `SplashScreen` — auto-redirects on auth state |
| `login` | `/login` | Public | `LoginScreen` |
| `register` | `/register` | Public | `RegisterScreen` |
| `patientDashboard` | `/patient` | 🔒 Auth | `PatientDashboard` |
| `adminDashboard` | `/admin` | 🔒 Auth | `AdminDashboard` |
| `superUserDashboard` | `/super` | 🔒 Auth | `SuperUserDashboard` |
| `ticketDetails` | `/ticket-details` | 🔒 Auth | `TicketDetailsScreen` (with `TicketModel` arg) |
| `settingsRoute` | `/settings` | 🔒 Auth | `SettingsScreen` |

> All protected routes redirect to `/login` if the user is not authenticated.

## 🔒 Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- `protect` middleware — validates `Authorization: Bearer <token>` header, rejects expired or invalid JWTs
- `authorize(...roles)` middleware — role-based guard (e.g., `authorize('super')`) returns `403 Forbidden` on mismatch
- Global `errorHandler` middleware catches all thrown errors and returns consistent JSON error responses
- `notFound` middleware returns `404` for undefined routes
- Auto-logout on `401` response via Dio interceptor in `ApiService`
- **Never commit your real `.env` file** — use `.env.example` as a reference
- CORS enabled via `cors()` middleware

## 🌱 Default Seed Users

The backend auto-seeds default accounts on first startup (when the DB is empty):

| Role | Email | Password |
|------|-------|----------|
| Super User | `super@meditrack.com` | `super123` |
| Admin | `admin@meditrack.com` | `admin123` |

> ⚠️ Change these credentials immediately in any production deployment.

## 🎨 Theming

The app supports **light and dark mode** via `ThemeProvider`:

- Theme definitions live in `frontend/lib/core/theme/app_theme.dart`
- Color palette defined in `frontend/lib/core/constants/app_colors.dart`
- Runtime toggle managed by `providers/theme_provider.dart`
- Google Fonts used throughout for consistent typography

## 🧪 Testing

Run Flutter widget/unit tests:
```bash
flutter test
```

Run Flutter static analysis (lint check):
```bash
flutter analyze
```

## 🔥 Firebase Setup (Optional)

To enable Firebase for Web/Desktop:
```bash
flutterfire configure
```

This generates `lib/firebase_options.dart`. Initialize in `main.dart`:
```dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

If Firebase is not configured, the app safely skips initialization on all platforms.

## 📱 Platform Support

| Platform | Support |
|----------|---------|
| Android | ✅ Full |
| iOS | ✅ Full |
| Web (Chrome) | ✅ Full |
| Windows | ✅ Full |
| macOS | ✅ Full |
| Linux | ✅ Full |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

Before submitting, please ensure:
- `flutter analyze` passes with no errors
- `flutter test` passes all tests
- Backend API changes are reflected in the API reference above

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

## 👥 Authors

- **Development Team** — *Full-stack development* — MediTrack Pro

## 🙏 Acknowledgments

- Flutter & Dart teams for the incredible cross-platform framework
- MongoDB Atlas for cloud database hosting
- Express.js community for the lightweight backend framework
- Pub.dev package authors for `provider`, `dio`, `fl_chart`, and more

## 📞 Contact

- **Project Owner**: ritesh.work.1510@gmail.com
- **Repository**: https://github.com/Ritesh151/MediTrack-HelpDesk-Flutter

## 🔄 Version History

- **1.0.0** — Initial release
  - Role-based authentication (Patient, Admin, Super User)
  - Full ticket lifecycle with doctor reply fields
  - In-ticket chat/messaging system
  - Hospital and admin management
  - Cross-platform Flutter client (Android, iOS, Web, Desktop)
  - Light/Dark theme support
  - Secure JWT + bcryptjs backend with global error handling

---

> **Note**: This project is built for use in hospital environments. Ensure all security configurations, environment variables, and credentials are properly managed before deployment. Always consult domain experts for healthcare-specific compliance requirements (e.g., HIPAA, GDPR).
