import { useState } from "react";
import { getGrade } from "../../data/utils";

const TeacherStudentScorecard = ({ students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Comprehensive Student Scorecards</h2>

      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-4 sm:p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Select Student</label>
        <select 
          value={selectedStudentId} 
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer"
        >
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.roll}) - {s.class}</option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="space-y-6">
          <div className="bg-white p-5 border border-gray-300 rounded-sm shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-[#003366]">{selectedStudent.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Roll: {selectedStudent.roll} <span className="text-gray-300 mx-2">|</span> Class: {selectedStudent.class} <span className="text-gray-300 mx-2">|</span> Sec: {selectedStudent.section}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cumulative GPA</p>
              <p className="text-3xl font-bold text-gray-800">{selectedStudent.cgpa.toFixed(2)}</p>
            </div>
          </div>

          {selectedStudent.semesters.sort((a, b) => a.sem - b.sem).map(sem => (
            <div key={sem.sem} className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Semester {sem.sem}</h4>
                <span className="text-sm font-semibold text-[#003366]">SGPA: {sem.sgpa.toFixed(2)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead className="bg-white text-gray-600 border-b border-gray-200 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-semibold border-r border-gray-100">Subject</th>
                      <th className="px-5 py-3 font-semibold border-r border-gray-100">External (Max 70)</th>
                      <th className="px-5 py-3 font-semibold border-r border-gray-100">Internal (Max 30)</th>
                      <th className="px-5 py-3 font-semibold border-r border-gray-100">Total (100)</th>
                      <th className="px-5 py-3 font-semibold border-r border-gray-100">Grade</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {Object.entries(sem.subjects).map(([subject, marks]) => {
                      const ext = Number(marks.ext) || 0;
                      const int = Number(marks.int) || 0;
                      const total = ext + int;
                      const { grade, status } = getGrade(total);
                      
                      return (
                        <tr key={subject} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="px-5 py-2.5 border-r border-gray-100 font-medium">{subject}</td>
                          <td className="px-5 py-2.5 border-r border-gray-100">{ext}</td>
                          <td className="px-5 py-2.5 border-r border-gray-100 text-gray-500">{int}</td>
                          <td className="px-5 py-2.5 border-r border-gray-100 font-semibold">{total}</td>
                          <td className="px-5 py-2.5 border-r border-gray-100 font-bold">{grade}</td>
                          <td className={`px-5 py-2.5 ${status === 'Pass' ? 'text-green-600' : 'text-red-600 font-medium'}`}>
                            {status}
                          </td>
                        </tr>
                      );
                    })}
                    {Object.keys(sem.subjects).length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-5 py-4 text-center text-gray-500 italic">No subjects recorded for this semester.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudentScorecard;
