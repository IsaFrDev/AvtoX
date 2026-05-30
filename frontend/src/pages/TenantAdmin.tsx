import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSite, getQuestions, createQuestion, deleteQuestion } from '../services/api';
import { Plus, Trash2, Save, ArrowLeft, HelpCircle } from 'lucide-react';

const TenantAdmin = () => {
  const { username } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [site, setSite] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQ, setNewQ] = useState({ text: '', choices: ['', '', '', ''], correct: 0 });

  useEffect(() => {
    if (username) {
      getSite(username).then((res: any) => setSite(res.data));
      getQuestions(username).then((res: any) => setQuestions(res.data));
    }
  }, [username]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (creds.user === 'admin' && creds.pass === 'admin123') setIsLoggedIn(true);
    else alert('Xato login yoki parol!');
  };

  const handleAdd = async () => {
    const payload = {
      store_id: site.id,
      text: { uz: newQ.text },
      choices: { uz: newQ.choices },
      correct_answer_index: newQ.correct,
    };
    await createQuestion(payload);
    getQuestions(username!).then((res: any) => setQuestions(res.data));
    setIsModalOpen(false);
    setNewQ({ text: '', choices: ['', '', '', ''], correct: 0 });
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      <form onSubmit={handleLogin} className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl sm:rounded-[2.5rem] p-7 sm:p-10 shadow-2xl space-y-6 sm:space-y-8">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center">Admin Panel</h2>
        <div className="space-y-3 sm:space-y-4">
          <input
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white outline-none focus:border-blue-500 text-sm sm:text-base"
            placeholder="Login"
            onChange={e => setCreds({ ...creds, user: e.target.value })}
          />
          <input
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white outline-none focus:border-blue-500 text-sm sm:text-base"
            type="password"
            placeholder="Parol"
            onChange={e => setCreds({ ...creds, pass: e.target.value })}
          />
        </div>
        <button className="w-full bg-blue-600 py-3.5 sm:py-4 rounded-2xl text-white font-black hover:bg-blue-700 transition-all text-sm sm:text-base">
          Kirish
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 bg-slate-900 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">{site?.name} Admin</h1>
              <p className="text-slate-500 text-xs sm:text-sm">Savollarni boshqarish</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-white font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Yangi Savol</span>
          </button>
        </div>

        {/* Questions list */}
        {questions.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 font-bold">Hali savollar yo'q. Yangi savol qo'shing.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex justify-between items-center gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span className="text-blue-500 font-black text-sm sm:text-base shrink-0">#{i + 1}</span>
                  <p className="font-bold text-white text-sm sm:text-base truncate">
                    {q.text.uz || q.text}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteQuestion(q.id);
                    getQuestions(username!).then((res: any) => setQuestions(res.data));
                  }}
                  className="text-red-500 hover:bg-red-500/10 p-2.5 sm:p-3 rounded-xl transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-50">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-[2.5rem] p-6 sm:p-10 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">Yangi Savol</h3>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-white h-24 sm:h-32 outline-none focus:border-blue-500 text-sm sm:text-base resize-none"
              placeholder="Savol matni..."
              onChange={e => setNewQ({ ...newQ, text: e.target.value })}
            />
            <div className="grid gap-2.5 sm:gap-3">
              {newQ.choices.map((_c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={`flex-1 bg-slate-950 border rounded-xl p-3 sm:p-4 text-white outline-none text-sm sm:text-base ${newQ.correct === i ? 'border-blue-500' : 'border-slate-800'}`}
                    placeholder={`Variant ${i + 1}`}
                    onChange={e => {
                      const next = [...newQ.choices];
                      next[i] = e.target.value;
                      setNewQ({ ...newQ, choices: next });
                    }}
                  />
                  <button
                    onClick={() => setNewQ({ ...newQ, correct: i })}
                    className={`w-10 sm:w-12 rounded-xl font-bold text-sm transition-all ${newQ.correct === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 py-4 sm:py-5 rounded-2xl text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" /> Saqlash
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full text-slate-500 font-bold py-2 text-sm sm:text-base"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantAdmin;
