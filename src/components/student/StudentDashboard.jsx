import { useState, useEffect, useRef } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Edit3, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { getGrade, recalculateStudentStats } from "../../data/utils";
import AlertMessage from "../common/AlertMessage";

const StudentDashboard = ({ student, setStudentsData }) => {
  const [viewSem, setViewSem] = useState(student.currentSem);
  const [isEditing, setIsEditing] = useState(false);
  const [editMarks, setEditMarks] = useState({});
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!student.semesters.find(s => s.sem === viewSem)) {
      setViewSem(student.currentSem);
    }
  }, [student.currentSem, student.semesters, viewSem]);

  const showMessage = (msg, type = 'success') => {
    setNotification({ text: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const currentSemData = student.semesters.find(s => s.sem === viewSem) || student.semesters[student.semesters.length - 1];

  const handleEditToggle = () => {
    if (isEditing) {
      setStudentsData(prev => prev.map(s => {
        if (s.id === student.id) {
          const updated = JSON.parse(JSON.stringify(s));
          const semIndex = updated.semesters.findIndex(sem => sem.sem === viewSem);
          if (semIndex > -1) {
            updated.semesters[semIndex].subjects = editMarks;
          }
          return recalculateStudentStats(updated);
        }
        return s;
      }));
      setIsEditing(false);
      showMessage('External marks saved successfully.');
    } else {
      setEditMarks(currentSemData ? currentSemData.subjects : {});
      setIsEditing(true);
    }
  };

  const handleImportExternalCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const extMarks = {};
      
      for(let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        const cols = line.split(',');
        if (cols.length >= 2) extMarks[cols[0].trim()] = Number(cols[1]);
      }
      
      if (Object.keys(extMarks).length > 0) {
         setStudentsData(prev => prev.map(s => {
           if (s.id === student.id) {
             const updated = JSON.parse(JSON.stringify(s));
             const semIndex = updated.semesters.findIndex(sem => sem.sem === viewSem);
             if (semIndex > -1) {
               const currentSubs = updated.semesters[semIndex].subjects;
               Object.keys(currentSubs).forEach(sub => {
                 if (extMarks[sub] !== undefined) currentSubs[sub].ext = extMarks[sub];
               });
             }
             return recalculateStudentStats(updated);
           }
           return s;
         }));
         showMessage(`Successfully imported external marks for Semester ${viewSem}.`);
      } else {
         showMessage('Invalid CSV format. Header required: Subject,ExternalMarks', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  if (!currentSemData) {
    return <div className="p-8 text-center text-gray-500">No active semester data found. Please update your Profile credentials.</div>;
  }
  
  const marksData = Object.entries(currentSemData.subjects).map(([name, scores]) => ({
    subject: name,
    score: (Number(scores.ext) || 0) + (Number(scores.int) || 0),
  }));

  const trendData = student.semesters.map(sem => ({
    name: `Sem ${sem.sem}`,
    SGPA: sem.sgpa
  }));

  const hasFailed = Object.values(currentSemData.subjects).some(scores => ((Number(scores.ext)||0) + (Number(scores.int)||0)) < 40);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <AlertMessage message={notification?.text} type={notification?.type} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-300 pb-2 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Academic Overview</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Viewing Semester:</label>
          <select 
            value={viewSem} 
            onChange={(e) => { setViewSem(Number(e.target.value)); setIsEditing(false); }}
            className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm outline-none focus:border-[#003366] bg-white min-w-[100px]"
          >
            {student.semesters.map(s => <option key={s.sem} value={s.sem}>Semester {s.sem}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-gray-300 rounded-sm shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cumulative GPA</p>
          <p className="text-2xl font-semibold text-gray-800">{student.cgpa.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 border border-gray-300 rounded-sm shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SGPA (Sem {currentSemData.sem})</p>
          <p className="text-2xl font-semibold text-gray-800">{currentSemData.sgpa.toFixed(2)}</p>
        </div>
        <div className={`p-4 border rounded-sm flex items-center gap-3 shadow-sm ${hasFailed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          {hasFailed ? <AlertTriangle className="w-8 h-8 text-red-600" /> : <CheckCircle className="w-8 h-8 text-green-600" />}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <p className={`text-lg font-semibold ${hasFailed ? 'text-red-700' : 'text-green-700'}`}>
              {hasFailed ? 'Backlog Exists' : 'Clear'}
            </p>
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
                <XAxis dataKey="subject" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{fontSize: '12px', padding: '8px', borderRadius: '4px'}} />
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
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{fontSize: '12px', padding: '8px', borderRadius: '4px'}} />
                <Line type="monotone" dataKey="SGPA" stroke="#2563eb" strokeWidth={2} dot={{r: 4, fill: '#2563eb'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
        <div className="px-5 py-4 border-b border-gray-300 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-800">External Scorecard: Semester {currentSemData.sem}</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportExternalCSV} className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex-1 sm:flex-none text-xs flex justify-center items-center gap-1 bg-white border border-gray-300 px-3 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-3.5 h-3.5" /> CSV Upload
            </button>
            <button onClick={handleEditToggle} className="flex-1 sm:flex-none text-xs flex justify-center items-center gap-1 bg-[#003366] text-white px-3 py-2 rounded shadow-sm hover:bg-blue-900 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Save Externals' : 'Input Externals'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead className="bg-white text-gray-600 border-b border-gray-300">
              <tr>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Subject</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">External (Max 70)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Internal (Max 30)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Total (100)</th>
                <th className="px-5 py-3 font-medium border-r border-gray-100">Grade</th>
                <th className="px-5 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {Object.entries(currentSemData.subjects).map(([subject, marks], idx) => {
                const ext = isEditing ? (editMarks[subject]?.ext || 0) : (marks.ext || 0);
                const int = marks.int || 0;
                const total = Number(ext) + Number(int);
                const { grade, status } = getGrade(total);
                
                return (
                  <tr key={subject} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-5 py-3 border-r border-gray-100 font-medium">{subject}</td>
                    <td className="px-5 py-3 border-r border-gray-100">
                      {isEditing ? (
                        <input 
                          type="number" max="70" min="0"
                          value={ext} 
                          onChange={(e) => setEditMarks({...editMarks, [subject]: { ...editMarks[subject], ext: Number(e.target.value) }})} 
                          className="w-20 border border-gray-300 px-2 py-1 rounded text-xs outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]" 
                        />
                      ) : (
                        <span className="font-semibold text-[#003366]">{ext}</span>
                      )}
                    </td>
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
