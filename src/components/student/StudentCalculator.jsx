import { useState, useEffect } from "react";
import { getGrade } from "../../data/utils";

const StudentCalculator = ({ student }) => {
  const [subjects, setSubjects] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // On Load: Pull the latest semester subjects from the database (imported by CSV)
  useEffect(() => {
    if (student?.semesters && student.semesters.length > 0) {
      const currentSem = student.semesters[student.semesters.length - 1];
      
      if (!currentSem.subjects || Object.keys(currentSem.subjects).length === 0) {
        setErrorMsg("Admin has not imported your marks yet.");
        return;
      }

      // Convert Firebase object to array format for our UI
      const dbSubjects = Object.entries(currentSem.subjects).map(([name, data]) => ({
        name: name,
        actualTotal: (data.ext || 0) + (data.int || 0), // Calculate actual total
        credits: 3, // Defaulting to 3, you can adjust this if credits are saved in DB
        estimatedMarks: ''
      }));
      setSubjects(dbSubjects);
    } else {
      setErrorMsg("No semester data found in database.");
    }
  }, [student]);

  const calculateGpa = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach(sub => {
      const marks = parseFloat(sub.estimatedMarks) || 0;
      const { points } = getGrade(marks);
      const credits = parseFloat(sub.credits) || 0;
      
      totalPoints += points * credits;
      totalCredits += credits;
    });
    setResult(totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00');
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">SGPA Estimator & Actual Comparison</h2>
      
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-4 sm:p-6">
        <p className="text-sm text-gray-600 mb-6">Enter your estimated marks to see the difference from the actual marks uploaded by the Admin.</p>
        
        <div className="space-y-4">
          <div className="hidden sm:flex gap-4 font-bold text-xs text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
            <div className="flex-1">Subject</div>
            <div className="w-24">Credits</div>
            <div className="w-24 text-blue-600">Actual</div>
            <div className="w-32">Estimated</div>
            <div className="w-24">Diff +/-</div>
          </div>
          
          {subjects.map((sub, idx) => {
            const estimated = parseFloat(sub.estimatedMarks);
            const diff = !isNaN(estimated) ? (sub.actualTotal - estimated) : null;
            
            return (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded border sm:border-none border-gray-200">
                <div className="w-full sm:flex-1 font-medium text-sm text-gray-800">
                  {sub.name}
                </div>
                
                <div className="w-full sm:w-24">
                  <input type="number" min="1" max="6" value={sub.credits} onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[idx].credits = e.target.value;
                    setSubjects(newSubs);
                  }} className="w-16 px-2 py-1 text-sm border border-gray-300 rounded outline-none" />
                </div>

                <div className="w-full sm:w-24 font-bold text-[#003366]">
                  {sub.actualTotal}
                </div>

                <div className="w-full sm:w-32">
                  <input type="number" min="0" max="100" placeholder="Estimate" value={sub.estimatedMarks} onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[idx].estimatedMarks = e.target.value;
                    setSubjects(newSubs);
                  }} className="w-24 px-3 py-1.5 text-sm border border-blue-300 bg-blue-50 rounded outline-none" />
                </div>

                <div className="w-full sm:w-24">
                  {diff !== null ? (
                     <span className={`px-2 py-1 text-xs font-bold rounded ${diff === 0 ? 'bg-gray-200 text-gray-700' : diff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                     </span>
                  ) : '-'}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-6">
          <button onClick={calculateGpa} className="w-full sm:w-auto bg-[#003366] text-white px-6 py-2.5 text-sm font-medium rounded hover:bg-blue-900 shadow-sm ml-auto">
            Calculate Estimated SGPA
          </button>
        </div>

        {result !== null && (
          <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
            <span className="font-medium text-blue-900 text-lg">Estimated Semester SGPA</span>
            <span className="text-3xl font-bold text-[#003366] bg-white px-4 py-1.5 rounded shadow-sm">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalculator;