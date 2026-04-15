import { useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";

const TeacherCurriculum = ({ curriculum, setCurriculum }) => {
  const [selectedClass, setSelectedClass] = useState(Object.keys(curriculum)[0] || '');
  const [selectedSem, setSelectedSem] = useState('1');
  const [newSubject, setNewSubject] = useState('');
  
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassInput, setNewClassInput] = useState('');
  
  const [showAddSem, setShowAddSem] = useState(false);
  const [newSemInput, setNewSemInput] = useState('');

  const classes = Object.keys(curriculum);
  const semesters = selectedClass && curriculum[selectedClass] ? Object.keys(curriculum[selectedClass]) : [];
  const subjects = (selectedClass && selectedSem && curriculum[selectedClass]?.[selectedSem]) ? curriculum[selectedClass][selectedSem] : [];

  const handleSaveClass = () => {
    const name = newClassInput.trim();
    if (name && !curriculum[name]) {
       setCurriculum(prev => ({ ...prev, [name]: { 1: [] } }));
       setSelectedClass(name);
       setSelectedSem('1');
       setShowAddClass(false);
       setNewClassInput('');
    }
  };

  const handleSaveSem = () => {
    const sem = newSemInput.trim();
    if (sem && selectedClass && !curriculum[selectedClass][sem]) {
       setCurriculum(prev => ({
          ...prev,
          [selectedClass]: { ...prev[selectedClass], [sem]: [] }
       }));
       setSelectedSem(sem);
       setShowAddSem(false);
       setNewSemInput('');
    }
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    const subject = newSubject.trim();
    if (!subject) return;
    setCurriculum(prev => {
      const classData = prev[selectedClass] || {};
      const semData = classData[selectedSem] || [];
      if (semData.includes(subject)) return prev;
      return {
        ...prev,
        [selectedClass]: {
          ...classData,
          [selectedSem]: [...semData, subject]
        }
      };
    });
    setNewSubject('');
  };

  const handleRemoveSubject = (sub) => {
    setCurriculum(prev => {
      const classData = prev[selectedClass] || {};
      const semData = classData[selectedSem] || [];
      return {
        ...prev,
        [selectedClass]: {
          ...classData,
          [selectedSem]: semData.filter(s => s !== sub)
        }
      };
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Curriculum Manager</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-5">
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Program Selection</h3>
              <button onClick={() => setShowAddClass(!showAddClass)} className="text-xs text-[#003366] hover:underline font-medium">
                {showAddClass ? 'Cancel' : '+ New Class'}
              </button>
            </div>
            {showAddClass ? (
              <div className="flex gap-2 mb-6">
                <input 
                  autoFocus value={newClassInput} onChange={e => setNewClassInput(e.target.value)} 
                  placeholder="e.g., B.Tech Civil"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                />
                <button onClick={handleSaveClass} className="bg-[#003366] text-white px-4 py-2 text-sm rounded font-medium hover:bg-blue-900 transition">Save</button>
              </div>
            ) : (
              <select 
                value={selectedClass} 
                onChange={e => { setSelectedClass(e.target.value); setSelectedSem(Object.keys(curriculum[e.target.value])[0] || '1'); }}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm outline-none focus:border-[#003366] bg-gray-50 mb-6 font-medium text-gray-800"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Term</h3>
              <button onClick={() => setShowAddSem(!showAddSem)} className="text-xs text-[#003366] hover:underline font-medium">
                {showAddSem ? 'Cancel' : '+ New Sem'}
              </button>
            </div>
            {showAddSem ? (
              <div className="flex gap-2">
                <input 
                  autoFocus type="number" value={newSemInput} onChange={e => setNewSemInput(e.target.value)} 
                  placeholder="e.g., 4"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                />
                <button onClick={handleSaveSem} className="bg-[#003366] text-white px-4 py-2 text-sm rounded font-medium hover:bg-blue-900 transition">Save</button>
              </div>
            ) : (
              <select 
                value={selectedSem} onChange={e => setSelectedSem(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm outline-none focus:border-[#003366] bg-gray-50 font-medium text-gray-800"
              >
                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white border border-gray-300 rounded-sm shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-3 mb-5 uppercase tracking-wide">
            Subjects for <span className="text-[#003366]">{selectedClass} (Semester {selectedSem})</span>
          </h3>
          
          <ul className="space-y-3 mb-6 flex-1">
            {subjects.map((sub, idx) => (
              <li key={idx} className="flex justify-between items-center px-4 py-3 bg-white border border-gray-200 rounded shadow-sm text-sm hover:border-[#003366] transition-colors">
                <span className="font-semibold text-gray-700">{sub}</span>
                <button onClick={() => handleRemoveSubject(sub)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded transition-colors" title="Remove Subject">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {subjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded">
                <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm italic">No subjects defined for this semester yet.</p>
              </div>
            )}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-200 pt-5 mt-auto">
            <form onSubmit={handleAddSubject} className="flex flex-1 gap-2">
              <input 
                type="text" required value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="Enter new subject name..." 
                className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
              />
              <button type="submit" className="bg-[#003366] text-white px-4 py-2 text-sm rounded font-medium hover:bg-blue-900 transition-colors shadow-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCurriculum;