import { useState } from "react";

const StudentPredictor = ({ student }) => {
  const [target, setTarget] = useState('');
  const [prediction, setPrediction] = useState(null);

  const calculateRequired = (e) => {
    e.preventDefault();
    const t = parseFloat(target);
    if (!t || t < 0 || t > 10) return;
    
    const semsCompleted = student.semesters.length;
    const currentCgpa = student.cgpa;
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
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Target Predictor</h2>
      
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-4 sm:p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="bg-gray-50 p-4 border border-gray-200 rounded flex justify-between items-center">
             <span className="text-sm text-gray-600 font-medium">Current Cumulative GPA</span>
             <span className="text-lg font-bold text-[#003366] bg-white px-3 py-1 rounded shadow-sm">{student.cgpa.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-4 border border-gray-200 rounded flex justify-between items-center">
             <span className="text-sm text-gray-600 font-medium">Semesters Logged</span>
             <span className="text-lg font-bold text-gray-800">{student.semesters.length}</span>
          </div>
          
          <form onSubmit={calculateRequired} className="pt-6 mt-6 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Set Target CGPA Goal</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="number" step="0.01" min="0" max="10" required
                value={target} onChange={(e) => setTarget(e.target.value)}
                placeholder="Ex: 8.5"
                className="w-full sm:w-40 px-4 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none"
              />
              <button type="submit" className="bg-[#003366] text-white px-6 py-2 text-sm font-medium rounded hover:bg-blue-900 transition-colors shadow-sm">
                Compute Required
              </button>
            </div>
          </form>
        </div>

        {prediction && (
          <div className={`flex-1 p-6 border rounded-lg flex flex-col justify-center items-center text-center shadow-inner ${prediction.isPossible ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Required Next SGPA</h3>
            <p className={`text-5xl font-black mb-4 tracking-tight ${prediction.isPossible ? 'text-[#003366]' : 'text-red-700'}`}>
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
