import { useState } from "react";
import { getGrade } from "../../data/utils";

const StudentCalculator = () => {
  const [subjects, setSubjects] = useState([
    { name: '', credits: 3, marks: '' },
    { name: '', credits: 4, marks: '' },
  ]);
  const [result, setResult] = useState(null);

  const calculateGpa = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach(sub => {
      const marks = parseFloat(sub.marks) || 0;
      const { points } = getGrade(marks);
      const credits = parseFloat(sub.credits) || 0;
      
      totalPoints += points * credits;
      totalCredits += credits;
    });
    setResult(totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00');
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">SGPA Estimator</h2>
      
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-4 sm:p-6">
        <p className="text-sm text-gray-600 mb-6">Enter expected total marks and subject credits to estimate your SGPA for the current semester.</p>
        
        <div className="space-y-4">
          <div className="hidden sm:flex gap-4 font-medium text-sm text-gray-700 pb-2 border-b border-gray-200">
            <div className="flex-1">Subject Title</div>
            <div className="w-24">Credits</div>
            <div className="w-32">Total Expected Marks</div>
          </div>
          
          {subjects.map((sub, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded border sm:border-none border-gray-200">
              <div className="w-full sm:flex-1">
                <label className="sm:hidden block text-xs text-gray-500 mb-1">Subject Title</label>
                <input type="text" placeholder={`Subject ${idx + 1}`} value={sub.name} onChange={(e) => {
                  const newSubs = [...subjects];
                  newSubs[idx] = { ...newSubs[idx], name: e.target.value };
                  setSubjects(newSubs);
                }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
              <div className="w-full sm:w-24 flex gap-3 sm:block">
                <div className="flex-1 sm:w-full">
                  <label className="sm:hidden block text-xs text-gray-500 mb-1">Credits</label>
                  <input type="number" min="1" max="6" value={sub.credits} onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[idx] = { ...newSubs[idx], credits: e.target.value };
                    setSubjects(newSubs);
                  }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
                </div>
                <div className="flex-1 sm:hidden"></div>
              </div>
              <div className="w-full sm:w-32">
                <label className="sm:hidden block text-xs text-gray-500 mb-1">Total Marks (0-100)</label>
                <input type="number" min="0" max="100" placeholder="0-100" value={sub.marks} onChange={(e) => {
                  const newSubs = [...subjects];
                  newSubs[idx] = { ...newSubs[idx], marks: e.target.value };
                  setSubjects(newSubs);
                }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-6">
          <button onClick={() => setSubjects([...subjects, { name: '', credits: 3, marks: '' }])} className="w-full sm:w-auto text-sm text-[#003366] font-medium px-4 py-2 hover:bg-blue-50 rounded transition-colors border border-[#003366] sm:border-none">
            + Add Subject Row
          </button>
          <button onClick={calculateGpa} className="w-full sm:w-auto bg-[#003366] text-white px-6 py-2.5 text-sm font-medium rounded hover:bg-blue-900 transition-colors sm:ml-auto shadow-sm">
            Calculate Result
          </button>
        </div>

        {result !== null && (
          <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-medium text-blue-900 text-lg">Estimated Semester SGPA</span>
            <span className="text-3xl font-bold text-[#003366] bg-white px-4 py-1.5 rounded shadow-sm">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalculator;