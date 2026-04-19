import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle } from "lucide-react";
import { getGrade } from "../../data/utils";

const StudentDashboard = ({ student }) => {
  const safeSemesters = student?.semesters || [];
  const defaultSem = student?.currentSem || 1;

  const [viewSem, setViewSem] = useState(defaultSem);

  useEffect(() => {
    if (safeSemesters.length > 0 && !safeSemesters.find(s => s.sem === viewSem)) {
      setViewSem(defaultSem);
    }
  }, [defaultSem, safeSemesters, viewSem]);

  const currentSemData = safeSemesters.find(s => s.sem === viewSem) || safeSemesters[safeSemesters.length - 1];

  if (!currentSemData || !currentSemData.subjects || Object.keys(currentSemData.subjects).length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded shadow-sm max-w-2xl mx-auto mt-10 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome, {student?.name || 'Student'}!</h3>
        <p className="text-gray-500">Your academic data has not been imported into the system yet. Please check back after the Admin uploads your marks.</p>
      </div>
    );
  }

  // --- DYNAMIC SGPA & CGPA CALCULATOR ---
  const calculateSGPA = (subjects) => {
    if (!subjects || Object.keys(subjects).length === 0) return 0;
    let totalCredits = 0;
    let totalPoints = 0;
    
    Object.values(subjects).forEach(marks => {
      const total = (Number(marks.ext) || 0) + (Number(marks.int) || 0);
      let points = 0;
      const gradeObj = getGrade(total);
      
      if (gradeObj && gradeObj.points !== undefined) {
         points = gradeObj.points;
      } else {
         // Fallback logic if points aren't found
         if (total >= 90) points = 10;
         else if (total >= 80) points = 9;
         else if (total >= 70) points = 8;
         else if (total >= 60) points = 7;
         else if (total >= 50) points = 6;
         else if (total >= 40) points = 5;
      }
      
      const credits = 3; // Assuming standard 3 credits per subject
      totalPoints += points * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };

  // Compute live SGPA for currently viewed semester
  const displaySgpa = calculateSGPA(currentSemData.subjects);
  
  // Compute live CGPA across ALL logged semesters
  let cgpaTotalPoints = 0;
  let cgpaTotalCredits = 0;
  safeSemesters.forEach(sem => {
    if (sem.subjects) {
      Object.values(sem.subjects).forEach(marks => {
        const total = (Number(marks.ext) || 0) + (Number(marks.int) || 0);
        let points = 0;
        const gradeObj = getGrade(total);
        if (gradeObj && gradeObj.points !== undefined) points = gradeObj.points;
        else {
           if (total >= 90) points = 10;
           else if (total >= 80) points = 9;
           else if (total >= 70) points = 8;
           else if (total >= 60) points = 7;
           else if (total >= 50) points = 6;
           else if (total >= 40) points = 5;
        }
        const credits = 3;
        cgpaTotalPoints += points * credits;
        cgpaTotalCredits += credits;
      });
    }
  });
  const displayCgpa = cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0;
  // --------------------------------------
  
  const marksData = Object.entries(currentSemData.subjects).map(([name, scores]) => ({
    subject: name,
    score: (Number(scores.ext) || 0) + (Number(scores.int) || 0),
  }));

  const trendData = safeSemesters.map(sem => ({
    name: `Sem ${sem.sem}`, 
    SGPA: Number(calculateSGPA(sem.subjects).toFixed(2))
  }));

  const hasFailed = Object.values(currentSemData.subjects).some(scores => ((Number(scores.ext)||0) + (Number(scores.int)||0)) < 40);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-300 pb-2 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Academic Overview</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Viewing Semester:</label>
          <select value={viewSem} onChange={(e) => setViewSem(Number(e.target.value))} className="border rounded px-3 py-1 text-sm outline-none">
            {safeSemesters.map(s => <option key={s.sem} value={s.sem}>Semester {s.sem}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 border rounded shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 border-gray-300">CGPA</p>
          <p className="text-2xl font-semibold text-gray-800">{displayCgpa.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1  border-gray-300">SGPA (Sem {currentSemData.sem})</p>
          <p className="text-2xl font-semibold text-gray-800">{displaySgpa.toFixed(2)}</p>
        </div>
        <div className={`p-4 border rounded flex items-center gap-3 shadow-sm ${hasFailed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          {hasFailed ? <AlertTriangle className="w-8 h-8 text-red-600" /> : <CheckCircle className="w-8 h-8 text-green-600" />}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <p className={`text-lg font-semibold ${hasFailed ? 'text-red-700' : 'text-green-700'}`}>{hasFailed ? 'Backlog Exists' : 'Clear'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 border border-gray-300 rounded-sm shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Marks (Sem {currentSemData.sem})</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="subject" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="score" fill="#003366" maxBarSize={40} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 border border-gray-300 rounded-sm shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="SGPA" stroke="#2563eb" strokeWidth={2} dot={{r: 4, fill: '#2563eb'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
        <div className="px-5 py-4 border-b border-gray-300 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-800">External Scorecard: Semester {currentSemData.sem}</h3>
          {/* Edit & Upload Buttons have been completely removed from here */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-600px">
            <thead className="bg-white text-gray-600 border-b border-gray-300">
              <tr>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Subject</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">External (Max 60)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Internal (Max 40)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Total (100)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Grade</th>
                <th className="px-5 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {Object.entries(currentSemData.subjects).map(([subject, marks]) => {
                const ext = marks.ext || 0;
                const int = marks.int || 0;
                const total = Number(ext) + Number(int);
                const { grade, status } = getGrade(total);
                
                return (
                  <tr key={subject} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-5 py-3 border-r border-gray-100 font-medium">{subject}</td>
                    {/* Input fields removed; now displaying strict read-only numbers */}
                    <td className="px-5 py-3 border-r border-gray-100 font-semibold text-[#003366]">{ext}</td>
                    <td className="px-5 py-3 border-r border-gray-100 text-gray-500">{int}</td>
                    <td className="px-5 py-3 border-r border-gray-100 font-semibold">{total}</td>
                    <td className="px-5 py-3 border-r border-gray-100 font-bold">{grade}</td>
                    <td className={`px-5 py-3 ${status === 'Pass' ? 'text-green-600' : 'text-red-600 font-medium'}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;