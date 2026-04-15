import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Firebase Imports
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import LoginScreen from "./components/auth/LoginScreen";

// 🚀 DYNAMIC IMPORTS: These pages are only downloaded when needed!
const StudentPage = lazy(() => import("./pages/StudentPage"));
const TeacherPage = lazy(() => import("./pages/TeacherPage"));

import { initialStudents } from "./data/students";
import { initialCurriculum } from "./data/curriculum";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [studentsData, setStudentsData] = useState(initialStudents);
  const [curriculum, setCurriculum] = useState(initialCurriculum);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser({ id: currentUser.uid, ...userDoc.data() });
          } else {
            setUser({ id: currentUser.uid, email: currentUser.email, role: "student" });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Portal...</div>;
  }

  return (
    <BrowserRouter>
      {!user ? (
        <LoginScreen />
      ) : (
        // 🚀 SUSPENSE: Shows a fallback while the requested page downloads
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading interface...</div>}>
          <Routes>
            {/* STUDENT */}
            {user.role === "student" && (
              <Route
                path="/"
                element={
                  <StudentPage
                    student={studentsData.find((s) => s.id === user.id) || studentsData[0] || {}}
                    onLogout={handleLogout}
                    setStudentsData={setStudentsData}
                  />
                }
              />
            )}

            {/* TEACHER */}
            {user.role === "teacher" && (
              <Route
                path="/teacher"
                element={
                  <TeacherPage
                      user={user}
                      onLogout={handleLogout}
                      students={studentsData}
                      setStudents={setStudentsData}
                      curriculum={curriculum}
                      setCurriculum={setCurriculum}
                  />
                }
              />
            )}

            {/* REDIRECT */}
            <Route path="*" element={<Navigate to={user.role === "teacher" ? "/teacher" : "/"} />} />
          </Routes>
        </Suspense>
      )}
    </BrowserRouter>
  );
}

export default App;