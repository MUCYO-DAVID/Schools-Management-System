'use client';
import { useState, useEffect } from "react"
import { BarChart3, Users, School, TrendingUp, Plus, Edit, Trash2, Eye, Activity, Megaphone, MapPin, GraduationCap, Calendar, Image, Award, MessageCircle, Send, X, Trash2 as TrashIcon, FileText, Radio } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School as SchoolType } from "../types"
import { useAuth } from "../providers/AuthProvider"

import { useRouter, useSearchParams } from "next/navigation"
import {
  fetchSchools,
  formatTimeAgo,
  addSchool,
  updateSchool,
  deleteSchool,
} from "@/api/school";
import { createFeeSchedule, fetchFeeInvoices, fetchFeeSchedules, fetchTransactions } from "@/app/api/payments";
import { createAnnouncement, fetchAnnouncements } from "@/app/api/portal";
import SchoolModal from "../components/SchoolModal"
import SchoolDetailsModal from "../components/SchoolDetailsModal"
import SchoolRegistrationChart from "../components/SchoolRegistrationChart"
import { fetchGalleries, createGallery, uploadGalleryMedia, deleteGalleryItem, fetchGallery, deleteGallery } from "@/app/api/galleries"
import { fetchParentChildren, fetchChildParents, linkParentToChild, removeParentChildRelationship, updateParentChildRelationship } from "@/app/api/parentChild"
import EventCalendar from "../components/EventCalendar"
import SurveyBuilder from "../components/SurveyBuilder"
import SurveyAnalytics from "../components/SurveyAnalytics"
import AdminAdsPanel from "../components/AdminAdsPanel"
import { fetchAdminAds } from "@/app/api/ads"
import { fetchSurveyTemplates, deleteSurveyTemplate, type SurveyTemplate } from "@/app/api/surveyTemplates"
import { BACKEND_URL as backendUrl } from "@/lib/backend"

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [pendingAdsCount, setPendingAdsCount] = useState(0)
  const [recentActivities, setRecentActivities] = useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "parent",
    password: "",
    schoolName: "",
    subject: "",
  });
  const [userCreateMessage, setUserCreateMessage] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "parent",
    password: "",
    schoolName: "",
    subject: "",
  });
  const [userEditMessage, setUserEditMessage] = useState("");
  const [userActionMessage, setUserActionMessage] = useState("");
  const [feeSchedules, setFeeSchedules] = useState<any[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<any[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    amount: "",
    currency: "RWF",
    dueDate: "",
  });
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchoolForDetails, setSelectedSchoolForDetails] = useState<SchoolType | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",    audienceRole: "all",
  });
  const [announcementMessage, setAnnouncementMessage] = useState("");



















  

  
  const [grades, setGrades] = useState<any[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [galleriesLoading, setGalleriesLoading] = useState(false);
  const [selectedSchoolForGallery, setSelectedSchoolForGallery] = useState<string | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [showCreateGallery, setShowCreateGallery] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryDescription, setNewGalleryDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(false);

  // Survey Management State
  const [surveys, setSurveys] = useState<SurveyTemplate[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [showSurveyBuilder, setShowSurveyBuilder] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<SurveyTemplate | null>(null);
  const [selectedSurveyForAnalytics, setSelectedSurveyForAnalytics] = useState<number | null>(null);

  // Parent-Child Relationship State
  const [showLinkParentChild, setShowLinkParentChild] = useState(false);
  const [linkForm, setLinkForm] = useState({
    parent_id: '',
    child_id: '',
    relationship_type: 'parent',
    is_primary: false,
  });
  const [linkMessage, setLinkMessage] = useState('');
  const [selectedParentForChildren, setSelectedParentForChildren] = useState<number | null>(null);
  const [parentChildren, setParentChildren] = useState<any[]>([]);

  // Next.js app router helpers
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin"); // Redirect to signin if not authenticated
    } else if (user?.role !== "admin") {
      router.push("/home"); // Redirect to home if not admin
    }
  }, [isAuthenticated, user, router]);

  // If a "tab" query param is present (e.g. /admin?tab=users), open that tab on load
  useEffect(() => {
    // Only run this effect if searchParams is available (client-side)
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab) setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString?.()])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return
    fetchAdminAds("pending_review")
      .then((list) => setPendingAdsCount(list.length))
      .catch(() => setPendingAdsCount(0))
  }, [isAuthenticated, user?.role, activeTab])

  // Open modal for adding a new school
  const handleAddSchool = () => {
    setEditingSchool(null); // no editing, new school
    setIsModalOpen(true);
  };

  const loadUsers = async (role = userFilter) => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem("token");
      const query = role !== "all" ? `?role=${encodeURIComponent(role)}` : "";
      const res = await fetch(`${backendUrl}/api/users${query}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setPaymentsLoading(true);
      const [schedules, invoices, transactions] = await Promise.all([
        fetchFeeSchedules(),
        fetchFeeInvoices(),
        fetchTransactions(),
      ]);
      setFeeSchedules(schedules);
      setFeeInvoices(invoices);
      setFeeTransactions(transactions);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.title || !scheduleForm.amount) return;
    try {
      const created = await createFeeSchedule({
        title: scheduleForm.title,
        amount: Number(scheduleForm.amount),
        currency: scheduleForm.currency,
        due_date: scheduleForm.dueDate || undefined,
      });
      setFeeSchedules((prev) => [created, ...prev]);
      setScheduleForm({ title: "", amount: "", currency: scheduleForm.currency, dueDate: "" });
    } catch (error) {
      console.error("Failed to create fee schedule:", error);
      alert(t("admin.failedCreateFeeSchedule"));
    }
  };

  const exportCsv = (rows: Record<string, any>[], filename: string) => {
    if (!rows.length) {
      alert(t("admin.noDataToExport"));
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = row[key] ?? "";
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCreateUser = async () => {
    setUserCreateMessage("");
    if (!userForm.firstName || !userForm.lastName || !userForm.email) {
      setUserCreateMessage("Please fill in first name, last name, and email.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        first_name: userForm.firstName,
        last_name: userForm.lastName,
        email: userForm.email,
        role: userForm.role,
        password: userForm.password || undefined,
      };

      // Add teacher-specific fields if role is teacher
      if (userForm.role === 'teacher') {
        payload.school_name = userForm.schoolName || undefined;
        payload.subject = userForm.subject || undefined;
      }

      const res = await fetch(`${backendUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create user");
      }
      const data = await res.json();
      setUserCreateMessage(
        data.temporaryPassword
          ? `User created. Temporary password: ${data.temporaryPassword}`
          : "User created successfully."
      );
      setUserForm({
        firstName: "",
        lastName: "",
        email: "",
        role: userForm.role,
        password: "",
        schoolName: "",
        subject: "",
      });
      loadUsers();
    } catch (err: any) {
      setUserCreateMessage(err.message || "Failed to create user.");
    }
  };

  const startEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setUserEditForm({
      firstName: userToEdit.first_name,
      lastName: userToEdit.last_name,
      email: userToEdit.email,
      role: userToEdit.role,
      password: "",
      schoolName: userToEdit.school_name || "",
      subject: userToEdit.subject || "",
    });
    setUserEditMessage("");
    setActiveTab("users");
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setUserEditMessage("");
    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        first_name: userEditForm.firstName,
        last_name: userEditForm.lastName,
        email: userEditForm.email,
        role: userEditForm.role,
        password: userEditForm.password || undefined,
      };

      // Add teacher-specific fields if role is teacher
      if (userEditForm.role === 'teacher') {
        payload.school_name = userEditForm.schoolName || undefined;
        payload.subject = userEditForm.subject || undefined;
      }

      const res = await fetch(`${backendUrl}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = "Failed to update user";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(message);
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setUserEditMessage("User updated successfully.");
      setUserEditForm((prev) => ({ ...prev, password: "" }));
    } catch (err: any) {
      setUserEditMessage(err.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const target = users.find((u) => u.id === userId);
    const displayName = target ? `${target.first_name} ${target.last_name}` : "this user";
    if (!confirm(`Are you sure you want to delete ${displayName}?`)) return;
    try {
      setUserActionMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        let message = "Failed to delete user";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(`${message} (status ${res.status})`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (editingUser?.id === userId) {
        setEditingUser(null);
        setUserEditMessage("");
      }
      setUserActionMessage(`Deleted ${displayName}.`);
    } catch (err: any) {
      setUserActionMessage(err.message || "Failed to delete user.");
    }
  };

  const handleResetPassword = async (targetUser: any) => {
    const tempPassword = `RSBS-${Math.random().toString(36).slice(2, 8)}`;
    if (!confirm(`Reset password for ${targetUser.first_name} ${targetUser.last_name}?`)) return;
    try {
      setUserActionMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/users/${targetUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          first_name: targetUser.first_name,
          last_name: targetUser.last_name,
          email: targetUser.email,
          role: targetUser.role,
          password: tempPassword,
        }),
      });
      if (!res.ok) {
        let message = "Failed to reset password";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(`${message} (status ${res.status})`);
      }
      setUserActionMessage(
        `Password reset for ${targetUser.first_name}. Temporary password: ${tempPassword}`
      );
    } catch (err: any) {
      setUserActionMessage(err.message || "Failed to reset password.");
    }
  };

  // Open modal for editing a school
  const handleUpdateSchool = (school: SchoolType) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  // Delete school confirmation handler
  const handleDeleteSchool = async (id: string) => {
    try {
      await deleteSchool(id);
      setSchools((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert(t("admin.failedDeleteSchool"));
    }
  };

  // Save school handler for both add and update
  const handleSaveSchool = async (schoolData: Omit<SchoolType, "id">, images: File[], imagesToDelete: string[]) => {
    try {
      if (editingSchool) {
        const updated = await updateSchool(editingSchool.id, schoolData, images, imagesToDelete);
        setSchools((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        const added = await addSchool(schoolData, images);
        setSchools((prev) => [...prev, added]);
      }
      setIsModalOpen(false);
      setEditingSchool(null);
    } catch (error) {
      alert(t("admin.failedSaveSchool"));
    }
  };

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await fetchSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    loadSchools();
  }, []);
  const totalStudents = schools.reduce((sum, school) => sum + school.students, 0)
  const publicSchools = schools.filter((s) => s.type === "Public").length
  const privateSchools = schools.filter((s) => s.type === "Private").length

  const stats = [
    {
      title: t("admin.statTotalSchools"),
      value: schools.length,
      icon: School,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-100",
      accent: "from-cyan-500/20 via-sky-500/10 to-transparent",
      change: "+12%",
      detail: t("admin.statRegisteredInstitutions"),
    },
    {
      title: t("admin.statTotalStudents"),
      value: totalStudents.toLocaleString(),
      icon: Users,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      change: "+8%",
      detail: t("admin.statLearnersTracked"),
    },
    {
      title: t("admin.statPublicSchools"),
      value: publicSchools,
      icon: BarChart3,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      accent: "from-amber-500/20 via-yellow-500/10 to-transparent",
      change: "+5%",
      detail: t("admin.statPublicInstitutions"),
    },
    {
      title: t("admin.statPrivateSchools"),
      value: privateSchools,
      icon: TrendingUp,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-100",
      accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
      change: "+15%",
      detail: t("admin.statPrivateInstitutions"),
    },
  ]
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/activities/recent`);
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();
        setRecentActivities(data);
      } catch (error) {
        console.error("Error loading activities:", error);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (activeTab === "users" && isAuthenticated) {
      loadUsers();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "payments" && isAuthenticated) {
      loadPayments();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "announcements" && isAuthenticated) {
      loadAnnouncements();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "grades" && isAuthenticated) {
      loadGrades();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "events" && isAuthenticated) {
      loadEvents();
    }
  }, [activeTab, isAuthenticated]);

  // Gallery management handlers
  const handleCreateGallery = async () => {
    if (!selectedSchoolForGallery || !newGalleryTitle.trim()) {
      alert(t("admin.selectSchoolAndGalleryTitle"));
      return;
    }
    try {
      const gallery = await createGallery({
        school_id: selectedSchoolForGallery,
        title: newGalleryTitle,
        description: newGalleryDescription,
        gallery_type: "photos"
      });
      setGalleries([...galleries, gallery]);
      setShowCreateGallery(false);
      setNewGalleryTitle("");
      setNewGalleryDescription("");
      setSelectedGallery(gallery);
    } catch (err: any) {
      alert(t("admin.failedCreateGallery").replace("{{message}}", err.message || "Unknown error"));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedGallery || !e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("media", e.target.files[0]);

      await uploadGalleryMedia(selectedGallery.id, formData);

      // Reload gallery items
      const gallery = await fetchGallery(selectedGallery.id);
      setGalleryItems(gallery.items || []);

      e.target.value = ""; // Reset input
    } catch (err: any) {
      alert(t("admin.failedUploadImage").replace("{{message}}", err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteGalleryItem(itemId);
      setGalleryItems(galleryItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      alert(t("admin.failedDeleteImage").replace("{{message}}", err.message || "Unknown error"));
    }
  };

  const handleDeleteGallery = async (galleryId: number) => {
    if (!confirm("Are you sure you want to delete this gallery? All images will be removed.")) return;

    try {
      await deleteGallery(galleryId);
      setGalleries(galleries.filter(g => g.id !== galleryId));
      if (selectedGallery?.id === galleryId) {
        setSelectedGallery(null);
        setGalleryItems([]);
      }
    } catch (err: any) {
      alert(t("admin.failedDeleteGallery").replace("{{message}}", err.message || "Unknown error"));
    }
  };

  useEffect(() => {
    if (activeTab === "scholarships" && isAuthenticated) {
      loadScholarships();
    }
  }, [activeTab, isAuthenticated]);

  // Survey functions
  const loadSurveys = async () => {
    setSurveysLoading(true);
    try {
      const data = await fetchSurveyTemplates({});
      setSurveys(data);
    } catch (err: any) {
      console.error('Error loading surveys:', err);
    } finally {
      setSurveysLoading(false);
    }
  };

  const handleDeleteSurvey = async (id: number) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    try {
      await deleteSurveyTemplate(id);
      await loadSurveys();
    } catch (err: any) {
      alert(err.message || t('errors.failedDeleteSurvey'));
    }
  };

  // Load surveys
  useEffect(() => {
    if (activeTab === "surveys" && isAuthenticated) {
      loadSurveys();
    }
  }, [activeTab, isAuthenticated]);

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadGrades = async () => {
    setGradesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrades(data);
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setGradesLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadGalleries = async (schoolId?: string) => {
    setGalleriesLoading(true);
    try {
      const filters: any = {};
      if (schoolId) filters.school_id = schoolId;
      const data = await fetchGalleries(filters);
      setGalleries(data);
    } catch (error) {
      console.error("Error loading galleries:", error);
    } finally {
      setGalleriesLoading(false);
    }
  };

  // Load galleries when school is selected
  useEffect(() => {
    if (activeTab === "galleries" && selectedSchoolForGallery) {
      loadGalleries(selectedSchoolForGallery);
    } else if (activeTab === "galleries" && !selectedSchoolForGallery && schools.length > 0) {
      // Auto-select first school
      setSelectedSchoolForGallery(schools[0].id);
    }
  }, [activeTab, selectedSchoolForGallery, schools.length]);

  // Load gallery items when gallery is selected
  useEffect(() => {
    if (selectedGallery) {
      const loadItems = async () => {
        try {
          const gallery = await fetchGallery(selectedGallery.id);
          setGalleryItems(gallery.items || []);
        } catch (error) {
          console.error("Error loading gallery items:", error);
        }
      };
      loadItems();
    }
  }, [selectedGallery]);

  const loadScholarships = async () => {
    setScholarshipsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/scholarships`);
      if (res.ok) {
        const data = await res.json();
        setScholarships(data);
      }
    } catch (error) {
      console.error("Error loading scholarships:", error);
    } finally {
      setScholarshipsLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) {
      setAnnouncementMessage("Title and body are required");
      return;
    }
    setAnnouncementsLoading(true);
    setAnnouncementMessage("");
    try {
      const newAnnouncement = await createAnnouncement({
        title: announcementForm.title.trim(),
        body: announcementForm.body.trim(),
        audience_role: announcementForm.audienceRole,
      });
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      setAnnouncementForm({ title: "", body: "", audienceRole: "all" });
      setAnnouncementMessage("Announcement published successfully!");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      setAnnouncementMessage("Failed to publish announcement");
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: t("admin.tabOverview"), icon: Activity },
    { id: "schools", label: t("admin.tabSchoolManagement"), icon: School },
    { id: "users", label: t("admin.tabUserManagement"), icon: Users },
    { id: "grades", label: t("admin.tabGrades"), icon: GraduationCap },
    { id: "events", label: t("admin.tabEvents"), icon: Calendar },
    { id: "galleries", label: t("admin.tabGalleries"), icon: Image },
    { id: "scholarships", label: t("admin.tabScholarships"), icon: Award },
    { id: "surveys", label: t("admin.tabSurveys"), icon: FileText },
    { id: "announcements", label: t("admin.tabAnnouncements"), icon: Megaphone },
    { id: "ads", label: t("admin.tabAdvertisements"), icon: Radio },
    { id: "payments", label: t("admin.tabPayments"), icon: BarChart3 },
    { id: "reports", label: t("admin.tabReports"), icon: BarChart3 },
  ];

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="page-shell">
      <Navigation />

      <div className="w-full mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Header */}
        <div className="relative mb-5 overflow-hidden rounded-[24px] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] dark:border-white/10 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.2),transparent_30%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-blue-100 backdrop-blur">
                <Activity className="h-3.5 w-3.5" />
                {t("admin.adminWorkspace")}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("admin.title")}</h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                {t("admin.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("admin.activeView")}</p>
                <p className="mt-1.5 text-base font-semibold text-white">{activeTabMeta.label}</p>
                <p className="mt-1 text-[11px] text-slate-300">{t("admin.sameWorkflowBetterLayout")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Schools</p>
                <p className="mt-1.5 text-xl font-semibold text-white">{schools.length}</p>
                <p className="mt-1 text-[11px] text-slate-300">{t("admin.institutionsListed")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("schools.students")}</p>
                <p className="mt-1.5 text-xl font-semibold text-white">{totalStudents.toLocaleString()}</p>
                <p className="mt-1 text-[11px] text-slate-300">{t("admin.liveTotalTracked")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-[20px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-46px_rgba(14,116,144,0.38)] dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${stat.accent}`} />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    {t("admin.thisMonth").replace("{{change}}", stat.change)}
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{stat.detail}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconBg} shadow-sm ring-1 ring-white dark:ring-white/10`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/85 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <nav className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-2 sm:px-5 scrollbar-thin">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const showPendingBadge = tab.id === "ads" && pendingAdsCount > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.push(`/admin?tab=${tab.id}`);
                    }}
                    className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.9)] dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                    {showPendingBadge && (
                      <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {pendingAdsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* School Registration Chart */}
                <div>
                  <SchoolRegistrationChart schools={schools} />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Activity */}
                  <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-cyan-50/60 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("admin.recentActivity")}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t("admin.recentActivitySubtitle")}</p>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {recentActivities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 py-10 text-center dark:border-white/10 dark:bg-white/5">
                          <Activity className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.noRecentActivities")}</p>
                        </div>
                      ) : (
                        recentActivities.map(({ id, action, school, created_at }) => (
                          <div
                            key={id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 transition-all hover:border-cyan-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-500/30 dark:hover:bg-white/10"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{action}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{school}</p>
                              </div>
                            </div>
                            <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">{formatTimeAgo(created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-violet-50/60 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("admin.quickActions")}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t("admin.quickActionsSubtitle")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => { setActiveTab("schools"); router.push("/admin?tab=schools") }}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_40px_-28px_rgba(59,130,246,0.45)] dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30 dark:hover:bg-white/10"
                      >
                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-300">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t("admin.addNewSchool")}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("admin.addNewSchoolDesc")}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("users"); router.push("/admin?tab=users") }}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_40px_-28px_rgba(16,185,129,0.4)] dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-500/30 dark:hover:bg-white/10"
                      >
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t("admin.manageUsers")}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("admin.manageUsersDesc")}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("ads"); router.push("/admin?tab=ads") }}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_18px_40px_-28px_rgba(245,158,11,0.42)] dark:border-white/10 dark:bg-white/5 dark:hover:border-amber-500/30 dark:hover:bg-white/10"
                      >
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 transition-colors group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-500/15 dark:text-amber-300">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t("admin.reviewAdApplications")}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t("admin.reviewAdApplicationsDesc")}
                            {pendingAdsCount > 0 ? ` · ${t("admin.pendingCount").replace("{{count}}", String(pendingAdsCount))}` : ""}
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("reports"); router.push("/admin?tab=reports") }}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_40px_-28px_rgba(139,92,246,0.42)] dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-500/30 dark:hover:bg-white/10"
                      >
                        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-500/15 dark:text-violet-300">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t("admin.viewReports")}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("admin.viewReportsDesc")}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schools" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t("admin.tabSchoolManagement")}</h3>
                  <button
                    onClick={handleAddSchool}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    {t("addSchool")}
                  </button>
                </div>

                {/* Map Status Summary */}
                {(() => {
                  const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude).length;
                  const schoolsWithoutCoords = schools.length - schoolsWithCoords;
                  return schoolsWithoutCoords > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-900 mb-1">
                            Map Location Data
                          </h4>
                          <p className="text-sm text-amber-800">
                            <strong>{schoolsWithoutCoords}</strong> school{schoolsWithoutCoords !== 1 ? 's' : ''} {schoolsWithoutCoords === 1 ? 'is' : 'are'} missing location coordinates and won't appear on the map.
                            Schools with <MapPin className="w-3 h-3 inline text-amber-500" /> icon need location data.
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            💡 Click the Edit button on any school to add latitude/longitude coordinates using the map picker.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("schools.schoolName")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("schools.location")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("schools.type")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("schools.students")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("schools.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.map((school) => (
                        <tr key={school.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{school.name}</div>
                              {(!school.latitude || !school.longitude) && (
                                <span className="inline-flex items-center" title="Missing map coordinates - click edit to add location">
                                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{school.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {school.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.students}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedSchoolForDetails(school)}
                                className="text-blue-600 hover:text-blue-900"
                                aria-label={`View details of ${school.name}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateSchool(school)}
                                className="text-green-600 hover:text-green-900"
                                aria-label={`Edit ${school.name}`}

                              >

                                <Edit className="w-4 h-4" />
                              </button>

                              <button

                                onClick={() => handleDeleteSchool(school.id)}

                                className="text-red-600 hover:text-red-900"

                                aria-label={`Delete ${school.name}`}
                              >
                                <Trash2 className="w-4 h-4" />

                              </button>

                            </div>

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t("admin.tabUserManagement")}</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
                  <p className="font-semibold mb-1">Role usage guide</p>
                  <p>Parents: use the Parent Portal for messages, documents, and fee payments.</p>
                  <p>Teachers: use the Teacher Portal for announcements, documents, messages, and fee schedules.</p>
                  <p>Students: pay invoices inside the Student dashboard.</p>
                  <p>Leaders/Admins: manage users, schools, and monitor activity here.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">{t("admin.createUser")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                      value={userForm.firstName}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={userForm.lastName}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={userForm.email}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      type="email"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="leader">Leader</option>
                      <option value="admin">Admin</option>
                    </select>
                    <input
                      value={userForm.password}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Temp password (optional)"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      type="text"
                    />
                  </div>

                  {userForm.role === 'teacher' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <input
                        value={userForm.schoolName}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                        placeholder="School name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={userForm.subject}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Subject/Lesson (e.g., Mathematics)"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleCreateUser}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    type="button"
                  >
                    {t("admin.createUser")}
                  </button>
                  {userCreateMessage && (
                    <p className="mt-3 text-sm text-green-700">{userCreateMessage}</p>
                  )}
                </div>

                {editingUser && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-semibold text-gray-900">{t("admin.editUser")}</h4>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <input
                        value={userEditForm.firstName}
                        onChange={(e) => setUserEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={userEditForm.lastName}
                        onChange={(e) => setUserEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last name"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={userEditForm.email}
                        onChange={(e) => setUserEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        type="email"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <select
                        value={userEditForm.role}
                        onChange={(e) => setUserEditForm((prev) => ({ ...prev, role: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="parent">Parent</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="leader">Leader</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input
                        value={userEditForm.password}
                        onChange={(e) => setUserEditForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="New password (optional)"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        type="text"
                      />
                    </div>

                    {userEditForm.role === 'teacher' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input
                          value={userEditForm.schoolName}
                          onChange={(e) => setUserEditForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                          placeholder="School name"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          value={userEditForm.subject}
                          onChange={(e) => setUserEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                          placeholder="Subject/Lesson (e.g., Mathematics)"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleUpdateUser}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                      type="button"
                    >
                      Save Changes
                    </button>
                    {userEditMessage && (
                      <p className="mt-3 text-sm text-green-700">{userEditMessage}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-gray-600">Filter by role:</label>
                  <select
                    value={userFilter}
                    onChange={(e) => {
                      setUserFilter(e.target.value);
                      loadUsers(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="parent">Parents</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="leader">Leaders</option>
                    <option value="admin">Admins</option>
                  </select>
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                  />
                </div>
                {userActionMessage && (
                  <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {userActionMessage}
                  </div>
                )}

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const filteredUsers = users.filter((u) => {
                          if (!userSearch) return true;
                          const needle = userSearch.toLowerCase();
                          return (
                            `${u.first_name} ${u.last_name}`.toLowerCase().includes(needle) ||
                            u.email.toLowerCase().includes(needle) ||
                            u.role.toLowerCase().includes(needle)
                          );
                        });

                        if (usersLoading) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                Loading users...
                              </td>
                            </tr>
                          );
                        }

                        if (filteredUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                No users found.
                              </td>
                            </tr>
                          );
                        }

                        return filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {u.first_name} {u.last_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 capitalize">{u.role}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditUser(u)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleResetPassword(u)}
                                  className="text-purple-600 hover:text-purple-800 text-xs"
                                  type="button"
                                >
                                  Reset Password
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Parent-Child Relationship Management */}
                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-semibold text-gray-900">Parent-Child Relationships</h4>
                    <button
                      onClick={() => {
                        setShowLinkParentChild(!showLinkParentChild);
                        setLinkMessage('');
                        setLinkForm({ parent_id: '', child_id: '', relationship_type: 'parent', is_primary: false });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      type="button"
                    >
                      {showLinkParentChild ? 'Cancel' : 'Link Parent to Child'}
                    </button>
                  </div>

                  {showLinkParentChild && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">{t("admin.createRelationship")}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                          value={linkForm.parent_id}
                          onChange={(e) => {
                            setLinkForm(prev => ({ ...prev, parent_id: e.target.value }));
                            setSelectedParentForChildren(e.target.value ? parseInt(e.target.value) : null);
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">{t("admin.selectParent")}</option>
                          {users.filter(u => u.role === 'parent').map(u => (
                            <option key={u.id} value={u.id}>
                              {u.first_name} {u.last_name} ({u.email})
                            </option>
                          ))}
                        </select>
                        <select
                          value={linkForm.child_id}
                          onChange={(e) => setLinkForm(prev => ({ ...prev, child_id: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">{t("admin.selectChild")}</option>
                          {users.filter(u => u.role === 'student').map(u => (
                            <option key={u.id} value={u.id}>
                              {u.first_name} {u.last_name} ({u.email})
                            </option>
                          ))}
                        </select>
                        <select
                          value={linkForm.relationship_type}
                          onChange={(e) => setLinkForm(prev => ({ ...prev, relationship_type: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="parent">Parent</option>
                          <option value="guardian">Guardian</option>
                          <option value="other">Other</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={linkForm.is_primary}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                            className="rounded"
                          />
                          Primary Parent
                        </label>
                      </div>
                      <button
                        onClick={async () => {
                          if (!linkForm.parent_id || !linkForm.child_id) {
                            setLinkMessage('Please select both parent and child');
                            return;
                          }
                          try {
                            await linkParentToChild({
                              parent_id: parseInt(linkForm.parent_id),
                              child_id: parseInt(linkForm.child_id),
                              relationship_type: linkForm.relationship_type,
                              is_primary: linkForm.is_primary,
                            });
                            setLinkMessage('Relationship created successfully!');
                            setLinkForm({ parent_id: '', child_id: '', relationship_type: 'parent', is_primary: false });
                            if (selectedParentForChildren) {
                              const children = await fetchParentChildren(selectedParentForChildren);
                              setParentChildren(children);
                            }
                            setTimeout(() => setLinkMessage(''), 3000);
                          } catch (err: any) {
                            setLinkMessage(err.message || 'Failed to create relationship');
                          }
                        }}
                        className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        type="button"
                      >
                        Create Link
                      </button>
                      {linkMessage && (
                        <p className={`mt-2 text-sm ${linkMessage.includes('success') ? 'text-green-700' : 'text-red-700'}`}>
                          {linkMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* View Parent's Children */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 mb-2 block">View Children for Parent:</label>
                    <select
                      value={selectedParentForChildren || ''}
                      onChange={(e) => {
                        const parentId = e.target.value ? parseInt(e.target.value) : null;
                        setSelectedParentForChildren(parentId);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-auto"
                    >
                      <option value="">Select a parent to view children</option>
                      {users.filter(u => u.role === 'parent').map(u => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedParentForChildren && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900">
                          Children for {users.find(u => u.id === selectedParentForChildren)?.first_name} {users.find(u => u.id === selectedParentForChildren)?.last_name}
                        </h5>
                      </div>
                      {parentChildren.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          No children linked to this parent yet.
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Child Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Primary</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {parentChildren.map((rel: any) => (
                              <tr key={rel.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {rel.first_name} {rel.last_name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">{rel.email}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 capitalize">{rel.relationship_type}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                  {rel.is_primary ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Primary</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <button
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to remove this relationship?')) {
                                        try {
                                          await removeParentChildRelationship(rel.id);
                                          const children = await fetchParentChildren(selectedParentForChildren);
                                          setParentChildren(children);
                                          setLinkMessage('Relationship removed successfully');
                                          setTimeout(() => setLinkMessage(''), 3000);
                                        } catch (err: any) {
                                          alert(t('admin.failedRemoveRelationship').replace('{{message}}', err.message || 'Unknown error'));
                                        }
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    type="button"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "announcements" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
                  <p className="font-semibold mb-1">Announcement Publishing</p>
                  <p>Create announcements that will be visible to parents and students in their portals.</p>
                  <p>Select audience to target specific roles or choose "All" to reach everyone.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">{t("admin.publishAnnouncement")}</h4>
                  <div className="space-y-4">
                    <input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Announcement title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <textarea
                      value={announcementForm.body}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, body: e.target.value }))}
                      placeholder="Announcement content"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      rows={5}
                    />
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-700">Target Audience:</label>
                      <select
                        value={announcementForm.audienceRole}
                        onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, audienceRole: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">All (Parents + Students)</option>
                        <option value="parent">Parents Only</option>
                        <option value="student">Students Only</option>
                      </select>
                      <button
                        onClick={handleCreateAnnouncement}
                        disabled={announcementsLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        type="button"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                  {announcementMessage && (
                    <p className={`mt-3 text-sm ${announcementMessage.includes("success") ? "text-green-700" : "text-red-700"}`}>
                      {announcementMessage}
                    </p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">{t("admin.tabAnnouncements")}</h4>
                  {announcementsLoading ? (
                    <p className="text-sm text-gray-500">{t("admin.loadingAnnouncements")}</p>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("admin.noAnnouncementsYet")}</p>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-base font-semibold text-gray-900">{ann.title}</h5>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                              {ann.audience_role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{ann.body}</p>
                          <p className="text-xs text-gray-400">
                            Published {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                  <p className="font-semibold mb-1">Payments overview</p>
                  <p>Create fee schedules, monitor invoices, and track transactions.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      exportCsv(
                        feeInvoices.map((inv) => ({
                          id: inv.id,
                          schedule: inv.schedule_title || "Invoice",
                          amount: inv.amount,
                          currency: inv.currency,
                          status: inv.status,
                          created_at: inv.created_at,
                        })),
                        "invoices-report.csv"
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Export Invoices CSV
                  </button>
                  <button
                    onClick={() =>
                      exportCsv(
                        feeTransactions.map((tx) => ({
                          id: tx.id,
                          provider: tx.provider,
                          amount: tx.amount,
                          currency: tx.currency,
                          status: tx.status,
                          reference: tx.reference || tx.id,
                          created_at: tx.created_at,
                        })),
                        "transactions-report.csv"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Export Transactions CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Total invoices</p>
                    <p className="text-xl font-semibold text-gray-900">{feeInvoices.length}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Paid invoices</p>
                    <p className="text-xl font-semibold text-green-600">
                      {feeInvoices.filter((inv) => inv.status === "paid").length}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Pending invoices</p>
                    <p className="text-xl font-semibold text-yellow-600">
                      {feeInvoices.filter((inv) => inv.status !== "paid").length}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Total collected</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {feeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)} {feeTransactions[0]?.currency || "RWF"}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">{t("admin.createFeeSchedule")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Title"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      value={scheduleForm.amount}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="Amount"
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={scheduleForm.currency}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, currency: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="RWF">RWF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input
                      value={scheduleForm.dueDate}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleCreateSchedule}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Create Schedule
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Fee Schedules</h4>
                    {paymentsLoading ? (
                      <p className="text-sm text-gray-500">{t("admin.loadingSchedules")}</p>
                    ) : feeSchedules.length === 0 ? (
                      <p className="text-sm text-gray-500">{t("admin.noSchedulesYet")}</p>
                    ) : (
                      <div className="space-y-2">
                        {feeSchedules.slice(0, 8).map((schedule) => (
                          <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900">{schedule.title}</p>
                            <p className="text-xs text-gray-500">
                              {schedule.amount} {schedule.currency}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Invoices</h4>
                    {paymentsLoading ? (
                      <p className="text-sm text-gray-500">{t("admin.loadingInvoices")}</p>
                    ) : feeInvoices.length === 0 ? (
                      <p className="text-sm text-gray-500">{t("admin.noInvoicesYet")}</p>
                    ) : (
                      <div className="space-y-2">
                        {feeInvoices.slice(0, 8).map((invoice) => (
                          <div key={invoice.id} className="border border-gray-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900">{invoice.schedule_title || "Invoice"}</p>
                            <p className="text-xs text-gray-500">
                              {invoice.amount} {invoice.currency} • {invoice.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Transactions</h4>
                    {paymentsLoading ? (
                      <p className="text-sm text-gray-500">{t("admin.loadingTransactions")}</p>
                    ) : feeTransactions.length === 0 ? (
                      <p className="text-sm text-gray-500">{t("admin.noTransactionsYet")}</p>
                    ) : (
                      <div className="space-y-2">
                        {feeTransactions.slice(0, 8).map((tx) => (
                          <div key={tx.id} className="border border-gray-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900">{tx.provider}</p>
                            <p className="text-xs text-gray-500">
                              {tx.amount} {tx.currency} • {tx.status}
                            </p>
                            <p className="text-xs text-gray-400">Ref: {tx.reference || tx.id}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ads" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Radio className="h-5 w-5 text-amber-600" />
                        Advertisement approvals
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                        Review who applied to advertise, preview their image or video, then approve to start a
                        10-day free trial or reject the submission.
                      </p>
                    </div>
                    {pendingAdsCount > 0 && (
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                        {pendingAdsCount} awaiting review
                      </span>
                    )}
                  </div>
                </div>
                <AdminAdsPanel onReviewed={() => {
                  fetchAdminAds("pending_review")
                    .then((list) => setPendingAdsCount(list.length))
                    .catch(() => setPendingAdsCount(0))
                }} />
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.85)] dark:border-white/10">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Reports & Analytics
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">A cleaner view of system performance</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        The data stays exactly the same. This section now emphasizes readability, spacing, and modern card hierarchy.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Schools</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{schools.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Students</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{totalStudents.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Registration Chart in Reports */}
                <div className="mb-6">
                  <SchoolRegistrationChart schools={schools} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        <School className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">School Distribution</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Public and private school balance across the platform.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/90 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Public Schools</span>
                          <span className="text-lg font-semibold text-blue-600">{publicSchools}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            style={{ width: `${schools.length > 0 ? (publicSchools / schools.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/90 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Private Schools</span>
                          <span className="text-lg font-semibold text-violet-600">{privateSchools}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                            style={{ width: `${schools.length > 0 ? (privateSchools / schools.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-[22px] border border-blue-100 bg-gradient-to-r from-blue-600 to-violet-600 p-5 text-white shadow-[0_20px_50px_-32px_rgba(37,99,235,0.6)]">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm text-blue-100">Total Schools</p>
                            <p className="mt-2 text-3xl font-semibold">{schools.length}</p>
                          </div>
                          <p className="text-xs text-blue-100">Updated from current records</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/70 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Student Statistics</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Enrollment insights calculated from school records.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-white/90 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">Average per School</span>
                        <span className="text-lg font-semibold text-emerald-600">
                          {schools.length > 0 ? Math.round(totalStudents / schools.length) : 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/90 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">Largest School</span>
                        <span className="text-lg font-semibold text-emerald-600">
                          {schools.length > 0 ? Math.max(...schools.map((s) => s.students)) : 0}
                        </span>
                      </div>
                      <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-[0_20px_50px_-32px_rgba(16,185,129,0.58)]">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm text-emerald-50">Total Students</p>
                            <p className="mt-2 text-3xl font-semibold">{totalStudents.toLocaleString()}</p>
                          </div>
                          <p className="text-xs text-emerald-50">Derived from all schools</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === "grades" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Grade Management</h3>
                </div>

                {gradesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t("admin.loadingGrades")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {grades.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No grades available
                            </td>
                          </tr>
                        ) : (
                          grades.slice(0, 50).map((grade) => (
                            <tr key={grade.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {grade.first_name} {grade.last_name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{grade.school_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{grade.subject}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                  grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                  }`}>
                                  {grade.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {grade.score}/{grade.max_score}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {grade.term} {grade.academic_year}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {grade.teacher_first_name} {grade.teacher_last_name}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
                </div>

                {/* Calendar View */}
                <EventCalendar
                  onEventClick={(event) => {
                    // Show event details - you can enhance this with a modal
                    alert(`Event: ${event.title}\nDate: ${new Date(event.start_date).toLocaleString()}\n${event.description || ''}\nLocation: ${event.location || 'N/A'}`);
                  }}
                  schoolId={undefined} // Admin can see all events
                />
              </div>
            )}

            {/* Galleries Tab */}
            {activeTab === "galleries" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Photo & Video Galleries</h3>
                </div>

                {/* School Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select School to Manage Gallery
                  </label>
                  <select
                    value={selectedSchoolForGallery || ""}
                    onChange={(e) => {
                      setSelectedSchoolForGallery(e.target.value);
                      setSelectedGallery(null);
                      setGalleryItems([]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t("admin.selectSchool")}</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} - {school.location}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSchoolForGallery && (
                  <>
                    {/* Galleries List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{t("admin.tabGalleries")}</h4>
                        <button
                          onClick={() => setShowCreateGallery(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {t("admin.createNewGallery")}
                        </button>
                      </div>

                      {galleriesLoading ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">{t("admin.loadingGalleries")}</p>
                        </div>
                      ) : galleries.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{t("admin.noGalleriesYet")}</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {galleries.map((gallery) => (
                            <div
                              key={gallery.id}
                              onClick={() => setSelectedGallery(gallery)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedGallery?.id === gallery.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-gray-900">{gallery.title}</h5>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGallery(gallery.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                              {gallery.description && (
                                <p className="text-sm text-gray-600 mb-2">{gallery.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {gallery.item_count || 0} {gallery.item_count === 1 ? "item" : "items"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gallery Items */}
                    {selectedGallery && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedGallery.title} - Images
                          </h4>
                          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            {uploading ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadImage}
                              disabled={uploading}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {galleryItems.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">{t("admin.noImagesInGallery")}</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryItems.map((item) => (
                              <div key={item.id} className="relative group">
                                <img
                                  src={`${backendUrl}${item.media_url}`}
                                  alt={item.title || "Gallery image"}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => handleDeleteImage(item.id)}
                                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                                {item.title && (
                                  <div className="mt-2 text-sm font-medium text-gray-900">{item.title}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Scholarships Tab */}
            {activeTab === "scholarships" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Scholarship Management</h3>
                </div>

                {scholarshipsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t("admin.loadingScholarships")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {scholarships.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        {t("admin.noScholarshipsAvailable")}
                      </div>
                    ) : (
                      scholarships.map((scholarship) => (
                        <div key={scholarship.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 mb-2">{scholarship.title}</h4>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scholarship.description}</p>

                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <p className="text-xs text-gray-500">Amount</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {scholarship.amount?.toLocaleString()} {scholarship.currency}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Applications</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {scholarship.application_count || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Deadline</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {scholarship.application_deadline ? new Date(scholarship.application_deadline).toLocaleDateString() : 'Open'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Slots</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {scholarship.remaining_slots || scholarship.total_slots || 'Unlimited'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${scholarship.status === 'active' ? 'bg-green-100 text-green-700' :
                                  scholarship.status === 'closed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                  {scholarship.status}
                                </span>
                                {scholarship.school_name && (
                                  <span className="text-xs text-gray-500">• {scholarship.school_name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Create Gallery Modal */}
            {showCreateGallery && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                  <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{t("admin.createNewGallery")}</h2>
                    <button
                      onClick={() => {
                        setShowCreateGallery(false);
                        setNewGalleryTitle("");
                        setNewGalleryDescription("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gallery Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        placeholder="e.g., School Facilities, Events 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newGalleryDescription}
                        onChange={(e) => setNewGalleryDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe what this gallery contains..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowCreateGallery(false);
                        setNewGalleryTitle("");
                        setNewGalleryDescription("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateGallery}
                      disabled={!newGalleryTitle.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Gallery
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isModalOpen && (
              <SchoolModal school={editingSchool} onSave={handleSaveSchool}
                onClose={() => setIsModalOpen(false)}
              />
            )}

            {/* School Details Modal */}
            {selectedSchoolForDetails && (
              <SchoolDetailsModal
                school={selectedSchoolForDetails}
                onClose={() => setSelectedSchoolForDetails(null)}
              />
            )}

            {/* Survey Builder Modal */}
            {showSurveyBuilder && (
              <SurveyBuilder
                onClose={() => {
                  setShowSurveyBuilder(false);
                  setEditingSurvey(null);
                  loadSurveys();
                }}
                surveyId={editingSurvey?.id}
              />
            )}

            {/* Survey Analytics Modal */}
            {selectedSurveyForAnalytics && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Survey Analytics</h2>
                    <button
                      onClick={() => setSelectedSurveyForAnalytics(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    <SurveyAnalytics surveyId={selectedSurveyForAnalytics} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
