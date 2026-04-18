import { useMemo, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { getGrade } from "../../data/utils";

const TeacherDashboard = ({ students }) => {
  const [filterClass, setFilterClass] = useState('All');
  const [filterSem, setFilterSem] = useState('All');

  // --- DYNAMICALLY FETCH UNIQUE COURSES FROM DATABASE ---
  const uniqueClasses = useMemo(() => {
    const classes = students.map(s => s.class).filter(Boolean); // Extract all course names
    return [...new Set(classes)].sort(); // Remove duplicates and alphabetize
  }, [students]);

  // Apply Filters
  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (filterClass !== 'All') result = result.filter(s => s.class === filterClass);
    return result;
  }, [students, filterClass]);

  // --- DYNAMIC CGPA CALCULATOR ---
  const calculateStudentCgpa = (student) => {
    let cgpaTotalPoints = 0;
    let cgpaTotalCredits = 0;
    const safeSemesters = student?.semesters || [];

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

    return cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0;
  };

  // 1. CALCULATE MEAN CGPA
  const batchAvgCgpa = useMemo(() => {
    if (!filteredStudents.length) return "0.00";
    const total = filteredStudents.reduce((acc, s) => acc + calculateStudentCgpa(s), 0);
    return (total / filteredStudents.length).toFixed(2);
  }, [filteredStudents]);

  // 2. OVERALL PASS RATE (Replacing Fake YoY Delta)
  const passRate = useMemo(() => {
    let passedSubjects = 0;
    let totalSubjects = 0;
    
    filteredStudents.forEach(student => {
      const sems = student.semesters || [];
      sems.forEach(sem => {
        if (sem.subjects) {
          Object.values(sem.subjects).forEach(marks => {
            totalSubjects++;
            const total = (Number(marks.ext)||0) + (Number(marks.int)||0);
            if (total >= 40) passedSubjects++; // 40 is passing criteria
          });
        }
      });
    });
    
    return totalSubjects > 0 ? ((passedSubjects / totalSubjects) * 100).toFixed(1) : "0.0";
  }, [filteredStudents]);

  // 3. REAL CHART DATA (Course-wise Performance)
  const courseChartData = useMemo(() => {
    const courseGroups = {};
    
    // Group students by their course/class
    filteredStudents.forEach(s => {
      const courseName = s.class || 'Unassigned';
      if (!courseGroups[courseName]) courseGroups[courseName] = { totalCgpa: 0, count: 0 };
      
      courseGroups[courseName].totalCgpa += calculateStudentCgpa(s);
      courseGroups[courseName].count += 1;
    });

    // Format for Recharts
    return Object.entries(courseGroups).map(([name, data]) => ({
      name: name,
      avgCgpa: Number((data.totalCgpa / data.count).toFixed(2))
    }));
  }, [filteredStudents]);

  // 4. SUBJECT DIFFICULTY INDEX
  const difficultyStats = useMemo(() => {
    const stats = {};
    let totalAnalyzed = 0;
    filteredStudents.forEach(student => {
      let targetSemData;
      if (filterSem === 'All') {
        targetSemData = student.semesters[student.semesters.length - 1]; 
      } else {
        targetSemData = student.semesters.find(s => s.sem === Number(filterSem));
      }
      if (targetSemData && targetSemData.subjects) {
        totalAnalyzed++;
        Object.entries(targetSemData.subjects).forEach(([subject, marks]) => {
          if (!stats[subject]) stats[subject] = { fails: 0, totalMarks: 0, count: 0 };
          const total = (Number(marks.ext)||0) + (Number(marks.int)||0);
          if (total < 40) stats[subject].fails += 1;
          stats[subject].totalMarks += total;
          stats[subject].count += 1;
        });
      }
    });
    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      failRate: ((data.fails / data.count) * 100).toFixed(1),
      avgScore: (data.totalMarks / data.count).toFixed(1),
      index: data.fails > totalAnalyzed * 0.3 ? 'High' : (data.fails > totalAnalyzed * 0.1 ? 'Medium' : 'Low')
    })).sort((a, b) => b.failRate - a.failRate);
  }, [filteredStudents, filterSem]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-300 pb-2 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Institutional Analytics</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          
          {/* DYNAMIC DROPDOWN */}
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="flex-1 sm:flex-none border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#003366] bg-white min-w-[140px] shadow-sm">
            <option value="All">All Courses</option>
            {uniqueClasses.map(className => (
               <option key={className} value={className}>{className}</option>
            ))}
          </select>

          <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="flex-1 sm:flex-none border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#003366] bg-white min-w-[120px] shadow-sm">
            <option value="All">All / Latest Sems</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm border-t-4 border-t-blue-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Active Students</p>
          <p className="text-3xl font-bold text-gray-800">{filteredStudents.length}</p>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm border-t-4 border-t-purple-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Mean CGPA</p>
          <p className="text-3xl font-bold text-gray-800">{batchAvgCgpa}</p>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm border-t-4 border-t-green-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Overall Pass Rate</p>
          <p className={`text-3xl font-bold ${Number(passRate) >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
            {passRate}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
             {/* RENAMED TO REFLECT REAL DATA */}
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Course Performance Comparison</h3>
          </div>
          <div className="h-72 p-5 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              {/* USING REAL DATA HERE */}
              <BarChart data={courseChartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{fontSize: '12px', borderRadius: '4px'}} />
                <Bar dataKey="avgCgpa" fill="#475569" maxBarSize={60} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Subject Difficulty Index (Filtered Sem)</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 border-b border-gray-200 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">Subject Area</th>
                  <th className="px-5 py-3 font-semibold">Mean Total Score</th>
                  <th className="px-5 py-3 font-semibold">Failure Rate</th>
                  <th className="px-5 py-3 font-semibold">Flag</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {difficultyStats.map((stat, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-medium">{stat.subject}</td>
                    <td className="px-5 py-3.5">{stat.avgScore}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-600">{stat.failRate}%</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded shadow-sm border
                        ${stat.index === 'High' ? 'bg-red-100 text-red-800 border-red-200' : 
                          stat.index === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                          'bg-green-100 text-green-800 border-green-200'}`}>
                        {stat.index}
                      </span>
                    </td>
                  </tr>
                ))}
                {difficultyStats.length === 0 && (
                  <tr>
                     <td colSpan={4} className="px-5 py-8 text-center text-gray-500 italic">No subject data to display for selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;