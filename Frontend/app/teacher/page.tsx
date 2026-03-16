'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../providers/AuthProvider';
import {
  createAnnouncement,
  fetchAnnouncements,
  fetchDocuments,
  fetchInbox,
  fetchRecipients,
  fetchSent,
  sendMessage,
  uploadDocument,
} from '../api/portal';
import { fetchFeeSchedules, createFeeSchedule } from '../api/payments';
import { BASE_URL } from '@/api/school';
import { fetchGrades, createGrade } from '../api/grades';
import { fetchEvents, createEvent } from '../api/events';
import { GraduationCap, Calendar, Plus } from 'lucide-react';
import EventCalendar from '../components/EventCalendar';

export default function TeacherPortal() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages' | 'documents' | 'fees' | 'grades' | 'events'>('announcements');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [messageRecipient, setMessageRecipient] = useState<number | ''>('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementAudience, setAnnouncementAudience] = useState('all');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentAudience, setDocumentAudience] = useState('all');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [feeTitle, setFeeTitle] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeCurrency, setFeeCurrency] = useState('RWF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Grades state
  const [grades, setGrades] = useState<any[]>([]);
  const [gradeStudentId, setGradeStudentId] = useState('');
  const [gradeSchoolId, setGradeSchoolId] = useState('');
  const [gradeSubject, setGradeSubject] = useState('');
  const [gradeGrade, setGradeGrade] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [gradeMaxScore, setGradeMaxScore] = useState('100');
  const [gradeTerm, setGradeTerm] = useState('');
  const [gradeAcademicYear, setGradeAcademicYear] = useState('');
  const [gradeComments, setGradeComments] = useState('');
  
  // Events state
  const [events, setEvents] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('general');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventAudience, setEventAudience] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (user?.role !== 'teacher' && user?.role !== 'leader' && user?.role !== 'admin') {
      router.push('/home');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || !user || (user.role !== 'teacher' && user.role !== 'leader' && user.role !== 'admin')) return;
    const loadPortal = async () => {
      try {
        const [ann, docs, inboxMessages, sentMessages, parents, schedules] = await Promise.all([
          fetchAnnouncements(),
          fetchDocuments(),
          fetchInbox(),
          fetchSent(),
          fetchRecipients('parent'),
          fetchFeeSchedules(),
        ]);
        setAnnouncements(ann);
        setDocuments(docs);
        setInbox(inboxMessages);
        setSent(sentMessages);
        setRecipients(parents);
        setFeeSchedules(schedules);
      } catch (error) {
        console.error('Error loading teacher portal:', error);
      }
    };
    loadPortal();
  }, [isAuthenticated, user?.role]);

  // Load grades when tab is active
  useEffect(() => {
    if (activeTab === 'grades' && isAuthenticated && user?.id) {
      fetchGrades({ teacher_id: user.id })
        .then(setGrades)
        .catch(err => console.error('Error loading grades:', err));
    }
  }, [activeTab, isAuthenticated, user?.id]);

  // Load events when tab is active
  useEffect(() => {
    if (activeTab === 'events' && isAuthenticated) {
      fetchEvents()
        .then(setEvents)
        .catch(err => console.error('Error loading events:', err));
    }
  }, [activeTab, isAuthenticated]);

  const unpaidSchedules = useMemo(() => feeSchedules, [feeSchedules]);

  const handleSendMessage = async () => {
    if (!messageRecipient || !messageBody.trim()) return;
    setIsSubmitting(true);
    try {
      const newMessage = await sendMessage({
        recipient_id: Number(messageRecipient),
        subject: messageSubject.trim() || undefined,
        body: messageBody.trim(),
      });
      setSent((prev) => [newMessage, ...prev]);
      setMessageRecipient('');
      setMessageSubject('');
      setMessageBody('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createAnnouncement({
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        audience_role: announcementAudience,
      });
      setAnnouncements((prev) => [created, ...prev]);
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setAnnouncementAudience('all');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentTitle.trim() || !documentFile) return;
    setIsSubmitting(true);
    try {
      const created = await uploadDocument({
        title: documentTitle.trim(),
        audience_role: documentAudience,
        file: documentFile,
      });
      setDocuments((prev) => [created, ...prev]);
      setDocumentTitle('');
      setDocumentFile(null);
      setDocumentAudience('all');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFee = async () => {
    if (!feeTitle.trim() || !feeAmount) return;
    setIsSubmitting(true);
    try {
      const created = await createFeeSchedule({
        title: feeTitle.trim(),
        amount: Number(feeAmount),
        currency: feeCurrency,
      });
      setFeeSchedules((prev) => [created, ...prev]);
      setFeeTitle('');
      setFeeAmount('');
      setFeeCurrency('RWF');
    } catch (error) {
      console.error('Failed to create fee schedule:', error);
      alert('Failed to create fee schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGrade = async () => {
    if (!gradeStudentId || !gradeSchoolId || !gradeSubject.trim() || !gradeGrade.trim() || !gradeTerm.trim() || !gradeAcademicYear.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createGrade({
        student_user_id: Number(gradeStudentId),
        school_id: gradeSchoolId,
        subject: gradeSubject.trim(),
        grade: gradeGrade.trim(),
        score: gradeScore ? Number(gradeScore) : undefined,
        max_score: gradeMaxScore ? Number(gradeMaxScore) : undefined,
        term: gradeTerm.trim(),
        academic_year: gradeAcademicYear.trim(),
        comments: gradeComments.trim() || undefined,
      });
      setGrades((prev) => [created, ...prev]);
      // Reset form
      setGradeStudentId('');
      setGradeSchoolId('');
      setGradeSubject('');
      setGradeGrade('');
      setGradeScore('');
      setGradeMaxScore('100');
      setGradeTerm('');
      setGradeAcademicYear('');
      setGradeComments('');
      alert('Grade added successfully!');
    } catch (error) {
      console.error('Failed to create grade:', error);
      alert('Failed to create grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventStartDate) {
      alert('Title and start date are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        event_type: eventType,
        start_date: eventStartDate,
        end_date: eventEndDate || undefined,
        location: eventLocation.trim() || undefined,
        audience_role: eventAudience,
      });
      setEvents((prev) => [created, ...prev]);
      // Reset form
      setEventTitle('');
      setEventDescription('');
      setEventType('general');
      setEventStartDate('');
      setEventEndDate('');
      setEventLocation('');
      setEventAudience('all');
      alert('Event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'teacher' ? 'Teacher Portal' : 'Staff Portal'}
          </h1>
          <p className="text-sm text-gray-600">
            Announcements, documents, messages, and fee schedules for school staff.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['announcements', 'messages', 'documents', 'fees', 'grades', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'announcements' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Create announcement</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Title"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={announcementAudience}
                    onChange={(e) => setAnnouncementAudience(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                  </select>
                  <button
                    disabled={isSubmitting || !announcementTitle.trim() || !announcementBody.trim()}
                    onClick={handleCreateAnnouncement}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Publish
                  </button>
                </div>
                <textarea
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Write announcement details..."
                  className="mt-3 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-sm text-gray-500">No announcements yet.</p>
                ) : (
                  announcements.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{item.body}</p>
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a message</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={messageRecipient}
                    onChange={(e) => setMessageRecipient(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select a parent</option>
                    {recipients.map((recipient: any) => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.first_name} {recipient.last_name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Subject (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    disabled={isSubmitting || !messageRecipient || !messageBody.trim()}
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your message..."
                  className="mt-3 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={4}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Inbox</h4>
                  <div className="space-y-3">
                    {inbox.length === 0 ? (
                      <p className="text-sm text-gray-500">No messages yet.</p>
                    ) : (
                      inbox.map((msg: any) => (
                        <div key={msg.id} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-400">
                            From {msg.sender_first_name} {msg.sender_last_name}
                          </p>
                          <p className="text-sm font-medium text-gray-900">{msg.subject || 'No subject'}</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sent</h4>
                  <div className="space-y-3">
                    {sent.length === 0 ? (
                      <p className="text-sm text-gray-500">No sent messages.</p>
                    ) : (
                      sent.map((msg: any) => (
                        <div key={msg.id} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-400">
                            To {msg.recipient_first_name} {msg.recipient_last_name}
                          </p>
                          <p className="text-sm font-medium text-gray-900">{msg.subject || 'No subject'}</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload document</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Document title"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={documentAudience}
                    onChange={(e) => setDocumentAudience(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                  </select>
                  <button
                    disabled={isSubmitting || !documentTitle.trim() || !documentFile}
                    onClick={handleUploadDocument}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    Upload
                  </button>
                </div>
                <input
                  type="file"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="mt-3 text-sm"
                />
              </div>

              <div className="space-y-4">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                ) : (
                  documents.map((doc: any) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.created_at).toLocaleString()}
                        </p>
                      </div>
                      <a
                        href={`${BASE_URL}${doc.file_url}`}
                        className="text-blue-600 text-sm font-medium"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Create fee schedule</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={feeTitle}
                    onChange={(e) => setFeeTitle(e.target.value)}
                    placeholder="Fee title"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    placeholder="Amount"
                    type="number"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={feeCurrency}
                    onChange={(e) => setFeeCurrency(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <button
                  disabled={isSubmitting || !feeTitle.trim() || !feeAmount}
                  onClick={handleCreateFee}
                  className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Create schedule
                </button>
              </div>

              <div className="space-y-3">
                {unpaidSchedules.length === 0 ? (
                  <p className="text-sm text-gray-500">No fee schedules yet.</p>
                ) : (
                  unpaidSchedules.map((schedule: any) => (
                    <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900">{schedule.title}</p>
                      <p className="text-xs text-gray-500">
                        {schedule.amount} {schedule.currency}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Enter Student Grade
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <input
                    value={gradeStudentId}
                    onChange={(e) => setGradeStudentId(e.target.value)}
                    placeholder="Student ID"
                    type="number"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={gradeSchoolId}
                    onChange={(e) => setGradeSchoolId(e.target.value)}
                    placeholder="School ID"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={gradeSubject}
                    onChange={(e) => setGradeSubject(e.target.value)}
                    placeholder="Subject (e.g., Mathematics)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={gradeGrade}
                    onChange={(e) => setGradeGrade(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Grade</option>
                    <option value="A">A - Excellent</option>
                    <option value="B">B - Good</option>
                    <option value="C">C - Satisfactory</option>
                    <option value="D">D - Needs Improvement</option>
                    <option value="F">F - Failing</option>
                  </select>
                  <input
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    placeholder="Score (e.g., 85)"
                    type="number"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={gradeMaxScore}
                    onChange={(e) => setGradeMaxScore(e.target.value)}
                    placeholder="Max Score (default: 100)"
                    type="number"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={gradeTerm}
                    onChange={(e) => setGradeTerm(e.target.value)}
                    placeholder="Term (e.g., Term 1, Q1)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={gradeAcademicYear}
                    onChange={(e) => setGradeAcademicYear(e.target.value)}
                    placeholder="Academic Year (e.g., 2024-2025)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <textarea
                    value={gradeComments}
                    onChange={(e) => setGradeComments(e.target.value)}
                    placeholder="Comments (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm md:col-span-2 lg:col-span-3"
                    rows={2}
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={handleCreateGrade}
                  className="mt-4 bg-blue-600 text-white text-sm px-6 py-2 rounded-md disabled:opacity-50 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Grade
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Grades Entered</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {grades.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No grades entered yet</td>
                        </tr>
                      ) : (
                        grades.slice(0, 20).map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{grade.first_name} {grade.last_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{grade.subject}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {grade.grade}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{grade.score}/{grade.max_score}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{grade.term} {grade.academic_year}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Create Event
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Event Title"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <input
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    type="datetime-local"
                    placeholder="Start Date"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    type="datetime-local"
                    placeholder="End Date (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={eventAudience}
                    onChange={(e) => setEventAudience(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                  </select>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Event Description"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm md:col-span-2"
                    rows={3}
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={handleCreateEvent}
                  className="mt-4 bg-purple-600 text-white text-sm px-6 py-2 rounded-md disabled:opacity-50 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Create Event
                </button>
              </div>

              {/* Calendar View */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Calendar</h4>
                <EventCalendar
                  onEventClick={(event) => {
                    alert(`Event: ${event.title}\nDate: ${new Date(event.start_date).toLocaleString()}\n${event.description || ''}`);
                  }}
                  schoolId={undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
