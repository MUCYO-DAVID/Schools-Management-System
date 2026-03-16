Name: [Your Name]
ID: [Your ID]
Date: January 30, 2026

Software Modeling And Design: Assignment I

a) Topic Name
RWANDA SCHOOL BRIDGE SYSTEM: Digital School Management and Enrollment Platform with Interactive Mapping and Real-time Communication.

b) Topic Description
Rwanda School Bridge System is a comprehensive web-based platform designed to digitize school management and student enrollment processes in Rwanda. The system connects five key stakeholders: Students, Parents, Teachers, School Leaders, and System Administrators. It features an Interactive Map for locating schools with geospatial data, a Live Chat System for real-time communication, Grade Management for academic tracking, Event Calendar for scheduling, Scholarship Management for financial aid opportunities, Photo/Video Galleries for virtual school tours, and integrated Payment Processing for school fees. The platform includes SMTP Email Notification Integration to send real-time updates for grades, applications, events, and notifications.

c) SDLC Phases Reflecting Rwanda School Bridge System

---

1. Requirement Analysis & Planning
In this phase, the project scope is defined. We identify the need for a five-tier user system (Student, Parent, Teacher, Leader, Admin). We plan the integration of Leaflet.js for interactive mapping with Haversine formula for distance calculations, define the logic for real-time chat messaging between users, and establish requirements for the grade entry system, event management, scholarship applications, and gallery uploads. The notification system requirements are outlined to handle multiple event types across all user roles.

---

2. Feasibility Study
We evaluate the technical and operational requirements. This includes choosing Next.js with React for the frontend, Node.js with Express for the backend, and PostgreSQL for relational data storage. We determine the feasibility of integrating multiple payment gateways (Stripe, Mobile Money), implementing file upload systems for documents and media, and ensuring secure JWT-based authentication. We assess the capability to handle geospatial data for school locations and real-time messaging infrastructure.

---

3. System Design
This is the "Modeling" phase. We create use case diagrams showing how students browse schools and apply for enrollment, how teachers enter grades and create events, how parents view their child's academic progress, and how leaders manage school galleries and scholarships. We design the Entity Relationship Diagram (ERD) with 20+ tables including users, schools, grades, report_cards, events, scholarships, galleries, chat_rooms, and notifications. We model the authentication flow with role-based access control and design API endpoints for all features.

---

4. Implementation (Coding)
During this phase, the actual source code is written. We develop the Rwanda School Bridge System using Next.js with TypeScript for type safety. Key tasks include configuring the SMTP client (Nodemailer) to send emails when grades are posted, applications are reviewed, or events are created. We implement the interactive map component with custom markers and filtering, program the grade calculation logic with automatic report card generation, build the real-time chat system with room management, develop the scholarship application workflow with document uploads, create the event RSVP system with calendar integration, and implement the gallery management with photo/video upload support using Multer.

---

5. Testing
We perform various tests to ensure the system is bug-free. This includes Unit Testing for grade calculations, payment processing, and distance calculations. Integration Testing to verify that when a teacher enters a grade, the student receives an email notification and the grade appears on both student and parent dashboards immediately. We test the authentication middleware across all protected routes, verify file upload limits and security, and conduct User Acceptance Testing with different role-based scenarios to ensure proper access control.

---

6. Deployment & Maintenance
The system will be deployed to a cloud hosting environment with the backend and frontend as separate services. The PostgreSQL database is configured with proper indexing for performance optimization. After launch, the Maintenance phase begins, which involves monitoring the email notification logs for delivery issues, updating the map markers with new school locations, expanding the chat system features based on user feedback, optimizing the scholarship matching algorithm, and ensuring the payment integration remains secure and compliant. We continuously improve system performance by analyzing user activity patterns and addressing reported bugs promptly.
