import { useState, useEffect } from "react";
import { LayoutDashboard, Users, FileText, BookOpen, Database } from 'lucide-react';

// Firebase Imports
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import TeacherStudentsList from "../components/teacher/TeacherStudentsList";
import TeacherStudentScorecard from "../components/teacher/TeacherStudentScorecard";
import TeacherCurriculum from "../components/teacher/TeacherCurriculum";
import TeacherDataManagement from "../components/teacher/TeacherDataManagement";

const TeacherPage = ({
  user,
  onLogout,
  students,
  setStudents,
  curriculum,
  setCurriculum,
  setRegisteredUsers
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // 📡 FETCH STUDENTS FROM FIREBASE ON LOAD
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsCollection = collection(db, "students");
        const studentSnapshot = await getDocs(studentsCollection);
        const studentList = studentSnapshot.docs.map(doc => ({
          id: doc.id, // The document ID (Firebase Auth UID)
          ...doc.data()
        }));
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students from Firebase:", error);
      }
    };

    fetchStudents();
  }, [setStudents]);

  const menuItems = [
    { id: 'dashboard', label: 'Institution Analytics', icon: LayoutDashboard },
    { id: 'directory', label: 'Internal Grades', icon: Users },
    { id: 'scorecards', label: 'Student Scorecards', icon: FileText },
    { id: 'curriculum', label: 'Curriculum Manager', icon: BookOpen },
    { id: 'data', label: 'Student Registry', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <Topbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto bg-gray-100/50">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'dashboard' && <TeacherDashboard students={students} />}
            {activeTab === 'directory' && <TeacherStudentsList students={students} setStudents={setStudents} curriculum={curriculum} />}
            {activeTab === 'scorecards' && <TeacherStudentScorecard students={students} />}
            {activeTab === 'curriculum' && <TeacherCurriculum curriculum={curriculum} setCurriculum={setCurriculum} />}
            {activeTab === 'data' && <TeacherDataManagement students={students} setStudents={setStudents} curriculum={curriculum} setRegisteredUsers={setRegisteredUsers} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherPage;