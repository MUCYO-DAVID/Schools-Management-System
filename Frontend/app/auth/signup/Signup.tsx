'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import AuthShell from '../components/AuthShell';
import type { School } from '@/app/types';
import { fetchSchools } from '@/api/school';
import { BACKEND_URL as backendUrl } from '@/lib/backend';

const SignUpPage = () => {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'leader' | 'teacher'>('student');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [subject, setSubject] = useState('');
  const [schoolNotFound, setSchoolNotFound] = useState(false);
  const [schoolNotFoundName, setSchoolNotFoundName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await fetchSchools();
        setSchools(data);
      } catch (err) {
        console.error('Error loading schools:', err);
      }
    };
    loadSchools();
  }, []);

  const schoolsSorted = useMemo(() => {
    return [...schools].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [schools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError(t("auth.signup.mustAgreeTerms"));
      setIsLoading(false);
      return;
    }

    if ((role === 'student' || role === 'teacher') && !selectedSchoolId && !schoolNotFound) {
      setError(t("auth.signup.selectSchoolRequired"));
      setIsLoading(false);
      return;
    }

    if (schoolNotFound && !schoolNotFoundName.trim()) {
      setError(t("auth.signup.enterSchoolNameRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        school_id: schoolNotFound ? null : (selectedSchoolId || null),
        school_not_found_name: schoolNotFound ? schoolNotFoundName.trim() : undefined,
      };

      // Add teacher-specific fields if role is teacher
      if (role === 'teacher') {
        const school = schools.find(s => s.id === selectedSchoolId);
        payload.school_name = schoolNotFound ? schoolNotFoundName.trim() : (school?.name || '');
        payload.subject = subject;
      }

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("auth.signup.registrationFailed"));
      }

      const data = await response.json();

      // Auto-login the user after successful registration
      if (data.token && data.user) {
        login(data.token, data.user);

        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'leader') {
          router.push('/home');
        } else if (data.user.role === 'teacher') {
          router.push('/home'); // Teachers go to home dashboard
        } else {
          router.push('/student');
        }
      } else {
        router.push('/auth/signin');
      }
    } catch (err: any) {
      setError(err.message || t("auth.signup.registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.signup.title")}
      subtitle={
        <>
          {t("auth.signup.subtitleHaveAccount")}{" "}
          <Link href="/auth/signin" className="font-semibold text-white hover:underline underline-offset-4">
            {t("auth.signup.signInLink")}
          </Link>
        </>
      }
      footer={
        <span className="text-white/60">
          {t("auth.signup.footerTerms")}{" "}
          <Link href="#" className="text-white hover:underline underline-offset-4">
            {t("auth.signup.terms")}
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-white hover:underline underline-offset-4">
            {t("auth.signup.privacyPolicy")}
          </Link>
          .
        </span>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-white/80">
              {t("auth.signup.firstNameLabel")}
            </label>
            <input
              id="firstName"
              type="text"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-white/80">
              {t("auth.signup.lastNameLabel")}
            </label>
            <input
              id="lastName"
              type="text"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            {t("auth.signup.emailLabel")}
          </label>
          <input
            id="email"
            type="email"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-white/80">
            {t("auth.signup.registeringAsLabel")}
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'student' | 'leader' | 'teacher')}
            className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
            required
          >
            <option value="student" className="bg-black">
              {t("auth.signup.roleStudent")}
            </option>
            <option value="teacher" className="bg-black">
              {t("auth.signup.roleTeacher")}
            </option>
            <option value="leader" className="bg-black">
              {t("auth.signup.roleSchoolLeader")}
            </option>
          </select>
          {role === 'leader' && (
            <p className="text-xs text-purple-200/80">
              {t("auth.signup.leaderVerificationHint")}
            </p>
          )}
        </div>

        {role === 'teacher' && (
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-white/80">
              {t("auth.signup.subjectLabel")}
            </label>
            <input
              id="subject"
              type="text"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
        )}

        {(role === 'student' || role === 'teacher') && (
          <div className="space-y-2">
            <label htmlFor="selectedSchoolId" className="text-sm font-medium text-white/80">
              {t("auth.signup.schoolLabel")}
            </label>
            {!schoolNotFound ? (
              <>
                <select
                  id="selectedSchoolId"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="" disabled className="bg-black">
                    {t("auth.signup.selectSchool")}
                  </option>
                  {schoolsSorted.map((school) => (
                    <option key={school.id} value={school.id} className="bg-black">
                      {school.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setSchoolNotFound(true); setSelectedSchoolId(''); }}
                  className="text-xs text-purple-300 hover:text-white underline underline-offset-2 transition"
                >
                  {t("auth.signup.cantSeeMySchool")}
                </button>
              </>
            ) : (
              <>
                <input
                  id="schoolNotFoundName"
                  type="text"
                  placeholder={t("auth.signup.enterYourSchoolName")}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30 placeholder:text-white/40"
                  value={schoolNotFoundName}
                  onChange={(e) => setSchoolNotFoundName(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => { setSchoolNotFound(false); setSchoolNotFoundName(''); }}
                  className="text-xs text-purple-300 hover:text-white underline underline-offset-2 transition"
                >
                  {t("auth.signup.backToSchoolList")}
                </button>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/80">
              {t("auth.signup.passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
              {t("auth.signup.confirmPasswordLabel")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-purple-500"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            required
          />
          <span>
            {t("auth.signup.agreeTerms")}{" "}
            <Link href="#" className="font-semibold text-white hover:underline underline-offset-4">
              {t("auth.signup.termsAndConditions")}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className={`group inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] ${
            isLoading ? 'cursor-not-allowed opacity-70' : ''
          }`}
        >
          {isLoading ? t("auth.signup.creatingAccount") : t("auth.signup.submit")}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignUpPage;
