# Frontend Integration Guide

This guide provides all the necessary information for frontend developers to integrate with the Mindora API.

## 🌐 Base URL

**Development:** `http://localhost:5000/api/v1`
**Production:** `http://swcow40wko0oksk004gks48o.197.243.27.200.sslip.io/` 

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

1. **Login/Register:**
   - Endpoint: `POST /auth/login` or `POST /auth/register`
   - Response includes `accessToken` and `refreshToken`.
2. **Authenticated Requests:**
   - Include the `accessToken` in the `Authorization` header of every request.
   - Format: `Authorization: Bearer <your_access_token>`
3. **Token Refresh:**
   - When `accessToken` expires (401 Unauthorized), use `POST /auth/refresh-token` with the `refreshToken` to get a new pair.

## 📦 Response Format

All API responses follow a consistent JSON structure.

### Success Response (`200`, `201`)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // ... payload data
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `500`)

```json
{
  "success": false,
  "message": "Error description message",
  "error": {
    // Optional details (stack trace in dev mode)
  }
}
```

### Validation Error (`422`)

```json
{
  "success": false,
  "message": "Validation error: email: Invalid email address",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

## 📄 Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Structure:**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🔌 Real-time (Socket.IO)

**Connection URL:** `http://localhost:5000` (Root URL, not `/api/v1`)

**Authentication:**
Pass the `token` in the handshake auth object:

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "Bearer <your_access_token>",
  },
});
```

### Events

| Direction            | Event Name        | Description               | Payload                                                  |
| :------------------- | :---------------- | :------------------------ | :------------------------------------------------------- |
| **Client -> Server** | `join_room`       | Join a specific chat room | `{ roomId: string }`                                     |
| **Client -> Server** | `send_message`    | Send a text message       | `{ recipientId: string, content: string }`               |
| **Client -> Server** | `typing_start`    | User started typing       | `{ roomId: string }`                                     |
| **Client -> Server** | `typing_stop`     | User stopped typing       | `{ roomId: string }`                                     |
| **Server -> Client** | `receive_message` | New message received      | `{ id: string, senderId: string, content: string, ... }` |
| **Server -> Client** | `notification`    | New notification          | `{ type: string, message: string, ... }`                 |
| **Server -> Client** | `user:online`     | User came online          | `{ userId: string }`                                     |
| **Server -> Client** | `user:offline`    | User went offline         | `{ userId: string }`                                     |

## 📂 File Uploads

Use `multipart/form-data` for endpoints that accept files (e.g., avatar upload).

- **Avatar:** Field name `avatar`
- **Documents:** Field name `document`
- **Post Images:** Field name `images` (supports multiple)

## 🗂️ Data Types & Enums

### User Roles

- `PATIENT`
- `THERAPIST`
- `ADMIN`

### Appointment Status

- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

### Appointment Type

- `VIDEO`
- `AUDIO`
- `CHAT`
- `IN_PERSON`

### Mood Levels

- `VERY_SAD`
- `SAD`
- `NEUTRAL`
- `HAPPY`
- `VERY_HAPPY`

### Notification Types

- `APPOINTMENT`
- `MESSAGE`
- `POST`
- `SYSTEM`
- `ACHIEVEMENT`

## 🛠️ Tools & Resources

- **Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs) - Interactive API testing.
- **Postman Collection:** Import `postman_collection.json` from the root directory.
- **Detailed Docs:** See `docs/api/` for endpoint-specific details.

# Mindora API Endpoints

## Base URL

```
http://localhost:5000/api/v1
```

For detailed API documentation including request/response examples, please see the [API Documentation](docs/api/README.md) in the `docs/` folder.

---

## 🔓 PUBLIC ENDPOINTS (No Authentication)

### Authentication

```
POST   /auth/register          - Register new user
POST   /auth/login             - User login
POST   /auth/forgot-password   - Request password reset
POST   /auth/reset-password    - Reset password with token
POST   /auth/verify-email      - Verify email address
```

### Public Resources

```
GET    /emergency-contacts     - Get emergency contact list
GET    /resources              - Get public resources (filtered)
GET    /resources/:id          - Get resource details
```

**Total Public Endpoints: 8**

---

## 👤 PATIENT ROLE ENDPOINTS

### Authentication & Profile (8 endpoints)

```
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/change-password
GET    /users/profile
PUT    /users/profile
POST   /users/profile/avatar
DELETE /users/profile/avatar
GET    /users/:userId
```

### Therapist Discovery (4 endpoints)

```
GET    /therapists                          - Browse approved therapists
GET    /therapists/:therapistId             - Get therapist details
GET    /therapists/:therapistId/availability - Check availability
GET    /therapists/:therapistId/reviews     - Read reviews
```

### Appointments (6 endpoints)

```
GET    /appointments                        - Get my appointments
GET    /appointments/:appointmentId         - Get appointment details
POST   /appointments                        - Book appointment
PUT    /appointments/:appointmentId/cancel  - Cancel appointment
PUT    /appointments/:appointmentId/reschedule - Reschedule
GET    /appointments/upcoming               - Get upcoming appointments
```

### Reviews (4 endpoints)

```
POST   /reviews                - Create therapist review
GET    /reviews/:reviewId      - Get review details
PUT    /reviews/:reviewId      - Update my review
DELETE /reviews/:reviewId      - Delete my review
```

### Exercises (7 endpoints)

```
GET    /exercises                              - Browse exercises
GET    /exercises/:exerciseId                  - Get exercise details
POST   /exercises                              - Create exercise (pending approval)
GET    /user-exercises                         - My exercise progress
POST   /user-exercises/:exerciseId/start       - Start exercise
PUT    /user-exercises/:userExerciseId/progress - Update progress
PUT    /user-exercises/:userExerciseId/complete - Mark complete
```

### Community (16 endpoints)

```
GET    /posts                          - Browse posts
GET    /posts/:postId                  - Get post details
POST   /posts                          - Create post (can be anonymous)
POST   /posts/:postId/images           - Upload post images
PUT    /posts/:postId                  - Update my post
DELETE /posts/:postId                  - Delete my post
POST   /posts/:postId/like             - Like post
DELETE /posts/:postId/like             - Unlike post
POST   /posts/:postId/comments         - Add comment
GET    /posts/:postId/comments         - Get comments
PUT    /comments/:commentId            - Update comment
DELETE /comments/:commentId            - Delete comment
POST   /comments/:commentId/like       - Like comment
DELETE /comments/:commentId/like       - Unlike comment
POST   /posts/:postId/report           - Report post
POST   /comments/:commentId/report     - Report comment
```

### Mood Tracking (4 endpoints)

```
POST   /mood-logs                      - Log mood entry
GET    /mood-logs                      - Get mood history
GET    /mood-logs/analytics            - Get mood analytics/trends
GET    /mood-logs/:logId               - Get specific mood log
```

### Monitoring (1 endpoint)

```
GET    /monitoring/me                  - Get my monitoring data
```

### Notifications (3 endpoints)

```
GET    /notifications                  - Get all notifications
PATCH  /notifications/:id/read         - Mark notification as read
DELETE /notifications/:id              - Delete notification
```

### Messages (3 endpoints)

```
POST   /messages                       - Send message
GET    /messages/conversations         - Get conversations
PATCH  /messages/:id/read              - Mark message as read
```

### Emergency Contacts (3 endpoints)

```
POST   /emergency-contacts             - Add emergency contact
GET    /emergency-contacts             - Get emergency contacts
DELETE /emergency-contacts/:id         - Delete emergency contact
```

---

## 👨‍⚕️ THERAPIST ROLE ENDPOINTS

Includes all authenticated endpoints plus:

### Professional Profile (3 endpoints)

```
PUT    /therapists/profile             - Update professional profile
GET    /therapists/dashboard           - Get therapist dashboard stats
POST   /therapists/documents           - Upload verification documents
```

### Patient Management (4 endpoints)

```
GET    /therapists/patients            - Get my patients
GET    /therapists/patients/:id        - Get patient details
GET    /monitoring/patients/:patientId/report - Get patient monitoring report
POST   /monitoring/patients/:patientId - Create monitoring entry/risk assessment
```

### Appointment Management (3 endpoints)

```
GET    /appointments/therapist         - Get my schedule
PUT    /appointments/:id/confirm       - Confirm appointment
PUT    /appointments/:id/complete      - Complete appointment & add notes
```

### Availability (2 endpoints)

```
GET    /therapists/availability        - Get my availability settings
PUT    /therapists/availability        - Update availability slots
```

---

## 👑 ADMIN ROLE ENDPOINTS

### Dashboard & Analytics (2 endpoints)

```
GET    /admin/dashboard                - Get system overview stats
GET    /admin/content                  - Get content moderation stats
```

### User Management (3 endpoints)

```
GET    /admin/users                    - List all users (filter by role)
GET    /admin/users/:id                - Get user details
PATCH  /admin/users/:id/status         - Suspend/Activate user
```

### Therapist Management (2 endpoints)

```
GET    /admin/therapists               - List therapist applications
PATCH  /admin/therapists/:id/approve   - Approve/Reject therapist
```

### Content Moderation (2 endpoints)

```
GET    /admin/reports                  - Get reported content
PATCH  /admin/reports/:id/resolve      - Resolve report (delete content/dismiss)
```

### System Settings (1 endpoint)

```
GET    /admin/settings                 - Get system configuration
```

---

## 🔌 WEBSOCKET EVENTS

### Client -> Server

```
join_room       - Join a specific chat/notification room
send_message    - Send a chat message
typing_start    - User started typing
typing_stop     - User stopped typing
read_message    - Mark message as read
```

### Server -> Client

```
receive_message - New message received
notification    - New system notification
user_online     - A user came online
user_offline    - A user went offline
typing_status   - Typing indicator update
error           - Operation error
```


# UPDATED API 

{
    "info": {
        "name": "Mindora API (Complete)",
        "description": "Comprehensive API Collection for Mindora Beta platform including all endpoint routes.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:5000/api/v1",
            "type": "string"
        },
        {
            "key": "token",
            "value": "",
            "type": "string"
        }
    ],
    "auth": {
        "type": "bearer",
        "bearer": [
            {
                "key": "token",
                "value": "{{token}}",
                "type": "string"
            }
        ]
    },
    "item": [
        {
            "name": "General",
            "item": [
                {
                    "name": "Health Check",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/health",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "health"
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Auth",
            "item": [
                {
                    "name": "Register",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"email\": \"test@example.com\",\n    \"password\": \"password123\",\n    \"fullName\": \"Test User\",\n    \"role\": \"PATIENT\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/register",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "register"
                            ]
                        }
                    }
                },
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"email\": \"test@example.com\",\n    \"password\": \"password123\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/login",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "login"
                            ]
                        }
                    }
                },
                {
                    "name": "Forgot Password",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"email\": \"test@example.com\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/forgot-password",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "forgot-password"
                            ]
                        }
                    }
                },
                {
                    "name": "Reset Password",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"token\": \"reset_token\",\n    \"password\": \"newPassword123\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/reset-password",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "reset-password"
                            ]
                        }
                    }
                },
                {
                    "name": "Verify Email",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"token\": \"verification_token\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/verify-email",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "verify-email"
                            ]
                        }
                    }
                },
                {
                    "name": "Refresh Token",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"refreshToken\": \"refresh_token_string\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/refresh-token",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "refresh-token"
                            ]
                        }
                    }
                },
                {
                    "name": "Logout",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"refreshToken\": \"refresh_token_string\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/logout",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "logout"
                            ]
                        }
                    }
                },
                {
                    "name": "Change Password",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"currentPassword\": \"oldPassword\",\n    \"newPassword\": \"newPassword123\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/change-password",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "auth",
                                "change-password"
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Users",
            "item": [
                {
                    "name": "Get Profile",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/profile",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "profile"
                            ]
                        }
                    }
                },
                {
                    "name": "Update Profile",
                    "request": {
                        "method": "PATCH",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"fullName\": \"Updated Name\",\n    \"bio\": \"New bio\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/users/profile",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "profile"
                            ]
                        }
                    }
                },
                {
                    "name": "Upload Avatar",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "avatar",
                                    "type": "file",
                                    "src": []
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{baseUrl}}/users/profile/avatar",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "profile",
                                "avatar"
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Avatar",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/users/profile/avatar",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "profile",
                                "avatar"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Statistics",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/statistics",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "statistics"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Dashboard",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/dashboard",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "dashboard"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Achievements",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/achievements",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "achievements"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Streaks",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/streaks",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                "streaks"
                            ]
                        }
                    }
                },
                {
                    "name": "Get User By ID",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/users/:userId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "users",
                                ":userId"
                            ],
                            "variable": [
                                {
                                    "key": "userId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Therapists",
            "item": [
                {
                    "name": "Create Profile",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"specialization\": \"CBT\",\n    \"licenseNumber\": \"123456\",\n    \"bio\": \"Therapist bio\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/therapists",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Therapist Details",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/therapists/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Therapist Profile",
                    "request": {
                        "method": "PATCH",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"bio\": \"Updated bio\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/therapists/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Set Availability",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"availability\": [\n        { \"dayOfWeek\": 1, \"startTime\": \"09:00\", \"endTime\": \"17:00\" }\n    ]\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/therapists/availability",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                "availability"
                            ]
                        }
                    }
                },
                {
                    "name": "Upload Document",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "document",
                                    "type": "file",
                                    "src": []
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{baseUrl}}/therapists/documents",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                "documents"
                            ]
                        }
                    }
                },
                {
                    "name": "Get My Patients",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/therapists/patients",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                "patients"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Analytics",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/therapists/analytics",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "therapists",
                                "analytics"
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Appointments",
            "item": [
                {
                    "name": "Create Appointment",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"therapistId\": \"therapist_id\",\n    \"startTime\": \"2024-01-01T10:00:00Z\",\n    \"endTime\": \"2024-01-01T11:00:00Z\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/appointments",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Appointments",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/appointments",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Appointment",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Cancel Appointment",
                    "request": {
                        "method": "PATCH",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"reason\": \"Schedule conflict\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id/cancel",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id",
                                "cancel"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Confirm Appointment",
                    "request": {
                        "method": "PATCH",
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id/confirm",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id",
                                "confirm"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Complete Appointment",
                    "request": {
                        "method": "PATCH",
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id/complete",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id",
                                "complete"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Add Session Notes",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"notes\": \"Patient is making progress.\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id/notes",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id",
                                "notes"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Status (Admin)",
                    "request": {
                        "method": "PATCH",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"status\": \"CONFIRMED\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/appointments/:id/status",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "appointments",
                                ":id",
                                "status"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Exercises",
            "item": [
                {
                    "name": "Get All Exercises",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/exercises",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Exercise",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/exercises/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get User Progress",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/exercises/user-exercises",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                "user-exercises"
                            ]
                        }
                    }
                },
                {
                    "name": "Start Exercise",
                    "request": {
                        "method": "POST",
                        "url": {
                            "raw": "{{baseUrl}}/exercises/user-exercises/:id/start",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                "user-exercises",
                                ":id",
                                "start"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Progress",
                    "request": {
                        "method": "PUT",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"progress\": 50\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/exercises/user-exercises/:id/progress",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                "user-exercises",
                                ":id",
                                "progress"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Complete Exercise",
                    "request": {
                        "method": "PUT",
                        "url": {
                            "raw": "{{baseUrl}}/exercises/user-exercises/:id/complete",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                "user-exercises",
                                ":id",
                                "complete"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Create Exercise",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"title\": \"New Exercise\",\n    \"content\": \"Instructions...\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/exercises",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises"
                            ]
                        }
                    }
                },
                {
                    "name": "Update Exercise",
                    "request": {
                        "method": "PUT",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"title\": \"Updated Title\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/exercises/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Upload Media",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "file",
                                    "type": "file",
                                    "src": []
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{baseUrl}}/exercises/:id/media",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                ":id",
                                "media"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Admin Create Exercise",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"title\": \"Admin Exercise\",\n    \"content\": \"...\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/exercises/admin",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "exercises",
                                "admin"
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Community",
            "item": [
                {
                    "name": "Get Posts",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/posts",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Post",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get Post Comments",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/comments",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "comments"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get User Posts",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/posts/user/:userId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                "user",
                                ":userId"
                            ],
                            "variable": [
                                {
                                    "key": "userId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Create Post",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"content\": \"Hello world\",\n    \"isAnonymous\": false\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts"
                            ]
                        }
                    }
                },
                {
                    "name": "Upload Post Images",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "formdata",
                            "formdata": [
                                {
                                    "key": "images",
                                    "type": "file",
                                    "src": []
                                }
                            ]
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/images",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "images"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Post",
                    "request": {
                        "method": "PUT",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"content\": \"Updated content\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Post",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Like Post",
                    "request": {
                        "method": "POST",
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/like",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "like"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Unlike Post",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/like",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "like"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Flag Post",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"reason\": \"Inappropriate content\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/flag",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "flag"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Add Comment",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"content\": \"Great post!\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts/:postId/comments",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":postId",
                                "comments"
                            ],
                            "variable": [
                                {
                                    "key": "postId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Comment",
                    "request": {
                        "method": "PUT",
                        "url": {
                            "raw": "{{baseUrl}}/comments/:commentId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "comments",
                                ":commentId"
                            ],
                            "variable": [
                                {
                                    "key": "commentId",
                                    "value": "456"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Comment",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/comments/:commentId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "comments",
                                ":commentId"
                            ],
                            "variable": [
                                {
                                    "key": "commentId",
                                    "value": "456"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Like Comment",
                    "request": {
                        "method": "POST",
                        "url": {
                            "raw": "{{baseUrl}}/comments/:commentId/like",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "comments",
                                ":commentId",
                                "like"
                            ],
                            "variable": [
                                {
                                    "key": "commentId",
                                    "value": "456"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Unlike Comment",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/comments/:commentId/like",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "comments",
                                ":commentId",
                                "like"
                            ],
                            "variable": [
                                {
                                    "key": "commentId",
                                    "value": "456"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Moderate Post (Admin)",
                    "request": {
                        "method": "PATCH",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"action\": \"APPROVE\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/posts/:id/moderate",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "posts",
                                ":id",
                                "moderate"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Mood",
            "item": [
                {
                    "name": "Log Mood",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"moodScore\": 8,\n    \"emotions\": [\"happy\", \"calm\"],\n    \"notes\": \"Had a good day\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Mood Logs",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Analytics",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs/analytics",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs",
                                "analytics"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Mood Log",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs/:logId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs",
                                ":logId"
                            ],
                            "variable": [
                                {
                                    "key": "logId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Update Mood Log",
                    "request": {
                        "method": "PUT",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"notes\": \"Updated notes\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs/:logId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs",
                                ":logId"
                            ],
                            "variable": [
                                {
                                    "key": "logId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Mood Log",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/mood-logs/:logId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "mood-logs",
                                ":logId"
                            ],
                            "variable": [
                                {
                                    "key": "logId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Monitoring",
            "item": [
                {
                    "name": "Get My Monitoring",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/monitoring/me",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "monitoring",
                                "me"
                            ]
                        }
                    }
                },
                {
                    "name": "Create Monitoring Entry",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"riskLevel\": \"LOW\",\n    \"notes\": \"Stable checkup\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/monitoring/patients/:patientId",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "monitoring",
                                "patients",
                                ":patientId"
                            ],
                            "variable": [
                                {
                                    "key": "patientId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get Patient Report",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/monitoring/patients/:patientId/report",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "monitoring",
                                "patients",
                                ":patientId",
                                "report"
                            ],
                            "variable": [
                                {
                                    "key": "patientId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get High Risk Patients",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/monitoring/high-risk",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "monitoring",
                                "high-risk"
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Admin",
            "item": [
                {
                    "name": "Get Dashboard",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/admin/dashboard",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "dashboard"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Users",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/admin/users",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "users"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Content Stats",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/admin/content",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "content"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Reports",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/admin/reports",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "reports"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Settings",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/admin/settings",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "settings"
                            ]
                        }
                    }
                },
                {
                    "name": "Approve Therapist",
                    "request": {
                        "method": "PATCH",
                        "url": {
                            "raw": "{{baseUrl}}/admin/therapists/:id/approve",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "admin",
                                "therapists",
                                ":id",
                                "approve"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Resources",
            "item": [
                {
                    "name": "Get All Resources",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/resources",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "resources"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Resource",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/resources/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "resources",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Notifications",
            "item": [
                {
                    "name": "Get Notifications",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/notifications",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "notifications"
                            ]
                        }
                    }
                },
                {
                    "name": "Mark As Read",
                    "request": {
                        "method": "PATCH",
                        "url": {
                            "raw": "{{baseUrl}}/notifications/:id/read",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "notifications",
                                ":id",
                                "read"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Notification",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/notifications/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "notifications",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Messages",
            "item": [
                {
                    "name": "Send Message",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"recipientId\": \"user_id\",\n    \"content\": \"Hello\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/messages",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "messages"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Conversations",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/messages/conversations",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "messages",
                                "conversations"
                            ]
                        }
                    }
                },
                {
                    "name": "Mark Message Read",
                    "request": {
                        "method": "PATCH",
                        "url": {
                            "raw": "{{baseUrl}}/messages/:id/read",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "messages",
                                ":id",
                                "read"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Emergency Contacts",
            "item": [
                {
                    "name": "Add Contact",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"name\": \"Emergency Contact\",\n    \"phoneNumber\": \"911\",\n    \"relationship\": \"Other\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/emergency-contacts",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "emergency-contacts"
                            ]
                        }
                    }
                },
                {
                    "name": "Get Contacts",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/emergency-contacts",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "emergency-contacts"
                            ]
                        }
                    }
                },
                {
                    "name": "Delete Contact",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/emergency-contacts/:id",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "emergency-contacts",
                                ":id"
                            ],
                            "variable": [
                                {
                                    "key": "id",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            "name": "Reviews",
            "item": [
                {
                    "name": "Create Review",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"rating\": 5,\n    \"comment\": \"Great therapist!\"\n}",
                            "options": {
                                "raw": {
                                    "language": "json"
                                }
                            }
                        },
                        "url": {
                            "raw": "{{baseUrl}}/reviews/therapists/:therapistId/reviews",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "reviews",
                                "therapists",
                                ":therapistId",
                                "reviews"
                            ],
                            "variable": [
                                {
                                    "key": "therapistId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Get Reviews",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/reviews/therapists/:therapistId/reviews",
                            "host": [
                                "{{baseUrl}}"
                            ],
                            "path": [
                                "reviews",
                                "therapists",
                                ":therapistId",
                                "reviews"
                            ],
                            "variable": [
                                {
                                    "key": "therapistId",
                                    "value": "123"
                                }
                            ]
                        }
                    }
                }
            ]
        }
    ]
}
