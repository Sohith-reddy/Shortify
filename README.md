# Shortify - Production-Ready URL Shortening Service

[![Java Version](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, full-stack URL shortening service built with Spring Boot backend and Angular frontend, designed for scalability, performance, and an exceptional user experience.

## 🎯 Overview

Shortify is a comprehensive, full-stack URL shortening service that transforms long, unwieldy URLs into short, manageable links. Built with an enterprise-grade Spring Boot backend and a modern Angular frontend, this service provides a robust foundation for production deployment with features like user authentication, personalized URL dashboards, analytics, expiration controls, and an intuitive user interface.

## ✨ Key Features

### Core Functionality
- **URL Shortening** - Convert long URLs into short, easy-to-share links
- **Custom Short URLs** - Support for custom short codes (planned)
- **URL Analytics** - Track click counts and usage statistics
- **URL Expiration** - Set expiration dates for temporary links
- **User Management** - Multi-user support with role-based access control
- **Premium Accounts** - Support for premium user features

### Angular Frontend Features
- **🔐 User Authentication** - Secure login and registration system with JWT token-based authentication
- **📊 Personalized URL Dashboard** - User-specific dashboard displaying all shortened URLs mapped to individual users
- **📈 Analytics & Insights** - Real-time click tracking, geographic data, and URL performance metrics
- **🎨 Responsive UI Design** - Mobile-first, responsive design for seamless experience across all devices
- **⚡ Real-time Updates** - Dynamic content updates without page refresh using RxJS observables
- **🔍 Search & Filter** - Advanced search and filtering capabilities for managing URLs
- **📋 URL Management** - Create, edit, delete, and organize shortened URLs with ease
- **👤 User Profile Management** - Update profile information, change password, and manage account settings
- **🔔 Notifications** - Toast notifications for user actions and system alerts
- **🌓 Dark Mode Support** - Theme switching for better user experience (planned)

### Technical Features
- **RESTful API** - Clean, well-documented API endpoints
- **Multi-Database Support** - MySQL and PostgreSQL compatibility
- **Environment Profiles** - Separate configurations for development and production
- **Health Monitoring** - Spring Boot Actuator integration
- **CORS Support** - Cross-Origin Resource Sharing enabled for Angular frontend
- **Connection Pooling** - HikariCP for optimized database connections
- **Production Ready** - Configured for deployment at scale

## 🏗️ Architecture

Shortify follows a modern, decoupled architecture with a clear separation between backend and frontend:

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Angular 21 | Single-page application with reactive forms and routing |
| **Frontend Language** | TypeScript 4.3 | Type-safe development with modern JavaScript features |
| **Styling** | SCSS | Component-scoped and global styling with variables |
| **State Management** | RxJS 6.6 | Reactive state management using observables |
| **HTTP Client** | Angular HttpClient | RESTful API communication with interceptors |
| **Backend Framework** | Spring Boot 4.5.5 | RESTful API server with dependency injection |
| **Java Version** | 21 (LTS) | Long-term support Java runtime |
| **ORM** | JPA/Hibernate | Object-relational mapping for database operations |
| **Database** | MySQL | Relational database for persistent storage |
| **Connection Pool** | HikariCP | High-performance JDBC connection pooling |
| **Build Tool - Backend** | Maven 3.x | Dependency management and build automation |
| **Build Tool - Frontend** | Angular CLI | Development server, build, and deployment tooling |
| **Monitoring** | Spring Boot Actuator | Health checks and application metrics |

### Application Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │  HTTP   │                  │  JDBC   │              │
│  Angular UI     │ ◄─────► │  Spring Boot API │ ◄─────► │   Database   │
│  (Port 4200)    │  REST   │  (Port 8080)     │         │  MySQL/PG    │
│                 │         │                  │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
      │                              │
      │                              │
   Browser                      JWT Auth
  RxJS/Forms                   JPA/Hibernate
  Routing                      Service Layer
```

### Project Structure

```
Shortify/
├── Server/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/urlshortener/urlshortener/
│   │   │   │   ├── controller/         # REST API Controllers
│   │   │   │   ├── service/            # Business Logic
│   │   │   │   ├── repository/         # Data Access Layer
│   │   │   │   ├── entity/             # JPA Entities
│   │   │   │   ├── models/             # DTOs and Request/Response Models
│   │   │   │   └── enums/              # Enumerations
│   │   │   └── resources/
│   │   │       ├── application.properties           # Main Configuration
│   │   │       ├── application-dev.properties       # Development Profile
│   │   │       └── application-prod.properties      # Production Profile
│   │   └── test/                       # Test Suite
│   ├── pom.xml                         # Maven Dependencies
│   └── mvnw                            # Maven Wrapper
│
├── Client/                          # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                   # Core Module (Services, Guards, Interceptors)
│   │   │   │   ├── services/           # HTTP Services (Auth, URL, User)
│   │   │   │   ├── guards/             # Route Guards (Auth Guard)
│   │   │   │   ├── interceptors/       # HTTP Interceptors (JWT, Error)
│   │   │   │   └── models/             # TypeScript Interfaces & Models
│   │   │   ├── features/               # Feature Modules
│   │   │   │   ├── auth/               # Authentication Module
│   │   │   │   │   ├── login/          # Login Component
│   │   │   │   │   ├── register/       # Registration Component
│   │   │   │   │   └── auth.module.ts
│   │   │   │   ├── dashboard/          # Dashboard Module
│   │   │   │   │   ├── url-list/       # URL List Component
│   │   │   │   │   ├── url-create/     # Create URL Component
│   │   │   │   │   ├── analytics/      # Analytics Component
│   │   │   │   │   └── dashboard.module.ts
│   │   │   │   └── profile/            # User Profile Module
│   │   │   │       ├── profile-view/   # View Profile
│   │   │   │       ├── profile-edit/   # Edit Profile
│   │   │   │       └── profile.module.ts
│   │   │   ├── shared/                 # Shared Module
│   │   │   │   ├── components/         # Reusable Components
│   │   │   │   ├── directives/         # Custom Directives
│   │   │   │   ├── pipes/              # Custom Pipes
│   │   │   │   └── shared.module.ts
│   │   │   ├── app-routing.module.ts   # Root Routing Configuration
│   │   │   ├── app.module.ts           # Root Module
│   │   │   └── app.component.ts        # Root Component
│   │   ├── environments/
│   │   │   ├── environment.ts          # Development Environment
│   │   │   └── environment.prod.ts     # Production Environment
│   │   ├── assets/                     # Static Assets (Images, Icons)
│   │   ├── styles.scss                 # Global Styles
│   │   └── index.html                  # Main HTML File
│   ├── angular.json                    # Angular CLI Configuration
│   ├── package.json                    # Node Dependencies
│   └── tsconfig.json                   # TypeScript Configuration
│
└── README.md                        # This File
```

## 🎨 Angular Frontend Architecture

The Shortify frontend is built with Angular 21, providing a modern, responsive, and user-friendly interface for URL management.

### Core Modules & Features

#### 1. 🔐 Authentication Module

**Login Component**
- Secure user authentication with JWT tokens
- Form validation using Angular Reactive Forms
- Email and password authentication
- "Remember Me" functionality
- Error handling with user-friendly messages
- Automatic redirection to dashboard after successful login

**Registration Component**
- New user account creation
- Password strength validation
- Email format validation
- Username uniqueness check
- Terms and conditions acceptance
- Automatic login after registration

**Technical Implementation:**
```typescript
// AuthService handles all authentication operations
- login(credentials): Observable<AuthResponse>
- register(userData): Observable<User>
- logout(): void
- isAuthenticated(): boolean
- getToken(): string
- getCurrentUser(): Observable<User>
```

**Authentication Flow:**
1. User submits login credentials
2. Angular HttpClient sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. Token is stored in localStorage/sessionStorage
5. HTTP Interceptor adds token to all subsequent API requests
6. Auth Guard protects dashboard and protected routes
7. User is redirected to dashboard upon successful authentication

---

#### 2. 📊 URL Dashboard (User-Specific)

The dashboard is the heart of the application, providing a personalized URL management interface for each authenticated user.

**Dashboard Features:**

**URL List View**
- Displays all URLs created by the logged-in user
- Paginated table view with sorting capabilities
- Columns: Short URL, Original URL, Created Date, Expiration Date, Click Count, Status
- Quick copy-to-clipboard functionality for short URLs
- Visual indicators for expired/active URLs
- Real-time click count updates

**URL Creation Panel**
- Quick URL shortening form
- Input validation for URL format
- Optional custom short code field
- Expiration date picker
- Success/error notifications
- Instant addition to URL list

**URL Management Actions**
- **Edit**: Modify expiration date and custom settings
- **Delete**: Remove URLs with confirmation dialog
- **Toggle Status**: Activate/deactivate URLs
- **View Details**: See detailed analytics
- **Share**: Quick share options (Email, Social Media)
- **QR Code**: Generate QR code for mobile sharing

**Search & Filter Panel**
- Search by original URL or short code
- Filter by status (Active, Expired, All)
- Filter by date range
- Sort by: Date Created, Click Count, Expiration Date

**Technical Implementation:**
```typescript
// URLService manages all URL operations
- getUserUrls(userId): Observable<ShortUrl[]>
- createShortUrl(urlData): Observable<ShortUrl>
- updateUrl(id, data): Observable<ShortUrl>
- deleteUrl(id): Observable<void>
- getUrlAnalytics(id): Observable<Analytics>
- toggleUrlStatus(id): Observable<ShortUrl>
```

**User-Specific Mapping:**
- Each URL is linked to the creating user via `user_id` foreign key
- Dashboard only displays URLs belonging to the authenticated user
- Users can only modify/delete their own URLs
- Admin users can view all URLs (with appropriate permissions)

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Shortify Dashboard                    [User Profile ▼] │
├─────────────────────────────────────────────────────────┤
│  [➕ Create New Short URL]                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Long URL: [..............................]  [Shorten]│
│  │ Custom Code (optional): [.........]  Expires: [📅] │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  📊 My URLs (23)         🔍 [Search...]  [Filter ▼]     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Short URL    │ Original URL  │ Clicks │ Created   │  │
│  ├─────────────────────────────────────────────────────│
│  │ /abc123  📋  │ example.com/..│   45   │ 2h ago  ✎│  │
│  │ /custom-link │ mysite.org/...│  128   │ 1d ago  ✎│  │
│  │ /xyz789      │ longurl.co/...│    7   │ 3d ago  ✎│  │
│  └───────────────────────────────────────────────────┘  │
│                       [1] 2 3 ... →                      │
└─────────────────────────────────────────────────────────┘
```

---

#### 3. 📈 Analytics & Insights

**Real-time Analytics Dashboard**
- Total URLs created by user
- Total clicks across all URLs
- Top performing URLs (by clicks)
- Recent activity timeline
- Geographic distribution of clicks (planned)
- Device type analytics (Desktop, Mobile, Tablet)
- Browser statistics
- Time-based click trends (hourly, daily, weekly)

**URL-Specific Analytics**
- Individual URL performance metrics
- Click history graph
- Referrer information
- Geographic heat map
- Peak usage times

---

#### 4. 👤 User Profile Management

**Profile View**
- Display user information (Username, Email, Role)
- Account creation date
- Premium status indicator
- Total URLs created
- Account activity statistics

**Profile Edit**
- Update username
- Change email address
- Update password (with current password verification)
- Profile picture upload (planned)
- Notification preferences

---

#### 5. 🎨 Shared Components

**Reusable UI Components:**
- **Navbar**: Top navigation with user menu and logout
- **Sidebar**: Quick navigation to Dashboard, Analytics, Profile
- **URL Card**: Displays URL information in card format
- **Toast Notifications**: Success, error, warning, and info messages
- **Loading Spinner**: Shown during API calls
- **Confirmation Dialog**: For destructive actions (delete, deactivate)
- **Copy Button**: One-click copy-to-clipboard
- **Date Picker**: For setting expiration dates
- **Pagination**: Reusable pagination component

---

### Angular Services & Architecture

#### Core Services

**1. AuthService** (`src/app/core/services/auth.service.ts`)
- Handles user authentication and authorization
- Manages JWT tokens
- Provides user session information
- Implements logout functionality

**2. URLService** (`src/app/core/services/url.service.ts`)
- CRUD operations for shortened URLs
- Fetches user-specific URLs
- Handles URL analytics data
- Manages URL status updates

**3. UserService** (`src/app/core/services/user.service.ts`)
- User profile management
- Account settings updates
- User statistics and metrics

**4. NotificationService** (`src/app/core/services/notification.service.ts`)
- Toast notification management
- Success, error, and info messages
- Auto-dismiss functionality

#### Guards

**AuthGuard** (`src/app/core/guards/auth.guard.ts`)
- Protects authenticated routes
- Redirects unauthenticated users to login
- Checks token validity

**GuestGuard** (`src/app/core/guards/guest.guard.ts`)
- Prevents authenticated users from accessing login/register pages
- Redirects to dashboard if already logged in

#### HTTP Interceptors

**JwtInterceptor** (`src/app/core/interceptors/jwt.interceptor.ts`)
- Automatically adds JWT token to HTTP request headers
- Ensures all API calls are authenticated

**ErrorInterceptor** (`src/app/core/interceptors/error.interceptor.ts`)
- Global error handling
- HTTP error status code handling (401, 403, 500, etc.)
- Token expiration detection and automatic logout
- User-friendly error messages

---

### Routing Configuration

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Public routes
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  
  // Protected routes (require authentication)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: UrlListComponent },
      { path: 'create', component: UrlCreateComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'analytics/:id', component: UrlAnalyticsComponent }
    ]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  
  // Wildcard route
  { path: '**', redirectTo: '/dashboard' }
];
```

---

### State Management with RxJS

The application uses **RxJS Observables** for reactive state management:

**Benefits:**
- Real-time data updates
- Efficient change detection
- Asynchronous data handling
- Clean separation of concerns

**Implementation Pattern:**
```typescript
// Component subscribes to data streams
this.urlService.getUserUrls(userId).subscribe(
  urls => this.urls = urls,
  error => this.notificationService.error('Failed to load URLs')
);

// Real-time updates via Subject/BehaviorSubject
private urlsSubject = new BehaviorSubject<ShortUrl[]>([]);
public urls$ = this.urlsSubject.asObservable();
```

---

### Form Handling

**Reactive Forms** are used throughout the application for:
- Type-safe form handling
- Built-in validation
- Dynamic form controls
- Better testing support

**Example - Login Form:**
```typescript
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  rememberMe: [false]
});

onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value).subscribe(
      response => this.router.navigate(['/dashboard']),
      error => this.handleError(error)
    );
  }
}
```

---

### Styling & Theming

**SCSS Architecture:**
- Component-scoped styles for encapsulation
- Global styles for common patterns
- SCSS variables for theming
- Responsive design with CSS Grid and Flexbox
- Mobile-first approach

**Responsive Breakpoints:**
```scss
// Mobile: < 768px
// Tablet: 768px - 1024px
// Desktop: > 1024px
```

---

### API Integration

All Angular services communicate with the Spring Boot backend via HTTP:

**Base API URL Configuration:**
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.shortify.com/api'
};
```

**HTTP Communication Example:**
```typescript
@Injectable({ providedIn: 'root' })
export class URLService {
  private apiUrl = `${environment.apiUrl}/shortUrl`;

  constructor(private http: HttpClient) {}

  getUserUrls(userId: number): Observable<ShortUrl[]> {
    return this.http.get<ApiResponse<ShortUrl[]>>(
      `${this.apiUrl}/user/${userId}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }
}
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

**Backend Requirements:**
- **Java 17** or higher ([Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html))
- **Maven 3.6+** ([Download](https://maven.apache.org/download.cgi))
- **MySQL 8.0+** or **PostgreSQL 12+** ([MySQL](https://dev.mysql.com/downloads/) | [PostgreSQL](https://www.postgresql.org/download/))

**Frontend Requirements:**
- **Node.js 14+** and **npm 6+** ([Download](https://nodejs.org/))
- **Angular CLI 12.2+** (Install: `npm install -g @angular/cli`)

**General:**
- **Git** (for cloning the repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sohith-reddy/Shortify.git
cd Shortify
```

### 2. Backend Setup (Spring Boot)

#### Database Setup

##### For MySQL:

```sql
CREATE DATABASE urlshortener;
CREATE USER 'urlshortener_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON urlshortener.* TO 'urlshortener_user'@'localhost';
FLUSH PRIVILEGES;
```

##### For PostgreSQL:

```sql
CREATE DATABASE urlshortener;
CREATE USER urlshortener_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE urlshortener TO urlshortener_user;
```

#### Configure Environment Variables

Set the following environment variables:

##### Development:
```bash
export DB_URL_DEV="jdbc:mysql://localhost:3306/urlshortener"
export DB_USERNAME="urlshortener_user"
export DB_PASSWORD="your_password"
```

##### Production:
```bash
export DB_URL_PROD="jdbc:mysql://your-production-host:3306/urlshortener"
export DB_USERNAME="urlshortener_user"
export DB_PASSWORD="your_secure_password"
```

#### Build the Backend

```bash
cd Server
./mvnw clean install
```

Or if you have Maven installed globally:

```bash
mvn clean install
```

#### Run the Backend Server

##### Development Mode:
```bash
./mvnw spring-boot:run
```

##### Production Mode:
```bash
export SPRING_PROFILES_ACTIVE=prod
./mvnw spring-boot:run
```

Or run the JAR directly:

```bash
java -jar target/urlshortener-0.0.1-SNAPSHOT.jar
```

The backend API will start on `http://localhost:8080`

---

### 3. Frontend Setup (Angular)

#### Install Node Dependencies

```bash
cd Client
npm install
```

This will install all required Angular dependencies including:
- Angular Core modules (12.2.0)
- Angular Router
- Angular Forms
- RxJS
- TypeScript
- Development tools

#### Configure API Endpoint

Update the environment files if your backend is running on a different host/port:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

#### Run the Angular Development Server

```bash
npm start
# or
ng serve
```

The Angular application will be available at `http://localhost:4200`

**Default Settings:**
- Development server runs on port 4200
- Auto-reload enabled (watches for file changes)
- Source maps enabled for debugging
- Proxy configuration for API calls (if needed)

#### Build for Production

```bash
npm run build
# or
ng build --configuration production
```

Production build output will be in `Client/dist/client/`

---

### 4. Running the Full Stack Application

To run both backend and frontend simultaneously:

**Terminal 1 - Backend:**
```bash
cd Server
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd Client
npm start
```

Then open your browser and navigate to:
- **Frontend UI**: `http://localhost:4200`
- **Backend API**: `http://localhost:8080/api`

---

### 5. First Time Setup - Create Admin User

After starting the application, you can:

1. **Register a new account** via the UI at `http://localhost:4200/register`
2. **Or use the API directly:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "role": "ADMIN"
  }'
```

Then login with your credentials at `http://localhost:4200/login`

## 🔧 Configuration

### Application Profiles

Shortify supports multiple environment profiles:

#### Development Profile (`dev`)
- Auto-creates/updates database schema
- SQL logging enabled
- Smaller connection pool (2-10 connections)
- Detailed error messages

#### Production Profile (`prod`)
- Schema validation only (no auto-updates)
- SQL logging disabled
- Larger connection pool (10-30 connections)
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes
- Max connection lifetime: 30 minutes

### Environment Configuration

Edit the appropriate properties file:

- **Development**: `src/main/resources/application-dev.properties`
- **Production**: `src/main/resources/application-prod.properties`

Key configuration options:

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Connection Pool
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=10

# Server
server.port=8080
```

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### 1. Shorten URL

**Endpoint:** `POST /api/shortUrl/shorten`

**Description:** Shorten a long URL

**Request Parameters:**
- `longUrl` (String, required) - The URL to be shortened

**Example Request:**
```bash
curl -X POST "http://localhost:8080/api/shortUrl/shorten?longUrl=https://www.example.com/very/long/url/path"
```

**Example Response:**
```json
{
  "status": true,
  "message": "URL shortened successfully",
  "data": "http://localhost:8080/abc123",
  "statusCode": 200
}
```

### Response Format

All API responses follow this structure:

```json
{
  "status": boolean,
  "message": "string",
  "data": object,
  "statusCode": number,
  "token": "string (optional)",
  "expiresInSec": number (optional)
}
```

## 💾 Database Schema

### ShortUrl Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| short_url | VARCHAR(255) | UNIQUE, NOT NULL | Short URL code |
| original_url | TEXT | NOT NULL | Original long URL |
| created_at | TIMESTAMP | NULL | Creation timestamp |
| expiration_time | TIMESTAMP | NULL | Expiration timestamp |
| user_id | BIGINT | FOREIGN KEY | Reference to users table |
| is_active | INT | NULL | Active status (1=active, 0=inactive) |
| click_count | BIGINT | NULL | Number of clicks/redirects |

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| user_name | VARCHAR(255) | UNIQUE, NOT NULL | Username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| role | VARCHAR(50) | NOT NULL | User role (USER, ADMIN) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | NULL | Last update timestamp |
| is_active | INT | NULL | Account status |
| is_premium | INT | NULL | Premium subscription status |

### Entity Relationships

- **User → ShortUrl**: One-to-Many (One user can create many short URLs)
- Cascade delete: Deleting a user deletes all their short URLs
- Lazy loading: Short URLs are loaded only when accessed

## 🧪 Testing

### Backend Testing (Spring Boot)

#### Run All Tests

```bash
cd Server
./mvnw test
```

#### Run Specific Test Class

```bash
./mvnw test -Dtest=UrlshortenerApplicationTests
```

#### Test Coverage

The backend includes test dependencies for:
- Unit testing with JUnit 5
- Integration testing with Spring Boot Test
- Repository testing with Data JPA Test
- Controller testing with WebMvc Test
- Validation testing

---

### Frontend Testing (Angular)

#### Run Unit Tests

```bash
cd Client
npm test
# or
ng test
```

This runs unit tests using Karma test runner with Jasmine framework.

#### Run Tests in Headless Mode (CI/CD)

```bash
ng test --watch=false --browsers=ChromeHeadless
```

#### Run Tests with Code Coverage

```bash
ng test --code-coverage
```

Coverage report will be generated in `Client/coverage/`

#### Run End-to-End Tests

```bash
ng e2e
```

#### Test Structure

Angular tests are located alongside their components:
- `*.spec.ts` - Unit test files
- Tests for components, services, guards, and interceptors
- Mocking HTTP requests with HttpClientTestingModule
- Testing routing with RouterTestingModule

**Example Test:**
```typescript
describe('LoginComponent', () => {
  it('should validate email format', () => {
    const component = fixture.componentInstance;
    component.loginForm.controls['email'].setValue('invalid-email');
    expect(component.loginForm.controls['email'].valid).toBeFalsy();
  });
});
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:8080/actuator/health
```

**Response:**
```json
{
  "status": "UP"
}
```

### Available Actuator Endpoints

- `/actuator/health` - Application health status
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics

## 🚢 Deployment

### Backend Deployment

#### Building for Production

1. Set the production profile:
```bash
export SPRING_PROFILES_ACTIVE=prod
```

2. Build the JAR:
```bash
cd Server
./mvnw clean package -DskipTests
```

3. The executable JAR will be in `Server/target/urlshortener-0.0.1-SNAPSHOT.jar`

#### Docker Deployment (Recommended)

Create a `Dockerfile` in the Server directory:

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/urlshortener-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:

```bash
docker build -t shortify-backend:latest .
docker run -p 8080:8080 \
  -e DB_URL_PROD="jdbc:mysql://host:3306/urlshortener" \
  -e DB_USERNAME="user" \
  -e DB_PASSWORD="password" \
  shortify-backend:latest
```

---

### Frontend Deployment

#### Building for Production

```bash
cd Client
npm run build
# or
ng build --configuration production
```

This creates an optimized production build in `Client/dist/client/` with:
- Minified JavaScript bundles
- Tree-shaking for smaller bundle size
- Ahead-of-Time (AOT) compilation
- Production environment configuration
- Optimized images and assets

#### Static File Hosting Options

**1. Nginx Server**

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Dockerfile for Angular:**

```dockerfile
# Build stage
FROM node:14-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t shortify-frontend:latest .
docker run -p 80:80 shortify-frontend:latest
```

**2. Apache Server**

Configure `.htaccess` for Angular routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**3. Cloud Hosting Platforms**

Deploy Angular app to various platforms:

- **Netlify**: 
  ```bash
  npm install -g netlify-cli
  netlify deploy --prod --dir=dist/client
  ```

- **Vercel**:
  ```bash
  npm install -g vercel
  vercel --prod
  ```

- **AWS S3 + CloudFront**:
  ```bash
  aws s3 sync dist/client/ s3://your-bucket-name
  aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
  ```

- **Firebase Hosting**:
  ```bash
  npm install -g firebase-tools
  firebase init hosting
  firebase deploy
  ```

- **Azure Static Web Apps**:
  Deployable directly via GitHub Actions or Azure CLI

- **Google Cloud Storage**:
  ```bash
  gsutil -m rsync -r dist/client gs://your-bucket-name
  ```

---

### Full Stack Docker Compose

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: urlshortener
      MYSQL_USER: urlshortener_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - shortify-network

  backend:
    build: ./Server
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL_PROD: jdbc:mysql://database:3306/urlshortener
      DB_USERNAME: urlshortener_user
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      - database
    networks:
      - shortify-network

  frontend:
    build: ./Client
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - shortify-network

volumes:
  mysql-data:

networks:
  shortify-network:
    driver: bridge
```

Run the entire stack:

```bash
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api

---

### Cloud Deployment Options

Shortify can be deployed on:

**Backend:**
- **AWS** (Elastic Beanstalk, ECS, EC2, Lambda with API Gateway)
- **Google Cloud Platform** (App Engine, Cloud Run, GKE)
- **Azure** (App Service, AKS, Container Instances)
- **Heroku** (with PostgreSQL addon)
- **DigitalOcean App Platform**

**Frontend:**
- **Netlify** (Recommended for Angular)
- **Vercel**
- **AWS S3 + CloudFront**
- **Firebase Hosting**
- **Azure Static Web Apps**
- **GitHub Pages**
- **Google Cloud Storage**

---

### Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure secure database credentials
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL for both frontend and backend
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up alerts for health check failures
- [ ] Implement rate limiting (recommended)
- [ ] Enable Spring Security (currently disabled)
- [ ] Configure CORS for production (restrict allowed origins)
- [ ] Set up CDN for frontend assets
- [ ] Enable gzip compression for API responses
- [ ] Configure proper caching headers
- [ ] Set up automated backups
- [ ] Implement monitoring and logging (ELK stack, CloudWatch, etc.)
- [ ] Configure Angular production environment variables
- [ ] Enable service worker for PWA features (optional)
- [ ] Set up analytics tracking (Google Analytics, etc.)

## 🔒 Security Considerations

### Current Implementation

- CORS enabled for all origins (configure for production)
- Health check details hidden
- Password fields should be encrypted before storage

### Recommended Enhancements

1. **Enable Spring Security** (currently commented out in pom.xml)
2. **Add authentication** - JWT tokens or session-based
3. **Implement rate limiting** - Prevent abuse
4. **Use HTTPS** - Encrypt data in transit
5. **Input validation** - Validate and sanitize URLs
6. **SQL injection prevention** - Use parameterized queries (already implemented via JPA)
7. **CORS configuration** - Restrict allowed origins in production

## 🛠️ Development

### Backend Development

#### Code Style

This project uses:
- **Lombok** for reducing boilerplate code
- **JPA conventions** for database operations
- **RESTful API** design principles

#### Adding New Features

1. Create/update entities in `entity/` package
2. Define repository methods in `repository/` package
3. Implement business logic in `service/` package
4. Expose endpoints in `controller/` package
5. Create DTOs in `models/` package if needed
6. Write tests for new functionality

#### Running in Development

```bash
cd Server
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Enable auto-reload for faster development.

---

### Frontend Development

#### Angular Development Server

```bash
cd Client
npm start
# or
ng serve
```

The dev server will:
- Start on `http://localhost:4200`
- Auto-reload on file changes
- Provide source maps for debugging
- Enable detailed error messages

#### Code Generation

Angular CLI provides scaffolding commands:

**Generate a new component:**
```bash
ng generate component features/dashboard/url-list
# or shorthand
ng g c features/dashboard/url-list
```

**Generate a new service:**
```bash
ng generate service core/services/url
# or shorthand
ng g s core/services/url
```

**Generate a new module:**
```bash
ng generate module features/dashboard --routing
```

**Generate a guard:**
```bash
ng generate guard core/guards/auth
```

**Generate an interceptor:**
```bash
ng generate interceptor core/interceptors/jwt
```

#### Project Structure Guidelines

Follow this modular architecture:

```
src/app/
├── core/              # Singleton services, guards, interceptors
├── features/          # Feature modules (lazy-loaded)
├── shared/            # Shared components, directives, pipes
└── app-routing.module.ts
```

#### Coding Standards

**TypeScript:**
- Use strict TypeScript (`strict: true` in tsconfig.json)
- Prefer interfaces over classes for data models
- Use async/await with observables where appropriate
- Follow Angular style guide

**Components:**
- Keep components small and focused
- Use OnPush change detection for performance
- Unsubscribe from observables in ngOnDestroy
- Use async pipe in templates when possible

**Services:**
- Keep business logic in services, not components
- Use dependency injection
- Return observables from HTTP calls
- Handle errors appropriately

**Example Service Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class URLService {
  private apiUrl = `${environment.apiUrl}/shortUrl`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getUserUrls(userId: number): Observable<ShortUrl[]> {
    return this.http.get<ApiResponse<ShortUrl[]>>(
      `${this.apiUrl}/user/${userId}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        this.notificationService.error('Failed to load URLs');
        return throwError(() => error);
      })
    );
  }
}
```

#### Hot Module Replacement

For even faster development, enable HMR:

```bash
ng serve --hmr
```

#### Linting

Run ESLint to check code quality:

```bash
ng lint
```

#### Formatting

Use Prettier for consistent code formatting (if configured):

```bash
npm run format
```

---

### Debugging

#### Backend Debugging

1. Run Spring Boot with debug enabled:
```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

2. Attach your IDE debugger to port 5005

#### Frontend Debugging

**Chrome DevTools:**
- Open Chrome DevTools (F12)
- Use breakpoints in Sources tab
- Angular DevTools extension for component inspection

**VS Code Debugging:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Angular Debug",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}/Client/src"
    }
  ]
}
```

---

### Performance Optimization

#### Backend:
- Use database connection pooling (HikariCP)
- Implement caching (Redis recommended)
- Add database indexes
- Use pagination for large datasets
- Optimize SQL queries

#### Frontend:
- Lazy load feature modules
- Use OnPush change detection strategy
- Implement virtual scrolling for large lists
- Optimize bundle size with tree-shaking
- Use trackBy with *ngFor
- Implement service workers for caching

---

## ⚡ Quick Start Commands Reference

### Backend (Spring Boot)

```bash
# Navigate to Server directory
cd Server

# Install dependencies and build
./mvnw clean install

# Run in development mode
./mvnw spring-boot:run

# Run in production mode
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run

# Run tests
./mvnw test

# Build production JAR
./mvnw clean package -DskipTests
```

### Frontend (Angular)

```bash
# Navigate to Client directory
cd Client

# Install dependencies
npm install

# Start development server (http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
ng test --code-coverage

# Generate a component
ng generate component features/my-component

# Generate a service
ng generate service core/services/my-service

# Lint code
ng lint
```

### Docker Commands

```bash
# Run full stack with Docker Compose
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Guidelines

- Follow Java naming conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 Roadmap

### Planned Backend Features

- [ ] URL redirection endpoint
- [ ] Custom short URL codes
- [ ] URL expiration automation
- [ ] Advanced analytics API endpoints
- [ ] QR code generation API
- [ ] API rate limiting
- [ ] User authentication and authorization (JWT)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Admin dashboard API
- [ ] Bulk URL shortening API
- [ ] API key management
- [ ] Redis caching layer
- [ ] URL validation and sanitization
- [ ] WebSocket support for real-time updates
- [ ] GraphQL API (optional)

### Planned Frontend Features

- [ ] Complete authentication flow (Login, Register, Forgot Password)
- [ ] User-specific URL dashboard with CRUD operations
- [ ] Advanced analytics dashboard with charts (Chart.js or ngx-charts)
- [ ] QR code generation and display
- [ ] Bulk URL shortening interface
- [ ] URL categorization and tagging system
- [ ] Search and filter functionality
- [ ] Sorting capabilities (by date, clicks, etc.)
- [ ] Export URLs to CSV/Excel
- [ ] Dark mode / Light mode toggle
- [ ] Multiple language support (i18n)
- [ ] Progressive Web App (PWA) features
- [ ] Push notifications
- [ ] Social media sharing integration
- [ ] Custom domain support UI
- [ ] URL preview with link thumbnails
- [ ] Keyboard shortcuts for power users
- [ ] Drag-and-drop URL organization
- [ ] Advanced user profile with avatar upload
- [ ] Two-factor authentication (2FA) setup
- [ ] Activity log and audit trail
- [ ] Custom themes and branding
- [ ] Responsive mobile app experience
- [ ] Accessibility improvements (WCAG 2.1 AA compliance)

### Infrastructure & DevOps

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing (unit, integration, e2e)
- [ ] Docker containerization (completed)
- [ ] Kubernetes deployment configuration
- [ ] Monitoring and alerting setup
- [ ] ELK stack for logging
- [ ] Performance monitoring (New Relic, Datadog)
- [ ] Automated backups
- [ ] Blue-green deployment strategy
- [ ] Load balancing configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sohith Reddy**

- GitHub: [@Sohith-reddy](https://github.com/Sohith-reddy)
- Repository: [Shortify](https://github.com/Sohith-reddy/Shortify)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- HikariCP for high-performance connection pooling
- The open-source community

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

---

**Built with ❤️ using Spring Boot**

*Shortify - Making URLs shorter, one link at a time.*
