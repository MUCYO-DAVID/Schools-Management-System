'use client';

import { useState } from 'react';
import { X, Loader2, XCircle, Upload, FileText, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { createApplication, ApplicationFormData } from '../api/student';
import type { School } from '../types';

interface ApplicationFormProps {
  school: School;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationForm({ school, onClose, onSuccess }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [formData, setFormData] = useState<ApplicationFormData>({
    school_id: school.id,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    current_grade: '',
    desired_grade: '',
    previous_school: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    address: '',
    additional_info: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError('Only JPEG, PNG, and PDF allowed');
        return;
      }

      if (newFiles.some(file => file.size > 5 * 1024 * 1024)) {
        setError('Files must be < 5MB');
        return;
      }

      setDocuments(prev => {
        const combined = [...prev, ...newFiles];
        if (combined.length > 5) {
          setError('Max 5 documents');
          return prev;
        }
        setError(null);
        return combined;
      });
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createApplication(formData, documents);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-[#141418] border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <div>
                <h2 className="text-sm font-black text-white italic uppercase tracking-widest">Enrolment Form</h2>
                <p className="text-[10px] text-slate-500 font-bold">{school.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <XCircle className="w-3 h-3" /> {error}
            </div>
          )}

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                   <input
                     name="first_name"
                     value={formData.first_name}
                     onChange={handleChange}
                     required
                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50 focus:ring-0 transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                   <input
                     name="last_name"
                     value={formData.last_name}
                     onChange={handleChange}
                     required
                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50 focus:ring-0 transition-all"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     required
                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50 focus:ring-0 transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Grade</label>
                   <input
                     name="desired_grade"
                     value={formData.desired_grade}
                     onChange={handleChange}
                     placeholder="e.g. Grade 9"
                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50 focus:ring-0 transition-all"
                   />
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Legal Guardian Details</span>
                <div className="h-px bg-white/5 flex-1" />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <input
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  placeholder="Guardian Name"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50"
                />
                <input
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  placeholder="Contact Phone"
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-purple-500/50"
                />
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Documentation</span>
                <div className="h-px bg-white/5 flex-1" />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer group">
                  <Upload className="w-5 h-5 text-slate-500 group-hover:text-purple-400 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Upload Credentials</span>
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                </label>

                <div className="space-y-2 max-h-[100px] overflow-y-auto pr-2">
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-lg group">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeDocument(index)} className="text-slate-600 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[9px] text-slate-600 italic">No files selected</div>
                  )}
                </div>
             </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
             <div className="flex items-center gap-2 text-emerald-500/60">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">Secure Submission</span>
             </div>
             <div className="flex-1" />
             <button
               type="button"
               onClick={onClose}
               className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all"
             >
               Discard
             </button>
             <button
               type="submit"
               disabled={loading}
               className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 transition-all disabled:opacity-50"
             >
               {loading ? 'Processing...' : 'Submit Application'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
