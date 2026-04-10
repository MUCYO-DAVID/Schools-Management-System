'use client';

import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../providers/AuthProvider';
import {
  fetchAnnouncements,
  fetchDocuments,
  fetchInbox,
  fetchRecipients,
  fetchSent,
  sendMessage,
} from '../api/portal';
import { fetchFeeInvoices, fetchFeeSchedules, createInvoice, payInvoiceSandbox, createStripeCheckout, fetchReceipt, initiateMobileMoneyPayment, confirmMobileMoneyPayment } from '../api/payments';
import { BASE_URL } from '@/api/school';
import { fetchGrades, fetchReportCards } from '../api/grades';
import { fetchEvents } from '../api/events';
import { fetchParentChildren } from '../api/parentChild';
import { GraduationCap, Calendar, Users, MessageCircle, ChevronRight } from 'lucide-react';
import EventCalendar from '../components/EventCalendar';

export default function ParentPortal() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages' | 'documents' | 'payments' | 'grades' | 'events'>('announcements');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [messageRecipient, setMessageRecipient] = useState<number | ''>('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childGrades, setChildGrades] = useState<any[]>([]);
  const [childReportCards, setChildReportCards] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState<{
    step: 'select_provider' | 'entering_codes' | 'receipt' | null;
    invoice: any | null;
    provider: 'MTN' | 'Airtel' | null;
    phoneNumber: string;
    merchantCode: string;
    payerCode: string;
    reference: string;
  }>({
    step: null,
    invoice: null,
    provider: null,
    phoneNumber: '',
    merchantCode: '',
    payerCode: '',
    reference: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (user?.role !== 'parent') {
      router.push('/home');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'parent') return;
    const loadPortal = async () => {
      try {
        const [ann, docs, inboxMessages, sentMessages, teachers, schedules, invoices, children] = await Promise.all([
          fetchAnnouncements(),
          fetchDocuments(),
          fetchInbox(),
          fetchSent(),
          fetchRecipients('teacher'),
          fetchFeeSchedules(),
          fetchFeeInvoices(),
          fetchParentChildren(), // Fetch linked children
        ]);
        setAnnouncements(ann);
        setDocuments(docs);
        setInbox(inboxMessages);
        setSent(sentMessages);
        setRecipients(teachers);
        setFeeSchedules(schedules);
        setFeeInvoices(invoices);
        setLinkedChildren(children);
        // Auto-select first child if available
        if (children.length > 0 && !selectedChildId) {
          setSelectedChildId(children[0].child_id);
        }
      } catch (error) {
        console.error('Error loading parent portal:', error);
      }
    };
    loadPortal();
  }, [isAuthenticated, user?.role]);

  // Load child grades when tab is active and child is selected
  useEffect(() => {
    if (activeTab === 'grades' && isAuthenticated && selectedChildId) {
      fetchGrades({ student_id: selectedChildId })
        .then(setChildGrades)
        .catch(err => console.error('Error loading grades:', err));
      fetchReportCards(selectedChildId)
        .then(setChildReportCards)
        .catch(err => console.error('Error loading report cards:', err));
    } else if (activeTab === 'grades' && isAuthenticated && !selectedChildId && linkedChildren.length === 0) {
      // No children linked
      setChildGrades([]);
      setChildReportCards([]);
    }
  }, [activeTab, isAuthenticated, selectedChildId, linkedChildren.length]);

  // Load events when tab is active
  useEffect(() => {
    if (activeTab === 'events' && isAuthenticated) {
      fetchEvents()
        .then(setEvents)
        .catch(err => console.error('Error loading events:', err));
    }
  }, [activeTab, isAuthenticated]);

  const unpaidInvoices = useMemo(() => feeInvoices.filter((inv: any) => inv.status !== 'paid'), [feeInvoices]);
  const unreadCount = useMemo(() => inbox.filter((msg) => !msg.read_at).length, [inbox]);

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

  const handleCreateInvoice = async (scheduleId: number) => {
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice({ schedule_id: scheduleId });
      setFeeInvoices((prev) => [invoice, ...prev]);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Unable to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInvoice = async (invoiceId: number) => {
    setIsSubmitting(true);
    try {
      const result = await payInvoiceSandbox(invoiceId);
      setFeeInvoices((prev) =>
        prev.map((inv) => (inv.id === result.invoice.id ? result.invoice : inv))
      );
      alert(`Sandbox payment successful. Reference: ${result.receipt.reference}`);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePay = async (invoiceId: number) => {
    setIsSubmitting(true);
    try {
      const origin = window.location.origin;
      const result = await createStripeCheckout(
        invoiceId,
        `${origin}/payments/stripe-success`,
        `${origin}/payments/stripe-cancel`
      );
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Stripe payment failed:', error);
      alert('Stripe payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMobileMoneyPayment = (invoice: any) => {
    setPaymentFlow({
      step: 'select_provider',
      invoice,
      provider: null,
      phoneNumber: '',
      merchantCode: '',
      payerCode: '',
      reference: '',
    });
  };

  const handleSelectProvider = async (provider: 'MTN' | 'Airtel') => {
    if (!paymentFlow.invoice || !paymentFlow.phoneNumber) {
      alert('Please enter phone number');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await initiateMobileMoneyPayment({
        invoice_id: paymentFlow.invoice.id,
        provider,
        phone_number: paymentFlow.phoneNumber,
      });
      setPaymentFlow((prev) => ({
        ...prev,
        step: 'entering_codes',
        provider,
        merchantCode: result.merchant_code,
        payerCode: result.payer_code,
        reference: result.reference,
      }));
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      alert('Failed to initiate payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmMobileMoneyPayment = async () => {
    if (!paymentFlow.invoice || !paymentFlow.provider || !paymentFlow.reference) {
      alert('Invalid payment state');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await confirmMobileMoneyPayment({
        invoice_id: paymentFlow.invoice.id,
        reference: paymentFlow.reference,
        provider: paymentFlow.provider,
      });
      setFeeInvoices((prev) =>
        prev.map((inv) => (inv.id === result.invoice.id ? result.invoice : inv))
      );
      setPaymentFlow((prev) => ({
        ...prev,
        step: 'receipt',
      }));
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      alert('Payment confirmation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseMobileMoneyFlow = () => {
    setPaymentFlow({
      step: null,
      invoice: null,
      provider: null,
      phoneNumber: '',
      merchantCode: '',
      payerCode: '',
      reference: '',
    });
  };

  const handleViewReceipt = async (invoiceId: number) => {
    try {
      setReceiptLoading(true);
      const data = await fetchReceipt(invoiceId);
      setReceiptData(data);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      alert('Failed to load receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!receiptData?.invoice) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('RSBS - Payment Receipt', 20, 20);
    doc.setFontSize(10);
    doc.text('Rwanda School Bridge System', 20, 28);
    doc.line(20, 32, 190, 32);
    doc.setFontSize(10);
    doc.text(`Invoice: #${receiptData.invoice.id}`, 20, 42);
    doc.text(`Amount: ${receiptData.invoice.amount} ${receiptData.invoice.currency}`, 20, 50);
    doc.text(`Status: ${receiptData.invoice.status}`, 20, 58);
    doc.text(`Provider: ${receiptData.payment?.provider || 'N/A'}`, 20, 66);
    doc.text(`Reference: ${receiptData.payment?.reference || receiptData.payment?.id || 'N/A'}`, 20, 74);
    doc.save(`receipt-${receiptData.invoice.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-sm text-gray-600">Announcements, messages, documents, and payments</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            {['announcements', 'messages', 'documents', 'payments', 'grades', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'messages' && unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'announcements' && (
            <div className="p-6 space-y-4">
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
          )}

          {activeTab === 'messages' && (
            <div className="p-12 space-y-6 flex flex-col items-center justify-center text-center bg-white rounded-lg border border-gray-200 min-h-[400px]">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Messaging has moved!</h3>
              <p className="text-gray-500 mb-6 max-w-md text-base leading-relaxed">
                We've upgraded our communication system. You can now chat directly with teachers, school leaders, and other parents in real-time.
              </p>
              <button
                onClick={() => router.push('/inbox')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Go to Messenger
                <ChevronRight className="w-5 h-5 -mr-1" />
              </button>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6 space-y-4">
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents shared yet.</p>
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
          )}

          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee schedules</h3>
                <div className="space-y-3">
                  {feeSchedules.length === 0 ? (
                    <p className="text-sm text-gray-500">No fee schedules available.</p>
                  ) : (
                    feeSchedules.map((schedule: any) => (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{schedule.title}</p>
                          <p className="text-xs text-gray-500">
                            {schedule.school_name || 'All schools'} • {schedule.amount} {schedule.currency}
                          </p>
                        </div>
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleCreateInvoice(schedule.id)}
                          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Create Invoice
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your invoices</h3>
                <div className="space-y-3">
                  {feeInvoices.length === 0 ? (
                    <p className="text-sm text-gray-500">No invoices yet.</p>
                  ) : (
                    feeInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{invoice.schedule_title || 'Invoice'}</p>
                          <p className="text-xs text-gray-500">
                            {invoice.amount} {invoice.currency} • {invoice.status}
                          </p>
                        </div>
                        {invoice.status !== 'paid' && (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleStartMobileMoneyPayment(invoice)}
                              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md"
                            >
                              Pay with Mobile Money
                            </button>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handlePayInvoice(invoice.id)}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md"
                            >
                              Sandbox Pay
                            </button>
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleStripePay(invoice.id)}
                              className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-md"
                            >
                              Stripe Test
                            </button>
                          </div>
                        )}
                        {invoice.status === 'paid' && (
                          <button
                            disabled={receiptLoading}
                            onClick={() => handleViewReceipt(invoice.id)}
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md"
                          >
                            View Receipt
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {unpaidInvoices.length === 0 && feeInvoices.length > 0 && (
                  <p className="text-xs text-green-700 mt-2">All invoices are paid.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Receipt</h3>
            <p className="text-sm text-gray-600 mb-4">Invoice #{receiptData.invoice?.id}</p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Amount</span>
                <span>
                  {receiptData.invoice?.amount} {receiptData.invoice?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{receiptData.invoice?.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Provider</span>
                <span>{receiptData.payment?.provider || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference</span>
                <span>{receiptData.payment?.reference || receiptData.payment?.id || "N/A"}</span>
              </div>
            </div>
            <button
              onClick={() => setReceiptData(null)}
              className="mt-4 w-full bg-gray-800 text-white px-4 py-2 rounded-md text-sm"
            >
              Close
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div>
          {/* Child Selection */}
          {linkedChildren.length > 0 ? (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Select Child to View Grades:
              </label>
              <select
                value={selectedChildId || ''}
                onChange={(e) => setSelectedChildId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="">Select a child...</option>
                {linkedChildren.map((rel: any) => (
                  <option key={rel.child_id} value={rel.child_id}>
                    {rel.first_name} {rel.last_name} {rel.is_primary && '(Primary)'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>No children linked.</strong> Please contact an administrator to link your children to your account.
              </p>
            </div>
          )}

          {selectedChildId && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Child's Grades & Report Cards
          </h3>
          {childReportCards.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Report Cards</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {childReportCards.map((report) => (
                  <div key={report.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">{report.school_name}</h5>
                        <p className="text-sm text-gray-600">{report.term} {report.academic_year}</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          report.overall_grade === 'A' ? 'text-green-600' :
                          report.overall_grade === 'B' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {report.overall_grade}
                        </div>
                        <p className="text-xs text-gray-600">{report.overall_percentage?.toFixed(1)}%</p>
                      </div>
                    </div>
                    {report.teacher_comments && (
                      <div className="bg-white rounded p-2 text-xs text-gray-600">
                        <strong>Teacher:</strong> {report.teacher_comments}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">All Grades</h4>
            {childGrades.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No grades available yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {childGrades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{grade.subject}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                            grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{grade.score}/{grade.max_score}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{grade.term} {grade.academic_year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </h3>
          <EventCalendar
            onEventClick={(event) => {
              alert(`Event: ${event.title}\nDate: ${new Date(event.start_date).toLocaleString()}\n${event.description || ''}\nLocation: ${event.location || 'N/A'}`);
            }}
            schoolId={undefined}
          />
        </div>
      )}

      {/* Mobile Money Payment Flow - UrubutoPay Style */}
      {paymentFlow.step === 'select_provider' && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Rwanda School Bridge System</h2>
              <p className="text-sm text-gray-600">School Fees Payment</p>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">Amount to pay</p>
              <p className="text-3xl font-bold text-blue-900">
                {paymentFlow.invoice?.amount} {paymentFlow.invoice?.currency}
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                placeholder="078XXXXXXX"
                value={paymentFlow.phoneNumber}
                onChange={(e) => setPaymentFlow((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700">Select Payment Provider</p>
              <button
                onClick={() => handleSelectProvider('MTN')}
                disabled={isSubmitting || !paymentFlow.phoneNumber}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="text-lg">📱</span>
                MTN Mobile Money
              </button>
              <button
                onClick={() => handleSelectProvider('Airtel')}
                disabled={isSubmitting || !paymentFlow.phoneNumber}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="text-lg">📱</span>
                Airtel Money
              </button>
            </div>
            <button
              onClick={handleCloseMobileMoneyFlow}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {paymentFlow.step === 'entering_codes' && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Complete Payment</h2>
              <p className="text-sm text-gray-600">Dial the USSD code and enter the details below</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 mb-2 font-semibold">
                Dial: *{paymentFlow.provider === 'MTN' ? '182' : '175'}*8*1#
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Merchant Code:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">{paymentFlow.merchantCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payer Code:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded">{paymentFlow.payerCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-mono">{paymentFlow.invoice?.amount} {paymentFlow.invoice?.currency}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-600 mb-6">
              After entering the codes on your phone, click Continue to confirm payment.
            </p>
            <button
              onClick={handleConfirmMobileMoneyPayment}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mb-3"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </button>
            <button
              onClick={handleCloseMobileMoneyFlow}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {paymentFlow.step === 'receipt' && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h2>
              <p className="text-sm text-gray-600">Your payment has been processed</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-gray-900">
                  {paymentFlow.invoice?.amount} {paymentFlow.invoice?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider</span>
                <span className="font-semibold text-gray-900">{paymentFlow.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono text-xs text-gray-900">{paymentFlow.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-900">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCloseMobileMoneyFlow}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
