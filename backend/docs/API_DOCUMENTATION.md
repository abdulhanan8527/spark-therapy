# SPARK Therapy Services API Documentation

## Overview
This document provides detailed information about the SPARK Therapy Services RESTful API. The API is designed to support the mobile application for therapy service management.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most API endpoints require authentication using JWT tokens. Tokens are obtained through the authentication endpoints and should be included in the `Authorization` header:

```
Authorization: Bearer <your-token-here>
```

## Error Responses
All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

## Success Responses
All success responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## API Endpoints

### Authentication

#### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent" // or "therapist" or "admin"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "token": "jwt-token"
  }
}
```

#### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "token": "jwt-token"
  }
}
```

#### Get User Profile
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update User Profile
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "password": "newpassword123" // Optional
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "user-id",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "parent",
    "token": "new-jwt-token"
  }
}
```

### Children Management

#### Get All Children (for current user)
- **URL**: `/children`
- **Method**: `GET`
- **Auth Required**: Yes (Parent, Therapist, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Children retrieved successfully",
  "data": [
    {
      "_id": "child-id",
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "2020-01-01T00:00:00.000Z",
      "gender": "female",
      "parentId": "parent-id",
      "therapistId": "therapist-id",
      "diagnosis": "Autism Spectrum Disorder",
      "startDate": "2023-01-01T00:00:00.000Z",
      "isActive": true,
      "notes": "Needs extra attention",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Child by ID
- **URL**: `/children/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Parent, Therapist, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Child retrieved successfully",
  "data": {
    "_id": "child-id",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "2020-01-01T00:00:00.000Z",
    "gender": "female",
    "parentId": "parent-id",
    "therapistId": "therapist-id",
    "diagnosis": "Autism Spectrum Disorder",
    "startDate": "2023-01-01T00:00:00.000Z",
    "isActive": true,
    "notes": "Needs extra attention",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Create Child
- **URL**: `/children`
- **Method**: `POST`
- **Auth Required**: Yes (Parent, Admin)
- **Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "2020-01-01T00:00:00.000Z",
  "gender": "female",
  "diagnosis": "Autism Spectrum Disorder",
  "notes": "Needs extra attention"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Child created successfully",
  "data": {
    "_id": "child-id",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "2020-01-01T00:00:00.000Z",
    "gender": "female",
    "parentId": "parent-id",
    "therapistId": null,
    "diagnosis": "Autism Spectrum Disorder",
    "startDate": "2023-01-01T00:00:00.000Z",
    "isActive": true,
    "notes": "Needs extra attention",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Child
- **URL**: `/children/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Parent, Admin)
- **Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "2020-01-01T00:00:00.000Z",
  "gender": "female",
  "diagnosis": "Autism Spectrum Disorder",
  "notes": "Making good progress",
  "isActive": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Child updated successfully",
  "data": {
    "_id": "child-id",
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "2020-01-01T00:00:00.000Z",
    "gender": "female",
    "parentId": "parent-id",
    "therapistId": "therapist-id",
    "diagnosis": "Autism Spectrum Disorder",
    "startDate": "2023-01-01T00:00:00.000Z",
    "isActive": true,
    "notes": "Making good progress",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Delete Child (Soft Delete)
- **URL**: `/children/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Parent, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Child deleted successfully",
  "data": {}
}
```

### Program Management

#### Get Programs by Child ID
- **URL**: `/programs/child/:childId`
- **Method**: `GET`
- **Auth Required**: Yes (Therapist, Parent, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Programs retrieved successfully",
  "data": [
    {
      "_id": "program-id",
      "childId": "child-id",
      "title": "Requesting Skills",
      "abllsCode": "R12",
      "category": "Communication",
      "shortDescription": "Teaching requesting skills",
      "longDescription": "Detailed description of the program...",
      "masteryCriteria": "3 consecutive correct responses",
      "dataCollectionMethod": "frequency",
      "targets": [
        {
          "_id": "target-id",
          "description": "Request preferred item using vocalization",
          "isMastered": false,
          "masteredDate": null,
          "notes": "Working on this target",
          "createdAt": "2023-01-01T00:00:00.000Z",
          "updatedAt": "2023-01-01T00:00:00.000Z"
        }
      ],
      "isArchived": false,
      "archivedDate": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Program by ID
- **URL**: `/programs/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Therapist, Parent, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Program retrieved successfully",
  "data": {
    "_id": "program-id",
    "childId": "child-id",
    "title": "Requesting Skills",
    "abllsCode": "R12",
    "category": "Communication",
    "shortDescription": "Teaching requesting skills",
    "longDescription": "Detailed description of the program...",
    "masteryCriteria": "3 consecutive correct responses",
    "dataCollectionMethod": "frequency",
    "targets": [
      {
        "_id": "target-id",
        "description": "Request preferred item using vocalization",
        "isMastered": false,
        "masteredDate": null,
        "notes": "Working on this target",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "isArchived": false,
    "archivedDate": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Create Program
- **URL**: `/programs`
- **Method**: `POST`
- **Auth Required**: Yes (Therapist, Admin)
- **Body**:
```json
{
  "childId": "child-id",
  "title": "Requesting Skills",
  "abllsCode": "R12",
  "category": "Communication",
  "shortDescription": "Teaching requesting skills",
  "longDescription": "Detailed description of the program...",
  "masteryCriteria": "3 consecutive correct responses",
  "dataCollectionMethod": "frequency",
  "targets": [
    {
      "description": "Request preferred item using vocalization",
      "notes": "Working on this target"
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Program created successfully",
  "data": {
    "_id": "program-id",
    "childId": "child-id",
    "title": "Requesting Skills",
    "abllsCode": "R12",
    "category": "Communication",
    "shortDescription": "Teaching requesting skills",
    "longDescription": "Detailed description of the program...",
    "masteryCriteria": "3 consecutive correct responses",
    "dataCollectionMethod": "frequency",
    "targets": [
      {
        "_id": "target-id",
        "description": "Request preferred item using vocalization",
        "isMastered": false,
        "masteredDate": null,
        "notes": "Working on this target",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "isArchived": false,
    "archivedDate": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Program
- **URL**: `/programs/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Therapist, Admin)
- **Body**:
```json
{
  "title": "Updated Requesting Skills",
  "abllsCode": "R12",
  "category": "Communication",
  "shortDescription": "Updated description",
  "longDescription": "Updated detailed description...",
  "masteryCriteria": "5 consecutive correct responses",
  "dataCollectionMethod": "frequency",
  "isArchived": false
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Program updated successfully",
  "data": {
    "_id": "program-id",
    "childId": "child-id",
    "title": "Updated Requesting Skills",
    "abllsCode": "R12",
    "category": "Communication",
    "shortDescription": "Updated description",
    "longDescription": "Updated detailed description...",
    "masteryCriteria": "5 consecutive correct responses",
    "dataCollectionMethod": "frequency",
    "targets": [
      {
        "_id": "target-id",
        "description": "Request preferred item using vocalization",
        "isMastered": false,
        "masteredDate": null,
        "notes": "Working on this target",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "isArchived": false,
    "archivedDate": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Delete Program (Archive)
- **URL**: `/programs/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Therapist, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Program archived successfully",
  "data": {
    "_id": "program-id",
    "childId": "child-id",
    "title": "Requesting Skills",
    "abllsCode": "R12",
    "category": "Communication",
    "shortDescription": "Teaching requesting skills",
    "longDescription": "Detailed description of the program...",
    "masteryCriteria": "3 consecutive correct responses",
    "dataCollectionMethod": "frequency",
    "targets": [
      {
        "_id": "target-id",
        "description": "Request preferred item using vocalization",
        "isMastered": false,
        "masteredDate": null,
        "notes": "Working on this target",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "isArchived": true,
    "archivedDate": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Target in Program
- **URL**: `/programs/:id/targets/:targetId`
- **Method**: `PUT`
- **Auth Required**: Yes (Therapist, Admin)
- **Body**:
```json
{
  "isMastered": true,
  "notes": "Target mastered on 3 consecutive trials"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Target updated successfully",
  "data": {
    "_id": "program-id",
    "childId": "child-id",
    "title": "Requesting Skills",
    "abllsCode": "R12",
    "category": "Communication",
    "shortDescription": "Teaching requesting skills",
    "longDescription": "Detailed description of the program...",
    "masteryCriteria": "3 consecutive correct responses",
    "dataCollectionMethod": "frequency",
    "targets": [
      {
        "_id": "target-id",
        "description": "Request preferred item using vocalization",
        "isMastered": true,
        "masteredDate": "2023-01-01T00:00:00.000Z",
        "notes": "Target mastered on 3 consecutive trials",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "isArchived": false,
    "archivedDate": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Notification Management

#### Get Notifications for Current User
- **URL**: `/notifications`
- **Method**: `GET`
- **Auth Required**: Yes (All users)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of notifications per page (default: 10)
  - `isRead`: Filter by read status (true/false)
- **Response**:
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification-id",
        "recipientId": "user-id",
        "senderId": "admin-id",
        "title": "New Program Assigned",
        "message": "A new program has been assigned to Jane Doe",
        "type": "info",
        "priority": "normal",
        "isRead": false,
        "readAt": null,
        "expiresAt": null,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "totalPages": 1,
    "currentPage": 1
  }
}
```

#### Get Notification by ID
- **URL**: `/notifications/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Recipient)
- **Response**:
```json
{
  "success": true,
  "message": "Notification retrieved successfully",
  "data": {
    "_id": "notification-id",
    "recipientId": "user-id",
    "senderId": "admin-id",
    "title": "New Program Assigned",
    "message": "A new program has been assigned to Jane Doe",
    "type": "info",
    "priority": "normal",
    "isRead": false,
    "readAt": null,
    "expiresAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Create Notification (Admin only)
- **URL**: `/notifications`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Body**:
```json
{
  "recipientId": "user-id", // Optional, null for broadcast
  "title": "System Maintenance",
  "message": "The system will be down for maintenance tomorrow",
  "type": "warning", // info, warning, success, error, broadcast
  "priority": "high", // low, normal, high, urgent
  "expiresAt": "2023-01-02T00:00:00.000Z" // Optional
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "_id": "notification-id",
    "recipientId": "user-id",
    "senderId": "admin-id",
    "title": "System Maintenance",
    "message": "The system will be down for maintenance tomorrow",
    "type": "warning",
    "priority": "high",
    "isRead": false,
    "readAt": null,
    "expiresAt": "2023-01-02T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Mark Notification as Read
- **URL**: `/notifications/:id/read`
- **Method**: `PUT`
- **Auth Required**: Yes (Recipient)
- **Response**:
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "notification-id",
    "recipientId": "user-id",
    "senderId": "admin-id",
    "title": "New Program Assigned",
    "message": "A new program has been assigned to Jane Doe",
    "type": "info",
    "priority": "normal",
    "isRead": true,
    "readAt": "2023-01-01T00:00:00.000Z",
    "expiresAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Mark All Notifications as Read
- **URL**: `/notifications/read-all`
- **Method**: `PUT`
- **Auth Required**: Yes (User)
- **Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

#### Delete Notification
- **URL**: `/notifications/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Recipient, Admin)
- **Response**:
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {}
}
```

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | User's full name |
| email | String | Email address (unique) |
| password | String | Hashed password |
| role | String | User role (parent, therapist, admin) |
| isActive | Boolean | Account status |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Child
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| firstName | String | Child's first name |
| lastName | String | Child's last name |
| dateOfBirth | Date | Child's date of birth |
| gender | String | Gender (male, female, other) |
| parentId | ObjectId | Reference to parent user |
| therapistId | ObjectId | Reference to therapist user (optional) |
| diagnosis | String | Medical diagnosis |
| startDate | Date | Therapy start date |
| isActive | Boolean | Active status |
| notes | String | Additional notes |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Program
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| childId | ObjectId | Reference to child |
| title | String | Program title |
| abllsCode | String | ABLLS-R code (optional) |
| category | String | Program category |
| shortDescription | String | Brief description |
| longDescription | String | Detailed description |
| masteryCriteria | String | Criteria for mastery |
| dataCollectionMethod | String | Method for data collection |
| targets | Array | Array of targets |
| isArchived | Boolean | Archive status |
| archivedDate | Date | Archive timestamp |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Target
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| description | String | Target description |
| isMastered | Boolean | Mastery status |
| masteredDate | Date | Date when mastered |
| notes | String | Additional notes |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Notification
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| recipientId | ObjectId | Reference to recipient user |
| senderId | ObjectId | Reference to sender user |
| title | String | Notification title |
| message | String | Notification message |
| type | String | Type of notification |
| priority | String | Notification priority |
| isRead | Boolean | Read status |
| readAt | Date | Read timestamp |
| expiresAt | Date | Expiration timestamp |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Invoice
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| parentId | ObjectId | Reference to parent user |
| childId | ObjectId | Reference to child |
| amount | Number | Invoice amount |
| description | String | Invoice description |
| issuedDate | Date | Invoice issue date |
| dueDate | Date | Invoice due date |
| paidDate | Date | Payment date (if paid) |
| status | String | Invoice status (pending, paid, overdue, cancelled) |
| invoiceNumber | String | Unique invoice number |
| notes | String | Additional notes |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Complaint
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| parentId | ObjectId | Reference to parent user |
| childId | ObjectId | Reference to child |
| subject | String | Complaint subject |
| description | String | Detailed complaint description |
| status | String | Complaint status (pending, under-review, resolved, rejected) |
| priority | String | Complaint priority (low, medium, high) |
| category | String | Complaint category (service, staff, billing, facility, other) |
| response | String | Admin response to complaint |
| resolvedDate | Date | Resolution date |
| rejectionReason | String | Reason for rejection (if rejected) |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Schedule
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| therapistId | ObjectId | Reference to therapist user |
| childId | ObjectId | Reference to child |
| date | Date | Session date |
| time | String | Session time (HH:MM format) |
| duration | Number | Session duration in minutes |
| sessionType | String | Type of session (assessment, therapy, evaluation, consultation, other) |
| notes | String | Additional notes |
| status | String | Schedule status (scheduled, completed, cancelled, rescheduled) |
| recurring | Boolean | Whether this is a recurring session |
| recurrencePattern | String | Recurrence pattern (daily, weekly, monthly, custom) |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### LeaveRequest
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| therapistId | ObjectId | Reference to therapist user |
| leaveType | String | Type of leave (vacation, sick, personal, professional-development, emergency, other) |
| startDate | Date | Leave start date |
| endDate | Date | Leave end date |
| reason | String | Reason for leave |
| status | String | Leave status (pending, approved, rejected) |
| rejectionReason | String | Reason for rejection (if rejected) |
| approvedBy | ObjectId | Reference to admin who approved |
| approvedDate | Date | Approval date |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### Fee
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| parentId | ObjectId | Reference to parent user |
| childId | ObjectId | Reference to child |
| amount | Number | Fee amount |
| description | String | Fee description |
| dueDate | Date | Fee due date |
| paidDate | Date | Payment date (if paid) |
| status | String | Fee status (pending, paid, overdue, cancelled) |
| feeType | String | Type of fee (therapy-session, assessment, consultation, materials, other) |
| invoiceId | ObjectId | Reference to associated invoice |
| notes | String | Additional notes |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |