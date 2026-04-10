'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GraduationCap, School, Users, BookOpen, Award, Star } from 'lucide-react';
import AuthBackground from '../../components/AuthBackground';

const SignUpPage = () => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'leader' | 'teacher'>('student');
  const [schoolName, setSchoolName] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [subject, setSubject] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    if ((role === 'student' || role === 'teacher') && !selectedSchoolId) {
      setError('Please select your school');
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
        school_id: selectedSchoolId
      };

      // Add teacher-specific fields if role is teacher
      if (role === 'teacher') {
        const school = schools.find(s => s.id === selectedSchoolId);
        payload.school_name = school?.name || '';
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
        throw new Error(errorData.message || 'Registration failed');
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
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      {/* Header Logo */}
      <header className="relative z-20 px-6 sm:px-12 py-6">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="RSBS Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
            RSBS
          </h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-1 flex-col justify-center items-center px-4 pb-20">
        <div className="w-full max-w-[500px] bg-black/80 backdrop-blur-md rounded-2xl p-8 md:p-14 border border-white/10 shadow-2xl">
          <h2 className="text-white text-3xl font-bold mb-7">Sign Up</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  id="firstName"
                  type="text"
                  className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                  placeholder=" "
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <label
                  htmlFor="firstName"
                  className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                >
                  First Name
                </label>
              </div>
              <div className="relative">
                <input
                  id="lastName"
                  type="text"
                  className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                  placeholder=" "
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <label
                  htmlFor="lastName"
                  className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                >
                  Last Name
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                htmlFor="email"
                className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'leader' | 'teacher')}
                className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-4 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 h-14 appearance-none cursor-pointer"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="leader">School Leader</option>
              </select>
              <label
                htmlFor="role"
                className="absolute left-4 top-2 text-[#8c8c8c] text-[10px] uppercase tracking-widest font-bold pointer-events-none"
              >
                Registering as
              </label>
            </div>

            {role === 'leader' && (
              <p className="text-[12px] text-purple-400 font-medium">
                Note: School leaders require identity verification questions.
              </p>
            )}

            {/* Role-Specific Fields */}
            {role === 'teacher' && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  id="subject"
                  type="text"
                  className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                  placeholder=" "
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <label
                  htmlFor="subject"
                  className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                >
                  Subject/Lesson
                </label>
              </div>
            )}

            {/* School Selection for Students and Teachers */}
            {(role === 'student' || role === 'teacher') && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <select
                  id="selectedSchoolId"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-4 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 h-14 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-[#333]">Select your school</option>
                  {schools.map((school: any) => (
                    <option key={school.id} value={school.id} className="bg-[#333]">
                      {school.name}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="selectedSchoolId"
                  className="absolute left-4 top-2 text-[#8c8c8c] text-[10px] uppercase tracking-widest font-bold pointer-events-none"
                >
                  Select Your School
                </label>
              </div>
            )}

            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
              >
                Password
              </label>
            </div>

            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
              >
                Confirm Password
              </label>
            </div>

            <div className="flex items-center mt-2 group">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 rounded bg-[#737373] border-none focus:ring-0 focus:ring-offset-0 checked:bg-purple-600 cursor-pointer transition-all"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="ml-2 text-[14px] text-[#b3b3b3] cursor-pointer group-hover:text-white transition-colors">
                I agree to the <Link href="#" className="hover:underline text-white underline-offset-4 decoration-purple-500">Terms & Conditions</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-white font-bold py-3.5 rounded-lg mt-4 shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing Up...
                </>
              ) : 'Sign Up'}
            </button>
          </form>

          <div className="mt-12 text-[#737373] text-[16px]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-white hover:underline font-medium decoration-purple-500 underline-offset-4">
              Sign in.
            </Link>
          </div>
        </div>
      </main>
    </AuthBackground>
  );
};

export default SignUpPage;
