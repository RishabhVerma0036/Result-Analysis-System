import { useState, useMemo } from "react";
import { Search, User, Edit3, Save, X, BookOpen } from "lucide-react";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getGrade } from "../../data/utils";

const TeacherStudentScorecard = ({ students, setStudents }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Search Filter
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(s =>
      s.name?.toLowerCase().includes(lower) ||
      s.roll?.toLowerCase().includes(lower)
    );
  }, [students, searchTerm]);

  // --- DYNAMIC SGPA & CGPA CALCULATORS ---
  const getPoints = (total) => {
    if (total >= 90) return 10;
    if (total >= 80) return 9;
    if (total >= 70) return 8;
    if (total >= 60) return 7;
    if (total >= 50) return 6;
    if (total >= 40) return 5;
    return 0;
  };

  const calculateSGPA = (subjects) => {
    if (!subjects || Object.keys(subjects).length === 0) return "0.00";
    let totalPoints = 0; let totalCredits = 0;
    Object.values(subjects).forEach(marks => {
      const total = (Number(marks.ext)||0) + (Number(marks.int)||0);
      totalPoints += getPoints(total) * 3; // Assuming 3 credits per subject
      totalCredits += 3;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const calculateCGPA = (student) => {
    let totalPoints = 0; let totalCredits = 0;
    (student.semesters || []).forEach(sem => {
      if (sem.subjects) {
         Object.values(sem.subjects).forEach(marks => {
            const total = (Number(marks.ext)||0) + (Number(marks.int)||0);
            totalPoints += getPoints(total) * 3;
            totalCredits += 3;
         });
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };
  // ---------------------------------------

  // Handlers
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setIsEditing(false); // Reset edit state when switching students
  };

  const handleEditClick = () => {
    setEditForm({
      name: selectedStudent.name || "",
      roll: selectedStudent.roll || "",
      class: selectedStudent.class || "",
      section: selectedStudent.section || ""
    });
    setIsEditing(true);
  };

  const handleSaveInfo = async () => {
    try {
      // 1. Update in Firebase
      const studentRef = doc(db, "students", selectedStudent.id);
      await updateDoc(studentRef, editForm);

      // 2. Update Local State UI instantly
      const updatedStudent = { ...selectedStudent, ...editForm };
      setSelectedStudent(updatedStudent);

      if (setStudents) {
         setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating student details:", error);
      alert("Failed to save changes to the database.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Sidebar: Student Directory */}
      <div className="w-full md:w-1/3 bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800 mb-3">Student Directory</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className={`w-full text-left px-4 py-3 rounded text-sm transition-colors flex flex-col ${selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-[#003366] text-[#003366] font-medium' : 'hover:bg-gray-100 text-gray-700 border-l-4 border-transparent'}`}
            >
              <span className="font-bold">{student.name}</span>
              <span className="text-xs text-gray-500">{student.roll} | {student.class}</span>
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center p-4 text-xs text-gray-500">No students found.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Scorecard & Editor */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {!selectedStudent ? (
          <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-10 flex flex-col items-center justify-center text-gray-500 h-full min-h-[400px]">
            <User className="w-16 h-16 mb-4 text-gray-300" />
            <p>Select a student from the directory to view or edit their profile.</p>
          </div>
        ) : (
          <>
            {/* Profile Card with Edit Logic */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-6 relative">
              {!isEditing ? (
                <button onClick={handleEditClick} className="absolute top-6 right-6 text-gray-500 hover:text-[#003366] flex items-center gap-1 text-xs font-semibold bg-gray-100 px-3 py-1.5 rounded transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit Details
                </button>
              ) : null}

              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-50 rounded-full text-[#003366] mt-1">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-1 w-full">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 px-3 py-2 text-sm rounded outline-none focus:border-[#003366] focus:ring-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Enrollment No.</label>
                        <input type="text" value={editForm.roll} onChange={e => setEditForm({...editForm, roll: e.target.value})} className="w-full border border-gray-300 px-3 py-2 text-sm rounded outline-none focus:border-[#003366] focus:ring-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Course</label>
                        <input type="text" value={editForm.class} onChange={e => setEditForm({...editForm, class: e.target.value})} className="w-full border border-gray-300 px-3 py-2 text-sm rounded outline-none focus:border-[#003366] focus:ring-1" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Section</label>
                        <input type="text" value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})} className="w-full border border-gray-300 px-3 py-2 text-sm rounded outline-none focus:border-[#003366] focus:ring-1" />
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex gap-2 mt-3 pt-4 border-t border-gray-100">
                        <button onClick={handleSaveInfo} className="bg-[#003366] text-white text-xs font-bold px-5 py-2.5 rounded shadow-sm flex items-center gap-1.5 hover:bg-blue-900 transition-colors">
                          <Save className="w-4 h-4"/> Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 text-xs font-bold px-5 py-2.5 rounded shadow-sm flex items-center gap-1.5 hover:bg-gray-300 transition-colors">
                          <X className="w-4 h-4"/> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><strong>Roll No:</strong> {selectedStudent.roll} &nbsp;|&nbsp; <strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Course:</strong> {selectedStudent.class} &nbsp;|&nbsp; <strong>Section:</strong> {selectedStudent.section}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scorecard Tables */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#003366]"/> Academic Records</h3>
                <div className="text-[#003366] font-black text-lg bg-white px-3 py-1 rounded shadow-sm border border-gray-200">
                  CGPA: {calculateCGPA(selectedStudent)}
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                {(!selectedStudent.semesters || selectedStudent.semesters.length === 0) ? (
                  <p className="text-sm text-gray-500 text-center py-6">No academic marks imported for this student yet.</p>
                ) : (
                  selectedStudent.semesters.map((sem, idx) => (
                    <div key={idx} className="border border-gray-200 rounded">
                      <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-[#003366]">Semester {sem.sem}</span>
                        <span className="text-xs font-bold bg-[#003366] text-white px-2.5 py-1 rounded shadow-sm">SGPA: {calculateSGPA(sem.subjects)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Subject</th>
                              <th className="px-4 py-2 font-semibold">Ext</th>
                              <th className="px-4 py-2 font-semibold">Int</th>
                              <th className="px-4 py-2 font-semibold">Total</th>
                              <th className="px-4 py-2 font-semibold">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sem.subjects && Object.entries(sem.subjects).map(([subName, marks]) => {
                              const total = (Number(marks.ext)||0) + (Number(marks.int)||0);
                              const { grade } = getGrade(total);
                              return (
                                <tr key={subName} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                  <td className="px-4 py-2 font-medium text-gray-800">{subName}</td>
                                  <td className="px-4 py-2">{marks.ext || 0}</td>
                                  <td className="px-4 py-2 text-gray-500">{marks.int || 0}</td>
                                  <td className="px-4 py-2 font-bold">{total}</td>
                                  <td className="px-4 py-2 font-bold text-[#003366]">{grade}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentScorecard;