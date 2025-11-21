# 🏗️ MINDORA - Complete Backend Architecture & System Design

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Security](#authentication--security)
6. [Real-time Features](#real-time-features)
7. [File Storage](#file-storage)
8. [Third-Party Integrations](#third-party-integrations)
9. [Infrastructure & DevOps](#infrastructure--devops)
10. [Monitoring & Analytics](#monitoring--analytics)

---

## 🎯 System Overview

**Mindora** is a comprehensive mental health platform for Rwanda that connects users with mental health professionals, provides mindfulness exercises, community support, and progress tracking.

### Core Features
- User Authentication & Profile Management
- Doctor Discovery & Booking System
- Video Call Therapy Sessions
- Mindfulness Exercise Library
- Community Support Groups
- Activity & Progress Tracking
- Real-time Notifications
- Payment Processing (Mobile Money - MTN, Airtel)

### Architecture Pattern
- **Backend**: RESTful API + WebSocket for real-time features
- **Database**: PostgreSQL (primary) + Redis (cache/sessions)
- **Storage**: AWS S3 / Cloudinary for media files
- **Video**: Twilio / Agora for video calls
- **Payments**: Flutterwave / PayPack (Rwanda-specific)

---

## 🛠️ Technology Stack

### Backend Framework
```
- Node.js v18+ with Express.js / NestJS
- TypeScript for type safety
- Alternative: Python with FastAPI / Django REST Framework
```

### Database
```
- PostgreSQL 14+ (Primary database)
- Redis 7+ (Caching, sessions, real-time data)
- MongoDB (Optional: for activity logs/analytics)
```

### Authentication
```
- JWT (JSON Web Tokens)
- Refresh Token rotation
- OAuth 2.0 (Google, Facebook)
- Biometric authentication support
```

### Real-time Communication
```
- Socket.io / WebSocket
- Twilio Video API / Agora SDK
- Push Notifications: Firebase Cloud Messaging (FCM)
```


### Payment Processing
```
- Flutterwave (MTN Mobile Money, Airtel Money)
- PayPack (Rwanda-specific)
- Stripe (International cards)
```

### File Storage
```
- AWS S3 / DigitalOcean Spaces
- Cloudinary (Image optimization)
```

### Email & SMS
```
- SendGrid / AWS SES (Email)
- Twilio / Africa's Talking (SMS for Rwanda)
```

---

## 🗄️ Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Profile
    bio TEXT,
    emergency_contact VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    
    -- Settings
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    biometric_enabled BOOLEAN DEFAULT false,
    
    -- Stats
    total_sessions INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    day_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP,
    
    -- Metadata
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_completed_onboarding BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_account_status ON users(account_status);
```

### 2. Doctors Table
```sql
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Info
    specialty VARCHAR(100) NOT NULL, -- Psychologist, Psychiatrist, Therapist, Counselor
    license_number VARCHAR(100) UNIQUE NOT NULL,
    years_of_experience INTEGER NOT NULL,
    education TEXT[], -- Array of degrees
    certifications TEXT[], -- Array of certifications
    
    -- Practice Details
    bio TEXT NOT NULL,
    languages TEXT[] DEFAULT ARRAY['English', 'Kinyarwanda'], -- Languages spoken
    consultation_fee INTEGER NOT NULL, -- In RWF
    currency VARCHAR(3) DEFAULT 'RWF',
    
    -- Availability
    availability JSONB, -- {"monday": ["09:00-12:00", "14:00-17:00"], ...}
    timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
    
    -- Location
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Rwanda',
    
    -- Ratings
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_patients INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    accepts_new_patients BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_rating ON doctors(average_rating DESC);
CREATE INDEX idx_doctors_verified ON doctors(is_verified);
```


### 3. Appointments Table
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    session_type VARCHAR(20) NOT NULL, -- 'video', 'in-person'
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, in-progress, completed, cancelled, no-show
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded, failed
    payment_amount INTEGER NOT NULL,
    payment_method VARCHAR(50), -- mtn_mobile_money, airtel_money, card
    payment_reference VARCHAR(255),
    
    -- Video Call (if applicable)
    video_room_id VARCHAR(255),
    video_room_url TEXT,
    video_started_at TIMESTAMP,
    video_ended_at TIMESTAMP,
    
    -- Notes
    patient_notes TEXT, -- Notes from patient before session
    doctor_notes TEXT, -- Notes from doctor after session
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_payment_status ON appointments(payment_status);
```

### 4. Exercises Table
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Exercise Info
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL, -- Step-by-step instructions
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- breathing, meditation, mindfulness, relaxation
    difficulty VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced
    
    -- Media
    thumbnail_url TEXT,
    audio_url TEXT, -- Guided audio
    video_url TEXT, -- Guided video
    
    -- Content
    benefits TEXT[], -- Array of benefits
    prerequisites TEXT[], -- What user should know
    
    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_featured ON exercises(is_featured);
```

### 5. User Exercise Sessions Table
```sql
CREATE TABLE user_exercise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Session Details
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_seconds INTEGER, -- Actual duration
    completed BOOLEAN DEFAULT false,
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_exercises_user ON user_exercise_sessions(user_id);
CREATE INDEX idx_user_exercises_exercise ON user_exercise_sessions(exercise_id);
CREATE INDEX idx_user_exercises_date ON user_exercise_sessions(started_at);
```


### 6. Communities Table
```sql
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Community Info
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- anxiety, depression, trauma, general
    
    -- Media
    image_url TEXT,
    cover_image_url TEXT,
    
    -- Settings
    is_private BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    
    -- Moderation
    created_by UUID REFERENCES users(id),
    moderators UUID[], -- Array of user IDs
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communities_category ON communities(category);
CREATE INDEX idx_communities_active ON communities(is_active);
```

### 7. Community Members Table
```sql
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership
    role VARCHAR(20) DEFAULT 'member', -- member, moderator, admin
    status VARCHAR(20) DEFAULT 'active', -- active, banned, left
    
    -- Activity
    post_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
```

### 8. Community Posts Table
```sql
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of image/video URLs
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_reported BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_posts_community ON community_posts(community_id);
CREATE INDEX idx_posts_user ON community_posts(user_id);
CREATE INDEX idx_posts_created ON community_posts(created_at DESC);
```

### 9. Post Likes Table
```sql
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
```

### 10. Post Comments Table
```sql
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id), -- For nested comments
    
    -- Content
    content TEXT NOT NULL,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    
    -- Status
    is_deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_post ON post_comments(post_id);
CREATE INDEX idx_comments_user ON post_comments(user_id);
CREATE INDEX idx_comments_parent ON post_comments(parent_comment_id);
```


### 11. Mood Tracking Table
```sql
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Mood Data
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5), -- 1=Very Sad, 5=Very Happy
    mood_label VARCHAR(50), -- sad, neutral, happy, etc.
    
    -- Context
    notes TEXT,
    triggers TEXT[], -- What caused this mood
    activities TEXT[], -- What user was doing
    
    -- Timestamp
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mood_user ON mood_entries(user_id);
CREATE INDEX idx_mood_date ON mood_entries(recorded_at);
```

### 12. Activity Log Table
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- session, exercise, mood, appointment, community
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Metadata
    icon VARCHAR(50),
    color VARCHAR(20),
    
    -- Related Entities
    related_entity_type VARCHAR(50), -- appointment, exercise, post, etc.
    related_entity_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_date ON activity_logs(created_at DESC);
```

### 13. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- appointment_reminder, new_message, community_post, etc.
    
    -- Action
    action_url TEXT, -- Deep link to specific screen
    action_data JSONB, -- Additional data for the action
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Delivery
    sent_via VARCHAR(20)[], -- ['push', 'email', 'sms']
    push_sent BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);
```

### 14. Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Aspects (optional detailed ratings)
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    
    -- Status
    is_verified BOOLEAN DEFAULT false, -- Verified that appointment happened
    is_published BOOLEAN DEFAULT true,
    is_reported BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, appointment_id)
);

CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```


### 15. Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    
    -- Payment Details
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    payment_method VARCHAR(50) NOT NULL, -- mtn_mobile_money, airtel_money, card
    
    -- Provider Details
    provider VARCHAR(50), -- flutterwave, paypack, stripe
    transaction_id VARCHAR(255) UNIQUE,
    provider_reference VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    failure_reason TEXT,
    
    -- Metadata
    metadata JSONB, -- Additional payment data
    
    -- Timestamps
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
```

### 16. Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token
    token VARCHAR(500) UNIQUE NOT NULL,
    
    -- Device Info
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- ios, android, web
    
    -- Security
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    
    -- Expiry
    expires_at TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### 17. Health Records Table (Optional - HIPAA Compliant)
```sql
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    
    -- Record Details
    record_type VARCHAR(50) NOT NULL, -- diagnosis, prescription, note, report
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Files
    file_urls TEXT[], -- Encrypted file URLs
    
    -- Privacy
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_id VARCHAR(255),
    
    -- Access Control
    shared_with UUID[], -- Array of doctor IDs who can access
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_records_user ON health_records(user_id);
CREATE INDEX idx_health_records_doctor ON health_records(doctor_id);
```

### 18. Emergency Contacts Table
```sql
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Contact Info
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Priority
    priority INTEGER DEFAULT 1, -- 1 = primary, 2 = secondary, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
```


---

## 🔌 API Endpoints

### Base URL
```
Production: https://api.mindora.rw/v1
Staging: https://api-staging.mindora.rw/v1
Development: http://localhost:3000/api/v1
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+250788123456",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "memberSince": "2024-11-20T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "tokens": { /* tokens object */ }
  }
}
```

#### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

#### 4. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "john@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

#### 6. Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### 7. Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

Request Body:
{
  "token": "verification-token-from-email"
}

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully"
}
```


### User Profile Endpoints

#### 8. Get Current User Profile
```http
GET /users/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+250788123456",
    "location": "Kigali, Rwanda",
    "avatar": "https://...",
    "bio": "...",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "stats": {
      "totalSessions": 24,
      "totalExercises": 67,
      "dayStreak": 12
    },
    "settings": {
      "theme": "dark",
      "notificationsEnabled": true,
      "soundEnabled": true,
      "biometricEnabled": false
    },
    "memberSince": "2024-01-15T10:00:00Z"
  }
}
```

#### 9. Update User Profile
```http
PATCH /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "name": "John Updated",
  "phone": "+250788999888",
  "location": "Kigali, Rwanda",
  "bio": "Mental health advocate"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated user object */ }
}
```

#### 10. Upload Avatar
```http
POST /users/me/avatar
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Request Body:
- avatar: [file]

Response: 200 OK
{
  "success": true,
  "data": {
    "avatarUrl": "https://storage.mindora.rw/avatars/uuid.jpg"
  }
}
```

#### 11. Update Settings
```http
PATCH /users/me/settings
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "theme": "dark",
  "notificationsEnabled": true,
  "soundEnabled": false,
  "language": "en"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated settings */ }
}
```

#### 12. Delete Account
```http
DELETE /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "password": "current-password",
  "reason": "No longer needed"
}

Response: 200 OK
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Doctor Endpoints

#### 13. Get All Doctors
```http
GET /doctors?page=1&limit=20&specialty=psychologist&city=Kigali&sortBy=rating
Authorization: Bearer {accessToken}

Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20, max: 100)
- specialty: string (psychologist, psychiatrist, therapist, counselor)
- city: string
- minRating: number (1-5)
- maxPrice: integer
- availability: string (today, tomorrow, this_week)
- sortBy: string (rating, price, experience)
- search: string (search by name)

Response: 200 OK
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "name": "Dr. Uwimana Marie",
        "specialty": "Clinical Psychologist",
        "avatar": "https://...",
        "rating": 4.9,
        "totalReviews": 156,
        "experience": 8,
        "consultationFee": 25000,
        "currency": "RWF",
        "languages": ["English", "Kinyarwanda", "French"],
        "city": "Kigali",
        "isVerified": true,
        "isAvailable": true,
        "nextAvailableSlot": "2024-11-21T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### 14. Get Doctor Details
```http
GET /doctors/:doctorId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Uwimana Marie",
    "specialty": "Clinical Psychologist",
    "avatar": "https://...",
    "bio": "Specialized in anxiety and depression...",
    "education": ["PhD in Clinical Psychology - University of Rwanda"],
    "certifications": ["Licensed Clinical Psychologist", "CBT Certified"],
    "rating": 4.9,
    "totalReviews": 156,
    "totalPatients": 320,
    "experience": 8,
    "consultationFee": 25000,
    "currency": "RWF",
    "languages": ["English", "Kinyarwanda", "French"],
    "clinicName": "Mindora Wellness Center",
    "clinicAddress": "KN 5 Ave, Kigali",
    "city": "Kigali",
    "availability": {
      "monday": ["09:00-12:00", "14:00-17:00"],
      "tuesday": ["09:00-12:00", "14:00-17:00"],
      "wednesday": ["09:00-12:00"],
      "thursday": ["09:00-12:00", "14:00-17:00"],
      "friday": ["09:00-12:00", "14:00-17:00"]
    },
    "isVerified": true,
    "isAvailable": true
  }
}
```

#### 15. Get Doctor Availability
```http
GET /doctors/:doctorId/availability?date=2024-11-21
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "date": "2024-11-21",
    "availableSlots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "10:00",
        "available": false
      },
      {
        "time": "11:00",
        "available": true
      }
    ]
  }
}
```

#### 16. Get Doctor Reviews
```http
GET /doctors/:doctorId/reviews?page=1&limit=10
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "user": {
          "name": "Anonymous", // Or actual name if user allows
          "avatar": "https://..."
        },
        "rating": 5,
        "title": "Excellent therapist",
        "comment": "Very professional and helpful...",
        "createdAt": "2024-11-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```


### Appointment Endpoints

#### 17. Create Appointment
```http
POST /appointments
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "doctorId": "uuid",
  "appointmentDate": "2024-11-21",
  "appointmentTime": "10:00",
  "sessionType": "video",
  "patientNotes": "Feeling anxious lately..."
}

Response: 201 Created
{
  "success": true,
  "data": {
    "appointment": {
      "id": "uuid",
      "doctorId": "uuid",
      "doctorName": "Dr. Uwimana Marie",
      "appointmentDate": "2024-11-21",
      "appointmentTime": "10:00",
      "sessionType": "video",
      "status": "scheduled",
      "paymentStatus": "pending",
      "paymentAmount": 25000,
      "currency": "RWF"
    },
    "paymentUrl": "https://payment.mindora.rw/pay/uuid" // Redirect to payment
  }
}
```

#### 18. Get User Appointments
```http
GET /appointments?status=upcoming&page=1&limit=20
Authorization: Bearer {accessToken}

Query Parameters:
- status: string (upcoming, completed, cancelled, all)
- page: integer
- limit: integer

Response: 200 OK
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "doctor": {
          "id": "uuid",
          "name": "Dr. Uwimana Marie",
          "specialty": "Clinical Psychologist",
          "avatar": "https://..."
        },
        "appointmentDate": "2024-11-21",
        "appointmentTime": "10:00",
        "sessionType": "video",
        "status": "confirmed",
        "paymentStatus": "paid",
        "videoRoomUrl": "https://video.mindora.rw/room/uuid",
        "canJoin": true, // Can join 15 mins before
        "canCancel": true, // Can cancel 24h before
        "createdAt": "2024-11-20T10:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 19. Get Appointment Details
```http
GET /appointments/:appointmentId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": { /* detailed appointment object */ }
}
```

#### 20. Cancel Appointment
```http
POST /appointments/:appointmentId/cancel
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "reason": "Schedule conflict"
}

Response: 200 OK
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "refundAmount": 25000,
    "refundStatus": "processing"
  }
}
```

#### 21. Reschedule Appointment
```http
POST /appointments/:appointmentId/reschedule
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "newDate": "2024-11-22",
  "newTime": "14:00"
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated appointment object */ }
}
```

#### 22. Join Video Call
```http
POST /appointments/:appointmentId/join
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "roomUrl": "https://video.mindora.rw/room/uuid",
    "token": "video-access-token",
    "expiresAt": "2024-11-21T11:00:00Z"
  }
}
```

#### 23. Submit Review
```http
POST /appointments/:appointmentId/review
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "rating": 5,
  "title": "Excellent session",
  "comment": "Very helpful and professional",
  "professionalismRating": 5,
  "communicationRating": 5,
  "effectivenessRating": 5
}

Response: 201 Created
{
  "success": true,
  "data": { /* review object */ }
}
```

### Exercise Endpoints

#### 24. Get All Exercises
```http
GET /exercises?category=meditation&difficulty=beginner&page=1&limit=20
Authorization: Bearer {accessToken}

Query Parameters:
- category: string (breathing, meditation, mindfulness, relaxation)
- difficulty: string (beginner, intermediate, advanced)
- page: integer
- limit: integer
- search: string

Response: 200 OK
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "title": "Deep Breathing",
        "description": "A simple breathing exercise...",
        "duration": 5,
        "category": "breathing",
        "difficulty": "beginner",
        "thumbnail": "https://...",
        "audioUrl": "https://...",
        "benefits": ["Reduces stress", "Improves focus"],
        "averageRating": 4.8,
        "completionCount": 1250
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 25. Get Exercise Details
```http
GET /exercises/:exerciseId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Deep Breathing",
    "description": "A simple breathing exercise...",
    "instructions": "1. Sit comfortably...\n2. Close your eyes...",
    "duration": 5,
    "category": "breathing",
    "difficulty": "beginner",
    "thumbnail": "https://...",
    "audioUrl": "https://...",
    "videoUrl": "https://...",
    "benefits": ["Reduces stress", "Improves focus"],
    "prerequisites": ["None"],
    "averageRating": 4.8,
    "completionCount": 1250,
    "userProgress": {
      "completed": true,
      "lastCompletedAt": "2024-11-20T10:00:00Z",
      "totalCompletions": 5
    }
  }
}
```

#### 26. Start Exercise Session
```http
POST /exercises/:exerciseId/start
Authorization: Bearer {accessToken}

Response: 201 Created
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "exerciseId": "uuid",
    "startedAt": "2024-11-20T10:00:00Z"
  }
}
```

#### 27. Complete Exercise Session
```http
POST /exercises/sessions/:sessionId/complete
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "durationSeconds": 300,
  "rating": 5,
  "feedback": "Very relaxing"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "completed": true,
    "pointsEarned": 10,
    "streakUpdated": true,
    "newStreak": 13
  }
}
```

#### 28. Get User Exercise History
```http
GET /exercises/history?page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "exercise": {
          "id": "uuid",
          "title": "Deep Breathing",
          "category": "breathing"
        },
        "startedAt": "2024-11-20T10:00:00Z",
        "completedAt": "2024-11-20T10:05:00Z",
        "duration": 300,
        "rating": 5
      }
    ],
    "stats": {
      "totalSessions": 67,
      "totalMinutes": 536,
      "favoriteCategory": "meditation"
    },
    "pagination": { /* pagination object */ }
  }
}
```


### Community Endpoints

#### 29. Get All Communities
```http
GET /communities?page=1&limit=20&category=anxiety
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "uuid",
        "name": "Ubwoba Support (Anxiety)",
        "description": "Support group for anxiety...",
        "category": "anxiety",
        "image": "https://...",
        "memberCount": 850,
        "postCount": 1240,
        "isJoined": true,
        "isPrivate": false
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 30. Get Community Details
```http
GET /communities/:communityId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ubwoba Support (Anxiety)",
    "description": "Support group for anxiety...",
    "category": "anxiety",
    "image": "https://...",
    "coverImage": "https://...",
    "memberCount": 850,
    "postCount": 1240,
    "isJoined": true,
    "isPrivate": false,
    "moderators": [
      {
        "id": "uuid",
        "name": "Moderator Name",
        "avatar": "https://..."
      }
    ],
    "rules": [
      "Be respectful",
      "No spam",
      "Support each other"
    ]
  }
}
```

#### 31. Join Community
```http
POST /communities/:communityId/join
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Joined community successfully"
}
```

#### 32. Leave Community
```http
POST /communities/:communityId/leave
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Left community successfully"
}
```

#### 33. Get Community Posts
```http
GET /communities/:communityId/posts?page=1&limit=20&sortBy=recent
Authorization: Bearer {accessToken}

Query Parameters:
- page: integer
- limit: integer
- sortBy: string (recent, popular, trending)

Response: 200 OK
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "author": {
          "id": "uuid",
          "name": "Mukamana Vestine",
          "avatar": "https://..."
        },
        "content": "Had a great session with my therapist...",
        "mediaUrls": [],
        "likeCount": 24,
        "commentCount": 8,
        "isLiked": false,
        "isPinned": false,
        "createdAt": "2024-11-20T08:00:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 34. Create Post
```http
POST /communities/:communityId/posts
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Request Body:
- content: string
- media: [files] (optional)

Response: 201 Created
{
  "success": true,
  "data": { /* post object */ }
}
```

#### 35. Like Post
```http
POST /posts/:postId/like
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 25
  }
}
```

#### 36. Unlike Post
```http
DELETE /posts/:postId/like
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "isLiked": false,
    "likeCount": 24
  }
}
```

#### 37. Get Post Comments
```http
GET /posts/:postId/comments?page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "author": {
          "id": "uuid",
          "name": "User Name",
          "avatar": "https://..."
        },
        "content": "Great to hear!",
        "likeCount": 5,
        "replies": [],
        "createdAt": "2024-11-20T08:30:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 38. Add Comment
```http
POST /posts/:postId/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "content": "Great to hear!",
  "parentCommentId": "uuid" // Optional, for replies
}

Response: 201 Created
{
  "success": true,
  "data": { /* comment object */ }
}
```

#### 39. Delete Post
```http
DELETE /posts/:postId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### 40. Report Post
```http
POST /posts/:postId/report
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "reason": "spam",
  "details": "This is spam content"
}

Response: 200 OK
{
  "success": true,
  "message": "Post reported successfully"
}
```


### Mood Tracking Endpoints

#### 41. Log Mood
```http
POST /mood
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "moodLevel": 4,
  "moodLabel": "happy",
  "notes": "Had a productive day",
  "triggers": ["work_success", "good_sleep"],
  "activities": ["exercise", "meditation"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "moodLevel": 4,
    "moodLabel": "happy",
    "recordedAt": "2024-11-20T10:00:00Z",
    "streakUpdated": true,
    "newStreak": 13
  }
}
```

#### 42. Get Mood History
```http
GET /mood?startDate=2024-11-01&endDate=2024-11-20&page=1&limit=50
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "uuid",
        "moodLevel": 4,
        "moodLabel": "happy",
        "notes": "Had a productive day",
        "recordedAt": "2024-11-20T10:00:00Z"
      }
    ],
    "stats": {
      "averageMood": 3.8,
      "totalEntries": 45,
      "moodDistribution": {
        "1": 2,
        "2": 5,
        "3": 15,
        "4": 18,
        "5": 5
      },
      "commonTriggers": ["work_stress", "lack_of_sleep"],
      "improvementTrend": "+12%"
    },
    "pagination": { /* pagination object */ }
  }
}
```

#### 43. Get Mood Analytics
```http
GET /mood/analytics?period=month
Authorization: Bearer {accessToken}

Query Parameters:
- period: string (week, month, quarter, year)

Response: 200 OK
{
  "success": true,
  "data": {
    "period": "month",
    "averageMood": 3.8,
    "moodTrend": "improving",
    "chartData": [
      { "date": "2024-11-01", "mood": 3 },
      { "date": "2024-11-02", "mood": 4 },
      // ... more data points
    ],
    "insights": [
      "Your mood has improved by 15% this month",
      "You're most happy on weekends",
      "Exercise correlates with better mood"
    ]
  }
}
```

### Activity Log Endpoints

#### 44. Get Activity Feed
```http
GET /activities?page=1&limit=50&type=all
Authorization: Bearer {accessToken}

Query Parameters:
- page: integer
- limit: integer
- type: string (all, session, exercise, mood, appointment, community)

Response: 200 OK
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "type": "mood",
        "title": "Mood Tracked",
        "description": "Logged mood: Happy 🙂",
        "icon": "happy-outline",
        "color": "#F59E0B",
        "createdAt": "2024-11-20T10:00:00Z",
        "relativeTime": "2 hours ago"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

### Notification Endpoints

#### 45. Get Notifications
```http
GET /notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Appointment Reminder",
        "body": "Your session with Dr. Uwimana is in 1 hour",
        "type": "appointment_reminder",
        "actionUrl": "mindora://appointments/uuid",
        "isRead": false,
        "createdAt": "2024-11-20T09:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { /* pagination object */ }
  }
}
```

#### 46. Mark Notification as Read
```http
PATCH /notifications/:notificationId/read
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 47. Mark All Notifications as Read
```http
POST /notifications/read-all
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### 48. Delete Notification
```http
DELETE /notifications/:notificationId
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Notification deleted"
}
```

### Payment Endpoints

#### 49. Initiate Payment
```http
POST /payments/initiate
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "appointmentId": "uuid",
  "paymentMethod": "mtn_mobile_money",
  "phoneNumber": "+250788123456"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "transactionId": "TXN123456",
    "status": "pending",
    "amount": 25000,
    "currency": "RWF",
    "paymentUrl": "https://payment.mindora.rw/pay/uuid",
    "expiresAt": "2024-11-20T10:15:00Z"
  }
}
```

#### 50. Verify Payment
```http
GET /payments/:paymentId/verify
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "completed",
    "amount": 25000,
    "currency": "RWF",
    "completedAt": "2024-11-20T10:05:00Z"
  }
}
```

#### 51. Get Payment History
```http
GET /payments?page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "appointmentId": "uuid",
        "amount": 25000,
        "currency": "RWF",
        "paymentMethod": "mtn_mobile_money",
        "status": "completed",
        "transactionId": "TXN123456",
        "completedAt": "2024-11-20T10:05:00Z"
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```


### Dashboard & Analytics Endpoints

#### 52. Get Dashboard Data
```http
GET /dashboard?period=month
Authorization: Bearer {accessToken}

Query Parameters:
- period: string (week, month, quarter, year)

Response: 200 OK
{
  "success": true,
  "data": {
    "period": "month",
    "metrics": {
      "totalSessions": 24,
      "totalExercises": 67,
      "dayStreak": 12,
      "completionRate": 92
    },
    "moodChart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "data": [3, 4, 2, 5, 4, 3, 4]
    },
    "exerciseChart": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "data": [8, 12, 15, 18]
    },
    "sessionDistribution": {
      "video": 8,
      "inPerson": 4
    },
    "achievements": [
      {
        "title": "7-Day Streak",
        "description": "Completed daily mood tracking",
        "icon": "trophy",
        "color": "#F59E0B",
        "earnedAt": "2024-11-18T10:00:00Z"
      }
    ],
    "goals": [
      {
        "title": "Weekly Mindfulness",
        "current": 5,
        "target": 7,
        "progress": 71
      }
    ]
  }
}
```

### Search Endpoints

#### 53. Global Search
```http
GET /search?q=anxiety&type=all&page=1&limit=20
Authorization: Bearer {accessToken}

Query Parameters:
- q: string (search query)
- type: string (all, doctors, exercises, communities, posts)
- page: integer
- limit: integer

Response: 200 OK
{
  "success": true,
  "data": {
    "doctors": [ /* matching doctors */ ],
    "exercises": [ /* matching exercises */ ],
    "communities": [ /* matching communities */ ],
    "posts": [ /* matching posts */ ],
    "totalResults": 45
  }
}
```

### Emergency Endpoints

#### 54. Get Emergency Contacts
```http
GET /emergency/contacts
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "userContacts": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "relationship": "Sister",
        "phone": "+250788999888",
        "priority": 1
      }
    ],
    "hotlines": [
      {
        "name": "Rwanda Mental Health Hotline",
        "phone": "114",
        "available": "24/7",
        "languages": ["Kinyarwanda", "English", "French"]
      },
      {
        "name": "Suicide Prevention Hotline",
        "phone": "+250788123456",
        "available": "24/7"
      }
    ]
  }
}
```

#### 55. Add Emergency Contact
```http
POST /emergency/contacts
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "name": "Jane Doe",
  "relationship": "Sister",
  "phone": "+250788999888",
  "email": "jane@example.com",
  "priority": 1
}

Response: 201 Created
{
  "success": true,
  "data": { /* emergency contact object */ }
}
```

#### 56. Trigger Emergency Alert
```http
POST /emergency/alert
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "type": "crisis", // crisis, panic_attack, suicidal_thoughts
  "location": {
    "latitude": -1.9441,
    "longitude": 30.0619
  },
  "message": "Need immediate help"
}

Response: 200 OK
{
  "success": true,
  "message": "Emergency alert sent",
  "data": {
    "alertId": "uuid",
    "contactsNotified": 2,
    "nearbyProfessionals": [
      {
        "name": "Dr. Uwimana Marie",
        "phone": "+250788111222",
        "distance": "2.5 km"
      }
    ]
  }
}
```

### Admin Endpoints (For Doctor/Admin Panel)

#### 57. Doctor - Get Appointments
```http
GET /doctor/appointments?status=upcoming&page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "appointments": [ /* doctor's appointments */ ],
    "pagination": { /* pagination object */ }
  }
}
```

#### 58. Doctor - Update Availability
```http
PATCH /doctor/availability
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "availability": {
    "monday": ["09:00-12:00", "14:00-17:00"],
    "tuesday": ["09:00-12:00"],
    "wednesday": ["09:00-12:00", "14:00-17:00"]
  }
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated availability */ }
}
```

#### 59. Doctor - Add Session Notes
```http
POST /doctor/appointments/:appointmentId/notes
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "notes": "Patient showed improvement in anxiety management...",
  "diagnosis": "Generalized Anxiety Disorder",
  "recommendations": ["Continue CBT", "Practice breathing exercises"],
  "nextSessionDate": "2024-12-01"
}

Response: 200 OK
{
  "success": true,
  "message": "Notes saved successfully"
}
```

---

## 🔐 Authentication & Security

### JWT Token Structure
```javascript
// Access Token (expires in 1 hour)
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user", // user, doctor, admin
  "iat": 1700000000,
  "exp": 1700003600
}

// Refresh Token (expires in 30 days)
{
  "userId": "uuid",
  "tokenId": "uuid",
  "iat": 1700000000,
  "exp": 1702592000
}
```

### Security Measures

1. **Password Requirements**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character
   - Hashed using bcrypt (cost factor: 12)

2. **Rate Limiting**
   ```
   - Login attempts: 5 per 15 minutes per IP
   - API requests: 100 per minute per user
   - Password reset: 3 per hour per email
   - File uploads: 10 per hour per user
   ```

3. **CORS Configuration**
   ```javascript
   {
     origin: ['https://mindora.rw', 'https://app.mindora.rw'],
     credentials: true,
     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }
   ```

4. **Data Encryption**
   - All sensitive data encrypted at rest (AES-256)
   - Health records encrypted with user-specific keys
   - TLS 1.3 for data in transit
   - Database connection encrypted

5. **HIPAA Compliance** (for health records)
   - Audit logs for all data access
   - Data retention policies
   - Secure data disposal
   - Access control lists
   - Regular security audits


---

## 🔄 Real-time Features (WebSocket)

### WebSocket Connection
```javascript
// Client connects to WebSocket
const socket = io('wss://api.mindora.rw', {
  auth: {
    token: 'jwt-access-token'
  }
});
```

### Events

#### 1. Appointment Reminders
```javascript
// Server → Client
socket.on('appointment:reminder', (data) => {
  // {
  //   appointmentId: 'uuid',
  //   doctorName: 'Dr. Uwimana Marie',
  //   time: '10:00 AM',
  //   minutesUntil: 15
  // }
});
```

#### 2. Video Call Events
```javascript
// Doctor joins call
socket.on('video:doctor-joined', (data) => {
  // { roomId: 'uuid', doctorName: 'Dr. Uwimana Marie' }
});

// Call ended
socket.on('video:call-ended', (data) => {
  // { roomId: 'uuid', duration: 3600 }
});
```

#### 3. Community Updates
```javascript
// New post in joined community
socket.on('community:new-post', (data) => {
  // {
  //   communityId: 'uuid',
  //   post: { /* post object */ }
  // }
});

// Someone liked your post
socket.on('community:post-liked', (data) => {
  // {
  //   postId: 'uuid',
  //   likedBy: { name: 'User Name', avatar: '...' }
  // }
});

// New comment on your post
socket.on('community:new-comment', (data) => {
  // {
  //   postId: 'uuid',
  //   comment: { /* comment object */ }
  // }
});
```

#### 4. Notifications
```javascript
// Real-time notification
socket.on('notification:new', (data) => {
  // { notification: { /* notification object */ } }
});
```

#### 5. Chat Messages (Doctor-Patient)
```javascript
// Send message
socket.emit('chat:send', {
  recipientId: 'doctor-uuid',
  message: 'Hello doctor'
});

// Receive message
socket.on('chat:message', (data) => {
  // {
  //   senderId: 'uuid',
  //   senderName: 'Dr. Uwimana',
  //   message: 'Hello, how can I help?',
  //   timestamp: '2024-11-20T10:00:00Z'
  // }
});

// Typing indicator
socket.emit('chat:typing', { recipientId: 'doctor-uuid' });
socket.on('chat:typing', (data) => {
  // { senderId: 'uuid', senderName: 'Dr. Uwimana' }
});
```

---

## 📁 File Storage

### Storage Structure
```
mindora-storage/
├── avatars/
│   ├── users/
│   │   └── {userId}.jpg
│   └── doctors/
│       └── {doctorId}.jpg
├── exercises/
│   ├── thumbnails/
│   │   └── {exerciseId}.jpg
│   ├── audio/
│   │   └── {exerciseId}.mp3
│   └── videos/
│       └── {exerciseId}.mp4
├── communities/
│   ├── images/
│   │   └── {communityId}.jpg
│   └── posts/
│       └── {postId}/
│           ├── image1.jpg
│           └── image2.jpg
└── health-records/
    └── {userId}/
        └── {recordId}.pdf (encrypted)
```

### File Upload Specifications

#### Avatar Upload
```
- Max size: 5 MB
- Formats: JPG, PNG, WebP
- Dimensions: Min 200x200, Max 2000x2000
- Auto-resize to: 150x150, 300x300, 600x600
- Compression: 80% quality
```

#### Exercise Media
```
Audio:
- Max size: 50 MB
- Formats: MP3, M4A
- Bitrate: 128 kbps

Video:
- Max size: 200 MB
- Formats: MP4, MOV
- Resolution: Max 1080p
- Compression: H.264
```

#### Community Post Media
```
Images:
- Max size: 10 MB per image
- Max images: 5 per post
- Formats: JPG, PNG, WebP
- Auto-resize to: 800x800, 1200x1200
```

### CDN Configuration
```
- CloudFront / Cloudflare CDN
- Cache duration: 1 year for static assets
- Automatic image optimization
- WebP conversion for supported browsers
- Lazy loading support
```

---

## 🔗 Third-Party Integrations

### 1. Video Call Integration (Twilio)

```javascript
// Initialize Twilio Video Room
const twilioClient = require('twilio')(accountSid, authToken);

async function createVideoRoom(appointmentId) {
  const room = await twilioClient.video.rooms.create({
    uniqueName: appointmentId,
    type: 'group',
    maxParticipants: 2,
    recordParticipantsOnConnect: true, // For quality assurance
    statusCallback: 'https://api.mindora.rw/webhooks/twilio/video'
  });
  
  return room;
}

// Generate access token
function generateVideoToken(userId, roomName) {
  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;
  
  const token = new AccessToken(accountSid, apiKey, apiSecret);
  token.identity = userId;
  
  const videoGrant = new VideoGrant({
    room: roomName
  });
  
  token.addGrant(videoGrant);
  return token.toJwt();
}
```

### 2. Payment Integration (Flutterwave)

```javascript
// Initialize payment
async function initiatePayment(appointmentId, amount, phoneNumber) {
  const response = await axios.post('https://api.flutterwave.com/v3/charges', {
    tx_ref: `MINDORA-${appointmentId}`,
    amount: amount,
    currency: 'RWF',
    payment_type: 'mobilemoneyrwanda',
    phone_number: phoneNumber,
    email: user.email,
    redirect_url: 'https://api.mindora.rw/webhooks/flutterwave/callback',
    meta: {
      appointmentId: appointmentId
    }
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
    }
  });
  
  return response.data;
}

// Verify payment
async function verifyPayment(transactionId) {
  const response = await axios.get(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    }
  );
  
  return response.data;
}
```

### 3. SMS Integration (Twilio / Africa's Talking)

```javascript
// Send SMS via Africa's Talking
const AfricasTalking = require('africastalking');

const sms = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
}).SMS;

async function sendSMS(phoneNumber, message) {
  const result = await sms.send({
    to: [phoneNumber],
    message: message,
    from: 'MINDORA'
  });
  
  return result;
}

// Send appointment reminder
async function sendAppointmentReminder(appointment) {
  const message = `Reminder: Your therapy session with ${appointment.doctorName} is at ${appointment.time} today. Join via the Mindora app.`;
  
  await sendSMS(appointment.userPhone, message);
}
```

### 4. Email Integration (SendGrid)

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  const msg = {
    to: to,
    from: 'noreply@mindora.rw',
    subject: subject,
    html: html
  };
  
  await sgMail.send(msg);
}

// Send welcome email
async function sendWelcomeEmail(user) {
  const html = `
    <h1>Welcome to Mindora, ${user.name}!</h1>
    <p>We're excited to have you on your mental wellness journey.</p>
    <a href="https://app.mindora.rw/onboarding">Get Started</a>
  `;
  
  await sendEmail(user.email, 'Welcome to Mindora', html);
}
```

### 5. Push Notifications (Firebase Cloud Messaging)

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendPushNotification(deviceToken, notification) {
  const message = {
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: {
      type: notification.type,
      actionUrl: notification.actionUrl
    },
    token: deviceToken
  };
  
  const response = await admin.messaging().send(message);
  return response;
}
```


---

## 🏗️ Infrastructure & DevOps

### Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
│                  (AWS ALB / Nginx)                       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│  API Server 1  │       │  API Server 2  │
│   (Node.js)    │       │   (Node.js)    │
└───────┬────────┘       └───────┬────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│   PostgreSQL   │       │     Redis      │
│   (Primary)    │       │    (Cache)     │
└───────┬────────┘       └────────────────┘
        │
┌───────▼────────┐
│   PostgreSQL   │
│   (Replica)    │
└────────────────┘
```

### Technology Stack

#### Production Environment
```yaml
Infrastructure:
  - Cloud Provider: AWS / DigitalOcean
  - Compute: EC2 / App Platform
  - Database: RDS PostgreSQL (Multi-AZ)
  - Cache: ElastiCache Redis
  - Storage: S3 / Spaces
  - CDN: CloudFront / Cloudflare
  - Load Balancer: Application Load Balancer

Backend:
  - Runtime: Node.js 18 LTS
  - Framework: Express.js / NestJS
  - Language: TypeScript
  - Process Manager: PM2

Database:
  - Primary: PostgreSQL 14+
  - Cache: Redis 7+
  - Search: Elasticsearch (optional)

Monitoring:
  - APM: New Relic / Datadog
  - Logging: CloudWatch / Papertrail
  - Error Tracking: Sentry
  - Uptime: Pingdom / UptimeRobot
```

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1
APP_URL=https://app.mindora.rw
API_URL=https://api.mindora.rw

# Database
DATABASE_URL=postgresql://user:pass@host:5432/mindora
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=another-secret-key
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=mindora-storage

# Twilio (Video & SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_API_KEY=your-api-key
TWILIO_API_SECRET=your-api-secret

# Flutterwave (Payments)
FLUTTERWAVE_PUBLIC_KEY=your-public-key
FLUTTERWAVE_SECRET_KEY=your-secret-key
FLUTTERWAVE_ENCRYPTION_KEY=your-encryption-key

# SendGrid (Email)
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@mindora.rw

# Africa's Talking (SMS)
AT_USERNAME=your-username
AT_API_KEY=your-api-key

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=mindora-app
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@mindora-app.iam.gserviceaccount.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-license-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mindora
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=mindora
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: mindora/api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          aws ecs update-service \
            --cluster mindora-cluster \
            --service mindora-api \
            --force-new-deployment
```

### Database Backup Strategy

```bash
# Daily automated backups
0 2 * * * pg_dump -h localhost -U postgres mindora | gzip > /backups/mindora_$(date +\%Y\%m\%d).sql.gz

# Retention policy
- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks
- Monthly backups: Keep for 12 months

# Backup to S3
aws s3 sync /backups/ s3://mindora-backups/database/
```

### Scaling Strategy

```
Horizontal Scaling:
- Auto-scaling based on CPU/Memory usage
- Min instances: 2
- Max instances: 10
- Scale up: CPU > 70% for 5 minutes
- Scale down: CPU < 30% for 10 minutes

Database Scaling:
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Query optimization and indexing
- Partitioning for large tables

Caching Strategy:
- Redis for session storage
- Cache frequently accessed data (doctors, exercises)
- Cache TTL: 5-60 minutes depending on data type
- Cache invalidation on updates
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

#### 1. Health Check Endpoint
```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2024-11-20T10:00:00Z",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  }
}
```

#### 2. Metrics to Track
```
Performance Metrics:
- API response time (p50, p95, p99)
- Database query time
- Cache hit rate
- Error rate
- Request rate (requests per second)

Business Metrics:
- New user registrations
- Active users (DAU, MAU)
- Appointments booked
- Exercises completed
- Community engagement
- Payment success rate
- Video call quality

System Metrics:
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Database connections
```


#### 3. Logging Strategy

```javascript
// Structured logging with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log examples
logger.info('User logged in', { userId: 'uuid', ip: '192.168.1.1' });
logger.error('Payment failed', { 
  userId: 'uuid', 
  appointmentId: 'uuid', 
  error: error.message 
});
```

#### 4. Error Tracking (Sentry)

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Capture errors
try {
  // code
} catch (error) {
  Sentry.captureException(error, {
    user: { id: userId, email: userEmail },
    tags: { feature: 'appointments' }
  });
}
```

### Analytics Events

```javascript
// Track user events for analytics
const analytics = {
  // User events
  userRegistered: { userId, source, timestamp },
  userLoggedIn: { userId, device, timestamp },
  profileUpdated: { userId, fields, timestamp },
  
  // Appointment events
  appointmentBooked: { userId, doctorId, date, amount, timestamp },
  appointmentCancelled: { userId, appointmentId, reason, timestamp },
  appointmentCompleted: { userId, appointmentId, duration, timestamp },
  
  // Exercise events
  exerciseStarted: { userId, exerciseId, timestamp },
  exerciseCompleted: { userId, exerciseId, duration, rating, timestamp },
  
  // Community events
  communityJoined: { userId, communityId, timestamp },
  postCreated: { userId, communityId, postId, timestamp },
  postLiked: { userId, postId, timestamp },
  commentAdded: { userId, postId, commentId, timestamp },
  
  // Mood events
  moodLogged: { userId, moodLevel, timestamp },
  
  // Payment events
  paymentInitiated: { userId, amount, method, timestamp },
  paymentCompleted: { userId, amount, transactionId, timestamp },
  paymentFailed: { userId, amount, reason, timestamp }
};
```

---

## 🔒 Data Privacy & Compliance

### GDPR Compliance

```
User Rights:
1. Right to Access - Users can download their data
2. Right to Rectification - Users can update their data
3. Right to Erasure - Users can delete their account
4. Right to Data Portability - Export data in JSON format
5. Right to Object - Users can opt-out of analytics

Implementation:
- Data export endpoint: GET /users/me/export
- Account deletion: DELETE /users/me
- Privacy settings: PATCH /users/me/privacy
- Cookie consent management
- Clear privacy policy
```

### Data Retention Policy

```
User Data:
- Active accounts: Retained indefinitely
- Deleted accounts: Soft delete for 30 days, then permanent deletion
- Inactive accounts (2+ years): Email notification, then deletion after 90 days

Health Records:
- Retained for 7 years (legal requirement)
- Encrypted at rest
- Access logs maintained

Activity Logs:
- Retained for 90 days
- Aggregated analytics retained for 2 years

Payment Records:
- Retained for 7 years (tax/legal requirement)
- PCI DSS compliant storage
```

### Security Best Practices

```
1. Input Validation
   - Sanitize all user inputs
   - Use parameterized queries (prevent SQL injection)
   - Validate file uploads
   - Rate limiting on all endpoints

2. Authentication
   - Strong password requirements
   - Account lockout after failed attempts
   - Two-factor authentication (optional)
   - Session timeout after inactivity

3. Authorization
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API key rotation
   - Audit logs for sensitive operations

4. Data Protection
   - Encrypt sensitive data at rest
   - TLS 1.3 for data in transit
   - Secure key management (AWS KMS)
   - Regular security audits

5. Monitoring
   - Real-time security alerts
   - Suspicious activity detection
   - Failed login attempt tracking
   - API abuse detection
```

---

## 📱 Mobile App Integration

### Deep Linking

```javascript
// Deep link structure
mindora://screen/params

Examples:
- mindora://appointments/uuid
- mindora://doctors/uuid
- mindora://exercises/uuid
- mindora://communities/uuid
- mindora://posts/uuid
- mindora://video-call/uuid

// Universal links (iOS)
https://app.mindora.rw/appointments/uuid

// App links (Android)
https://app.mindora.rw/appointments/uuid
```

### Push Notification Payload

```json
{
  "notification": {
    "title": "Appointment Reminder",
    "body": "Your session with Dr. Uwimana is in 15 minutes",
    "sound": "default",
    "badge": 1
  },
  "data": {
    "type": "appointment_reminder",
    "appointmentId": "uuid",
    "deepLink": "mindora://appointments/uuid",
    "timestamp": "2024-11-20T09:45:00Z"
  },
  "priority": "high"
}
```

### Offline Support

```javascript
// API responses include cache headers
Cache-Control: max-age=300, must-revalidate

// Offline-first data
- User profile
- Upcoming appointments
- Exercise library
- Joined communities

// Sync strategy
- Queue actions when offline
- Sync when connection restored
- Conflict resolution for concurrent edits
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Example: User service test
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.email).toBe('john@example.com');
      expect(user.password).not.toBe('SecurePass123!'); // Should be hashed
    });
    
    it('should throw error for duplicate email', async () => {
      await expect(
        userService.createUser({ email: 'existing@example.com' })
      ).rejects.toThrow('Email already exists');
    });
  });
});
```

### Integration Tests
```javascript
// Example: Appointment booking flow
describe('Appointment Booking', () => {
  it('should complete full booking flow', async () => {
    // 1. User logs in
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'password' });
    
    const token = loginRes.body.data.tokens.accessToken;
    
    // 2. Get doctor availability
    const availabilityRes = await request(app)
      .get('/api/v1/doctors/doctor-uuid/availability?date=2024-11-21')
      .set('Authorization', `Bearer ${token}`);
    
    expect(availabilityRes.status).toBe(200);
    
    // 3. Book appointment
    const bookingRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorId: 'doctor-uuid',
        appointmentDate: '2024-11-21',
        appointmentTime: '10:00',
        sessionType: 'video'
      });
    
    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.data.appointment).toHaveProperty('id');
  });
});
```

### Load Testing
```javascript
// Using Artillery
// artillery.yml
config:
  target: 'https://api.mindora.rw'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike"

scenarios:
  - name: "User journey"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "user@example.com"
            password: "password"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "token"
      - get:
          url: "/api/v1/doctors"
          headers:
            Authorization: "Bearer {{ token }}"
```

---

## 📚 API Documentation

### OpenAPI/Swagger Specification

```yaml
openapi: 3.0.0
info:
  title: Mindora API
  version: 1.0.0
  description: Mental health platform API for Rwanda
  contact:
    email: dev@mindora.rw

servers:
  - url: https://api.mindora.rw/v1
    description: Production server
  - url: https://api-staging.mindora.rw/v1
    description: Staging server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        avatar:
          type: string
          format: uri
        stats:
          type: object
          properties:
            totalSessions:
              type: integer
            totalExercises:
              type: integer
            dayStreak:
              type: integer

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      user:
                        $ref: '#/components/schemas/User'
                      tokens:
                        type: object
```


---

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
```
✓ Set up development environment
✓ Initialize Node.js/Express project with TypeScript
✓ Configure PostgreSQL database
✓ Set up Redis for caching
✓ Implement database migrations
✓ Create base API structure
✓ Set up error handling middleware
✓ Configure logging (Winston)
✓ Set up Docker containers
```

### Phase 2: Authentication & User Management (Weeks 3-4)
```
✓ Implement user registration
✓ Implement login with JWT
✓ Implement refresh token mechanism
✓ Password reset functionality
✓ Email verification
✓ User profile CRUD operations
✓ Avatar upload
✓ Settings management
```

### Phase 3: Doctor Management (Weeks 5-6)
```
✓ Doctor profile creation
✓ Doctor listing with filters
✓ Doctor search functionality
✓ Availability management
✓ Doctor reviews system
✓ Verification system
```

### Phase 4: Appointment System (Weeks 7-8)
```
✓ Appointment booking
✓ Availability checking
✓ Appointment management (cancel, reschedule)
✓ Appointment reminders
✓ Video call integration (Twilio)
✓ Session notes (doctor side)
```

### Phase 5: Payment Integration (Week 9)
```
✓ Flutterwave integration
✓ Payment initiation
✓ Payment verification
✓ Webhook handling
✓ Refund processing
✓ Payment history
```

### Phase 6: Exercise System (Week 10)
```
✓ Exercise library
✓ Exercise sessions tracking
✓ Progress tracking
✓ Exercise ratings
✓ Audio/video upload
```

### Phase 7: Community Features (Weeks 11-12)
```
✓ Community creation
✓ Community membership
✓ Post creation
✓ Like/comment system
✓ Content moderation
✓ Reporting system
```

### Phase 8: Mood Tracking & Analytics (Week 13)
```
✓ Mood logging
✓ Mood history
✓ Analytics dashboard
✓ Charts and insights
✓ Activity feed
```

### Phase 9: Notifications & Real-time (Week 14)
```
✓ Push notifications (FCM)
✓ Email notifications (SendGrid)
✓ SMS notifications (Africa's Talking)
✓ WebSocket implementation
✓ Real-time updates
```

### Phase 10: Testing & Optimization (Weeks 15-16)
```
✓ Unit tests
✓ Integration tests
✓ Load testing
✓ Performance optimization
✓ Security audit
✓ API documentation
```

### Phase 11: Deployment & Monitoring (Week 17)
```
✓ Production environment setup
✓ CI/CD pipeline
✓ Monitoring setup (Sentry, New Relic)
✓ Backup strategy
✓ SSL certificates
✓ Domain configuration
```

### Phase 12: Launch & Iteration (Week 18+)
```
✓ Soft launch
✓ User feedback collection
✓ Bug fixes
✓ Feature improvements
✓ Scaling as needed
```

---

## 💰 Cost Estimation (Monthly)

### Infrastructure Costs
```
AWS/DigitalOcean:
- EC2/Droplet (2x instances): $40-80
- RDS PostgreSQL: $50-100
- ElastiCache Redis: $30-50
- S3 Storage (100GB): $3-5
- CloudFront CDN: $10-20
- Load Balancer: $20-30
Total Infrastructure: $153-285/month

Third-Party Services:
- Twilio Video (100 hours): $50-100
- Flutterwave (transaction fees): 1.4% per transaction
- SendGrid (50k emails): $15-30
- Africa's Talking SMS: $0.01-0.02 per SMS
- Firebase (push notifications): Free-$25
- Sentry (error tracking): Free-$26
Total Services: $90-181/month

Total Estimated Cost: $243-466/month
(Scales with usage)
```

---

## 📖 Additional Resources

### Documentation Links
```
- API Documentation: https://docs.mindora.rw
- Developer Portal: https://developers.mindora.rw
- Status Page: https://status.mindora.rw
- Support: support@mindora.rw
```

### Useful Libraries

```javascript
// Core
- express: Web framework
- typescript: Type safety
- dotenv: Environment variables
- helmet: Security headers
- cors: CORS handling

// Database
- pg: PostgreSQL client
- typeorm / prisma: ORM
- redis: Redis client

// Authentication
- jsonwebtoken: JWT handling
- bcrypt: Password hashing
- passport: Authentication middleware

// Validation
- joi / zod: Schema validation
- express-validator: Request validation

// File Upload
- multer: File upload handling
- sharp: Image processing

// Testing
- jest: Testing framework
- supertest: API testing
- artillery: Load testing

// Monitoring
- winston: Logging
- @sentry/node: Error tracking
- prom-client: Prometheus metrics

// Utils
- date-fns: Date manipulation
- lodash: Utility functions
- axios: HTTP client
```

---

## 🎯 Success Metrics

### Technical KPIs
```
Performance:
- API response time < 200ms (p95)
- Database query time < 50ms (p95)
- Uptime > 99.9%
- Error rate < 0.1%

Scalability:
- Support 10,000+ concurrent users
- Handle 1,000+ requests per second
- Database can handle 100M+ records
```

### Business KPIs
```
User Engagement:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention rate
- Session duration

Appointments:
- Appointments booked per day
- Appointment completion rate
- Average rating
- Rebooking rate

Revenue:
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Payment success rate
- Refund rate
```

---

## 🔄 Future Enhancements

### Short-term (3-6 months)
```
- AI-powered mood insights
- Chatbot for initial screening
- Group therapy sessions
- Prescription management
- Insurance integration
- Multi-language support (Kinyarwanda, French)
```

### Long-term (6-12 months)
```
- Machine learning for doctor recommendations
- Predictive analytics for mental health trends
- Integration with wearables (Apple Watch, Fitbit)
- Telemedicine for physical health
- Corporate wellness programs
- Research data anonymization and sharing
```

---

## 📞 Support & Maintenance

### Support Channels
```
- Email: support@mindora.rw
- Phone: +250 788 123 456
- In-app chat support
- Help center: https://help.mindora.rw
- Community forum
```

### Maintenance Windows
```
- Scheduled maintenance: Sundays 2:00-4:00 AM EAT
- Emergency maintenance: As needed with 1-hour notice
- Database backups: Daily at 2:00 AM EAT
- Security patches: Applied within 24 hours
```

### SLA (Service Level Agreement)
```
Uptime: 99.9% (excluding scheduled maintenance)
Response Time:
- Critical issues: 1 hour
- High priority: 4 hours
- Medium priority: 24 hours
- Low priority: 72 hours

Support Hours:
- Email/Chat: 24/7
- Phone: 8:00 AM - 8:00 PM EAT (Mon-Fri)
- Emergency: 24/7
```

---

## ✅ Checklist for Backend Engineers

### Before Development
```
☐ Review complete architecture document
☐ Set up development environment
☐ Access to all third-party services
☐ Database design approved
☐ API endpoints documented
☐ Security requirements understood
☐ Testing strategy defined
```

### During Development
```
☐ Follow coding standards
☐ Write unit tests for all functions
☐ Document all API endpoints
☐ Implement proper error handling
☐ Add logging for debugging
☐ Validate all inputs
☐ Use environment variables for secrets
☐ Implement rate limiting
☐ Add database indexes
☐ Optimize queries
```

### Before Deployment
```
☐ All tests passing
☐ Code reviewed
☐ Security audit completed
☐ Performance testing done
☐ Documentation updated
☐ Environment variables configured
☐ Database migrations ready
☐ Backup strategy in place
☐ Monitoring configured
☐ SSL certificates installed
```

### After Deployment
```
☐ Monitor error rates
☐ Check performance metrics
☐ Verify all integrations working
☐ Test critical user flows
☐ Monitor database performance
☐ Check logs for issues
☐ Verify backups running
☐ Update status page
```

---

## 📝 Conclusion

This comprehensive backend architecture provides everything needed to build a production-ready mental health platform for Rwanda. The system is designed to be:

- **Scalable**: Handle growth from hundreds to millions of users
- **Secure**: HIPAA-compliant with encryption and access controls
- **Reliable**: 99.9% uptime with automated backups
- **Fast**: Optimized for performance with caching and CDN
- **Maintainable**: Clean code, documentation, and monitoring
- **Cost-effective**: Efficient resource usage with auto-scaling

The modular architecture allows for incremental development and easy addition of new features. All third-party integrations are Rwanda-specific (mobile money, local SMS) while maintaining international standards.

**Ready to build? Start with Phase 1 and follow the roadmap!** 🚀

---

**Document Version**: 1.0  
**Last Updated**: November 20, 2024  
**Maintained By**: Mindora Engineering Team  
**Contact**: dev@mindora.rw
