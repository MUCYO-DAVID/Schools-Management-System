'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import Link from 'next/link';
import { Shield, AlertCircle } from 'lucide-react';
import AuthBackground from '../../components/AuthBackground';

export default function VerifyCodePage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [emailForVerification, setEmailForVerification] = useState<string | null>(null);
  const [requiresLeaderQuestions, setRequiresLeaderQuestions] = useState(false);
  const [leaderAnswer1, setLeaderAnswer1] = useState('');
  const [leaderAnswer2, setLeaderAnswer2] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // In a real application, you'd likely get the email from a secure session or context
    // For this example, we'll assume it's passed via localStorage or a query param
    const storedEmail = localStorage.getItem('userEmailForVerification');
    const requiresLeader = localStorage.getItem('requiresLeaderQuestions') === 'true';

    if (storedEmail) {
      setEmailForVerification(storedEmail);
      setRequiresLeaderQuestions(requiresLeader);
    } else {
      // If no email is found, redirect back to sign-in
      router.push('/auth/signin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setError('');
    setIsVerifying(true);

    if (!emailForVerification) {
      setError('Email not found for verification. Please sign in again.');
      return;
    }

    try {
      let requestBody: any = { email: emailForVerification };

      if (requiresLeaderQuestions) {
        // For leaders, send answers to verification questions
        if (!leaderAnswer1.trim() || !leaderAnswer2.trim()) {
          setError('Please answer both verification questions.');
          return;
        }
        requestBody.leaderAnswers = {
          answer1: leaderAnswer1,
          answer2: leaderAnswer2,
        };
      } else {
        // For regular users, send verification code
        if (!code.trim()) {
          setError('Please enter the verification code.');
          return;
        }
        requestBody.code = code;
      }

      const response = await fetch(`${backendUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const { token, user } = await response.json();
      login(token, user); // Log in the user after successful verification

      // Clean up verification data
      localStorage.removeItem('userEmailForVerification');
      localStorage.removeItem('requiresLeaderQuestions');

      // Check for redirect path (from verification flow)
      const redirectPath = localStorage.getItem('redirectAfterVerification');
      localStorage.removeItem('redirectAfterVerification');

      // Also check for redirect from login (in case it wasn't moved to redirectAfterVerification)
      const loginRedirect = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');

      // Redirect based on role or saved redirect
      const finalRedirect = redirectPath || loginRedirect;
      if (finalRedirect) {
        router.push(finalRedirect);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'leader') {
        router.push('/schools');
      } else if (user.role === 'student' || user.role === 'parent') {
        router.push('/home');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending) return;
    setError('');
    setIsResending(true);
    if (!emailForVerification) {
      setError('Email not found to resend code.');
      return;
    }

    // Leaders don't need to resend code, they answer questions
    if (requiresLeaderQuestions) {
      setError('Please answer the verification questions above.');
      return;
    }

    try {
      // Placeholder for your backend API call to resend the code
      const response = await fetch(`${backendUrl}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend code');
      }
      alert('Verification code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while resending code');
    } finally {
      setIsResending(false);
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
        <div className="w-full max-w-[450px] bg-black/80 backdrop-blur-md rounded-2xl p-10 md:p-16 border border-white/10 shadow-2xl">
          <div className="mb-7">
            {requiresLeaderQuestions ? (
              <>
                <h2 className="text-white text-3xl font-bold mb-3">Leader Verification</h2>
                <p className="text-[#b3b3b3] text-sm">
                  Please answer the following questions to verify your leadership role.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white text-2xl font-bold mb-2">Verify Email</h2>
                <p className="text-[#b3b3b3] text-sm">
                  A verification code was sent to <span className="text-purple-400 font-medium">{emailForVerification}</span>.
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-6 text-sm flex gap-2 items-start animate-in fade-in zoom-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {requiresLeaderQuestions ? (
              <>
                <div className="relative">
                  <input
                    id="answer1"
                    type="text"
                    className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                    placeholder=" "
                    value={leaderAnswer1}
                    onChange={(e) => setLeaderAnswer1(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="answer1"
                    className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                  >
                    Primary responsibility
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="answer2"
                    type="text"
                    className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                    placeholder=" "
                    value={leaderAnswer2}
                    onChange={(e) => setLeaderAnswer2(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="answer2"
                    className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                  >
                    Authorized to manage info? (Yes/No)
                  </label>
                </div>
              </>
            ) : (
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  className="w-full bg-[#333] hover:bg-[#444] transition-all rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                  placeholder=" "
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <label
                  htmlFor="code"
                  className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
                >
                  Verification Code
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-white font-bold py-3.5 rounded-lg mt-6 shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2 ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (requiresLeaderQuestions ? 'Verify Leadership' : 'Verify Code')}
            </button>

            {!requiresLeaderQuestions && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className={`text-[#b3b3b3] hover:text-white hover:underline text-sm font-medium transition-colors underline-offset-4 decoration-purple-500 flex items-center justify-center gap-1 mx-auto ${isResending ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isResending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resending...
                    </>
                  ) : 'Resend Code'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </AuthBackground>
  );
}
