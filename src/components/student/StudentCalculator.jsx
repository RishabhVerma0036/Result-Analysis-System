import { useState, useEffect } from "react";
import { getGrade } from "../../data/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Save } from "lucide-react"; 

const StudentCalculator = ({ student }) => {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (student?.semesters && student.semesters.length > 0) {
      if (!selectedSemester) {
        setSelectedSemester(String(student.semesters[student.semesters.length - 1].sem));
      }
    } else {
      setErrorMsg("No semester data found in database.");
    }
  }, [student]);

  useEffect(() => {
    if (!student?.semesters || !selectedSemester) return;

    const currentSem = student.semesters.find(s => String(s.sem) === String(selectedSemester));
      
    if (!currentSem || !currentSem.subjects || Object.keys(currentSem.subjects).length === 0) {
      setErrorMsg(`No marks imported for Semester ${selectedSemester} yet.`);
      setSubjects([]);
      setResult(null);
      return;
    }

    setErrorMsg("");
    const dbSubjects = Object.entries(currentSem.subjects).map(([name, data]) => ({
      name: name,
      actualTotal: (data.ext || 0) + (data.int || 0), 
      credits: data.credits || 3, 
      estimatedMarks: data.estimatedMarks || '' 
    }));
    
    setSubjects(dbSubjects);
    setResult(null); 
  }, [student, selectedSemester]);

  const handleSaveEstimates = async () => {
    if (!student?.id) {
      setErrorMsg("Student ID missing. Cannot save data.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setErrorMsg("");

    try {
      const studentRef = doc(db, "students", student.id);
      
      const updatedSemesters = student.semesters.map(sem => {
        if (String(sem.sem) === String(selectedSemester)) {
          const updatedSubjects = { ...sem.subjects };
          
          subjects.forEach(sub => {
            if (updatedSubjects[sub.name]) {
              updatedSubjects[sub.name].estimatedMarks = sub.estimatedMarks;
            }
          });
          
          return { ...sem, subjects: updatedSubjects };
        }
        return sem;
      });

      await updateDoc(studentRef, { semesters: updatedSemesters });
      
      setSaveMessage("Estimates successfully saved to your profile!");
      setTimeout(() => setSaveMessage(""), 4000); 
    } catch (error) {
      console.error("Error saving estimates:", error);
      setErrorMsg("Failed to save estimates to the database.");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 pb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">SGPA Estimator & Actual Comparison</h2>
        
        {student?.semesters && student.semesters.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] bg-white shadow-sm"
            >
              {[...student.semesters]
                .sort((a, b) => Number(a.sem) - Number(b.sem))
                .map((sem, idx) => (
                  <option key={idx} value={sem.sem}>Semester {sem.sem}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {saveMessage && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">
          {saveMessage}
        </div>
      )}

      {subjects.length > 0 && (
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
                  
                  <div className="w-full sm:w-24 flex items-center gap-2">
                    <span className="sm:hidden text-xs font-bold text-gray-500 uppercase w-20">Credits:</span>
                    <span className="px-2 py-1 text-sm font-semibold text-gray-700">{sub.credits}</span>
                  </div>

                  <div className="w-full sm:w-24 flex items-center gap-2 font-bold text-[#003366]">
                    <span className="sm:hidden text-xs font-bold text-gray-500 uppercase w-20">Actual:</span>
                    {sub.actualTotal}
                  </div>

                  <div className="w-full sm:w-32 flex items-center gap-2">
                    <span className="sm:hidden text-xs font-bold text-gray-500 uppercase w-20">Estimate:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Estimate" 
                      value={sub.estimatedMarks} 
                      onChange={(e) => {
                        let val = e.target.value;
                        // Add hard limit validation
                        if (val !== "" && Number(val) > 100) {
                          setErrorMsg(`Estimation for ${sub.name} cannot exceed 100.`);
                          return; 
                        }
                        setErrorMsg(""); // clear error if valid
                        const newSubs = [...subjects];
                        newSubs[idx].estimatedMarks = val;
                        setSubjects(newSubs);
                      }} 
                      className="w-24 px-3 py-1.5 text-sm border border-blue-300 bg-blue-50 rounded outline-none focus:border-[#003366] focus:ring-1" 
                    />
                  </div>

                  <div className="w-full sm:w-24 flex items-center gap-2">
                    <span className="sm:hidden text-xs font-bold text-gray-500 uppercase w-20">Diff:</span>
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
            <button 
              onClick={handleSaveEstimates} 
              disabled={isSaving}
              className="w-full sm:w-auto bg-white text-[#003366] border border-[#003366] px-6 py-2.5 text-sm font-medium rounded hover:bg-blue-50 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> 
              {isSaving ? 'Saving...' : 'Save Estimates'}
            </button>

            <button 
              onClick={calculateGpa} 
              className="w-full sm:w-auto bg-[#003366] text-white px-6 py-2.5 text-sm font-medium rounded hover:bg-blue-900 shadow-sm ml-auto transition-colors"
            >
              Calculate Estimated SGPA
            </button>
          </div>

          {result !== null && (
            <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
              <span className="font-medium text-blue-900 text-lg">Estimated Semester {selectedSemester} SGPA</span>
              <span className="text-3xl font-bold text-[#003366] bg-white px-4 py-1.5 rounded shadow-sm">{result}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCalculator;