import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import LoginScreen from "./components/auth/LoginScreen";

const StudentPage = lazy(() => import("./pages/StudentPage"));
const AdminPage = lazy(() => import("./pages/TeacherPage"));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [studentsData, setStudentsData] = useState([]); // Safe empty array fallback

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // IF STUDENT: Fetch their actual marks/scorecard from the 'students' collection
            if (userData.role === 'student') {
              const studentDoc = await getDoc(doc(db, "students", currentUser.uid));
              if (studentDoc.exists()) {
                // Merge auth data with database marks
                setUser({ id: currentUser.uid, ...userData, ...studentDoc.data() });
              } else {
                // Safe fallback if student doc hasn't been created yet
                setUser({ id: currentUser.uid, ...userData, cgpa: 0, semesters: [] });
              }
            } else {
              // IF ADMIN: Just set the user
              setUser({ id: currentUser.uid, ...userData });
            }
          } else {
            setUser({ id: currentUser.uid, email: currentUser.email, role: "student", cgpa: 0, semesters: [] });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#003366] font-bold">Loading Portal...</div>;
  }

  return (
    <BrowserRouter>
      {!user ? (
        <LoginScreen />
      ) : (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading interface...</div>}>
          <Routes>
            {/* STUDENT ROUTE */}
            {user.role === "student" && (
              <Route
                path="/"
                element={
                  <StudentPage
                    student={user} // Directly pass the Firebase user data (No more .find!)
                    onLogout={handleLogout}
                  />
                }
              />
            )}

            {/* ADMIN ROUTE */}
            {(user.role === "admin" || user.role === "teacher") && (
              <Route
                path="/admin"
                element={
                  <AdminPage
                      user={user}
                      onLogout={handleLogout}
                      students={studentsData}
                      setStudents={setStudentsData}
                  />
                }
              />
            )}

            {/* REDIRECT */}
            <Route path="*" element={<Navigate to={(user.role === "admin" || user.role === "teacher") ? "/admin" : "/"} />} />
          </Routes>
        </Suspense>
      )}
    </BrowserRouter>
  );
}

export default App;