import React, { useState, useEffect, useMemo } from 'react';
import qs from './questions404_full.json';

export default function App(){
  const questions = qs.slice().sort((a,b)=>a.id-b.id);
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mode, setMode] = useState('practice');
  const [examN, setExamN] = useState(100);
  const [examSet, setExamSet] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(()=>{
    let t;
    if (examStarted && timeLeft>0){
      t = setInterval(()=>{ setTimeLeft(s=>{ if(s<=1){ clearInterval(t); handleSubmit(); return 0 } return s-1 }) },1000);
    }
    return ()=>clearInterval(t);
  },[examStarted,timeLeft]);

  const progress = useMemo(()=>{
    const answered = Object.keys(answers).length;
    const correct = Object.keys(answers).filter(id=>{
      const q = questions.find(x=>x.id===parseInt(id));
      return q && answers[id] && q.answer && answers[id]===q.answer;
    }).length;
    return { answered, correct, wrong: answered - correct };
  },[answers,questions]);

  function chooseOption(qid, opt){
    setAnswers(prev=>({...prev, [qid]: opt}));
  }

  function startExam(){
    let N = parseInt(examN)||100; if(N>total) N=total;
    // shuffle
    const idxs = Array.from({length: total}, (_,i)=>i);
    for(let i=idxs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [idxs[i],idxs[j]]=[idxs[j],idxs[i]] }
    const pick = idxs.slice(0,N);
    setExamSet(pick);
    setAnswers({});
    setExamStarted(true);
    setMode('exam');
    // time per question = 3600/100 seconds
    setTimeLeft(Math.ceil((3600/100)*N));
    setIndex(0);
  }

  function handleSubmit(){
    setExamStarted(false);
    setMode('practice');
    // show results area via state (we'll compute below)
  }

  function gradeSet(setIds){
    const ids = setIds;
    let corr=0; const details=[];
    ids.forEach(id=>{
      const q = questions.find(x=>x.id===id);
      const ua = answers[id];
      if(q && ua && ua===q.answer) corr++; else details.push({id, q, ua});
    });
    return {total:ids.length, correct:corr, wrong: ids.length-corr, percent: Math.round(100*corr/ids.length)};
  }

  const current = questions[ examStarted && mode==='exam' ? examSet[index] : index ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold">QT</div>
            <div>
              <div className="text-lg font-semibold">Quiz Tài Chính</div>
              <div className="text-xs text-gray-500">404 câu — Azota-style</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={mode} onChange={e=>setMode(e.target.value)} className="border rounded px-2 py-1">
              <option value="practice">Luyện tập</option>
              <option value="exam">Kiểm tra</option>
            </select>
            <input className="border rounded px-2 py-1 w-20" value={examN} onChange={e=>setExamN(e.target.value)} />
            <button onClick={startExam} className="bg-indigo-600 text-white px-3 py-1 rounded">Bắt đầu</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-4 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-white rounded-lg p-3 shadow">
          <div className="mb-4">
            <div className="text-sm text-gray-500">Tiến độ</div>
            <div className="text-xl font-semibold">{progress.answered}/{total} trả lời</div>
            <div className="text-sm text-green-600">Đúng {progress.correct} • Sai {progress.wrong}</div>
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-[60vh] overflow-auto">
            {questions.map((q,i)=> (
              <button key={q.id} onClick={()=>{ setIndex(i); }} className={`py-2 rounded ${answers[q.id]? 'bg-indigo-600 text-white':'bg-gray-100 text-gray-700'}`}>{q.id}</button>
            ))}
          </div>
        </aside>

        <section className="col-span-9">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Câu {current?.id}</div>
                <div className="text-lg font-medium mt-2">{current?.question}</div>
              </div>
              <div className="text-sm text-gray-500">{examStarted? 'Kiểm tra' : 'Luyện tập'}</div>
            </div>

            <div className="mt-6 space-y-3">
              {['A','B','C'].map(L=>{
                const txt = current?.options?.[L] || '';
                const selected = answers[current?.id]===L;
                const isCorrect = current?.answer===L;
                return (
                  <button key={L} onClick={()=>chooseOption(current.id, L)} className={`w-full text-left p-4 rounded border ${selected? 'ring-2 ring-indigo-300':''} ${(!examStarted)&& selected && isCorrect? 'bg-green-50':''}`}>
                    <div className="font-semibold">{L}.</div>
                    <div className="text-sm mt-1">{txt}</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <button onClick={()=>setIndex(i=>Math.max(0,i-1))} className="px-4 py-2 bg-gray-100 rounded mr-2">⬅ Trước</button>
                <button onClick={()=>setIndex(i=>Math.min(total-1,i+1))} className="px-4 py-2 bg-indigo-600 text-white rounded">Tiếp ➡</button>
              </div>
              <div>
                <button onClick={()=>{ if(confirm('Nộp bài?')) handleSubmit(); }} className="px-4 py-2 bg-red-500 text-white rounded">Nộp bài</button>
              </div>
            </div>
          </div>

          <div className="mt-4"></div>
        </section>
      </main>
    </div>
  );
}
