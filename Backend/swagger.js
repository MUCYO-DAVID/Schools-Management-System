/** OpenAPI 3.0 specification for Rwanda School Bridge System (RSBS) */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Rwanda School Bridge System — API',
    version: '1.0.0',
    description:
      'REST API for RSBS — a platform connecting schools, teachers, students, parents and leaders in Rwanda. ' +
      'All protected routes require a Bearer JWT token obtained from `/api/auth/login` or `/api/auth/signup`.',
    contact: { name: 'RSBS Dev Team', email: 'mucyobecks@gmail.com' },
  },
  servers: [
    { url: 'https://rwandaschoolbridgesystem.onrender.com', description: 'Production (Render)' },
    { url: 'http://localhost:5000', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the token you received from /api/auth/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Access denied' },
        },
      },
      School: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-1234' },
          name: { type: 'string', example: 'Green Hills Academy' },
          name_rw: { type: 'string', example: 'Green Hills Academy' },
          location: { type: 'string', example: 'Kigali, Rwanda' },
          type: { type: 'string', enum: ['Public', 'Private'] },
          level: { type: 'string', enum: ['Primary', 'Secondary', 'TVET'] },
          students: { type: 'integer', example: 1200 },
          established: { type: 'integer', example: 1998 },
          image_urls: { type: 'array', items: { type: 'string' } },
          latitude: { type: 'number', example: -1.946 },
          longitude: { type: 'number', example: 30.104 },
          average_rating: { type: 'number', example: 4.2 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          first_name: { type: 'string', example: 'Alice' },
          last_name: { type: 'string', example: 'Uwimana' },
          email: { type: 'string', example: 'alice@example.com' },
          role: { type: 'string', enum: ['student', 'teacher', 'parent', 'leader', 'admin'] },
          school_id: { type: 'string', example: 'uuid-1234' },
          avatar_url: { type: 'string', example: 'https://res.cloudinary.com/...' },
        },
      },
      Grade: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          student_user_id: { type: 'integer', example: 12 },
          school_id: { type: 'string', example: 'uuid-1234' },
          subject: { type: 'string', example: 'Mathematics' },
          grade: { type: 'string', example: 'A' },
          score: { type: 'number', example: 88 },
          max_score: { type: 'number', example: 100 },
          term: { type: 'string', example: 'Term 1' },
          academic_year: { type: 'string', example: '2025-2026' },
          teacher_id: { type: 'integer', example: 7 },
          comments: { type: 'string', example: 'Excellent work' },
        },
      },
      Survey: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          school_id: { type: 'string' },
          user_id: { type: 'integer' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          teaching_quality: { type: 'integer', minimum: 1, maximum: 5 },
          facilities_quality: { type: 'integer', minimum: 1, maximum: 5 },
          safety_quality: { type: 'integer', minimum: 1, maximum: 5 },
          ease_of_use: { type: 'integer', minimum: 1, maximum: 5 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string', example: 'Term exams schedule' },
          body: { type: 'string', example: 'Exams start on Monday...' },
          audience_role: { type: 'string', example: 'all' },
          school_id: { type: 'string' },
          created_by: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Scholarship: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string', example: 'STEM Excellence Award' },
          description: { type: 'string' },
          school_id: { type: 'string' },
          amount: { type: 'number', example: 500000 },
          deadline: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['open', 'closed'] },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string', example: 'Open Day 2026' },
          description: { type: 'string' },
          school_id: { type: 'string' },
          event_date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],

  paths: {
    // ─── AUTH ─────────────────────────────────────────────────────────────────
    '/api/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['first_name', 'last_name', 'email', 'password', 'role'],
                properties: {
                  first_name: { type: 'string', example: 'Alice' },
                  last_name: { type: 'string', example: 'Uwimana' },
                  email: { type: 'string', example: 'alice@example.com' },
                  password: { type: 'string', example: 'secret123' },
                  role: { type: 'string', enum: ['student', 'teacher', 'parent', 'leader'] },
                  school_id: { type: 'string', example: 'uuid-1234' },
                  school_not_found_name: { type: 'string', example: 'My New School' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered — verification code sent to email' },
          400: { description: 'Validation error or email already exists' },
        },
      },
    },
    '/api/auth/verify-code': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify email OTP and receive JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', example: 'alice@example.com' },
                  code: { type: 'string', example: '482910' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Verified — returns JWT token and user object' },
          400: { description: 'Invalid or expired code' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'alice@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful — returns JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/resend-code': {
      post: {
        tags: ['Authentication'],
        summary: 'Resend email verification code',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', example: 'alice@example.com' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Code resent' },
          404: { description: 'Email not found' },
        },
      },
    },

    // ─── SCHOOLS ──────────────────────────────────────────────────────────────
    '/api/schools': {
      get: {
        tags: ['Schools'],
        summary: 'List all schools (leaders only see their own)',
        responses: {
          200: {
            description: 'Array of schools',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/School' } } } },
          },
        },
      },
      post: {
        tags: ['Schools'],
        summary: 'Create a school — leader / admin only',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'location', 'type', 'level'],
                properties: {
                  name: { type: 'string' },
                  name_rw: { type: 'string' },
                  location: { type: 'string' },
                  type: { type: 'string', enum: ['Public', 'Private'] },
                  level: { type: 'string', enum: ['Primary', 'Secondary', 'TVET'] },
                  students: { type: 'integer' },
                  established: { type: 'integer' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  description: { type: 'string' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'School created' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/schools/top': {
      get: {
        tags: ['Schools'],
        summary: 'Get top-rated schools',
        security: [],
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 4 } }],
        responses: { 200: { description: 'Array of top-rated schools' } },
      },
    },
    '/api/schools/nearby': {
      get: {
        tags: ['Schools'],
        summary: 'Get schools near a GPS location',
        security: [],
        parameters: [
          { in: 'query', name: 'latitude', required: true, schema: { type: 'number' } },
          { in: 'query', name: 'longitude', required: true, schema: { type: 'number' } },
          { in: 'query', name: 'radius', schema: { type: 'number', default: 50, description: 'Radius in km' } },
        ],
        responses: { 200: { description: 'Nearby schools sorted by distance' } },
      },
    },
    '/api/schools/{id}': {
      put: {
        tags: ['Schools'],
        summary: 'Update a school — leader / admin only',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  type: { type: 'string' },
                  level: { type: 'string' },
                  students: { type: 'integer' },
                  imagesToDelete: { type: 'array', items: { type: 'string' } },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated school' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Schools'],
        summary: 'Delete a school — leader / admin only',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/schools/{id}/rate': {
      post: {
        tags: ['Schools'],
        summary: 'Rate a school (1–5 stars)',
        security: [],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['rating'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 } } },
            },
          },
        },
        responses: { 200: { description: 'Rating saved' } },
      },
    },
    '/api/schools/{schoolId}/details': {
      get: {
        tags: ['Schools'],
        summary: 'Get extended details for a school',
        parameters: [{ in: 'path', name: 'schoolId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'School details object' } },
      },
      post: {
        tags: ['Schools'],
        summary: 'Create or update extended school details — leader / admin',
        parameters: [{ in: 'path', name: 'schoolId', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { description: { type: 'string' }, mission: { type: 'string' }, vision: { type: 'string' }, facilities: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Details saved' } },
      },
    },

    // ─── USERS ────────────────────────────────────────────────────────────────
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: "Get current user's profile",
        responses: { 200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
      },
      put: {
        tags: ['Users'],
        summary: 'Update own profile',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                  location: { type: 'string' },
                  date_of_birth: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated profile' } },
      },
    },
    '/api/users/me/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Upload profile avatar',
        requestBody: {
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } } },
        },
        responses: { 200: { description: 'Returns new avatar_url' } },
      },
    },
    '/api/users/change-password': {
      post: {
        tags: ['Users'],
        summary: 'Change own password',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['current_password', 'new_password'],
                properties: {
                  current_password: { type: 'string' },
                  new_password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password changed' }, 400: { description: 'Wrong current password' } },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users — admin only',
        parameters: [{ in: 'query', name: 'role', schema: { type: 'string' } }],
        responses: { 200: { description: 'Array of users' } },
      },
    },
    '/api/users/students/search': {
      get: {
        tags: ['Users'],
        summary: 'Search students by name or email',
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' } },
          { in: 'query', name: 'school_id', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Matching students' } },
      },
    },

    // ─── GRADES ───────────────────────────────────────────────────────────────
    '/api/grades': {
      get: {
        tags: ['Grades & Report Cards'],
        summary: 'Get grades — teachers see only their own, admins see all',
        parameters: [
          { in: 'query', name: 'school_id', schema: { type: 'string' } },
          { in: 'query', name: 'term', schema: { type: 'string' } },
          { in: 'query', name: 'academic_year', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Array of grades' } },
      },
      post: {
        tags: ['Grades & Report Cards'],
        summary: 'Post a grade — teacher (own school only) or admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['student_user_id', 'school_id', 'subject'],
                properties: {
                  student_user_id: { type: 'integer' },
                  school_id: { type: 'string' },
                  subject: { type: 'string', example: 'Mathematics' },
                  grade: { type: 'string', example: 'A' },
                  score: { type: 'number', example: 88 },
                  max_score: { type: 'number', example: 100 },
                  term: { type: 'string', example: 'Term 1' },
                  academic_year: { type: 'string', example: '2025-2026' },
                  comments: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Grade posted and student/parent notified' },
          403: { description: 'Teacher not assigned to this school' },
        },
      },
    },
    '/api/grades/student/{studentId}': {
      get: {
        tags: ['Grades & Report Cards'],
        summary: "Get a student's grades",
        parameters: [
          { in: 'path', name: 'studentId', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'term', schema: { type: 'string' } },
          { in: 'query', name: 'academic_year', schema: { type: 'string' } },
          { in: 'query', name: 'school_id', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Array of grades' },
          403: { description: 'Teacher can only view grades for students at their school' },
        },
      },
    },
    '/api/grades/bulk-upload': {
      post: {
        tags: ['Grades & Report Cards'],
        summary: 'Bulk upload grades via CSV — teacher (own school) or admin',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'school_id', 'term', 'academic_year'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'CSV: student_email, subject, grade, score, max_score, comments' },
                  school_id: { type: 'string' },
                  term: { type: 'string' },
                  academic_year: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Upload summary with results and per-row errors' } },
      },
    },
    '/api/report-cards/generate': {
      post: {
        tags: ['Grades & Report Cards'],
        summary: 'Generate a single report card',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['student_user_id', 'school_id', 'term', 'academic_year'],
                properties: {
                  student_user_id: { type: 'integer' },
                  school_id: { type: 'string' },
                  term: { type: 'string' },
                  academic_year: { type: 'string' },
                  attendance_percentage: { type: 'number' },
                  teacher_comments: { type: 'string' },
                  principal_comments: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Report card generated and student/parents notified' } },
      },
    },
    '/api/report-cards/bulk-generate': {
      post: {
        tags: ['Grades & Report Cards'],
        summary: 'Bulk generate report cards and optionally email them',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['school_id', 'term', 'academic_year'],
                properties: {
                  school_id: { type: 'string' },
                  term: { type: 'string' },
                  academic_year: { type: 'string' },
                  student_ids: { type: 'array', items: { type: 'integer' } },
                  send_emails: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Bulk generation summary' } },
      },
    },

    // ─── SURVEYS ──────────────────────────────────────────────────────────────
    '/api/surveys': {
      get: {
        tags: ['Surveys'],
        summary: 'List survey comments / reviews',
        security: [],
        parameters: [{ in: 'query', name: 'school_id', schema: { type: 'string' } }],
        responses: { 200: { description: 'Array of survey entries' } },
      },
      post: {
        tags: ['Surveys'],
        summary: 'Submit a school survey / rating',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['school_id', 'rating'],
                properties: {
                  school_id: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                  teaching_quality: { type: 'integer', minimum: 1, maximum: 5 },
                  facilities_quality: { type: 'integer', minimum: 1, maximum: 5 },
                  safety_quality: { type: 'integer', minimum: 1, maximum: 5 },
                  ease_of_use: { type: 'integer', minimum: 1, maximum: 5 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Survey submitted' } },
      },
    },
    '/api/surveys/{id}/like': {
      post: {
        tags: ['Surveys'],
        summary: 'Like / unlike a survey comment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Like toggled' } },
      },
    },
    '/api/surveys/{id}/replies': {
      get: {
        tags: ['Surveys'],
        summary: 'Get replies for a survey comment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Array of replies' } },
      },
      post: {
        tags: ['Surveys'],
        summary: 'Reply to a survey comment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', required: ['comment'], properties: { comment: { type: 'string' } } } } },
        },
        responses: { 201: { description: 'Reply posted' } },
      },
    },

    // ─── GALLERIES ────────────────────────────────────────────────────────────
    '/api/galleries': {
      get: {
        tags: ['Galleries'],
        summary: 'List galleries',
        security: [],
        parameters: [
          { in: 'query', name: 'school_id', schema: { type: 'string' } },
          { in: 'query', name: 'gallery_type', schema: { type: 'string', example: 'photos' } },
          { in: 'query', name: 'is_featured', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'Array of galleries' } },
      },
      post: {
        tags: ['Galleries'],
        summary: 'Create a gallery — leader / admin',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  school_id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  gallery_type: { type: 'string', default: 'photos' },
                  is_featured: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Gallery created' } },
      },
    },
    '/api/galleries/{id}/items': {
      post: {
        tags: ['Galleries'],
        summary: 'Upload a photo/video to a gallery',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  media: { type: 'string', format: 'binary' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Item uploaded — stored on Cloudinary' } },
      },
    },

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    '/api/events': {
      get: {
        tags: ['Events'],
        summary: 'List events',
        security: [],
        parameters: [{ in: 'query', name: 'school_id', schema: { type: 'string' } }],
        responses: { 200: { description: 'Array of events' } },
      },
      post: {
        tags: ['Events'],
        summary: 'Create an event — leader / admin',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'event_date'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  school_id: { type: 'string' },
                  event_date: { type: 'string', format: 'date-time' },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Event created' } },
      },
    },
    '/api/events/{id}/rsvp': {
      post: {
        tags: ['Events'],
        summary: 'RSVP to an event',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['attending', 'not_attending'] } } } } },
        },
        responses: { 200: { description: 'RSVP saved' } },
      },
    },

    // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: "Get current user's notifications",
        responses: { 200: { description: 'Array of notifications' } },
      },
    },
    '/api/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get count of unread notifications',
        responses: { 200: { description: '{ count: number }' } },
      },
    },
    '/api/notifications/mark-all-read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        responses: { 200: { description: 'All marked read' } },
      },
    },

    // ─── PORTAL ───────────────────────────────────────────────────────────────
    '/api/portal/announcements': {
      get: {
        tags: ['Portal'],
        summary: 'List announcements (filtered by role)',
        responses: { 200: { description: 'Array of announcements' } },
      },
      post: {
        tags: ['Portal'],
        summary: 'Create an announcement — staff only (teachers scoped to their school)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'body'],
                properties: {
                  title: { type: 'string' },
                  body: { type: 'string' },
                  audience_role: { type: 'string', default: 'all', example: 'student' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Announcement created' },
          403: { description: 'Teacher not assigned to a school' },
        },
      },
    },
    '/api/portal/messages': {
      post: {
        tags: ['Portal'],
        summary: 'Send a direct message (also creates a real-time chat room)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipient_id', 'body'],
                properties: {
                  recipient_id: { type: 'integer' },
                  subject: { type: 'string' },
                  body: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Message sent' } },
      },
    },
    '/api/portal/recipients': {
      get: {
        tags: ['Portal'],
        summary: 'Get messageable users (teachers only see their school)',
        parameters: [{ in: 'query', name: 'role', schema: { type: 'string', example: 'student' } }],
        responses: { 200: { description: 'Array of users' } },
      },
    },
    '/api/portal/documents': {
      post: {
        tags: ['Portal'],
        summary: 'Upload a portal document — staff only',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'file'],
                properties: {
                  title: { type: 'string' },
                  file: { type: 'string', format: 'binary' },
                  audience_role: { type: 'string', default: 'all' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Document uploaded' } },
      },
    },

    // ─── SCHOLARSHIPS ─────────────────────────────────────────────────────────
    '/api/scholarships': {
      get: {
        tags: ['Scholarships'],
        summary: 'List available scholarships',
        security: [],
        parameters: [{ in: 'query', name: 'school_id', schema: { type: 'string' } }],
        responses: { 200: { description: 'Array of scholarships' } },
      },
      post: {
        tags: ['Scholarships'],
        summary: 'Create a scholarship — leader / admin',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'school_id'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  school_id: { type: 'string' },
                  amount: { type: 'number' },
                  deadline: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Scholarship created' } },
      },
    },
    '/api/scholarships/{id}/apply': {
      post: {
        tags: ['Scholarships'],
        summary: 'Apply for a scholarship (upload supporting documents)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  cover_letter: { type: 'string' },
                  documents: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Application submitted' } },
      },
    },

    // ─── STUDENT APPLICATIONS ─────────────────────────────────────────────────
    '/api/applications': {
      get: {
        tags: ['Student Applications'],
        summary: "Get current student's applications",
        responses: { 200: { description: 'Array of applications' } },
      },
      post: {
        tags: ['Student Applications'],
        summary: 'Submit a school application',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['school_id'],
                properties: {
                  school_id: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Application submitted' } },
      },
    },
    '/api/leader/applications': {
      get: {
        tags: ['Student Applications'],
        summary: "Get all applications for leader's school",
        responses: { 200: { description: 'Array of pending applications' } },
      },
    },
    '/api/leader/applications/{id}/approve': {
      post: {
        tags: ['Student Applications'],
        summary: 'Approve a student application',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Application approved — student notified' } },
      },
    },
    '/api/leader/applications/{id}/reject': {
      post: {
        tags: ['Student Applications'],
        summary: 'Reject a student application',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Application rejected — student notified' } },
      },
    },

    // ─── PARENT-CHILD ─────────────────────────────────────────────────────────
    '/api/parent-children': {
      get: {
        tags: ['Parent-Child'],
        summary: "Get children linked to the current parent's account",
        responses: { 200: { description: 'Array of parent-child relationships' } },
      },
      post: {
        tags: ['Parent-Child'],
        summary: "Link a child to the current parent's account",
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['child_email'],
                properties: {
                  child_email: { type: 'string', example: 'child@example.com' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Child linked' }, 404: { description: 'Child not found' } },
      },
    },

    // ─── CONNECTIONS ──────────────────────────────────────────────────────────
    '/api/connections/suggested': {
      get: {
        tags: ['Connections'],
        summary: 'Get suggested users to connect with',
        responses: { 200: { description: 'Array of suggested users' } },
      },
    },
    '/api/connections/request': {
      post: {
        tags: ['Connections'],
        summary: 'Send a connection request',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', required: ['target_user_id'], properties: { target_user_id: { type: 'integer' } } } } },
        },
        responses: { 201: { description: 'Request sent' } },
      },
    },
    '/api/connections/respond': {
      post: {
        tags: ['Connections'],
        summary: 'Accept or decline a connection request',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requester_id', 'action'],
                properties: {
                  requester_id: { type: 'integer' },
                  action: { type: 'string', enum: ['accept', 'decline'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Response recorded' } },
      },
    },

    // ─── REALTIME CHAT ────────────────────────────────────────────────────────
    '/api/chat/rooms/direct': {
      post: {
        tags: ['Chat'],
        summary: 'Get or create a direct chat room between two users',
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', required: ['other_user_id'], properties: { other_user_id: { type: 'integer' } } } } },
        },
        responses: { 200: { description: 'Chat room object' } },
      },
    },
    '/api/chat/rooms/group': {
      post: {
        tags: ['Chat'],
        summary: 'Create a group chat room',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'member_ids'],
                properties: {
                  name: { type: 'string' },
                  school_id: { type: 'string' },
                  member_ids: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Group room created' } },
      },
    },
    '/api/chat/rooms/{roomId}/messages': {
      get: {
        tags: ['Chat'],
        summary: 'Get messages for a room',
        parameters: [
          { in: 'path', name: 'roomId', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
        ],
        responses: { 200: { description: 'Array of messages' } },
      },
      post: {
        tags: ['Chat'],
        summary: 'Send a message (with optional file attachment)',
        parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  attachment: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Message sent' } },
      },
    },

    // ─── ADS ──────────────────────────────────────────────────────────────────
    '/api/ads/active': {
      get: {
        tags: ['Advertisements'],
        summary: 'Get currently active ad campaigns',
        security: [],
        responses: { 200: { description: 'Array of active ads' } },
      },
    },
    '/api/ads': {
      post: {
        tags: ['Advertisements'],
        summary: 'Submit an ad campaign for review (free trial period)',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'media'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  click_url: { type: 'string' },
                  company_name: { type: 'string' },
                  placement: { type: 'string', default: 'global' },
                  media: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ad submitted — pending admin review' },
        },
      },
    },
    '/api/ads/admin/all': {
      get: {
        tags: ['Advertisements'],
        summary: 'List all ad campaigns — admin only',
        responses: { 200: { description: 'All ads with status' } },
      },
    },
    '/api/ads/admin/{id}/review': {
      patch: {
        tags: ['Advertisements'],
        summary: 'Approve or reject an ad — admin only',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['approve', 'reject'] },
                  rejection_reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Ad status updated' } },
      },
    },

    // ─── HEALTH ───────────────────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        security: [],
        responses: { 200: { description: 'Server is up', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, platform: { type: 'string' }, gitCommit: { type: 'string' } } } } } } },
      },
    },
  },
};

module.exports = swaggerSpec;
