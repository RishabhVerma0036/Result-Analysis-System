import { useState } from "react";
import { Upload, Save, Edit, AlertCircle } from "lucide-react";
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
  const [importErrors, setImportErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell?.trim()));
      
      const newStudents = [];
      const errors = [];

      // Expected CSV: EnrollmentNo,Name,Email,Course,Semester,Section,Sub1Name,Sub1Ext,Sub1Int,Sub1Credit,Sub2Name...
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length < 6 || !rows[i][0]) continue;
        
        let roll = rows[i][0];
        let name = rows[i][1];
        let email = rows[i][2];
        let course = rows[i][3];
        let currentSem = Number(rows[i][4]);
        let section = rows[i][5];

        let hasError = false;
        let subjectsObj = {};
        
        // Start reading subjects from index 6 in chunks of 4 (Name, Ext, Int, Credits)
        for (let j = 6; j < rows[i].length; j += 4) {
          if (rows[i][j]) {
            let subName = rows[i][j];
            let ext = Number(rows[i][j+1]) || 0;
            let int = Number(rows[i][j+2]) || 0;
            let credits = Number(rows[i][j+3]) || 3;

            // VALIDATION 1: Max Marks Check
            if (ext > 60 || int > 40) {
              errors.push(`Row ${i + 1} (${name}): ${subName} marks exceed limit. Max External is 60 (got ${ext}), Max Internal is 40 (got ${int}).`);
              hasError = true;
            }

            // VALIDATION 2: Duplicate Subject in another semester check
            let existingStudent = students.find(s => s.email === email || s.roll === roll);
            if (existingStudent && existingStudent.semesters) {
              existingStudent.semesters.forEach(sem => {
                if (Number(sem.sem) !== currentSem && sem.subjects && sem.subjects[subName]) {
                  errors.push(`Row ${i + 1} (${name}): Subject '${subName}' already exists in Semester ${sem.sem} for this student.`);
                  hasError = true;
                }
              });
            }

            subjectsObj[subName] = { ext, int, credits };
          }
        }

        // Only add to preview if no errors found in this row
        if (!hasError) {
          newStudents.push({
            roll,
            name,
            email,
            class: course,
            currentSem,
            section,
            subjects: subjectsObj
          });
        }
      }
      
      setImportErrors(errors);
      setImportedData(newStudents);
    };
    reader.readAsText(file);
    // Reset file input so same file can be uploaded again if needed
    e.target.value = null; 
  };

  const saveToDatabase = async () => {
    setLoading(true);
    setNotification(null);
    let successCount = 0;

    let currentStudents = [...students];

    for (const stu of importedData) {
      try {
        let existingStudent = currentStudents.find(s => s.email === stu.email || s.roll === stu.roll);

        if (existingStudent) {
          const uid = existingStudent.id;
          let updatedSemesters = existingStudent.semesters ? [...existingStudent.semesters] : [];
          let semIndex = updatedSemesters.findIndex(s => s.sem === stu.currentSem);

          if (semIndex !== -1) {
            updatedSemesters[semIndex].subjects = {
              ...updatedSemesters[semIndex].subjects,
              ...stu.subjects 
            };
          } else {
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

          await setDoc(doc(db, "students", uid), updatedStudentDoc, { merge: true });
          currentStudents = currentStudents.map(p => p.id === uid ? updatedStudentDoc : p);
          successCount++;

        } else {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, stu.email, 'password1234');
          const uid = userCredential.user.uid;

          await setDoc(doc(db, "users", uid), {
            name: stu.name,
            email: stu.email,
            role: "student"
          });

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
          currentStudents.push(newStudentDoc);
          successCount++;
          
          await secondaryAuth.signOut();
        }

      } catch (err) {
        console.error("Error processing student:", stu.email, err);
      }
    }

    setStudents(currentStudents);
    setLoading(false);
    setNotification({ type: 'success', text: `Successfully saved ${successCount} records.` });
    setImportedData([]);
    setImportErrors([]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {notification && <div className="p-4 bg-green-100 text-green-800 rounded">{notification.text}</div>}

      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Student Registry (CSV Import)</h2>
      
      <div className="bg-white border p-6 rounded-sm shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">Upload CSV File</label>
        <p className="text-xs text-gray-500 mb-4">Format: EnrollmentNo, Name, Email, Course, Sem, Section, Sub1, Sub1_Ext (Max 60), Sub1_Int (Max 40), Sub1_Credit...</p>
        <div className="flex items-center gap-4">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#003366] hover:file:bg-blue-100" />
        </div>
      </div>

      {importErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm shadow-sm">
          <div className="flex gap-2 items-center text-red-800 font-bold mb-2">
            <AlertCircle className="w-5 h-5" /> 
            Import Errors Found (These rows will be skipped)
          </div>
          <ul className="list-disc pl-6 text-sm text-red-700 space-y-1">
            {importErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {importedData.length > 0 && (
        <div className="bg-white border p-6 rounded-sm shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Preview Valid Data</h3>
            <button onClick={saveToDatabase} disabled={loading} className="bg-[#003366] text-white px-4 py-2 rounded text-sm flex gap-2 items-center">
              <Save className="w-4 h-4" /> {loading ? "Saving to Database..." : `Save ${importedData.length} Valid Rows`}
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
                  <th className="p-2">Subjects (Ext/Int/Cr)</th>
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
                        <div key={sub}>{sub}: E({marks.ext}) I({marks.int}) C({marks.credits})</div>
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