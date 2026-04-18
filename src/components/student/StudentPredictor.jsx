import { useState } from "react";
import { getGrade } from "../../data/utils";

const StudentPredictor = ({ student }) => {
  const [target, setTarget] = useState('');
  const [prediction, setPrediction] = useState(null);

  const safeSemesters = student?.semesters || [];

  // --- DYNAMIC CGPA CALCULATOR (Same as Dashboard) ---
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
  
  const currentCgpa = cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0;
  // ---------------------------------------------------

  const calculateRequired = (e) => {
    e.preventDefault();
    const t = parseFloat(target);
    if (!t || t < 0 || t > 10) return;
    
    const semsCompleted = safeSemesters.length || 0;
    
    // Now uses the dynamically calculated CGPA instead of the database '0'
    const requiredSgpa = (t * (semsCompleted + 1)) - (currentCgpa * semsCompleted);
    
    let message = '';
    let isPossible = true;
    if (requiredSgpa > 10) {
      message = "Target mathematically impossible in a single semester. Adjust your target.";
      isPossible = false;
    } else if (requiredSgpa < 0) {
      message = "Target easily achievable. Maintaining passing grades is sufficient.";
    } else {
      message = "Target achievable. Required SGPA calculated below.";
    }
    setPrediction({ required: requiredSgpa.toFixed(2), message, isPossible });
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">CGPA Estimator</h2>
      
      <div className="bg-white border p-4 sm:p-6 flex flex-col md:flex-row gap-8 rounded shadow-sm">
        <div className="flex-1 space-y-4">
          <div className="bg-gray-50 p-4 border rounded flex justify-between items-center">
             <span className="text-sm font-medium">Current Cumulative GPA</span>
             {/* Displaying the newly calculated CGPA here */}
             <span className="text-lg font-bold text-[#003366] bg-white px-3 py-1 rounded shadow-sm">
               {currentCgpa.toFixed(2)}
             </span>
          </div>
          <div className="bg-gray-50 p-4 border rounded flex justify-between items-center">
             <span className="text-sm font-medium">Semesters Logged</span>
             <span className="text-lg font-bold">{safeSemesters.length || 0}</span>
          </div>
          
          <form onSubmit={calculateRequired} className="pt-6 border-t mt-6">
            <label className="block text-sm font-semibold mb-3">Set Target CGPA Goal</label>
            <div className="flex gap-3">
              <input 
                type="number" step="0.01" min="0" max="10" required 
                value={target} onChange={(e) => setTarget(e.target.value)} 
                placeholder="Ex: 8.5" 
                className="w-full sm:w-40 px-4 py-2 border rounded outline-none" 
              />
              <button type="submit" className="bg-[#003366] text-white px-6 py-2 rounded">
                Compute Required
              </button>
            </div>
          </form>
        </div>

        {prediction && (
          <div className={`flex-1 p-6 border rounded-lg flex flex-col justify-center items-center text-center ${prediction.isPossible ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Required Next SGPA</h3>
            <p className={`text-5xl font-black mb-4 ${prediction.isPossible ? 'text-[#003366]' : 'text-red-700'}`}>
              {prediction.required > 10 ? '> 10' : prediction.required}
            </p>
            <p className={`text-sm font-medium px-4 py-2 rounded ${prediction.isPossible ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {prediction.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPredictor;