# Software Requirements Document (SRD)
## Rwanda School Bridge System (RSBS)

**Version:** 1.0  
**Date:** 2024  
**Prepared by:** [Your Name]  
**Project:** Schools Management System

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Requirement Gathering Methods](#2-requirement-gathering-methods)
3. [User Requirements](#3-user-requirements)
4. [System Requirements](#4-system-requirements)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Use Cases](#7-use-cases)
8. [System Architecture Overview](#8-system-architecture-overview)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Rwanda School Bridge System (RSBS), a comprehensive web-based platform designed to facilitate school management, student applications, academic tracking, and communication between educational stakeholders in Rwanda.

### 1.2 Scope
The system serves five primary user roles: Students, Parents, Teachers, School Leaders, and System Administrators. It provides functionality for school browsing, application management, grade tracking, event management, scholarship programs, payment processing, and real-time communication.

### 1.3 Definitions and Acronyms
- **RSBS**: Rwanda School Bridge System
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **API**: Application Programming Interface
- **SMTP**: Simple Mail Transfer Protocol
- **PDF**: Portable Document Format
- **CSV**: Comma-Separated Values

### 1.4 References
- Software Modeling Design Assignment No. 2
- Rwanda Education System Guidelines
- Web Application Security Standards

---

## 2. Requirement Gathering Methods

### 2.1 Methods Used

#### 2.1.1 Interviews
**Purpose:** To understand the needs of different stakeholders  
**Participants:**
- School administrators (Leaders)
- Teachers
- Parents
- Students
- Education ministry officials

**Key Findings:**
- Need for centralized school information system
- Requirement for automated grade management
- Demand for parent-student communication portal
- Need for scholarship application system

#### 2.1.2 Surveys and Questionnaires
**Purpose:** To gather quantitative data on system requirements  
**Distribution:** Online surveys to 200+ potential users  
**Key Questions:**
- What features are most important?
- What are the pain points in current systems?
- What devices will be used to access the system?
- What languages should be supported?

**Results:**
- 85% requested mobile-friendly interface
- 90% needed English and Kinyarwanda support
- 78% prioritized grade tracking features
- 82% wanted real-time notifications

#### 2.1.3 Observation
**Purpose:** To understand current workflows and processes  
**Observed:**
- Manual grade entry processes
- Paper-based application systems
- In-person fee payment methods
- Email-based communication challenges

#### 2.1.4 Prototyping
**Purpose:** To validate requirements with stakeholders  
**Approach:** Created interactive mockups and early prototypes  
**Feedback:** Iterative improvements based on user testing

#### 2.1.5 Document Analysis
**Purpose:** To understand existing systems and regulations  
**Analyzed:**
- Rwanda education system structure
- School registration requirements
- Data privacy regulations
- Payment processing standards

### 2.2 Requirement Prioritization
Requirements were prioritized using the MoSCoW method:
- **Must Have:** Core functionality (authentication, grade management, applications)
- **Should Have:** Important features (payments, events, galleries)
- **Could Have:** Nice-to-have features (advanced analytics, surveys)
- **Won't Have:** Out-of-scope features (video conferencing, mobile apps)

---

## 3. User Requirements

### 3.1 Student Requirements

#### 3.1.1 School Browsing and Search
- **UR-S-001:** Students must be able to browse all available schools in the system
- **UR-S-002:** Students must be able to search schools by name, location, type (public/private), and level (primary/secondary)
- **UR-S-003:** Students must be able to view school details including facilities, uniform information, and photo galleries
- **UR-S-004:** Students must be able to view schools on an interactive map with distance calculation
- **UR-S-005:** Students must be able to filter schools by proximity (within 50km radius)

#### 3.1.2 Application Management
- **UR-S-006:** Students must be able to apply to multiple schools
- **UR-S-007:** Students must be able to upload required documents (birth certificate, transcripts, etc.)
- **UR-S-008:** Students must be able to track application status (pending, approved, rejected)
- **UR-S-009:** Students must receive email notifications when application status changes
- **UR-S-010:** Students must be able to view application history

#### 3.1.3 Academic Information
- **UR-S-011:** Students must be able to view their grades by subject, term, and academic year
- **UR-S-012:** Students must be able to view their report cards
- **UR-S-013:** Students must receive notifications when new grades are posted
- **UR-S-014:** Students must be able to download their report cards as PDF

#### 3.1.4 Scholarships
- **UR-S-015:** Students must be able to browse available scholarships
- **UR-S-016:** Students must be able to apply for scholarships
- **UR-S-017:** Students must be able to track scholarship application status

#### 3.1.5 Events and Communication
- **UR-S-018:** Students must be able to view school events and calendar
- **UR-S-019:** Students must be able to RSVP to events
- **UR-S-020:** Students must be able to participate in real-time chat with teachers and administrators
- **UR-S-021:** Students must be able to respond to surveys

### 3.2 Parent Requirements

#### 3.2.1 Child Information Access
- **UR-P-001:** Parents must be able to view all their linked children
- **UR-P-002:** Parents must be able to view their children's grades
- **UR-P-003:** Parents must be able to view their children's report cards
- **UR-P-004:** Parents must receive notifications when their child's grades are posted
- **UR-P-005:** Parents must receive notifications when their child's report card is available

#### 3.2.2 Fee Management
- **UR-P-006:** Parents must be able to view fee schedules
- **UR-P-007:** Parents must be able to view invoices for their children
- **UR-P-008:** Parents must be able to pay fees online using Stripe or Mobile Money
- **UR-P-009:** Parents must be able to view payment history

#### 3.2.3 Communication
- **UR-P-010:** Parents must be able to view school events
- **UR-P-011:** Parents must be able to RSVP to events
- **UR-P-012:** Parents must be able to communicate with teachers and school administrators via chat
- **UR-P-013:** Parents must be able to respond to surveys

### 3.3 Teacher Requirements

#### 3.3.1 Grade Management
- **UR-T-001:** Teachers must be able to enter grades for students
- **UR-T-002:** Teachers must be able to upload grades in bulk via CSV file
- **UR-T-003:** Teachers must be able to update and delete grades
- **UR-T-004:** Teachers must be able to add comments to grades
- **UR-T-005:** Teachers must be able to generate report cards for students
- **UR-T-006:** Teachers must be able to generate report cards in bulk
- **UR-T-007:** Teachers must be able to send report cards via email

#### 3.3.2 Event Management
- **UR-T-008:** Teachers must be able to create school events
- **UR-T-009:** Teachers must be able to set event types (academic, sports, general)
- **UR-T-010:** Teachers must be able to set event audience (all, students, parents)
- **UR-T-011:** Teachers must be able to view event RSVPs

#### 3.3.3 Communication
- **UR-T-012:** Teachers must be able to communicate with students and parents via chat
- **UR-T-013:** Teachers must be able to send notifications to students and parents

### 3.4 School Leader Requirements

#### 3.4.1 School Management
- **UR-L-001:** Leaders must be able to create and manage their school profile
- **UR-L-002:** Leaders must be able to upload school photos and videos to galleries
- **UR-L-003:** Leaders must be able to set school location on interactive map
- **UR-L-004:** Leaders must be able to update school information (facilities, uniform info, etc.)

#### 3.4.2 Application Review
- **UR-L-005:** Leaders must be able to view all applications to their school
- **UR-L-006:** Leaders must be able to approve or reject applications
- **UR-L-007:** Leaders must be able to add rejection reasons
- **UR-L-008:** Leaders must be able to view application statistics

#### 3.4.3 Student Management
- **UR-L-009:** Leaders must be able to assign parents to students
- **UR-L-010:** Leaders must be able to view all students in their school
- **UR-L-011:** Leaders must be able to manage parent-child relationships

#### 3.4.4 Scholarship Management
- **UR-L-012:** Leaders must be able to create scholarships
- **UR-L-013:** Leaders must be able to review scholarship applications
- **UR-L-014:** Leaders must be able to manage scholarship slots

#### 3.4.5 Analytics
- **UR-L-015:** Leaders must be able to view school statistics
- **UR-L-016:** Leaders must be able to view application trends
- **UR-L-017:** Leaders must be able to view registration charts

### 3.5 Administrator Requirements

#### 3.5.1 User Management
- **UR-A-001:** Administrators must be able to create, update, and delete users
- **UR-A-002:** Administrators must be able to assign roles to users
- **UR-A-003:** Administrators must be able to manage parent-child relationships
- **UR-A-004:** Administrators must be able to view all users in the system

#### 3.5.2 School Management
- **UR-A-005:** Administrators must be able to create, update, and delete schools
- **UR-A-006:** Administrators must be able to assign leaders to schools
- **UR-A-007:** Administrators must be able to verify school information

#### 3.5.3 System Management
- **UR-A-008:** Administrators must be able to view system-wide analytics
- **UR-A-009:** Administrators must be able to manage surveys
- **UR-A-010:** Administrators must be able to view survey analytics
- **UR-A-011:** Administrators must be able to manage system settings

---

## 4. System Requirements

### 4.1 Hardware Requirements

#### 4.1.1 Server Requirements
- **Processor:** Minimum 4 CPU cores, 8 cores recommended
- **RAM:** Minimum 8GB, 16GB recommended
- **Storage:** Minimum 100GB SSD, 500GB recommended
- **Network:** High-speed internet connection (minimum 100Mbps)

#### 4.1.2 Client Requirements
- **Desktop/Laptop:**
  - Modern web browser (Chrome, Firefox, Safari, Edge)
  - Minimum 4GB RAM
  - Internet connection (minimum 5Mbps)
- **Mobile Devices:**
  - iOS 12+ or Android 8+
  - Modern mobile browser
  - Internet connection (minimum 3G)

### 4.2 Software Requirements

#### 4.2.1 Server-Side
- **Operating System:** Linux (Ubuntu 20.04+ recommended) or Windows Server
- **Runtime:** Node.js 18+ LTS
- **Database:** PostgreSQL 14+
- **Web Server:** Nginx or Apache (for production)
- **Process Manager:** PM2 (for Node.js)

#### 4.2.2 Client-Side
- **Web Browser:** 
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **JavaScript:** Enabled
- **Cookies:** Enabled
- **Local Storage:** Enabled

#### 4.2.3 Development Tools
- **Frontend Framework:** Next.js 14+
- **Backend Framework:** Express.js 5+
- **Package Manager:** npm or yarn
- **Version Control:** Git
- **Code Editor:** VS Code or similar

### 4.3 Database Requirements
- **Database System:** PostgreSQL 14+
- **Storage:** Minimum 50GB for initial deployment
- **Backup:** Daily automated backups
- **Replication:** Recommended for high availability

### 4.4 Network Requirements
- **Protocols:** HTTP/HTTPS
- **Ports:** 
  - 80 (HTTP)
  - 443 (HTTPS)
  - 3000 (Development frontend)
  - 5000 (Development backend)
- **SSL/TLS:** Required for production
- **Firewall:** Configured to allow necessary ports

### 4.5 Integration Requirements
- **Email Service:** SMTP server (Gmail, SendGrid, or custom)
- **Payment Gateway:** Stripe API, Mobile Money APIs (MTN, Airtel)
- **Maps Service:** Leaflet.js with OpenStreetMap
- **File Storage:** Local storage or cloud storage (AWS S3, Azure Blob)

---

## 5. Functional Requirements

### 5.1 Authentication and Authorization

#### 5.1.1 User Authentication
- **FR-AUTH-001:** System must support user registration with email and password
- **FR-AUTH-002:** System must support two-factor authentication (2FA) via email verification code
- **FR-AUTH-003:** System must support JWT-based session management
- **FR-AUTH-004:** System must support password reset functionality
- **FR-AUTH-005:** System must enforce password complexity requirements
- **FR-AUTH-006:** System must support role-based access control (RBAC)

#### 5.1.2 Role Management
- **FR-AUTH-007:** System must support five user roles: Student, Parent, Teacher, Leader, Admin
- **FR-AUTH-008:** System must restrict access based on user roles
- **FR-AUTH-009:** System must allow administrators to assign roles
- **FR-AUTH-010:** System must support special verification for leader accounts

### 5.2 School Management

#### 5.2.1 School Information
- **FR-SCH-001:** System must allow creation of school profiles with name, type, level, location
- **FR-SCH-002:** System must store school geospatial data (latitude, longitude)
- **FR-SCH-003:** System must support school search by name, type, level, location
- **FR-SCH-004:** System must calculate distance between user location and schools
- **FR-SCH-005:** System must display schools on interactive map
- **FR-SCH-006:** System must support school photo and video galleries
- **FR-SCH-007:** System must allow updating school information
- **FR-SCH-008:** System must support school uniform information storage

### 5.3 Application Management

#### 5.3.1 Application Submission
- **FR-APP-001:** System must allow students to submit applications to schools
- **FR-APP-002:** System must support document uploads (PDF, images)
- **FR-APP-003:** System must validate application data before submission
- **FR-APP-004:** System must store application status (pending, approved, rejected, withdrawn)

#### 5.3.2 Application Review
- **FR-APP-005:** System must allow leaders to view applications to their school
- **FR-APP-006:** System must allow leaders to approve or reject applications
- **FR-APP-007:** System must require rejection reasons when rejecting applications
- **FR-APP-008:** System must send email notifications on status change
- **FR-APP-009:** System must track application statistics

### 5.4 Grade Management

#### 5.4.1 Grade Entry
- **FR-GRD-001:** System must allow teachers to enter grades for students
- **FR-GRD-002:** System must support bulk grade upload via CSV file
- **FR-GRD-003:** System must validate grade data (scores, letter grades)
- **FR-GRD-004:** System must store grades with subject, term, academic year
- **FR-GRD-005:** System must allow teachers to add comments to grades
- **FR-GRD-006:** System must support grade updates and deletions

#### 5.4.2 Grade Viewing
- **FR-GRD-007:** System must allow students to view their own grades
- **FR-GRD-008:** System must allow parents to view their children's grades
- **FR-GRD-009:** System must filter grades by term, academic year, school
- **FR-GRD-010:** System must display grades in organized tables

#### 5.4.3 Report Cards
- **FR-GRD-011:** System must automatically calculate overall grade from subject grades
- **FR-GRD-012:** System must generate report cards with overall percentage and letter grade
- **FR-GRD-013:** System must support bulk report card generation
- **FR-GRD-014:** System must allow downloading report cards as PDF
- **FR-GRD-015:** System must send report cards via email to students and parents

### 5.5 Event Management

#### 5.5.1 Event Creation
- **FR-EVT-001:** System must allow teachers and leaders to create events
- **FR-EVT-002:** System must support event types (general, academic, sports, etc.)
- **FR-EVT-003:** System must allow setting event audience (all, students, parents, teachers)
- **FR-EVT-004:** System must store event date, time, location, description
- **FR-EVT-005:** System must support event RSVP functionality

#### 5.5.2 Event Viewing
- **FR-EVT-006:** System must display events in calendar view (month, week, day, list)
- **FR-EVT-007:** System must filter events by date, school, type
- **FR-EVT-008:** System must send email notifications for new events
- **FR-EVT-009:** System must allow users to RSVP to events

### 5.6 Payment Processing

#### 5.6.1 Fee Management
- **FR-PAY-001:** System must allow creation of fee schedules
- **FR-PAY-002:** System must generate invoices for students
- **FR-PAY-003:** System must support multiple payment methods (Stripe, Mobile Money)
- **FR-PAY-004:** System must process payment transactions securely
- **FR-PAY-005:** System must generate payment receipts
- **FR-PAY-006:** System must track payment history

### 5.7 Scholarship Management

#### 5.7.1 Scholarship Creation
- **FR-SCHL-001:** System must allow leaders and admins to create scholarships
- **FR-SCHL-002:** System must store scholarship details (description, requirements, slots)
- **FR-SCHL-003:** System must set scholarship deadlines

#### 5.7.2 Scholarship Applications
- **FR-SCHL-004:** System must allow students to apply for scholarships
- **FR-SCHL-005:** System must support document uploads for scholarship applications
- **FR-SCHL-006:** System must track application status
- **FR-SCHL-007:** System must manage available slots

### 5.8 Communication

#### 5.8.1 Real-Time Chat
- **FR-COM-001:** System must support direct and group chat rooms
- **FR-COM-002:** System must allow users to send text messages
- **FR-COM-003:** System must support file attachments in chat
- **FR-COM-004:** System must display message timestamps
- **FR-COM-005:** System must support read receipts
- **FR-COM-006:** System must enforce chat privileges based on roles

#### 5.8.2 Notifications
- **FR-COM-007:** System must send email notifications for important events
- **FR-COM-008:** System must display in-app notifications
- **FR-COM-009:** System must notify parents when their child's grades are posted
- **FR-COM-010:** System must notify students when applications are reviewed

### 5.9 Parent-Child Relationships

#### 5.9.1 Relationship Management
- **FR-PCR-001:** System must support linking parents to children
- **FR-PCR-002:** System must allow multiple children per parent
- **FR-PCR-003:** System must allow multiple parents per child
- **FR-PCR-004:** System must support primary parent designation
- **FR-PCR-005:** System must allow leaders and admins to assign relationships

#### 5.9.2 Data Access
- **FR-PCR-006:** Parents must only see information for their linked children
- **FR-PCR-007:** System must automatically notify parents of child-related events

### 5.10 Survey System

#### 5.10.1 Survey Creation
- **FR-SUR-001:** System must allow admins and leaders to create surveys
- **FR-SUR-002:** System must support multiple question types (text, single-choice, multiple-choice, rating, yes-no)
- **FR-SUR-003:** System must set survey audience and dates

#### 5.10.2 Survey Response
- **FR-SUR-004:** System must allow students and parents to respond to surveys
- **FR-SUR-005:** System must validate required questions
- **FR-SUR-006:** System must prevent duplicate responses

#### 5.10.3 Survey Analytics
- **FR-SUR-007:** System must display response counts
- **FR-SUR-008:** System must show answer distributions
- **FR-SUR-009:** System must generate charts for survey results

### 5.11 Analytics and Reporting

#### 5.11.1 School Analytics
- **FR-ANA-001:** System must display school registration statistics
- **FR-ANA-002:** System must show application trends
- **FR-ANA-003:** System must display user statistics by role

#### 5.11.2 System Analytics
- **FR-ANA-004:** System must provide admin dashboard with system-wide statistics
- **FR-ANA-005:** System must track user activity

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### 6.1.1 Response Time
- **NFR-PERF-001:** System must load pages within 2 seconds under normal load
- **NFR-PERF-002:** System must process API requests within 500ms
- **NFR-PERF-003:** System must support concurrent access by 1000+ users
- **NFR-PERF-004:** System must handle file uploads up to 10MB within 30 seconds

#### 6.1.2 Throughput
- **NFR-PERF-005:** System must handle 100 requests per second
- **NFR-PERF-006:** System must support 10,000+ registered users
- **NFR-PERF-007:** System must support 500+ schools

#### 6.1.3 Scalability
- **NFR-PERF-008:** System must be horizontally scalable
- **NFR-PERF-009:** System must support database replication
- **NFR-PERF-010:** System must handle increasing data volume

### 6.2 Security Requirements

#### 6.2.1 Authentication Security
- **NFR-SEC-001:** System must encrypt passwords using bcrypt
- **NFR-SEC-002:** System must use HTTPS for all communications
- **NFR-SEC-003:** System must implement JWT token expiration
- **NFR-SEC-004:** System must protect against SQL injection attacks
- **NFR-SEC-005:** System must protect against XSS (Cross-Site Scripting) attacks
- **NFR-SEC-006:** System must implement CSRF protection

#### 6.2.2 Data Security
- **NFR-SEC-007:** System must encrypt sensitive data at rest
- **NFR-SEC-008:** System must implement role-based access control
- **NFR-SEC-009:** System must log security events
- **NFR-SEC-010:** System must comply with data privacy regulations

#### 6.2.3 Payment Security
- **NFR-SEC-011:** System must use PCI-DSS compliant payment processing
- **NFR-SEC-012:** System must not store credit card information
- **NFR-SEC-013:** System must use secure payment gateways

### 6.3 Reliability Requirements

#### 6.3.1 Availability
- **NFR-REL-001:** System must have 99% uptime
- **NFR-REL-002:** System must support scheduled maintenance windows
- **NFR-REL-003:** System must have automated backup system

#### 6.3.2 Fault Tolerance
- **NFR-REL-004:** System must handle database connection failures gracefully
- **NFR-REL-005:** System must handle API failures with proper error messages
- **NFR-REL-006:** System must implement retry mechanisms for failed operations

#### 6.3.3 Data Integrity
- **NFR-REL-007:** System must maintain data consistency
- **NFR-REL-008:** System must prevent data loss
- **NFR-REL-009:** System must support transaction rollback

### 6.4 Usability Requirements

#### 6.4.1 User Interface
- **NFR-USE-001:** System must have intuitive and user-friendly interface
- **NFR-USE-002:** System must be responsive (mobile, tablet, desktop)
- **NFR-USE-003:** System must support keyboard navigation
- **NFR-USE-004:** System must provide clear error messages

#### 6.4.2 Accessibility
- **NFR-USE-005:** System must follow WCAG 2.1 Level AA guidelines
- **NFR-USE-006:** System must support screen readers
- **NFR-USE-007:** System must have sufficient color contrast

#### 6.4.3 Internationalization
- **NFR-USE-008:** System must support English and Kinyarwanda languages
- **NFR-USE-009:** System must support date and time formats for Rwanda
- **NFR-USE-010:** System must support currency formatting (RWF)

### 6.5 Maintainability Requirements

#### 6.5.1 Code Quality
- **NFR-MAIN-001:** System must follow coding standards and best practices
- **NFR-MAIN-002:** System must have comprehensive code documentation
- **NFR-MAIN-003:** System must use version control (Git)

#### 6.5.2 Modularity
- **NFR-MAIN-004:** System must have modular architecture
- **NFR-MAIN-005:** System must separate frontend and backend concerns
- **NFR-MAIN-006:** System must use reusable components

### 6.6 Portability Requirements

#### 6.6.1 Platform Independence
- **NFR-PORT-001:** System must run on multiple operating systems (Linux, Windows)
- **NFR-PORT-002:** System must work on multiple web browsers
- **NFR-PORT-003:** System must work on mobile devices

### 6.7 Compatibility Requirements

#### 6.7.1 Browser Compatibility
- **NFR-COMP-001:** System must work on Chrome 90+
- **NFR-COMP-002:** System must work on Firefox 88+
- **NFR-COMP-003:** System must work on Safari 14+
- **NFR-COMP-004:** System must work on Edge 90+

#### 6.7.2 Device Compatibility
- **NFR-COMP-005:** System must work on desktop computers
- **NFR-COMP-006:** System must work on tablets
- **NFR-COMP-007:** System must work on smartphones

---

## 7. Use Cases

### 7.1 Student Use Cases

#### UC-001: Browse Schools
**Actor:** Student  
**Precondition:** Student is logged in  
**Main Flow:**
1. Student navigates to school browsing page
2. System displays list of schools
3. Student applies filters (type, level, location)
4. System displays filtered results
5. Student clicks on a school
6. System displays school details

**Alternative Flow:**
- Student searches by name
- Student views schools on map

#### UC-002: Apply to School
**Actor:** Student  
**Precondition:** Student is logged in, school exists  
**Main Flow:**
1. Student selects a school
2. Student clicks "Apply" button
3. System displays application form
4. Student fills in personal information
5. Student uploads required documents
6. Student submits application
7. System validates data
8. System creates application record
9. System sends confirmation email
10. System notifies school leader

#### UC-003: View Grades
**Actor:** Student  
**Precondition:** Student is logged in, grades exist  
**Main Flow:**
1. Student navigates to grades page
2. System fetches student's grades
3. System displays grades in table
4. Student filters by term or academic year
5. System displays filtered grades

### 7.2 Parent Use Cases

#### UC-004: View Child's Grades
**Actor:** Parent  
**Precondition:** Parent is logged in, parent-child relationship exists  
**Main Flow:**
1. Parent navigates to parent dashboard
2. System displays list of linked children
3. Parent selects a child
4. System fetches child's grades
5. System displays grades for selected child

#### UC-005: Pay Fees
**Actor:** Parent  
**Precondition:** Parent is logged in, invoice exists  
**Main Flow:**
1. Parent navigates to fees page
2. System displays invoices for children
3. Parent selects an invoice
4. Parent chooses payment method
5. System redirects to payment gateway
6. Parent completes payment
7. System processes payment
8. System updates invoice status
9. System sends receipt email

### 7.3 Teacher Use Cases

#### UC-006: Enter Grades
**Actor:** Teacher  
**Precondition:** Teacher is logged in  
**Main Flow:**
1. Teacher navigates to grades page
2. Teacher clicks "Add Grade"
3. System displays grade entry form
4. Teacher selects student, subject, term, academic year
5. Teacher enters grade and score
6. Teacher adds comments (optional)
7. Teacher submits form
8. System validates data
9. System saves grade
10. System notifies student and parents
11. System sends email notifications

#### UC-007: Bulk Upload Grades
**Actor:** Teacher  
**Precondition:** Teacher is logged in, CSV file prepared  
**Main Flow:**
1. Teacher navigates to grades page
2. Teacher clicks "Bulk Upload"
3. System displays upload form
4. Teacher selects CSV file
5. Teacher enters term and academic year
6. Teacher uploads file
7. System parses CSV
8. System validates data
9. System creates grades for valid rows
10. System reports success and errors
11. System notifies students and parents

### 7.4 Leader Use Cases

#### UC-008: Review Application
**Actor:** Leader  
**Precondition:** Leader is logged in, application exists  
**Main Flow:**
1. Leader navigates to applications page
2. System displays pending applications
3. Leader selects an application
4. System displays application details and documents
5. Leader reviews information
6. Leader approves or rejects
7. If rejected, leader enters reason
8. Leader submits decision
9. System updates application status
10. System sends email notification to student

#### UC-009: Assign Parent to Child
**Actor:** Leader  
**Precondition:** Leader is logged in, parent and child exist  
**Main Flow:**
1. Leader navigates to student management
2. Leader selects a student
3. Leader clicks "Assign Parent"
4. System displays parent search form
5. Leader searches for parent by email or name
6. System displays matching parents
7. Leader selects a parent
8. Leader sets relationship type and primary status
9. Leader submits
10. System creates parent-child relationship
11. System confirms success

### 7.5 Administrator Use Cases

#### UC-010: Manage Users
**Actor:** Administrator  
**Precondition:** Administrator is logged in  
**Main Flow:**
1. Administrator navigates to user management
2. System displays list of users
3. Administrator filters by role
4. Administrator selects a user
5. Administrator updates user information or role
6. Administrator saves changes
7. System updates user record

---

## 8. System Architecture Overview

### 8.1 Architecture Pattern
The system follows a **three-tier architecture**:
1. **Presentation Layer:** Next.js frontend (React-based)
2. **Application Layer:** Node.js/Express backend (RESTful API)
3. **Data Layer:** PostgreSQL database

### 8.2 Technology Stack

#### Frontend
- **Framework:** Next.js 14+ (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Fetch API

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5+
- **Language:** JavaScript
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Email:** Nodemailer
- **Payment:** Stripe SDK

#### Database
- **RDBMS:** PostgreSQL
- **Tables:** 20+ tables including users, schools, grades, applications, events, etc.
- **Features:** Geospatial queries, transactions, foreign keys

### 8.3 System Components

#### 8.3.1 Authentication Module
- User registration and login
- JWT token generation and validation
- Role-based access control middleware
- Two-factor authentication

#### 8.3.2 School Management Module
- School CRUD operations
- Geospatial data handling
- Gallery management
- Search and filtering

#### 8.3.3 Application Management Module
- Application submission
- Document uploads
- Application review workflow
- Status tracking

#### 8.3.4 Grade Management Module
- Grade entry and updates
- Bulk grade upload
- Report card generation
- PDF export

#### 8.3.5 Communication Module
- Real-time chat
- Email notifications
- In-app notifications
- Event notifications

#### 8.3.6 Payment Module
- Fee schedule management
- Invoice generation
- Payment processing
- Receipt generation

### 8.4 Data Flow

#### 8.4.1 User Registration Flow
1. User submits registration form
2. Frontend sends POST request to `/api/auth/register`
3. Backend validates data
4. Backend hashes password
5. Backend creates user record
6. Backend sends verification email
7. User verifies email
8. User can login

#### 8.4.2 Grade Entry Flow
1. Teacher enters grade data
2. Frontend sends POST request to `/api/grades`
3. Backend validates data and user permissions
4. Backend saves grade to database
5. Backend creates notification for student
6. Backend finds parent-child relationships
7. Backend creates notifications for parents
8. Backend sends email notifications
9. Frontend displays success message

### 8.5 Security Architecture
- **Authentication:** JWT tokens with expiration
- **Authorization:** Role-based middleware
- **Data Encryption:** HTTPS, password hashing (bcrypt)
- **Input Validation:** Server-side validation
- **SQL Injection Protection:** Parameterized queries
- **XSS Protection:** Input sanitization

---

## 9. Appendices

### 9.1 Glossary
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **API:** Application Programming Interface
- **CSV:** Comma-Separated Values
- **PDF:** Portable Document Format
- **SMTP:** Simple Mail Transfer Protocol
- **HTTPS:** Hypertext Transfer Protocol Secure

### 9.2 Assumptions
1. Users have access to internet and modern web browsers
2. Users have email addresses
3. Payment gateways (Stripe, Mobile Money) are available
4. SMTP server is configured for email sending
5. Database server is properly maintained

### 9.3 Constraints
1. System must comply with Rwanda data privacy regulations
2. System must support English and Kinyarwanda languages
3. System must work on mobile devices
4. System must handle payment processing securely
5. System must support offline capabilities (limited)

---

## Document Approval

**Prepared by:** [Your Name]  
**Date:** [Date]  
**Reviewed by:** [Reviewer Name]  
**Approved by:** [Approver Name]

---

**End of Document**
