
import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";

interface DashboardProps {
  students: Student[];
}

interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  
  const stats = useMemo(() => {
    if (students.length === 0) return null;

    const totalStudents = students.length;
    const avgScore = students.reduce((acc, curr) => acc + curr.average, 0) / totalStudents;
    
    // Exercise Averages
    const tStats = [1, 2, 3, 4, 5].map(i => {
      const key = `t${i}`;
      const sum = students.reduce((acc, curr) => acc + curr.scores[key as keyof typeof curr.scores], 0);
      return {
        name: `Temrin ${i}`,
        Puan: Math.round(sum / totalStudents)
      };
    });

    // Gender Distribution
    const maleCount = students.filter(s => s.gender === 'Erkek').length;
    const femaleCount = students.filter(s => s.gender === 'Kadın').length;
    const genderData = [
      { name: 'Erkek', value: maleCount },
      { name: 'Kadın', value: femaleCount }
    ];

    // Pass/Fail (Assuming 50 is pass)
    const passed = students.filter(s => s.average >= 50).length;
    const successRate = (passed / totalStudents) * 100;

    return { totalStudents, avgScore, tStats, genderData, successRate };
  }, [students]);

  // AI Analysis function using Gemini
  const handleAIAnalysis = async () => {
    if (!stats || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analyze this student performance data for a teacher in Turkish:
        - Class Average: ${stats.avgScore.toFixed(1)}
        - Success Rate: %${stats.successRate.toFixed(0)}
        - Exercises Performance: ${JSON.stringify(stats.tStats)}
        - Student Avgs: ${JSON.stringify(students.map(s => ({ name: s.fullName, avg: s.average })))}`,
        config: {
          systemInstruction: "Sen profesyonel bir eğitim asistanısın. Verileri analiz ederek öğretmene sınıfın durumu hakkında pedagojik içgörüler ve somut öneriler sun.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Genel durum özeti" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sınıfın başarılı olduğu alanlar" },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Geliştirilmesi gereken noktalar" },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Öğretmen için 3 adet aksiyon önerisi" },
            },
            required: ["summary", "strengths", "weaknesses", "recommendations"],
          }
        },
      });

      if (response.text) {
        setAnalysis(JSON.parse(response.text.trim()));
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <p className="text-lg">Analiz için henüz yeterli veri yok.</p>
        <p className="text-sm">Lütfen önce öğrenci ekleyin.</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#EC4899']; // Blue for Male, Pink for Female

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Toplam Öğrenci</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Sınıf Ortalaması</p>
          <h3 className="text-3xl font-bold text-primary mt-2">{stats.avgScore.toFixed(1)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Başarı Oranı (50+)</p>
          <h3 className="text-3xl font-bold text-emerald-500 mt-2">%{stats.successRate.toFixed(0)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">En Yüksek Temrin</p>
          <h3 className="text-3xl font-bold text-indigo-500 mt-2">
            {stats.tStats.reduce((prev, current) => (prev.Puan > current.Puan) ? prev : current).name}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Exercise Averages */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Temrin Ortalamaları</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748B'}} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#F1F5F9'}}
                />
                <Bar dataKey="Puan" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Gender Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Cinsiyet Dağılımı</h3>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            Yapay Zeka Sınıf Analizi
          </h3>
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isAnalyzing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analiz Ediliyor...
              </>
            ) : (
              'Analiz Al'
            )}
          </button>
        </div>

        {analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Genel Bakış</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Öne Çıkan Başarılar
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-emerald-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  Gelişim Bekleyen Noktalar
                </h4>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-red-500">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Eğitmen Tavsiyeleri
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 font-medium">
                      {i + 1}. {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : !isAnalyzing && (
          <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Sınıf verilerinizi analiz ederek öğretim stratejinizi geliştirin.</p>
          </div>
        )}
      </div>
    </div>
  );
};
