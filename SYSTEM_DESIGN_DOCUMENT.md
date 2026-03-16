# System Design Document (SDD)
## Rwanda School Bridge System (RSBS)
## Assignment No. 3 - Software Modeling Design

**Version:** 1.0  
**Date:** 2024  
**Prepared by:** [Your Name]  
**Project:** Schools Management System

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Use Case Diagrams](#2-use-case-diagrams)
3. [Class Diagrams](#3-class-diagrams)
4. [Sequence Diagrams](#4-sequence-diagrams)
5. [Activity Diagrams](#5-activity-diagrams)
6. [Entity Relationship Diagram (ERD)](#6-entity-relationship-diagram-erd)
7. [System Architecture Diagram](#7-system-architecture-diagram)
8. [Database Schema](#8-database-schema)

---

## 1. Introduction

### 1.1 Purpose
This document presents the system design and modeling diagrams for the Rwanda School Bridge System. It includes UML diagrams, database design, and system architecture specifications.

### 1.2 Scope
This document covers:
- Use case modeling for all user roles
- Class structure and relationships
- Sequence of interactions
- Activity flows
- Database entity relationships
- System architecture

---

## 2. Use Case Diagrams

### 2.1 Overall System Use Case Diagram

```
                    ┌─────────────────────────────────────┐
                    │   Rwanda School Bridge System        │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   Student     │          │    Parent     │          │    Teacher     │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        │                           │                           │
        ├─ Browse Schools           ├─ View Child Grades        ├─ Enter Grades
        ├─ Search Schools          ├─ View Report Cards        ├─ Bulk Upload Grades
        ├─ View School Details     ├─ Pay Fees                 ├─ Generate Report Cards
        ├─ Apply to School         ├─ View Events              ├─ Create Events
        ├─ Upload Documents        ├─ RSVP Events             ├─ View Students
        ├─ Track Applications      ├─ Chat with Teachers       ├─ Chat with Students/Parents
        ├─ View Grades             ├─ View Scholarships        │
        ├─ View Report Cards       ├─ Apply Scholarships       │
        ├─ View Events             └───────────────────────────┘
        ├─ RSVP Events
        ├─ Apply Scholarships
        ├─ Chat with Teachers
        └─ Respond to Surveys

        ┌───────────────┐          ┌───────────────┐
        │    Leader     │          │   Administrator│
        └───────────────┘          └───────────────┘
                │                           │
                │                           │
                ├─ Manage School Profile   ├─ Manage Users
                ├─ Review Applications    ├─ Manage Schools
                ├─ Approve/Reject Apps     ├─ Assign Leaders
                ├─ Manage Galleries        ├─ Manage Parent-Child Links
                ├─ Create Scholarships     ├─ View Analytics
                ├─ Review Scholarship Apps ├─ Manage Surveys
                ├─ Assign Parents         ├─ System Settings
                ├─ View Statistics        └─ View All Data
                ├─ Create Events
                └─ Chat with Users
```

### 2.2 Student Use Case Diagram

**Actors:** Student, System

**Use Cases:**
1. **Browse Schools**
   - Includes: Search Schools, Filter Schools, View on Map
   
2. **Apply to School**
   - Includes: Fill Application Form, Upload Documents, Submit Application
   - Extends: View School Details

3. **View Grades**
   - Includes: Filter by Term, Filter by Academic Year

4. **View Report Cards**
   - Includes: Download PDF

5. **Apply for Scholarship**
   - Includes: Upload Documents, Track Status

6. **Chat with Teachers**
   - Includes: Send Messages, Receive Messages

### 2.3 Teacher Use Case Diagram

**Actors:** Teacher, System, Student, Parent

**Use Cases:**
1. **Enter Grades**
   - Includes: Select Student, Enter Grade Data, Add Comments
   - Extends: Notify Student, Notify Parents

2. **Bulk Upload Grades**
   - Includes: Upload CSV, Validate Data, Process Grades

3. **Generate Report Cards**
   - Includes: Calculate Overall Grade, Generate PDF, Send Email

4. **Create Events**
   - Includes: Set Event Details, Set Audience, Send Notifications

### 2.4 Leader Use Case Diagram

**Actors:** Leader, System, Student, Application

**Use Cases:**
1. **Review Application**
   - Includes: View Application Details, View Documents
   - Extends: Approve Application, Reject Application

2. **Manage School Profile**
   - Includes: Update School Info, Upload Gallery, Set Location

3. **Assign Parent to Child**
   - Includes: Search Parent, Link Relationship

### 2.5 Administrator Use Case Diagram

**Actors:** Administrator, System, All Users

**Use Cases:**
1. **Manage Users**
   - Includes: Create User, Update User, Delete User, Assign Role

2. **Manage Schools**
   - Includes: Create School, Update School, Delete School, Assign Leader

3. **View Analytics**
   - Includes: User Statistics, School Statistics, Application Trends

---

## 3. Class Diagrams

### 3.1 Main System Classes

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - email: String                                              │
│ - password_hash: String                                      │
│ - first_name: String                                         │
│ - last_name: String                                          │
│ - role: Enum (Student, Parent, Teacher, Leader, Admin)       │
│ - phone: String                                              │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + login()                                                    │
│ + logout()                                                   │
│ + updateProfile()                                            │
└─────────────────────────────────────────────────────────────┘
                    ▲
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────┴────┐ ┌────┴────┐ ┌────┴────┐
│  Student   │ │ Parent  │ │ Teacher │
└────────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────────────┐
│                         School                               │
├─────────────────────────────────────────────────────────────┤
│ - id: String                                                 │
│ - name: String                                               │
│ - type: Enum (Public, Private)                                │
│ - level: Enum (Primary, Secondary)                           │
│ - location: String                                           │
│ - latitude: Decimal                                          │
│ - longitude: Decimal                                         │
│ - description: Text                                          │
│ - uniform_info: Text                                         │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + create()                                                   │
│ + update()                                                   │
│ + delete()                                                   │
│ + search()                                                   │
│ + calculateDistance()                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
┌─────────────────────────────────────────────────────────────┐
│                    StudentApplication                        │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - student_id: Integer (FK -> User)                           │
│ - school_id: String (FK -> School)                           │
│ - status: Enum (Pending, Approved, Rejected, Withdrawn)      │
│ - rejection_reason: Text                                      │
│ - documents: JSON                                             │
│ - submitted_at: DateTime                                      │
├─────────────────────────────────────────────────────────────┤
│ + submit()                                                   │
│ + approve()                                                   │
│ + reject()                                                    │
│ + withdraw()                                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          Grade                               │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - student_user_id: Integer (FK -> User)                      │
│ - school_id: String (FK -> School)                           │
│ - subject: String                                            │
│ - grade: String (A, B, C, D, F)                             │
│ - score: Decimal                                             │
│ - max_score: Decimal                                         │
│ - term: String                                               │
│ - academic_year: String                                      │
│ - teacher_id: Integer (FK -> User)                          │
│ - comments: Text                                             │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + create()                                                   │
│ + update()                                                   │
│ + delete()                                                   │
│ + calculateOverallGrade()                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ *
                    │
                    │ 1
┌─────────────────────────────────────────────────────────────┐
│                      ReportCard                             │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - student_user_id: Integer (FK -> User)                      │
│ - school_id: String (FK -> School)                           │
│ - term: String                                               │
│ - academic_year: String                                      │
│ - overall_grade: String                                      │
│ - overall_percentage: Decimal                                │
│ - attendance_percentage: Decimal                             │
│ - teacher_comments: Text                                     │
│ - principal_comments: Text                                   │
│ - generated_at: DateTime                                     │
├─────────────────────────────────────────────────────────────┤
│ + generate()                                                 │
│ + calculateOverallGrade()                                   │
│ + generatePDF()                                              │
│ + sendEmail()                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Event                                │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - school_id: String (FK -> School)                           │
│ - title: String                                              │
│ - description: Text                                          │
│ - event_type: Enum                                           │
│ - date: DateTime                                             │
│ - location: String                                           │
│ - audience_role: Enum                                        │
│ - created_by: Integer (FK -> User)                          │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + create()                                                   │
│ + update()                                                   │
│ + delete()                                                   │
│ + sendNotifications()                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
┌─────────────────────────────────────────────────────────────┐
│                      EventRSVP                              │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - event_id: Integer (FK -> Event)                            │
│ - user_id: Integer (FK -> User)                              │
│ - status: Enum (Going, Not Going, Maybe)                     │
│ - rsvp_at: DateTime                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ParentChildRelationship                   │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - parent_id: Integer (FK -> User)                            │
│ - child_id: Integer (FK -> User)                             │
│ - relationship_type: String                                  │
│ - is_primary: Boolean                                        │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + link()                                                     │
│ + unlink()                                                   │
│ + getChildren()                                              │
│ + getParents()                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ChatRoom                                │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - name: String                                               │
│ - type: Enum (Direct, Group)                                 │
│ - created_by: Integer (FK -> User)                          │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + create()                                                   │
│ + addMember()                                                │
│ + removeMember()                                             │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
┌─────────────────────────────────────────────────────────────┐
│                      ChatMessage                            │
├─────────────────────────────────────────────────────────────┤
│ - id: Integer                                                │
│ - room_id: Integer (FK -> ChatRoom)                          │
│ - sender_id: Integer (FK -> User)                            │
│ - message_text: Text                                         │
│ - attachment_url: String                                     │
│ - read: Boolean                                              │
│ - created_at: DateTime                                       │
├─────────────────────────────────────────────────────────────┤
│ + send()                                                     │
│ + markAsRead()                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Relationships Summary

- **User** (1) ──< (0..*) **StudentApplication** (Student applies)
- **User** (1) ──< (0..*) **Grade** (Teacher creates, Student receives)
- **User** (1) ──< (0..*) **ReportCard** (Student receives)
- **School** (1) ──< (0..*) **StudentApplication** (School receives)
- **School** (1) ──< (0..*) **Grade** (School has grades)
- **User** (1) ──< (0..*) **ParentChildRelationship** (as Parent)
- **User** (1) ──< (0..*) **ParentChildRelationship** (as Child)
- **Event** (1) ──< (0..*) **EventRSVP** (Event has RSVPs)
- **ChatRoom** (1) ──< (0..*) **ChatMessage** (Room has messages)

---

## 4. Sequence Diagrams

### 4.1 Student Application Submission Sequence

```
Student          Frontend         Backend          Database        EmailService
  │                 │                │                │                │
  │─Browse Schools─>│                │                │                │
  │<─School List────│                │                │                │
  │                 │                │                │                │
  │─Select School──>│                │                │                │
  │─Click Apply────>│                │                │                │
  │                 │─POST /api/applications─────────>│                │
  │                 │                │─Validate──────>│                │
  │                 │                │<─User Data────│                │
  │                 │                │─Insert App────>│                │
  │                 │                │<─App Created───│                │
  │                 │                │─Send Email─────┼───────────────>│
  │                 │                │                │                │
  │                 │<─Success───────│                │                │
  │<─Confirmation───│                │                │                │
  │                 │                │                │                │
```

### 4.2 Grade Entry and Notification Sequence

```
Teacher          Frontend         Backend          Database        NotificationService
  │                 │                │                │                │
  │─Enter Grade────>│                │                │                │
  │                 │─POST /api/grades───────────────>│                │
  │                 │                │─Validate──────>│                │
  │                 │                │─Insert Grade───>│                │
  │                 │                │<─Grade Saved───│                │
  │                 │                │─Get Parents────>│                │
  │                 │                │<─Parent List────│                │
  │                 │                │─Notify Student──┼───────────────>│
  │                 │                │─Notify Parents──┼───────────────>│
  │                 │                │─Send Emails────┼───────────────>│
  │                 │                │                │                │
  │                 │<─Success───────│                │                │
  │<─Grade Saved───│                │                │                │
  │                 │                │                │                │
```

### 4.3 Application Review Sequence

```
Leader           Frontend         Backend          Database        EmailService
  │                 │                │                │                │
  │─View Apps──────>│                │                │                │
  │                 │─GET /api/applications─────────>│                │
  │                 │                │─Query Apps─────>│                │
  │                 │                │<─App List───────│                │
  │<─App List───────│                │                │                │
  │                 │                │                │                │
  │─Select App─────>│                │                │                │
  │─Approve/Reject─>│                │                │                │
  │                 │─PUT /api/applications/:id──────>│                │
  │                 │                │─Update Status──>│                │
  │                 │                │<─Updated────────│                │
  │                 │                │─Get Student─────>│                │
  │                 │                │<─Student Data───│                │
  │                 │                │─Send Email──────┼───────────────>│
  │                 │                │                │                │
  │                 │<─Success───────│                │                │
  │<─Updated────────│                │                │                │
  │                 │                │                │                │
```

### 4.4 Bulk Grade Upload Sequence

```
Teacher          Frontend         Backend          Database        NotificationService
  │                 │                │                │                │
  │─Select CSV─────>│                │                │                │
  │─Upload─────────>│                │                │                │
  │                 │─POST /api/grades/bulk-upload───>│                │
  │                 │                │─Parse CSV───────│                │
  │                 │                │─For Each Row:───│                │
  │                 │                │  └─Validate─────>│                │
  │                 │                │  └─Find Student─>│                │
  │                 │                │  └─Insert Grade>│                │
  │                 │                │  └─Notify───────┼───────────────>│
  │                 │                │                │                │
  │                 │<─Results───────│                │                │
  │<─Upload Complete│                │                │                │
  │                 │                │                │                │
```

### 4.5 Report Card Generation Sequence

```
Teacher          Frontend         Backend          Database        EmailService
  │                 │                │                │                │
  │─Generate Report>│                │                │                │
  │                 │─POST /api/report-cards/generate>│                │
  │                 │                │─Get Grades─────>│                │
  │                 │                │<─Grade List────│                │
  │                 │                │─Calculate───────│                │
  │                 │                │─Insert Report──>│                │
  │                 │                │<─Report Saved──│                │
  │                 │                │─Get Parents─────>│                │
  │                 │                │<─Parent List────│                │
  │                 │                │─Send Emails────┼───────────────>│
  │                 │                │                │                │
  │                 │<─Success───────│                │                │
  │<─Report Generated│                │                │                │
  │                 │                │                │                │
```

---

## 5. Activity Diagrams

### 5.1 Student Application Process

```
[Start]
   │
   ▼
[Login to System]
   │
   ▼
[Browse Schools]
   │
   ▼
[Select School]
   │
   ▼
[Click Apply Button]
   │
   ▼
[Fill Application Form]
   │
   ├─[Enter Personal Info]
   │
   ├─[Upload Documents]
   │
   └─[Review Information]
   │
   ▼
{All Fields Valid?}
   │
   ├─No──>[Show Error]───┐
   │                     │
   └─Yes                 │
      │                 │
      ▼                 │
[Submit Application]    │
      │                 │
      ▼                 │
[System Validates]      │
      │                 │
      ▼                 │
[Save to Database]      │
      │                 │
      ▼                 │
[Send Confirmation Email]│
      │                 │
      ▼                 │
[Notify School Leader]  │
      │                 │
      ▼                 │
[Application Status: Pending]
      │
      ▼
[Wait for Review]
      │
      ▼
{Status Changed?}
      │
      ├─Yes──>[Receive Notification]
      │        │
      │        ▼
      │     {Approved?}
      │        │
      │        ├─Yes──>[View Acceptance]
      │        │
      │        └─No───>[View Rejection Reason]
      │
      └─No───>[Continue Waiting]
      │
      ▼
[End]
```

### 5.2 Grade Entry Process

```
[Start]
   │
   ▼
[Teacher Login]
   │
   ▼
[Navigate to Grades]
   │
   ▼
{Upload Method?}
   │
   ├─Single Entry──>[Select Student]
   │                  │
   │                  ▼
   │               [Enter Grade Data]
   │                  │
   │                  ▼
   │               [Add Comments]
   │                  │
   │                  ▼
   │               [Submit]
   │                  │
   └─Bulk Upload──>[Select CSV File]
                     │
                     ▼
                  [Upload File]
                     │
                     ▼
                  [Parse CSV]
                     │
                     ▼
                  [Validate Each Row]
                     │
                     ▼
                  [Process Valid Rows]
   │
   ▼
[System Validates Data]
   │
   ▼
{Valid?}
   │
   ├─No──>[Show Error]───┐
   │                     │
   └─Yes                 │
      │                 │
      ▼                 │
[Save Grade(s) to Database]
      │                 │
      ▼                 │
[Calculate Overall Grade]
      │                 │
      ▼                 │
[Find Student's Parents]
      │                 │
      ▼                 │
[Create Notification for Student]
      │                 │
      ▼                 │
[Create Notifications for Parents]
      │                 │
      ▼                 │
[Send Email Notifications]
      │                 │
      ▼                 │
[Display Success Message]
      │
      ▼
[End]
```

### 5.3 Application Review Process

```
[Start]
   │
   ▼
[Leader Login]
   │
   ▼
[View Pending Applications]
   │
   ▼
[Select Application]
   │
   ▼
[View Application Details]
   │
   ├─[View Student Information]
   │
   ├─[View Documents]
   │
   └─[View Application History]
   │
   ▼
{Decision?}
   │
   ├─Approve──>[Click Approve]
   │             │
   │             ▼
   │          [Update Status: Approved]
   │             │
   │             ▼
   │          [Save to Database]
   │             │
   │             ▼
   │          [Send Approval Email]
   │             │
   │             ▼
   │          [Notify Student]
   │
   └─Reject───>[Click Reject]
                │
                ▼
             [Enter Rejection Reason]
                │
                ▼
             [Update Status: Rejected]
                │
                ▼
             [Save to Database]
                │
                ▼
             [Send Rejection Email]
                │
                ▼
             [Notify Student]
   │
   ▼
[End]
```

### 5.4 Parent-Child Linking Process

```
[Start]
   │
   ▼
[Leader/Admin Login]
   │
   ▼
[Navigate to Student Management]
   │
   ▼
[Select Student]
   │
   ▼
[Click "Assign Parent"]
   │
   ▼
[Search for Parent]
   │
   ├─[Search by Email]
   │
   └─[Search by Name]
   │
   ▼
[Display Matching Parents]
   │
   ▼
[Select Parent]
   │
   ▼
[Set Relationship Type]
   │
   ├─[Parent]
   │
   ├─[Guardian]
   │
   └─[Other]
   │
   ▼
[Set Primary Status]
   │
   ├─[Primary Parent]
   │
   └─[Secondary Parent]
   │
   ▼
[Submit Relationship]
   │
   ▼
[System Validates]
   │
   ├─[Check if relationship exists]
   │
   └─[Check if parent/child roles are correct]
   │
   ▼
{Valid?}
   │
   ├─No──>[Show Error]───┐
   │                     │
   └─Yes                 │
      │                 │
      ▼                 │
[Save to Database]
      │                 │
      ▼                 │
[Confirm Success]
      │                 │
      ▼                 │
[Parent can now view child's data]
      │
      ▼
[End]
```

---

## 6. Entity Relationship Diagram (ERD)

### 6.1 Complete ERD Description

```
┌─────────────┐
│    users    │
├─────────────┤
│ PK id       │
│    email    │
│    password │
│    role     │
│    ...      │
└─────────────┘
       │
       │ 1
       │
       │ *
┌──────────────────────┐
│ parent_child_        │
│ relationships        │
├──────────────────────┤
│ PK id                │
│ FK parent_id ────────┼──┐
│ FK child_id          │  │
│    relationship_type │  │
│    is_primary        │  │
└──────────────────────┘  │
                          │
                          │
┌─────────────┐          │
│   schools   │          │
├─────────────┤          │
│ PK id       │          │
│    name     │          │
│    type     │          │
│    location │          │
│    lat/lng  │          │
└─────────────┘          │
       │                 │
       │ 1               │
       │                 │
       │ *               │
┌──────────────────────┐ │
│ student_applications │ │
├──────────────────────┤ │
│ PK id                │ │
│ FK student_id ───────┼─┘
│ FK school_id ────────┼──┐
│    status            │  │
│    documents         │  │
└──────────────────────┘  │
                          │
┌─────────────┐          │
│    grades   │          │
├─────────────┤          │
│ PK id       │          │
│ FK student_id ────────┼─┘
│ FK school_id ────────┼──┐
│ FK teacher_id ───────┼──┼──┐
│    subject           │  │  │
│    grade             │  │  │
│    score             │  │  │
│    term              │  │  │
│    academic_year     │  │  │
└─────────────┘          │  │  │
       │                 │  │  │
       │ *               │  │  │
       │                 │  │  │
       │ 1               │  │  │
┌──────────────────────┐ │  │  │
│   report_cards       │ │  │  │
├──────────────────────┤ │  │  │
│ PK id                │ │  │  │
│ FK student_id ───────┼─┘  │  │
│ FK school_id ────────┼────┘  │
│    term              │       │
│    academic_year     │       │
│    overall_grade     │       │
│    overall_percentage│       │
└──────────────────────┘       │
                               │
┌─────────────┐                │
│    events   │                │
├─────────────┤                │
│ PK id       │                │
│ FK school_id ────────────────┘
│ FK created_by ────────────────┐
│    title                      │
│    description                │
│    event_type                 │
│    date                       │
└─────────────┘                 │
       │                        │
       │ 1                      │
       │                        │
       │ *                      │
┌──────────────────────┐        │
│   event_rsvps        │        │
├──────────────────────┤        │
│ PK id                │        │
│ FK event_id          │        │
│ FK user_id ──────────┼────────┘
│    status            │
└──────────────────────┘

┌─────────────┐
│ chat_rooms  │
├─────────────┤
│ PK id       │
│ FK created_by ────┐
│    name           │
│    type           │
└─────────────┘     │
       │            │
       │ 1          │
       │            │
       │ *          │
┌──────────────────────┐
│  chat_messages       │
├──────────────────────┤
│ PK id                │
│ FK room_id           │
│ FK sender_id ────────┘
│    message_text      │
│    attachment_url    │
│    read              │
└──────────────────────┘

┌─────────────┐
│ scholarships│
├─────────────┤
│ PK id       │
│ FK school_id ────┐
│ FK created_by ───┼──┐
│    title         │  │
│    description   │  │
│    slots         │  │
└─────────────┘     │  │
       │            │  │
       │ 1          │  │
       │            │  │
       │ *          │  │
┌──────────────────────┐ │
│ scholarship_         │ │
│ applications         │ │
├──────────────────────┤ │
│ PK id                │ │
│ FK scholarship_id    │ │
│ FK student_id ───────┼─┘
│    status            │
│    documents         │
└──────────────────────┘

┌─────────────┐
│  galleries  │
├─────────────┤
│ PK id       │
│ FK school_id ────┐
│    title         │
│    description   │
└─────────────┘     │
       │            │
       │ 1          │
       │            │
       │ *          │
┌──────────────────────┐
│  gallery_items       │
├──────────────────────┤
│ PK id                │
│ FK gallery_id        │
│    file_url          │
│    file_type         │
│    order_index       │
└──────────────────────┘
```

### 6.2 Key Relationships

1. **User Relationships:**
   - User (1) ──< (0..*) StudentApplication (as student)
   - User (1) ──< (0..*) Grade (as student)
   - User (1) ──< (0..*) Grade (as teacher)
   - User (1) ──< (0..*) ParentChildRelationship (as parent)
   - User (1) ──< (0..*) ParentChildRelationship (as child)
   - User (1) ──< (0..*) Event (as creator)
   - User (1) ──< (0..*) EventRSVP
   - User (1) ──< (0..*) ChatMessage (as sender)
   - User (1) ──< (0..*) ChatRoom (as creator)

2. **School Relationships:**
   - School (1) ──< (0..*) StudentApplication
   - School (1) ──< (0..*) Grade
   - School (1) ──< (0..*) ReportCard
   - School (1) ──< (0..*) Event
   - School (1) ──< (0..*) Scholarship
   - School (1) ──< (0..*) Gallery

3. **Composite Relationships:**
   - Grade (*) ──> (1) ReportCard (calculated from grades)
   - Event (1) ──< (0..*) EventRSVP
   - ChatRoom (1) ──< (0..*) ChatMessage
   - Gallery (1) ──< (0..*) GalleryItem

### 6.3 Database Tables Summary

**Core Tables:**
1. `users` - All system users (students, parents, teachers, leaders, admins)
2. `schools` - School information
3. `student_applications` - Student applications to schools
4. `grades` - Individual subject grades
5. `report_cards` - Generated report cards
6. `events` - School events
7. `event_rsvps` - Event attendance
8. `parent_child_relationships` - Parent-child links
9. `chat_rooms` - Chat rooms
10. `chat_messages` - Chat messages
11. `scholarships` - Scholarship opportunities
12. `scholarship_applications` - Scholarship applications
13. `galleries` - Photo/video galleries
14. `gallery_items` - Gallery items
15. `notifications` - System notifications
16. `fee_schedules` - Fee structures
17. `fee_invoices` - Student invoices
18. `payment_transactions` - Payment records
19. `survey_templates` - Survey templates
20. `survey_questions` - Survey questions
21. `survey_responses` - Survey responses
22. `survey_answers` - Survey answers

---

## 7. System Architecture Diagram

### 7.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│                    (Frontend - Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Student  │  │  Parent  │  │ Teacher │  │  Leader  │    │
│  │  Portal  │  │  Portal  │  │  Portal  │  │  Portal  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Home   │  │  Schools │  │   Chat   │  │  Admin   │    │
│  │   Page   │  │   Page   │  │  Window │  │ Dashboard│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Components & Tailwind CSS              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        │ REST API
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│                   (Backend - Node.js/Express)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth        │  │   Schools    │  │   Grades    │      │
│  │   Routes      │  │   Routes     │  │   Routes    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Applications │  │    Events    │  │    Chat      │      │
│  │   Routes     │  │   Routes     │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Payments     │  │ Scholarships │  │  Surveys     │      │
│  │   Routes      │  │   Routes     │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware: Auth, Validation, Error Handling│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      DATA LAYER                               │
│                   (PostgreSQL Database)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   users  │  │ schools  │  │  grades  │  │ events  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │applications│ │report_  │  │chat_    │  │scholarships│    │
│  │           │ │cards    │  │rooms    │  │           │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        20+ Tables with Foreign Key Relationships     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Email      │  │   Payment    │  │    Maps     │      │
│  │   Service    │  │   Gateways    │  │   Service   │      │
│  │  (SMTP)      │  │ (Stripe/MoMo)│  │ (Leaflet)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend Application            │  │
│  │                                                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │  │
│  │  │  Pages     │  │ Components │  │    API     │      │  │
│  │  │  (Routes)  │  │  (UI)      │  │  (Client)  │      │  │
│  │  └────────────┘  └────────────┘  └────────────┘      │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         State Management (React Hooks)          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API Calls
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   EXPRESS SERVER                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Route Handlers                      │  │
│  │  /api/auth  /api/schools  /api/grades  /api/events    │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │              Middleware Layer                           │  │
│  │  - Authentication (JWT)                                 │  │
│  │  - Authorization (RBAC)                                 │  │
│  │  - Validation                                          │  │
│  │  - Error Handling                                      │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │              Business Logic Layer                      │  │
│  │  - Grade Calculations                                  │  │
│  │  - Report Card Generation                              │  │
│  │  - Distance Calculations                               │  │
│  │  - Notification Logic                                  │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │              Data Access Layer                        │  │
│  │  - Database Queries                                    │  │
│  │  - File Operations                                     │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │ SQL Queries
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    PostgreSQL Database                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Tables   │  │ Indexes │  │Foreign   │  │Triggers  │     │
│  │          │  │          │  │Keys      │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 7.3 Data Flow Architecture

```
User Action
    │
    ▼
Frontend Component
    │
    ▼
API Client Function
    │
    ▼
HTTP Request (REST)
    │
    ▼
Express Route Handler
    │
    ├─► Authentication Middleware
    │       │
    │       └─► JWT Validation
    │
    ├─► Authorization Middleware
    │       │
    │       └─► Role Check
    │
    ├─► Validation Middleware
    │       │
    │       └─► Input Validation
    │
    ▼
Business Logic
    │
    ├─► Database Query
    │       │
    │       └─► PostgreSQL
    │
    ├─► External Service Call
    │       │
    │       ├─► Email Service
    │       ├─► Payment Gateway
    │       └─► Map Service
    │
    ▼
Response Processing
    │
    ▼
HTTP Response
    │
    ▼
Frontend Update
    │
    ▼
User Interface Update
```

---

## 8. Database Schema

### 8.1 Core Tables with Attributes

#### Users Table
```sql
users (
    id: INTEGER (PK, Auto-increment)
    email: VARCHAR(255) (UNIQUE, NOT NULL)
    password_hash: VARCHAR(255) (NOT NULL)
    first_name: VARCHAR(100)
    last_name: VARCHAR(100)
    role: ENUM('student', 'parent', 'teacher', 'leader', 'admin')
    phone: VARCHAR(20)
    created_at: TIMESTAMP
    updated_at: TIMESTAMP
)
```

#### Schools Table
```sql
schools (
    id: VARCHAR(255) (PK)
    name: VARCHAR(255) (NOT NULL)
    type: ENUM('public', 'private')
    level: ENUM('primary', 'secondary')
    location: VARCHAR(255)
    latitude: DECIMAL(10, 8)
    longitude: DECIMAL(11, 8)
    description: TEXT
    uniform_info: TEXT
    created_at: TIMESTAMP
    updated_at: TIMESTAMP
)
```

#### Grades Table
```sql
grades (
    id: INTEGER (PK, Auto-increment)
    student_user_id: INTEGER (FK -> users.id)
    school_id: VARCHAR(255) (FK -> schools.id)
    subject: VARCHAR(255) (NOT NULL)
    grade: VARCHAR(10) (NOT NULL)
    score: DECIMAL(5, 2)
    max_score: DECIMAL(5, 2) DEFAULT 100
    term: VARCHAR(50)
    academic_year: VARCHAR(20)
    teacher_id: INTEGER (FK -> users.id)
    comments: TEXT
    created_at: TIMESTAMP
    updated_at: TIMESTAMP
)
```

#### Report Cards Table
```sql
report_cards (
    id: INTEGER (PK, Auto-increment)
    student_user_id: INTEGER (FK -> users.id)
    school_id: VARCHAR(255) (FK -> schools.id)
    term: VARCHAR(50) (NOT NULL)
    academic_year: VARCHAR(20) (NOT NULL)
    overall_grade: VARCHAR(10)
    overall_percentage: DECIMAL(5, 2)
    attendance_percentage: DECIMAL(5, 2)
    teacher_comments: TEXT
    principal_comments: TEXT
    generated_at: TIMESTAMP
    UNIQUE(student_user_id, school_id, term, academic_year)
)
```

#### Parent-Child Relationships Table
```sql
parent_child_relationships (
    id: INTEGER (PK, Auto-increment)
    parent_id: INTEGER (FK -> users.id)
    child_id: INTEGER (FK -> users.id)
    relationship_type: VARCHAR(50) DEFAULT 'parent'
    is_primary: BOOLEAN DEFAULT FALSE
    created_at: TIMESTAMP
    UNIQUE(parent_id, child_id)
)
```

### 8.2 Indexes and Constraints

**Primary Keys:**
- All tables have `id` as primary key

**Foreign Keys:**
- `student_applications.student_id` → `users.id`
- `student_applications.school_id` → `schools.id`
- `grades.student_user_id` → `users.id`
- `grades.teacher_id` → `users.id`
- `grades.school_id` → `schools.id`
- `parent_child_relationships.parent_id` → `users.id`
- `parent_child_relationships.child_id` → `users.id`

**Unique Constraints:**
- `users.email` (UNIQUE)
- `report_cards(student_user_id, school_id, term, academic_year)` (UNIQUE)
- `parent_child_relationships(parent_id, child_id)` (UNIQUE)

**Indexes:**
- `users.email` (for fast login)
- `schools(latitude, longitude)` (for geospatial queries)
- `grades(student_user_id, term, academic_year)` (for grade queries)
- `notifications(user_id, read)` (for notification queries)

---

## 9. Summary

This System Design Document provides comprehensive modeling diagrams for the Rwanda School Bridge System:

1. **Use Case Diagrams** - Show interactions between actors and system
2. **Class Diagrams** - Define system structure and relationships
3. **Sequence Diagrams** - Illustrate interaction flows
4. **Activity Diagrams** - Show business process flows
5. **Entity Relationship Diagram** - Database structure and relationships
6. **System Architecture** - Three-tier architecture design

All diagrams follow UML 2.0 standards and can be drawn using tools like:
- Draw.io / diagrams.net
- Lucidchart
- Microsoft Visio
- PlantUML
- Or hand-drawn for assignments

---

**End of Document**
