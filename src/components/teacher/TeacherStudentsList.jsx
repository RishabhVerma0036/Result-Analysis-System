import React, { useState, useMemo, useRef } from "react";
import { Search, Edit3, Upload, Download } from "lucide-react";
import { recalculateStudentStats } from "../../data/utils";
import AlertMessage from "../common/AlertMessage";

// Firebase Imports
import { db } from "../../firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

const TeacherStudentsList = ({ students, setStudents, curriculum }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const showMessage = (msg, type = 'success') => {
    setNotification({ text: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const processedStudents = useMemo(() => {
    let result = [...students];
    result.sort((a, b) => b.cgpa - a.cgpa);
    if (filterClass !== 'All') {
      result = result.filter(s => s.class === filterClass);
    }
    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.roll.toLowerCase().includes(lowerQuery)
      );
    }
    return result;
  }, [students, searchTerm, filterClass]);

  // 📡 SAVE MANUAL EDITS TO FIREBASE
  const handleUpdateMarks = async () => {
    if(!editingStudentId) return;
    
    let updatedStudentData = null;
    
    const newStudentsList = students.map(s => {
      if (s.id === editingStudentId) {
        const updated = JSON.parse(JSON.stringify(s));
        const semNum = filterSem !== 'All' ? Number(filterSem) : s.currentSem;
        
        let targetSemIndex = updated.semesters.findIndex(sem => sem.sem === semNum);
        
        if (targetSemIndex === -1) {
          const subs = curriculum[s.class]?.[semNum] || [];
          const newSubjectsObj = {};
          subs.forEach(sub => newSubjectsObj[sub] = { ext: 0, int: 0 });
          updated.semesters.push({ sem: semNum, subjects: newSubjectsObj, sgpa: 0 });
          targetSemIndex = updated.semesters.length - 1;
        }
        updated.semesters[targetSemIndex].subjects = editFormData;
        updatedStudentData = recalculateStudentStats(updated);
        return updatedStudentData;
      }
      return s;
    });

    if (updatedStudentData) {
      try {
        // Update specific document in Firestore
        const studentRef = doc(db, "students", updatedStudentData.id);
        await updateDoc(studentRef, {
          semesters: updatedStudentData.semesters,
          cgpa: updatedStudentData.cgpa
        });

        // Update local state to reflect UI change instantly
        setStudents(newStudentsList);
        setEditingStudentId(null);
        setEditFormData({});
        showMessage('Internal marks successfully updated and saved to database.');
      } catch (error) {
        console.error("Error updating document: ", error);
        showMessage('Failed to save to database. Check connection.', 'error');
      }
    }
  };

  const startEditing = (student) => {
    setEditingStudentId(student.id);
    const semNum = filterSem !== 'All' ? Number(filterSem) : student.currentSem;
    const currentSemData = student.semesters.find(s => s.sem === semNum);
    
    if (currentSemData) {
      setEditFormData(currentSemData.subjects);
    } else {
      const subs = curriculum[student.class]?.[semNum] || [];
      const newSubjectsObj = {};
      subs.forEach(sub => newSubjectsObj[sub] = { ext: 0, int: 0 });
      setEditFormData(newSubjectsObj);
    }
  };

  // 📡 SAVE CSV IMPORT TO FIREBASE USING BATCH WRITE
  const handleImportInternalCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      let updatedCount = 0;
      
      let newStudents = JSON.parse(JSON.stringify(students));
      const batch = writeBatch(db); // Prepare a batch to save multiple students at once
      
      for(let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        const cols = line.split(',');
        
        if (cols.length >= 3) {
          const roll = cols[0].trim();
          const subject = cols[1].trim();
          const marks = Number(cols[2].trim());
          
          const studentIndex = newStudents.findIndex(s => s.roll === roll);
          if (studentIndex > -1) {
            const s = newStudents[studentIndex];
            const semNum = filterSem !== 'All' ? Number(filterSem) : s.currentSem;
            let targetSemIndex = s.semesters.findIndex(sem => sem.sem === semNum);
            
            if (targetSemIndex === -1) {
              const subs = curriculum[s.class]?.[semNum] || [];
              const newSubjectsObj = {};
              subs.forEach(sub => newSubjectsObj[sub] = { ext: 0, int: 0 });
              s.semesters.push({ sem: semNum, subjects: newSubjectsObj, sgpa: 0 });
              targetSemIndex = s.semesters.length - 1;
            }
            
            if (s.semesters[targetSemIndex].subjects[subject]) {
              s.semesters[targetSemIndex].subjects[subject].int = marks;
              updatedCount++;
            } else if (Object.keys(s.semesters[targetSemIndex].subjects).length === 0) {
               s.semesters[targetSemIndex].subjects[subject] = { ext: 0, int: marks };
               updatedCount++;
            }
            
            // Recalculate and queue the update in the batch
            newStudents[studentIndex] = recalculateStudentStats(s);
            const studentRef = doc(db, "students", s.id);
            batch.update(studentRef, { 
              semesters: newStudents[studentIndex].semesters, 
              cgpa: newStudents[studentIndex].cgpa 
            });
          }
        }
      }
      
      if (updatedCount > 0) {
        try {
          await batch.commit(); // Commit all updates to Firebase at once
          setStudents(newStudents);
          showMessage(`Successfully imported and saved ${updatedCount} internal mark entries to the cloud.`);
        } catch (err) {
          console.error("Batch update failed:", err);
          showMessage("Failed to sync CSV data with the database.", "error");
        }
      } else {
        showMessage('No valid records found. CSV format should be: Roll Number, Subject, Internal Marks', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleExportInternalCSV = () => {
    let csvContent = "Roll Number,Subject,Internal Marks\n";
    let hasData = false;

    processedStudents.forEach(student => {
      const semNum = filterSem !== 'All' ? Number(filterSem) : student.currentSem;
      const targetSemData = student.semesters.find(s => s.sem === semNum);
      if (targetSemData && targetSemData.subjects) {
        Object.entries(targetSemData.subjects).forEach(([subject, marks]) => {
          const safeSubject = subject.includes(',') ? `"${subject}"` : subject;
          csvContent += `${student.roll},${safeSubject},${marks.int || 0}\n`;
          hasData = true;
        });
      }
    });

    if (!hasData) {
      showMessage("No data available to export for the current filters.", "error");
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Internal_Marks_Sem_${filterSem}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage("Data exported successfully.");
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-4">
      <AlertMessage message={notification?.text} type={notification?.type} />

      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Internal Marks Directory</h2>
      
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-gray-300 rounded-sm shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" placeholder="Search by name or roll number..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none transition-shadow"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setEditingStudentId(null); }} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer">
            <option value="All">All Classes</option>
            <option value="B.Tech CS">B.Tech CS</option>
            <option value="B.Tech IT">B.Tech IT</option>
          </select>
          <select value={filterSem} onChange={(e) => { setFilterSem(e.target.value); setEditingStudentId(null); }} className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer">
            <option value="All">Target: Active Sem</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Target: Semester {s}</option>)}
          </select>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportInternalCSV} className="hidden" />
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => fileInputRef.current.click()} title="Import CSV" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors shadow-sm whitespace-nowrap font-medium">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleExportInternalCSV} title="Export CSV" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-[#003366] px-4 py-2 text-sm border border-[#003366] rounded hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-bold border-r border-gray-100">Roll #</th>
                <th className="px-5 py-4 font-bold border-r border-gray-100">Full Name</th>
                <th className="px-5 py-4 font-bold border-r border-gray-100">Cohort / Sec</th>
                <th className="px-5 py-4 font-bold border-r border-gray-100">Current Sem</th>
                <th className="px-5 py-4 font-bold">Teacher Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {processedStudents.map(student => {
                const isEditing = editingStudentId === student.id;
                const semToEdit = filterSem !== 'All' ? Number(filterSem) : student.currentSem;
                return (
                  <React.Fragment key={student.id}>
                    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isEditing ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-5 py-3 border-r border-gray-100 font-mono text-xs text-gray-500">{student.roll}</td>
                      <td className="px-5 py-3 border-r border-gray-100 font-semibold text-[#003366]">{student.name}</td>
                      <td className="px-5 py-3 border-r border-gray-100">{student.class} <span className="text-gray-400">|</span> Sec {student.section}</td>
                      <td className="px-5 py-3 border-r border-gray-100 font-medium">Sem {student.currentSem}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => isEditing ? setEditingStudentId(null) : startEditing(student)} className="text-xs flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 transition-colors font-medium text-gray-700">
                          <Edit3 className="w-3.5 h-3.5 text-[#003366]" /> {isEditing ? 'Cancel Edit' : `Input Sem ${semToEdit} Internals`}
                        </button>
                      </td>
                    </tr>
                    {isEditing && (
                      <tr>
                        <td colSpan="5" className="p-0 border-b border-gray-200">
                          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/30 shadow-inner">
                            <div className="flex items-center gap-2 mb-4">
                               <div className="w-2 h-2 rounded-full bg-[#003366]"></div>
                               <p className="text-xs text-[#003366] font-bold uppercase tracking-widest">Internal Marks Evaluation (Sem {semToEdit} - Max 30)</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-5">
                              {Object.entries(editFormData).map(([sub, marks]) => (
                                <div key={sub} className="flex-none min-w-[140px] bg-white p-3 border border-blue-100 rounded shadow-sm">
                                  <label className="block text-xs font-semibold text-gray-600 mb-2 truncate" title={sub}>{sub}</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" max="30" min="0" value={marks.int || 0} 
                                      onChange={(e) => setEditFormData({...editFormData, [sub]: { ...editFormData[sub], int: Number(e.target.value) }})}
                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold text-center outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                                    />
                                    <span className="text-xs text-gray-400">/30</span>
                                  </div>
                                </div>
                              ))}
                              {Object.keys(editFormData).length === 0 && (
                                 <p className="text-sm text-red-500 italic bg-white p-3 rounded border border-red-100">No curriculum subjects found for {student.class} Semester {semToEdit}.</p>
                              )}
                              <div className="flex-1 flex justify-end mt-4 sm:mt-0">
                                <button onClick={handleUpdateMarks} disabled={Object.keys(editFormData).length === 0} className="bg-[#003366] text-white px-6 py-2.5 text-sm font-medium rounded shadow hover:bg-blue-900 transition-colors disabled:opacity-50">
                                  Save Sem {semToEdit} Internals
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {processedStudents.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center text-gray-500 bg-white">
              <Search className="w-8 h-8 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No matching student records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentsList;