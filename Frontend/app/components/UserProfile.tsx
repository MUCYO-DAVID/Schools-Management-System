'use client';

import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Camera,
  Edit2, Save, X, Lock, Bell, Globe, FileText,
  Award, GraduationCap, Settings, CheckCircle, AlertCircle,
  Upload, Image as ImageIcon, Trash2
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

interface UserProfileProps {
  userId?: number;
  onClose?: () => void;
}

interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at?: string;
}

export default function UserProfile({ userId, onClose }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'activity'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    date_of_birth: '',
  });

  // Security state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    email_grades: true,
    email_applications: true,
    email_events: true,
    language: 'en',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/users/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? false,
          email_grades: data.email_grades ?? true,
          email_applications: data.email_applications ?? true,
          email_events: data.email_events ?? true,
          language: data.language || 'en',
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      // Use /me endpoint for own profile, /:id for viewing others (admin only)
      const endpoint = !userId || userId === currentUser?.id
        ? `${backendUrl}/api/users/me`
        : `${backendUrl}/api/users/${targetUserId}`;

      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          date_of_birth: data.date_of_birth || '',
        });
        if (data.avatar_url) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
          const avatarUrl = data.avatar_url.startsWith('http')
            ? data.avatar_url
            : `${backendUrl}${data.avatar_url}`;
          setAvatarPreview(avatarUrl);
        } else {
          setAvatarPreview(null);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      // Upload avatar if changed
      let newAvatarUrl: string | null = null;
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('avatar', avatarFile);
        // Use /me endpoint for own profile
        const avatarEndpoint = !userId || userId === currentUser?.id
          ? `${backendUrl}/api/users/me/avatar`
          : `${backendUrl}/api/users/${targetUserId}/avatar`;

        const uploadRes = await fetch(avatarEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.message || 'Failed to upload avatar');
        }

        const uploadData = await uploadRes.json();
        newAvatarUrl = uploadData.avatar_url;

        // Update avatar preview immediately with the new URL
        if (newAvatarUrl) {
          const fullAvatarUrl = newAvatarUrl.startsWith('http')
            ? newAvatarUrl
            : newAvatarUrl.startsWith('data:')
              ? newAvatarUrl
              : `${backendUrl}${newAvatarUrl.startsWith('/') ? '' : '/'}${newAvatarUrl}`;
          setAvatarPreview(fullAvatarUrl);
        }
      }

      // Prepare update body - only include avatar_url if we uploaded a new one
      const updateBody: any = { ...formData };
      if (newAvatarUrl) {
        updateBody.avatar_url = newAvatarUrl;
      }
      // Don't include avatar_url if we didn't upload a new one (to preserve existing)

      // Update profile - use /me endpoint for own profile
      const updateEndpoint = !userId || userId === currentUser?.id
        ? `${backendUrl}/api/users/me`
        : `${backendUrl}/api/users/${targetUserId}`;

      const updateRes = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();

        // Update profile state with the new data
        setProfile(updated);

        // Update avatar preview - always use the avatar_url from the response
        if (updated.avatar_url) {
          const fullAvatarUrl = updated.avatar_url.startsWith('http')
            ? updated.avatar_url
            : updated.avatar_url.startsWith('data:')
              ? updated.avatar_url
              : `${backendUrl}${updated.avatar_url.startsWith('/') ? '' : '/'}${updated.avatar_url}`;
          setAvatarPreview(fullAvatarUrl);
        } else if (newAvatarUrl) {
          // Fallback to new upload if response doesn't have it
          const fullAvatarUrl = newAvatarUrl.startsWith('http')
            ? newAvatarUrl
            : newAvatarUrl.startsWith('data:')
              ? newAvatarUrl
              : `${backendUrl}${newAvatarUrl.startsWith('/') ? '' : '/'}${newAvatarUrl}`;
          setAvatarPreview(fullAvatarUrl);
        } else if (!avatarFile && profile?.avatar_url) {
          // If no new upload and we had an avatar before, keep it
          const fullAvatarUrl = profile.avatar_url.startsWith('http')
            ? profile.avatar_url
            : `${backendUrl}${profile.avatar_url.startsWith('/') ? '' : '/'}${profile.avatar_url}`;
          setAvatarPreview(fullAvatarUrl);
        }

        setIsEditing(false);
        setAvatarFile(null);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        // Update local storage user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...userData,
          ...updated
        };
        if (updated.avatar_url) {
          updatedUserData.avatar_url = updated.avatar_url;
        }
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        // Update form data to reflect saved changes (no reload needed)
        setFormData({
          first_name: updated.first_name || '',
          last_name: updated.last_name || '',
          email: updated.email || '',
          phone: updated.phone || '',
          bio: updated.bio || '',
          location: updated.location || '',
          date_of_birth: updated.date_of_birth || '',
        });

        // Ensure avatar preview is set correctly from the updated profile
        if (updated.avatar_url && !avatarPreview?.startsWith('data:')) {
          const fullAvatarUrl = updated.avatar_url.startsWith('http')
            ? updated.avatar_url
            : `${backendUrl}${updated.avatar_url.startsWith('/') ? '' : '/'}${updated.avatar_url}`;
          setAvatarPreview(fullAvatarUrl);
        }
      } else {
        const error = await updateRes.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800',
      teacher: 'bg-purple-100 text-purple-800',
      leader: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>

          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={
                        avatarPreview.startsWith('http')
                          ? avatarPreview
                          : avatarPreview.startsWith('data:')
                            ? avatarPreview
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${avatarPreview.startsWith('/') ? '' : '/'}${avatarPreview}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If image fails to load, hide it and show fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 ${avatarPreview ? 'hidden' : ''}`}
                    style={{ display: avatarPreview ? 'none' : 'flex' }}
                  >
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                  </div>
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 mt-4 sm:mt-0 sm:ml-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-gray-600 mt-1">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(profile.role)}`}>
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      </span>
                      {profile.created_at && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Member since {new Date(profile.created_at).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                  {!userId && (
                    <div className="mt-4 sm:mt-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setAvatarFile(null);
                              // Reset avatar preview to the saved profile avatar
                              if (profile?.avatar_url) {
                                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                                const avatarUrl = profile.avatar_url.startsWith('http')
                                  ? profile.avatar_url
                                  : `${backendUrl}${profile.avatar_url}`;
                                setAvatarPreview(avatarUrl);
                              } else {
                                setAvatarPreview(null);
                              }
                              // Reload profile to reset form data
                              loadProfile();
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'activity', label: 'Activity', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+250 788 123 456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Kigali, Rwanda"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.current_password || !passwordData.new_password}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.email_notifications}
                      onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive browser push notifications</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.push_notifications}
                      onChange={(e) => setPreferences({ ...preferences, push_notifications: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Grade Notifications</p>
                        <p className="text-sm text-gray-500">Get notified when grades are posted</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.email_grades}
                      onChange={(e) => setPreferences({ ...preferences, email_grades: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Application Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about application updates</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.email_applications}
                      onChange={(e) => setPreferences({ ...preferences, email_applications: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Event Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about school events</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.email_events}
                      onChange={(e) => setPreferences({ ...preferences, email_events: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language</h3>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Activity history will be displayed here</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
