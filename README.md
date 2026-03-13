# Shortify - Production-Ready URL Shortening Service

[![Java Version](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, end-to-end URL shortening service built with Spring Boot, designed for scalability, performance, and reliability.

## 🎯 Overview

Shortify is a comprehensive URL shortening service that transforms long, unwieldy URLs into short, manageable links. Built with enterprise-grade Spring Boot architecture, this service provides a robust foundation for production deployment with features like user management, URL analytics, expiration controls, and more.

## ✨ Key Features

### Core Functionality
- **URL Shortening** - Convert long URLs into short, easy-to-share links
- **Custom Short URLs** - Support for custom short codes (planned)
- **URL Analytics** - Track click counts and usage statistics
- **URL Expiration** - Set expiration dates for temporary links
- **User Management** - Multi-user support with role-based access control
- **Premium Accounts** - Support for premium user features

### Technical Features
- **RESTful API** - Clean, well-documented API endpoints
- **Multi-Database Support** - MySQL and PostgreSQL compatibility
- **Environment Profiles** - Separate configurations for development and production
- **Health Monitoring** - Spring Boot Actuator integration
- **CORS Support** - Cross-Origin Resource Sharing enabled
- **Connection Pooling** - HikariCP for optimized database connections
- **Production Ready** - Configured for deployment at scale

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | Spring Boot 4.0.3 |
| **Java Version** | 17 (LTS) |
| **ORM** | JPA/Hibernate |
| **Database** | MySQL / PostgreSQL |
| **Connection Pool** | HikariCP |
| **Build Tool** | Maven 3.x |
| **Monitoring** | Spring Boot Actuator |

### Project Structure

```
Shortify/
├── src/
│   ├── main/
│   │   ├── java/com/urlshortener/urlshortener/
│   │   │   ├── controller/         # REST API Controllers
│   │   │   ├── service/            # Business Logic
│   │   │   ├── repository/         # Data Access Layer
│   │   │   ├── entity/             # JPA Entities
│   │   │   ├── models/             # DTOs and Request/Response Models
│   │   │   └── enums/              # Enumerations
│   │   └── resources/
│   │       ├── application.properties           # Main Configuration
│   │       ├── application-dev.properties       # Development Profile
│   │       └── application-prod.properties      # Production Profile
│   └── test/                       # Test Suite
├── pom.xml                         # Maven Dependencies
└── README.md                       # This File
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher ([Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html))
- **Maven 3.6+** ([Download](https://maven.apache.org/download.cgi))
- **MySQL 8.0+** or **PostgreSQL 12+** ([MySQL](https://dev.mysql.com/downloads/) | [PostgreSQL](https://www.postgresql.org/download/))
- **Git** (for cloning the repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sohith-reddy/Shortify.git
cd Shortify
```

### 2. Database Setup

#### For MySQL:

```sql
CREATE DATABASE urlshortener;
CREATE USER 'urlshortener_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON urlshortener.* TO 'urlshortener_user'@'localhost';
FLUSH PRIVILEGES;
```

#### For PostgreSQL:

```sql
CREATE DATABASE urlshortener;
CREATE USER urlshortener_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE urlshortener TO urlshortener_user;
```

### 3. Configure Environment Variables

Set the following environment variables:

#### Development:
```bash
export DB_URL_DEV="jdbc:mysql://localhost:3306/urlshortener"
export DB_USERNAME="urlshortener_user"
export DB_PASSWORD="your_password"
```

#### Production:
```bash
export DB_URL_PROD="jdbc:mysql://your-production-host:3306/urlshortener"
export DB_USERNAME="urlshortener_user"
export DB_PASSWORD="your_secure_password"
```

### 4. Build the Application

```bash
./mvnw clean install
```

Or if you have Maven installed globally:

```bash
mvn clean install
```

### 5. Run the Application

#### Development Mode:
```bash
./mvnw spring-boot:run
```

#### Production Mode:
```bash
export SPRING_PROFILES_ACTIVE=prod
./mvnw spring-boot:run
```

Or run the JAR directly:

```bash
java -jar target/urlshortener-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

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

### Run All Tests

```bash
./mvnw test
```

### Run Specific Test Class

```bash
./mvnw test -Dtest=UrlshortenerApplicationTests
```

### Test Coverage

The project includes test dependencies for:
- Unit testing with JUnit 5
- Integration testing with Spring Boot Test
- Repository testing with Data JPA Test
- Controller testing with WebMvc Test
- Validation testing

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

### Building for Production

1. Set the production profile:
```bash
export SPRING_PROFILES_ACTIVE=prod
```

2. Build the JAR:
```bash
./mvnw clean package -DskipTests
```

3. The executable JAR will be in `target/urlshortener-0.0.1-SNAPSHOT.jar`

### Docker Deployment (Recommended)

Create a `Dockerfile`:

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
docker build -t shortify:latest .
docker run -p 8080:8080 \
  -e DB_URL_PROD="jdbc:mysql://host:3306/urlshortener" \
  -e DB_USERNAME="user" \
  -e DB_PASSWORD="password" \
  shortify:latest
```

### Cloud Deployment Options

Shortify can be deployed on:

- **AWS** (Elastic Beanstalk, ECS, EC2)
- **Google Cloud Platform** (App Engine, Cloud Run, GKE)
- **Azure** (App Service, AKS)
- **Heroku**
- **DigitalOcean App Platform**

### Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Configure secure database credentials
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up alerts for health check failures
- [ ] Implement rate limiting (recommended)
- [ ] Enable Spring Security (currently disabled)

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

### Code Style

This project uses:
- **Lombok** for reducing boilerplate code
- **JPA conventions** for database operations
- **RESTful API** design principles

### Adding New Features

1. Create/update entities in `entity/` package
2. Define repository methods in `repository/` package
3. Implement business logic in `service/` package
4. Expose endpoints in `controller/` package
5. Create DTOs in `models/` package if needed
6. Write tests for new functionality

### Running in Development

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Enable auto-reload for faster development.

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

### Planned Features

- [ ] URL redirection endpoint
- [ ] Custom short URL codes
- [ ] URL expiration automation
- [ ] Click analytics dashboard
- [ ] QR code generation
- [ ] API rate limiting
- [ ] User authentication and authorization
- [ ] Admin dashboard
- [ ] Bulk URL shortening
- [ ] API key management
- [ ] Redis caching layer
- [ ] URL validation and sanitization

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
