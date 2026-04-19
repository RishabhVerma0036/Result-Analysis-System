import { useState } from "react";
import { Upload, Save, Edit } from "lucide-react";
import { db, firebaseConfig } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
// Secondary App for Auth to prevent logging Admin out
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Initialize a secondary app just for creating users
const secondaryApp = initializeApp(firebaseConfig, "SecondaryAppForAuth");
const secondaryAuth = getAuth(secondaryApp);

const TeacherDataManagement = ({ students, setStudents }) => {
  const [notification, setNotification] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell?.trim()));
      
      const newStudents = [];
      // Expected CSV: EnrollmentNo,Name,Email,Course,Semester,Section,Sub1Name,Sub1Ext,Sub1Int,Sub2Name...
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length < 6 || !rows[i][0]) continue;
        
        let subjectsObj = {};
        // Start reading subjects from index 6 in chunks of 3 (Name, Ext, Int)
        for (let j = 6; j < rows[i].length; j += 3) {
          if (rows[i][j]) {
            subjectsObj[rows[i][j]] = {
              ext: Number(rows[i][j+1]) || 0,
              int: Number(rows[i][j+2]) || 0
            };
          }
        }

        newStudents.push({
          roll: rows[i][0],
          name: rows[i][1],
          email: rows[i][2],
          class: rows[i][3],
          currentSem: Number(rows[i][4]),
          section: rows[i][5],
          subjects: subjectsObj
        });
      }
      setImportedData(newStudents);
    };
    reader.readAsText(file);
  };

  const saveToDatabase = async () => {
    setLoading(true);
    setNotification(null);
    let successCount = 0;

    // Use a local copy of students to track updates during the loop
    let currentStudents = [...students];

    for (const stu of importedData) {
      try {
        // Check if student already exists in the current student list
        let existingStudent = currentStudents.find(s => s.email === stu.email || s.roll === stu.roll);

        if (existingStudent) {
          // --- STUDENT EXISTS: UPDATE SEMESTER OR MARKS ---
          const uid = existingStudent.id;
          
          // Copy existing semesters or default to empty array
          let updatedSemesters = existingStudent.semesters ? [...existingStudent.semesters] : [];
          let semIndex = updatedSemesters.findIndex(s => s.sem === stu.currentSem);

          if (semIndex !== -1) {
            // Fix 2: Semester exists, update the subjects & marks
            updatedSemesters[semIndex].subjects = {
              ...updatedSemesters[semIndex].subjects,
              ...stu.subjects // Merges new marks with existing marks
            };
          } else {
            // Fix 1: New semester for existing student
            updatedSemesters.push({
              sem: stu.currentSem,
              subjects: stu.subjects,
              sgpa: 0
            });
          }

          const updatedStudentDoc = {
            ...existingStudent,
            name: stu.name,
            class: stu.class,
            section: stu.section,
            currentSem: stu.currentSem, 
            semesters: updatedSemesters
          };

          // Update the database (using merge: true to be safe)
          await setDoc(doc(db, "students", uid), updatedStudentDoc, { merge: true });

          // Update our local tracking list
          currentStudents = currentStudents.map(p => p.id === uid ? updatedStudentDoc : p);
          successCount++;

        } else {
          // --- NEW STUDENT: CREATE AUTH AND DATABASE DOCUMENTS ---
          
          // 1. Create User in Auth using secondary app
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, stu.email, 'password1234');
          const uid = userCredential.user.uid;

          // 2. Save User Role Document
          await setDoc(doc(db, "users", uid), {
            name: stu.name,
            email: stu.email,
            role: "student"
          });

          // 3. Save to Students Collection
          const newStudentDoc = {
            id: uid,
            name: stu.name,
            email: stu.email,
            roll: stu.roll,
            class: stu.class,
            section: stu.section,
            currentSem: stu.currentSem,
            cgpa: 0, 
            semesters: [{
              sem: stu.currentSem,
              subjects: stu.subjects,
              sgpa: 0
            }]
          };

          await setDoc(doc(db, "students", uid), newStudentDoc);
          
          // Add to our local tracking list
          currentStudents.push(newStudentDoc);
          successCount++;
          
          // Sign out secondary auth to clear it for the next one
          await secondaryAuth.signOut();
        }

      } catch (err) {
        console.error("Error processing student:", stu.email, err);
      }
    }

    // Update the main state once the loop is done
    setStudents(currentStudents);
    setLoading(false);
    setNotification({ type: 'success', text: `Successfully processed ${successCount} students.` });
    setImportedData([]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {notification && <div className="p-4 bg-green-100 text-green-800 rounded">{notification.text}</div>}

      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Student Registry (CSV Import)</h2>
      
      <div className="bg-white border p-6 rounded-sm shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">Upload CSV File</label>
        <p className="text-xs text-gray-500 mb-4">Format: EnrollmentNo, Name, Email, Course, Sem, Section, Sub1, Sub1_Ext, Sub1_Int...</p>
        <div className="flex items-center gap-4">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#003366] hover:file:bg-blue-100" />
        </div>
      </div>

      {importedData.length > 0 && (
        <div className="bg-white border p-6 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Preview Imported Data</h3>
            <button onClick={saveToDatabase} disabled={loading} className="bg-[#003366] text-white px-4 py-2 rounded text-sm flex gap-2 items-center">
              <Save className="w-4 h-4" /> {loading ? "Saving to Database..." : "Save All to Firebase"}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2">Roll No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Sem</th>
                  <th className="p-2">Subjects (Ext/Int)</th>
                </tr>
              </thead>
              <tbody>
                {importedData.map((s, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{s.roll}</td>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.class}</td>
                    <td className="p-2">{s.currentSem}</td>
                    <td className="p-2 text-xs">
                      {Object.entries(s.subjects).map(([sub, marks]) => (
                        <div key={sub}>{sub}: E({marks.ext}) I({marks.int})</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeacherDataManagement;