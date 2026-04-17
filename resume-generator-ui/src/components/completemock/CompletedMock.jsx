import React, { useEffect, useState } from 'react';
import API from '../../api';

const CompletedMock = () => {
  const [mocks, setMocks] = useState([]);
  const [selectedMock, setSelectedMock] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMocks();
  }, []);

  useEffect(() => {
    if (selectedMock) {
      try {
        const parsed = typeof selectedMock.result_summary === 'string' 
          ? JSON.parse(selectedMock.result_summary) 
          : selectedMock.result_summary;
        setSummaryData(parsed);
      } catch (e) {
        console.error("JSON Parsing Error", e);
        setSummaryData(null);
      }
    }
  }, [selectedMock]);

  const fetchMocks = async () => {
    try {
      const res = await API.get('/completed-mocks');
      setMocks(res.data.data);
      if (res.data.data.length > 0) setSelectedMock(res.data.data[0]);
    } catch (err) {
      console.error("Error fetching mocks", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#0a0a0c] flex items-center justify-center font-mono text-purple-500 animate-pulse uppercase tracking-widest">
      Loading Performance Data...
    </div>
  );

  return (
    <div className="h-screen bg-[#0a0a0c] text-[#a0a0c0] overflow-hidden font-mono selection:bg-purple-500/30">
      <div className="flex h-full">
        
        {/* LEFT SIDE: HISTORY */}
        <div className="w-1/4 min-w-[300px] border-r border-gray-800/50 flex flex-col h-full bg-[#0d0d10]">
          <div className="p-6 border-b border-gray-800/30">
            <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Session History</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mocks.map((mock) => {
              const item = typeof mock.result_summary === 'string' ? JSON.parse(mock.result_summary) : mock.result_summary;
              return (
                <div 
                  key={mock.id}
                  onClick={() => setSelectedMock(mock)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedMock?.id === mock.id ? 'bg-purple-600/10 border-purple-500 shadow-lg' : 'bg-[#121216] border-gray-800/50 hover:border-gray-700'
                  }`}
                >
                  <p className="text-[10px] font-bold text-white uppercase">{item?.candidateName || "Candidate"}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[8px] text-purple-400 font-black uppercase tracking-tighter">{item?.domain || "FullStack"}</span>
                    <span className="text-[8px] text-gray-600 font-mono">{new Date(mock.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: MAIN CONTENT */}
        <div className="flex-1 h-full overflow-y-auto p-8 custom-scrollbar bg-[#0a0a0c]">
          {summaryData ? (
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
              
              <div className="text-center">
                <h1 className="text-2xl font-black text-purple-400 uppercase tracking-[0.4em]">Career Analyser — Performance</h1>
                <p className="text-[10px] text-blue-400 mt-2 uppercase tracking-widest">Great Job, {summaryData.candidateName}!</p>
              </div>

              {/* TOP CARDS: SCORES & CANDIDATE INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121216] border border-gray-800/50 p-8 rounded-2xl text-center shadow-xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Resume Score</p>
                  <div className="text-4xl font-black text-green-500">{summaryData.scores?.resume?.value || 0}%</div>
                  <p className="text-[8px] text-green-500/50 mt-2 uppercase">{summaryData.scores?.resume?.label}</p>
                </div>

                <div className="bg-[#121216] border border-gray-800/50 p-8 rounded-2xl text-center shadow-xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Interview Score</p>
                  <div className="text-4xl font-black text-orange-500">{summaryData.scores?.interview?.value || 0}%</div>
                  <p className="text-[8px] text-orange-500/50 mt-2 uppercase">{summaryData.scores?.interview?.label}</p>
                </div>

                <div className="bg-[#121216] border border-gray-800/50 p-6 rounded-2xl flex flex-col justify-center space-y-3">
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500 uppercase">Candidate</span><span className="font-bold text-white">{summaryData.candidateName}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500 uppercase">Domain</span><span className="font-bold text-blue-400">{summaryData.domain}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500 uppercase">Difficulty</span><span className="font-bold text-yellow-500">{summaryData.difficulty}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gray-500 uppercase">Type</span><span className="font-bold text-purple-400">{summaryData.interviewType}</span></div>
                </div>
              </div>

              {/* RESUME ANALYSIS SECTION (Added only if data exists) */}
              {summaryData.resumeAnalysis && (
                <div className="bg-[#121216] border border-gray-800/50 rounded-2xl p-8 shadow-2xl space-y-6">
                  <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-gray-800 pb-4">Resume Detailed Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Key Skills Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {summaryData.resumeAnalysis.keySkills?.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black rounded-full">{skill}</span>
                        ))}
                      </div>
                      <div className="pt-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Missing Keywords</p>
                        <p className="text-[11px] text-red-400/80 font-medium italic">{summaryData.resumeAnalysis.missingKeywords}</p>
                      </div>
                    </div>
                    <div className="space-y-4 border-l border-gray-800 pl-8">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Formatting Feedback</p>
                      <ul className="space-y-2">
                        {summaryData.resumeAnalysis.formattingFeedback?.map((fb, i) => (
                          <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                            <span className="text-blue-500">•</span> {fb}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Project Impact</p>
                        <p className="text-[11px] text-blue-400/80 leading-relaxed">{summaryData.resumeAnalysis.projectImpact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SENTIMENT & PROGRESS BARS */}
              <div className="bg-[#121216] border border-gray-800/50 p-8 rounded-2xl">
                <h3 className="text-[10px] font-black text-purple-500 uppercase mb-8 tracking-[0.2em]">Sentiment Analysis</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { label: "Confidence", val: summaryData.sentiment?.confidence || 0, color: "bg-purple-500" },
                    { label: "Professionalism", val: summaryData.sentiment?.professionalism || 0, color: "bg-green-500" },
                    { label: "Clarity", val: summaryData.sentiment?.clarity || 0, color: "bg-blue-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase font-bold"><span className="text-gray-400">{item.label}</span><span>{item.val}%</span></div>
                      <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MISTAKE ANALYSIS TABLE */}
              <div className="bg-[#121216] border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800/50 bg-black/20 text-[10px] font-black text-red-400 uppercase tracking-widest">Mistake Analysis Table</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-900/50 text-gray-500 uppercase font-black">
                      <tr><th className="px-6 py-4">Question Asked</th><th className="px-6 py-4">Your Answer</th><th className="px-6 py-4">Correct Answer</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {summaryData.mistakes?.map((m, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 text-gray-200 font-bold">{m.q}</td>
                          <td className="px-6 py-4 italic text-gray-500">"{m.u}"</td>
                          <td className="px-6 py-4 text-green-500/80">{m.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PRACTICE QUESTIONS SECTION */}
              <div className="bg-[#121216] border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-blue-500 uppercase mb-8 tracking-widest">Recommended Practice (10 Items)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {summaryData.practiceQuestions?.map((pq, i) => (
                    <div key={i} className="p-4 bg-black/20 border border-gray-800/50 rounded-xl hover:border-blue-500/30 transition">
                      <p className="text-[11px] font-bold text-white mb-2">{i+1}. {pq.q}</p>
                      <p className="text-[10px] text-gray-500 italic bg-[#0a0a0c] p-3 rounded-lg border border-gray-800/50">💡 {pq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIDEO & CHAT FLOW */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#121216] border border-gray-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest px-2">Video Recording</p>
                  <video 
                    key={selectedMock.id} 
                    controls 
                    className="w-full rounded-xl bg-black aspect-video border border-gray-800"
                    src={`http://localhost:5000/api/interview-video/${selectedMock.id}`} 
                  />
                </div>
                <div className="bg-[#121216] border border-gray-800/50 p-6 rounded-2xl flex flex-col h-[400px]">
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Conversation Flow</p>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                    {(typeof selectedMock.chat_data === 'string' ? JSON.parse(selectedMock.chat_data) : selectedMock.chat_data)?.map((chat, idx) => (
                      <div key={idx} className={`flex ${chat.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-2xl text-[10px] max-w-[85%] ${chat.role === 'ai' ? 'bg-[#1a1a20] text-purple-300 border border-gray-800' : 'bg-purple-600 text-white'}`}>
                          {chat.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-gray-700">
              Select a session to view analysis...
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22222a; border-radius: 10px; }
        body { overflow: hidden; }
      `}} />
    </div>
  );
};

export default CompletedMock;