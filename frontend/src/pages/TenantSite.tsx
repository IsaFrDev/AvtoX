import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSite, getQuestions } from '../services/api';
import { HelpCircle, CheckCircle2, XCircle, Settings } from 'lucide-react';

const TenantSite = () => {
  const { username } = useParams();
  const [site, setSite] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (username) {
      getSite(username).then((res: any) => setSite(res.data)).catch(() => {});
      getQuestions(username).then((res: any) => setQuestions(res.data)).catch(() => {});
    }
  }, [username]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === questions[currentIdx].correct_answer_index) setScore(s => s + 1);
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
      } else setShowResult(true);
    }, 1200);
  };

  if (!site) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold text-lg">
      Yuklanmoqda...
    </div>
  );

  if (showResult) return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-center shadow-2xl border border-slate-800">
        <h2 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4">Natija</h2>
        <div className="text-6xl sm:text-7xl font-black text-blue-500 mb-4 sm:mb-6">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-slate-400 mb-8 sm:mb-10 text-base sm:text-lg">
          {questions.length} tadan {score} ta to'g'ri
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-lg shadow-blue-600/20"
        >
          Qayta boshlash
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">{site.name}</h1>
          <a
            href={`/${username}/admin`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-400 font-bold text-xs sm:text-sm transition-colors shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Panel</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {questions.length > 0 ? (
          <div className="space-y-6 sm:space-y-10">
            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
              <span>Savol {currentIdx + 1} / {questions.length}</span>
              <span className="text-blue-500">To'g'ri: {score}</span>
            </div>

            <div className="bg-slate-900 rounded-3xl sm:rounded-[3rem] p-5 sm:p-10 border border-slate-800 shadow-2xl">
              <p className="text-xl sm:text-3xl font-bold text-white mb-6 sm:mb-12 leading-snug">
                {questions[currentIdx].text.uz || questions[currentIdx].text}
              </p>

              <div className="grid gap-3 sm:gap-5">
                {(questions[currentIdx].choices.uz || questions[currentIdx].choices).map((choice: string, idx: number) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === questions[currentIdx].correct_answer_index;

                  let style = "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700";
                  if (selectedAnswer !== null) {
                    if (isCorrect) style = "bg-green-500/10 border-green-500 text-green-400 shadow-lg shadow-green-500/10";
                    else if (isSelected) style = "bg-red-500/10 border-red-500 text-red-400 shadow-lg shadow-red-500/10";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full p-4 sm:p-6 rounded-2xl border-2 text-left text-sm sm:text-lg font-bold transition-all flex items-center justify-between group ${style}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm shrink-0 ${selectedAnswer !== null && isCorrect ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{choice}</span>
                      </div>
                      {selectedAnswer !== null && isCorrect && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 ml-2" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 sm:py-32 bg-slate-900 rounded-3xl sm:rounded-[3rem] border border-slate-800 shadow-2xl px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg sm:text-xl font-bold">Hali savollar qo'shilmagan.</p>
            <a
              href={`/${username}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black mt-6 sm:mt-8 inline-block hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Savol qo'shish
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantSite;
