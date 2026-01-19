const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System knowledge about the Rwanda School Browsing System
const SYSTEM_KNOWLEDGE = `
You are an AI assistant for the Rwanda School Browsing System (RSBS), a comprehensive platform for managing schools in Rwanda.

SYSTEM FEATURES:
- School browsing and search with filters
- Student applications with document uploads
- School leader dashboards for managing applications
- Admin analytics and reporting
- Email notifications for application status
- Multi-language support (English & Kinyarwanda)
- Rating and review system for schools

USER ROLES:
1. STUDENTS: Can browse schools, apply to schools, upload documents, track application status
2. LEADERS: School administrators who manage their schools and review applications
3. ADMINS: System administrators with full access to all features

APPLICATION PROCESS:
1. Students browse schools (public/private, primary/secondary)
2. Students submit applications with personal info and documents
3. Leaders review applications and approve/reject with reasons
4. Students receive email notifications about their application status
5. Applications can be: pending, approved, rejected, or withdrawn

SCHOOLS INFO:
- Schools in Rwanda are categorized by:
  * Type: Public or Private
  * Level: Primary or Secondary
  * Location: Various districts (Kigali, etc.)
  * Students count, establishment year, facilities

KEY PAGES:
- /landing - Homepage with featured schools
- /student - Student portal (browse, apply, track applications)
- /schools - School management (leaders only)
- /leader - Application review dashboard (leaders only)
- /admin - Admin dashboard with analytics
- /about - About the system
- /contact - Contact form
`;

// Role-specific system prompts
const getRolePrompt = (userRole) => {
  const basePrompt = SYSTEM_KNOWLEDGE;

  switch (userRole) {
    case 'student':
      return `${basePrompt}

STUDENT ASSISTANT MODE:
You are helping a STUDENT user. Focus on:
- Guiding them through the application process
- Helping them find suitable schools
- Explaining application requirements
- Tracking their application status
- Answering questions about schools in Rwanda
- Providing tips for successful applications

Be friendly, encouraging, and supportive. Help them make informed decisions about their education.`;

    case 'leader':
      return `${basePrompt}

SCHOOL LEADER ASSISTANT MODE:
You are helping a SCHOOL LEADER. Focus on:
- Managing and reviewing student applications efficiently
- Best practices for evaluating applications
- Tips for improving school reputation and ratings
- How to attract quality students
- Administrative guidance for school management
- Analyzing application trends

Be professional and provide actionable advice for school improvement.`;

    case 'admin':
      return `${basePrompt}

ADMIN ASSISTANT MODE:
You are helping a SYSTEM ADMINISTRATOR. Focus on:
- System analytics and reporting
- User management insights
- Application trends and statistics
- System performance optimization
- Data analysis and visualization suggestions
- Best practices for system administration

Provide technical, data-driven insights and recommendations.`;

    default:
      return `${basePrompt}

GENERAL ASSISTANT MODE:
You are helping a visitor. Focus on:
- Explaining the system features
- Guiding them through signup/login
- Answering general questions about schools in Rwanda
- Encouraging them to create an account
- Explaining the benefits of the platform`;
  }
};

// Enhanced prompt for internet search capability
const enhancePromptWithSearch = (userMessage, userRole) => {
  const searchKeywords = ['top schools', 'best schools', 'schools in kigali', 'schools in rwanda', 'compare schools', 'school rankings'];
  const needsSearch = searchKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

  if (needsSearch) {
    return `${userMessage}

Note: If this question requires current information about schools in Rwanda (rankings, locations, facilities, etc.), use your knowledge to provide helpful information. If you don't have specific current data, provide general guidance on how to evaluate schools and what factors to consider.`;
  }

  return userMessage;
};

// Main chat function
const getChatResponse = async (message, conversationHistory = [], userRole = 'guest', userContext = {}) => {
  try {
    // Enhance message if search is needed
    const enhancedMessage = enhancePromptWithSearch(message, userRole);

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: getRolePrompt(userRole)
      },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      {
        role: 'user',
        content: enhancedMessage
      }
    ];

    // Add user context if available
    if (Object.keys(userContext).length > 0) {
      const contextMessage = `
User Context:
- Name: ${userContext.name || 'Not provided'}
- Email: ${userContext.email || 'Not provided'}
- Role: ${userRole}
${userContext.applicationCount ? `- Has ${userContext.applicationCount} application(s)` : ''}
${userContext.schoolName ? `- School: ${userContext.schoolName}` : ''}
      `;
      messages.splice(1, 0, { role: 'system', content: contextMessage });
    }

    console.log(`AI Request from ${userRole}: "${message.substring(0, 50)}..."`);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Fast and cost-effective
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    const response = completion.choices[0].message.content;
    console.log(`AI Response length: ${response.length} characters`);

    return {
      success: true,
      message: response,
      tokens: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('AI Service Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);

    // Handle specific errors
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return {
        success: false,
        message: "⚠️ AI service quota exceeded. The administrator needs to add billing at platform.openai.com. For now, here are some helpful links:\n\n📚 Application Guide: /student?tab=browse\n📧 Contact Support: /contact\n❓ FAQ: Check our About page",
        error: 'quota_exceeded'
      };
    }

    if (error.code === 'invalid_api_key' || error.status === 401) {
      return {
        success: false,
        message: "⚠️ AI service configuration error. Please contact the administrator to configure the OpenAI API key.",
        error: 'config_error'
      };
    }

    return {
      success: false,
      message: "I'm having trouble processing your request right now. Please try rephrasing your question or try again in a moment.\n\nYou can also:\n• Browse schools at /student\n• Contact us at /contact\n• Check the About page for more info",
      error: error.message
    };
  }
};

// Quick suggestions based on user role
const getQuickSuggestions = (userRole) => {
  const suggestions = {
    student: [
      "How do I apply to a school?",
      "What documents do I need?",
      "Top schools in Kigali?",
      "How long does approval take?",
      "Can I apply to multiple schools?"
    ],
    leader: [
      "How to review applications?",
      "Best practices for school management",
      "How to improve school rating?",
      "Application approval process",
      "Managing student documents"
    ],
    admin: [
      "Generate application statistics",
      "User activity analysis",
      "System performance insights",
      "Most popular schools",
      "Application trends this month"
    ],
    guest: [
      "What is Rwanda School Browsing System?",
      "How do I sign up?",
      "What are the benefits?",
      "Who can use this system?",
      "Is it free to use?"
    ]
  };

  return suggestions[userRole] || suggestions.guest;
};

// Enhanced fallback responses with pattern matching (works WITHOUT external AI)
const getFallbackResponse = (message, userRole) => {
  const lowerMessage = message.toLowerCase();

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon)/i)) {
    const userName = userRole === 'student' ? 'Student' : userRole === 'leader' ? 'School Leader' : 'there';
    return `Hello ${userName}! 👋 Welcome to Rwanda School Browsing System (RSBS)!

I'm here to help you with:
${userRole === 'student' ? `
• **Applying to schools** - Step-by-step guidance
• **Tracking applications** - Check your status
• **Document requirements** - What you need
• **School information** - Find the best schools
` : userRole === 'leader' ? `
• **Reviewing applications** - Manage student applications
• **School management** - Best practices
• **Application approval** - How to approve/reject
• **Improving your school** - Attract more students
` : `
• **Understanding the system** - How RSBS works
• **Getting started** - Sign up and login
• **Browsing schools** - Find schools in Rwanda
• **Contact support** - Get help
`}

Just ask me anything! Or click a suggestion below.`;
  }

  // Application process
  if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
    if (lowerMessage.includes('how') || lowerMessage.includes('process') || lowerMessage.includes('step')) {
      return `📝 **How to Apply to a School - Complete Guide**

**Step-by-Step Process:**

1️⃣ **Browse Schools**
   - Go to Student Portal (/student)
   - Use filters: Public/Private, Primary/Secondary
   - Search by location (e.g., Kigali)

2️⃣ **Select a School**
   - Click on school card to view details
   - Check rating, facilities, student count
   - Read reviews from other students

3️⃣ **Click "Apply" Button**
   - Found on the school card
   - Opens application form

4️⃣ **Fill Application Form**
   📌 **Personal Information:**
      - Full name, date of birth
      - Contact details (email, phone)
   
   📌 **Academic Information:**
      - Current grade/class
      - Desired grade
      - Current school (if applicable)
   
   📌 **Parent/Guardian Information:**
      - Parent name, email, phone
      - Emergency contact

5️⃣ **Upload Documents** (Up to 5 files)
   - Report cards
   - Certificates
   - ID copies
   - Academic records
   
6️⃣ **Review & Submit**
   - Double-check all information
   - Click "Submit Application"

**After Submission:**
✅ You'll receive email confirmation
✅ Track status in "My Applications" tab
✅ Get notified when reviewed (email + portal)

**Timeline:** Schools typically review within 2-7 days

Need help? Visit /student to start browsing!`;
    }

    if (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('check')) {
      return `📊 **How to Track Your Applications**

**Method 1: Student Portal**
1. Go to Student Portal (/student)
2. Click "My Applications" tab
3. See all applications with status:
   - 🟡 **Pending** - Under review
   - 🟢 **Approved** - Congratulations!
   - 🔴 **Rejected** - See reason provided

**Method 2: Email Notifications**
- You receive emails when status changes
- Parent email also gets notified
- Check your inbox regularly

**Application Details:**
- Click any application to see full details
- View submitted documents
- Read approval/rejection reason
- See reviewer name and date

**What Each Status Means:**

🟡 **Pending:**
- School is reviewing your application
- Average wait time: 2-7 days
- Check documents are uploaded correctly

🟢 **Approved:**
- Congratulations! You've been accepted
- Follow school's enrollment instructions
- Check email for next steps

🔴 **Rejected:**
- Application wasn't accepted this time
- Read the reason provided by school
- You can apply to other schools
- Improve documents and try again

Need more help? Contact the school directly!`;
    }

    if (lowerMessage.includes('multiple') || lowerMessage.includes('how many')) {
      return `**Can I Apply to Multiple Schools?**

✅ **YES!** You can apply to as many schools as you want.

**Benefits:**
- Increases your chances of acceptance
- Compare different schools
- Have backup options
- Choose the best offer

**Important Notes:**
⚠️ **One application per school** - You can only apply once to each specific school
✅ **No limit on total applications** - Apply to 5, 10, or 20 schools!
📧 **Each application tracked separately** - Manage all in "My Applications"

**Best Strategy:**
1. Apply to 3-5 schools initially
2. Mix of "reach" and "safe" schools
3. Consider location and facilities
4. Check application requirements for each

**Pro Tip:** Apply early! Schools review on first-come, first-served basis.

Ready to apply? Visit /student to browse schools!`;
    }
  }

  // Documents
  if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return `📄 **Document Requirements & Upload Guide**

**Required Documents:**

✅ **Must Have (Essential):**
1. Recent report card (last semester/year)
2. Student ID or birth certificate
3. Passport-size photo

📌 **Highly Recommended:**
4. Academic certificates or awards
5. Reference letter from teacher
6. Previous school transcripts
7. Character reference

**Technical Requirements:**

📁 **File Formats:** JPEG, PNG, or PDF only
💾 **File Size:** Maximum 5MB per file
🔢 **File Limit:** Up to 5 documents total

**Upload Tips:**

✅ **Good Quality:**
- Clear, readable scans
- All text is visible
- No blurry or dark images
- Proper orientation

✅ **Naming Convention:**
- reportcard.pdf
- birth_certificate.jpg
- award_certificate.png

✅ **Before Uploading:**
- Check file size (under 5MB)
- Verify correct document
- Ensure readability

**Common Issues:**

❌ **"File too large"** - Compress or reduce quality
❌ **"Invalid format"** - Convert to PDF, JPEG, or PNG
❌ **"Upload failed"** - Check internet connection

**How to Upload:**
1. Fill application form
2. Scroll to "Upload Documents" section
3. Click "Choose Files" or drag & drop
4. Select up to 5 files
5. See preview of uploaded files
6. Remove if needed, then submit

**Security:** All documents are encrypted and only visible to school leaders reviewing your application.

Need help? Contact support at /contact`;
  }

  // School information / top schools
  if (lowerMessage.includes('top schools') || lowerMessage.includes('best schools') || lowerMessage.includes('school') && lowerMessage.includes('kigali')) {
    return `🏫 **Schools in Rwanda - How to Find the Best**

**Browse Schools:**
Visit /student and use our powerful search:

**Filter By:**
- 📍 **Location** (Kigali, other districts)
- 🏛️ **Type** (Public or Private)
- 📚 **Level** (Primary or Secondary)
- ⭐ **Rating** (5-star system)

**Top Features to Consider:**

1️⃣ **Rating & Reviews**
   - Check star rating (1-5 stars)
   - Read student reviews
   - See parent feedback

2️⃣ **Facilities**
   - Computer labs
   - Science labs
   - Library
   - Sports facilities
   - Cafeteria

3️⃣ **Student Count**
   - Smaller schools = more attention
   - Larger schools = more resources

4️⃣ **Established Year**
   - Older = more experienced
   - Newer = modern facilities

5️⃣ **Location**
   - Close to home
   - Transportation available
   - Safe neighborhood

**How to Compare:**
1. Browse multiple schools
2. Check ratings
3. Read all reviews
4. Compare facilities
5. Consider your budget (public vs private)

**Popular Areas:**
- Kigali (most schools)
- Other urban centers
- Rural areas

**Pro Tip:** Apply to both "dream schools" and "safe options" to maximize your chances!

Start browsing at /student now!`;
  }

  // Leader - Review applications
  if (userRole === 'leader' && (lowerMessage.includes('review') || lowerMessage.includes('approve') || lowerMessage.includes('reject'))) {
    return `👨‍💼 **Application Review Guide for School Leaders**

**How to Review Applications:**

**Step 1: Access Dashboard**
- Click "Applications" in navigation
- Or visit /leader directly

**Step 2: View Applications**
- See all applications grouped by school
- Filter by status: Pending, Approved, Rejected
- Search by student name

**Step 3: Review Details**
- Click "View Details" on any application
- Review:
  ✅ Student personal information
  ✅ Academic background
  ✅ Parent/guardian details
  ✅ Uploaded documents (download to view)
  ✅ Any additional information

**Step 4: Download Documents**
- Click document links to view/download
- Verify authenticity
- Check for completeness

**Step 5: Make Decision**

🟢 **To Approve:**
1. Click "Approve" button
2. Confirm your decision
3. Student gets email notification
4. Status updated to "Approved"

🔴 **To Reject:**
1. Click "Reject" button
2. **MUST provide clear reason** (required!)
3. Be constructive and helpful
4. Student gets email with your reason
5. Status updated to "Rejected"

**Best Practices:**

⏱️ **Response Time:**
- Review within 24-48 hours
- Don't keep students waiting
- Prompt responses improve reputation

📋 **Fair Evaluation:**
- Check all documents carefully
- Be consistent in criteria
- Don't discriminate
- Give every application proper attention

✍️ **Rejection Reasons:**
Good examples:
✅ "Document quality is poor, please resubmit clear scans"
✅ "Current grade doesn't meet requirements for desired class"
✅ "School capacity is full for this academic year"

Bad examples:
❌ "No" (too vague)
❌ "Not good enough" (not helpful)
❌ "We don't want you" (unprofessional)

**After Review:**
- Student receives email immediately
- Parent receives copy
- Application status updated in portal
- You can see review history

**Tips for Attracting Quality Students:**
1. Respond quickly to applications
2. Provide constructive feedback
3. Maintain high school rating
4. Improve school facilities
5. Encourage positive reviews

Need help? Check /about or contact admin support!`;
  }

  // Leader - Improve school
  if (userRole === 'leader' && (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('rating'))) {
    return `📈 **How to Improve Your School's Reputation**

**1. Respond to Applications Quickly ⚡**
   - Review within 24-48 hours
   - Fast responses = better reputation
   - Shows professionalism

**2. Maintain High Rating ⭐**
   - Current ratings visible to all students
   - Based on student reviews
   - Encourage positive experiences

**3. Provide Quality Feedback 💬**
   - Even when rejecting, be helpful
   - Constructive criticism
   - Professional communication

**4. Update School Information 📝**
   - Keep facilities list current
   - Update student count
   - Add photos if possible
   - Accurate contact details

**5. Fair Application Process ⚖️**
   - Consistent evaluation criteria
   - No discrimination
   - Transparent requirements

**6. Encourage Reviews 📢**
   - Ask satisfied students to rate
   - Respond to feedback
   - Show you care

**7. Improve Facilities 🏗️**
   - Add computer labs
   - Update library
   - Sports equipment
   - Modern classrooms

**What Students Look For:**
- ⭐ High ratings (4-5 stars)
- 💬 Positive reviews
- 🏫 Good facilities
- 👨‍🏫 Qualified teachers
- 📍 Convenient location
- 💰 Reasonable fees

**Track Your Progress:**
- Monitor application volume
- Check rating trends
- Read student feedback
- Compare with other schools

**Remember:** Quality education + professional management = More applications!

Manage your school at /schools`;
  }

  // Admin help
  if (userRole === 'admin') {
    return `👨‍💼 **Admin Dashboard & Analytics**

**Available Features:**

📊 **System Analytics** (/admin)
- Total users (students, leaders, admins)
- Application statistics
- School performance metrics
- User activity trends

📈 **Reports:**
- Daily/weekly/monthly summaries
- Application approval rates
- Popular schools
- User growth

🔧 **User Management:**
- View all users
- Manage accounts
- Reset passwords (if needed)
- Monitor activity

🏫 **School Management:**
- View all schools
- Verify school information
- Monitor compliance
- Handle disputes

**Best Practices:**
- Regular system monitoring
- Address user complaints quickly
- Maintain data privacy
- Ensure fair processes

**Data Analysis Tips:**
- Track application trends
- Identify popular schools
- Monitor response times
- Optimize user experience

Visit /admin for full dashboard!`;
  }

  // System info / What is RSBS
  if (lowerMessage.includes('what is') || lowerMessage.includes('about') || lowerMessage.includes('system') || lowerMessage.includes('rsbs')) {
    return `🎓 **Rwanda School Browsing System (RSBS) - Complete Overview**

**What is RSBS?**
A comprehensive digital platform connecting students, schools, and education opportunities across Rwanda.

**Our Mission:**
Making school applications simple, transparent, and accessible for every Rwandan student.

**Key Features:**

👨‍🎓 **For Students:**
✅ Browse 100+ schools across Rwanda
✅ Filter by location, type, level
✅ Read reviews and ratings
✅ Apply online with documents
✅ Track application status
✅ Email notifications
✅ Multi-language support (English & Kinyarwanda)

👨‍💼 **For School Leaders:**
✅ Manage school information
✅ Review student applications
✅ Approve/reject with feedback
✅ Track application trends
✅ Improve school reputation

👨‍💻 **For Admins:**
✅ System analytics
✅ User management
✅ Performance monitoring
✅ Data reporting

**System Benefits:**

🚀 **Fast & Efficient**
- Apply to multiple schools in minutes
- Track all applications in one place
- Instant email notifications

🔒 **Secure & Private**
- Encrypted document storage
- Protected personal information
- Verified school leaders only

📱 **Accessible Anywhere**
- Works on phone, tablet, computer
- No app download needed
- Available 24/7

🌐 **Multilingual**
- English & Kinyarwanda
- Easy language switching
- Inclusive for all Rwandans

**How It Works:**

1. **Students** browse and apply to schools
2. **Schools** receive and review applications
3. **System** facilitates communication
4. **Everyone** tracks progress in real-time

**Get Started:**
- **Students:** Sign up → Browse → Apply
- **Leaders:** Verify account → Manage schools
- **Guests:** Explore schools without login

**Pages:**
- 🏠 /landing - Homepage
- 👨‍🎓 /student - Student portal
- 🏫 /schools - School management
- 👨‍💼 /leader - Application dashboard
- 👨‍💻 /admin - System analytics
- ℹ️ /about - Learn more
- 📧 /contact - Get help

**Vision:**
Empowering every Rwandan student to find their perfect school through technology.

Ready to start? Visit /student or /about!`;
  }

  // Signup / Getting started
  if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('create account') || lowerMessage.includes('get started')) {
    return `🚀 **How to Get Started with RSBS**

**Sign Up Process:**

**Step 1: Choose Account Type**
- 👨‍🎓 **Student** - Apply to schools
- 👨‍💼 **School Leader** - Manage schools
- 👨‍💻 **Admin** - System management

**Step 2: Registration** (/auth/signup)
Fill in the form:
- Full name
- Email address (important!)
- Password (strong & secure)
- Confirm password
- Select role (Student/Leader)

**Step 3: Email Verification**
- Check your email inbox
- Find verification code (6 digits)
- Enter code on verification page
- Account activated!

**Step 4: Login** (/auth/signin)
- Enter email
- Enter password
- Receive verification code via email
- Enter code
- You're in!

**For Students:**
After signup → Browse schools → Apply

**For Leaders:**
After signup → Admin approves → Manage schools

**Important Notes:**

📧 **Email is Critical:**
- Used for all notifications
- Verification code sent here
- Password recovery
- Application updates

🔒 **Password Security:**
- Minimum 6 characters
- Mix letters and numbers
- Keep it secret
- Don't share with anyone

**Already Have Account?**
Just login at /auth/signin

**Forgot Password?**
Contact support at /contact

**Need Help?**
- Visit /about for detailed guide
- Contact us at /contact
- Check FAQ section

**Free to Use:** ✅
No fees for students or schools!

Ready? Click the signup button!`;
  }

  // Approval time
  if (lowerMessage.includes('how long') || lowerMessage.includes('approval') || lowerMessage.includes('wait')) {
    return `⏱️ **Application Review Timeline**

**Typical Response Time:**
- **Fast:** 1-2 days ⚡
- **Average:** 3-5 days 📅
- **Maximum:** 7-10 days 🕐

**What Affects Timeline:**

1️⃣ **School Workload**
   - More applications = longer wait
   - Popular schools may take longer

2️⃣ **Application Quality**
   - Complete applications process faster
   - Missing documents cause delays

3️⃣ **School Responsiveness**
   - Some schools review daily
   - Others review weekly

4️⃣ **Time of Year**
   - Peak season (Jan-Feb) = slower
   - Off-season = faster

**What You Can Do:**

✅ **Submit Complete Application**
- Fill all fields
- Upload all documents
- Double-check information

✅ **Upload Quality Documents**
- Clear, readable scans
- All required documents
- Correct file formats

✅ **Check Status Regularly**
- Visit "My Applications" tab
- Check email notifications
- Don't spam the school

⚠️ **Don't:**
- Submit duplicate applications
- Contact school multiple times
- Get impatient too quickly

**If It's Taking Too Long:**

After 7-10 days with no response:
1. Check "My Applications" for updates
2. Verify email notifications not in spam
3. Contact school directly (if contact provided)
4. Consider applying to other schools

**Remember:**
- Schools review in order received
- Quality applications reviewed first
- Patience is important
- Have backup school options

**Track Your Application:**
Visit /student → My Applications tab

Good luck! 🍀`;
  }

  // Contact / Help
  if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return `📞 **Get Help & Contact Support**

**Ways to Get Help:**

1️⃣ **Contact Form** (/contact)
   - Fill out contact form
   - Describe your issue
   - Get response via email
   - 24-48 hour response time

2️⃣ **FAQ Section** (/about)
   - Common questions answered
   - Step-by-step guides
   - Troubleshooting tips

3️⃣ **AI Chatbot** (Right here!)
   - Ask me anything
   - Instant responses
   - Available 24/7

4️⃣ **Email Support**
   - Check /contact for email
   - Include your account email
   - Describe issue clearly

**Common Issues:**

🔐 **Can't Login:**
- Check email spelling
- Verify password
- Check verification code
- Try password reset

📧 **Not Receiving Emails:**
- Check spam folder
- Verify email address correct
- Add us to contacts
- Try different email provider

📄 **Upload Problems:**
- Check file size (under 5MB)
- Use correct format (PDF, JPEG, PNG)
- Check internet connection
- Try smaller file

❌ **Application Issues:**
- Ensure all fields filled
- Upload required documents
- Check internet connection
- Try again later

**Before Contacting Support:**

✅ Check this chatbot first
✅ Read FAQ section
✅ Verify your internet connection
✅ Try logging out and back in
✅ Clear browser cache

**When Contacting:**

Include:
- Your full name
- Email address
- Detailed description
- Screenshots (if applicable)
- Steps to reproduce issue

**Response Time:**
- Simple questions: Same day
- Complex issues: 1-2 days
- Technical problems: 2-3 days

**Emergency Contact:**
For urgent issues, visit /contact for emergency contact details.

We're here to help! 🤝`;
  }

  // Default with role-based suggestions
  return `I'm currently running in **fallback mode** (limited AI). But I can still help!

**Ask me about:**
${userRole === 'student' ? `
• How do I apply to a school?
• What documents do I need?
• Top schools in Kigali?
• How long does approval take?
• Can I apply to multiple schools?
• How to track my applications?
• How to sign up?
` : userRole === 'leader' ? `
• How to review applications?
• How to approve/reject applications?
• Best practices for school management
• How to improve school rating?
• Managing student documents
• Application trends
` : userRole === 'admin' ? `
• System analytics
• User management
• Application statistics
• Performance monitoring
• Data reporting
` : `
• What is Rwanda School Browsing System?
• How do I sign up?
• What are the benefits?
• How to get started?
• Contact support
`}

**Quick Actions:**
${userRole === 'student' ? '• Browse schools at /student\n• Check applications in "My Applications"\n• Upload documents during application' : ''}
${userRole === 'leader' ? '• Review applications at /leader\n• Manage schools at /schools\n• Approve or reject with feedback' : ''}
${userRole === 'admin' ? '• View analytics at /admin\n• Manage users\n• Generate reports' : ''}
• Learn more at /about
• Contact us at /contact

💡 **Tip:** Try asking a complete question for better answers!

Or click a suggestion above to get detailed help! 👆`;
};

module.exports = {
  getChatResponse,
  getQuickSuggestions,
  getFallbackResponse
};
