import { useState, useEffect } from "react";
import { LayoutDashboard, Database, FileText } from 'lucide-react';
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import TeacherStudentScorecard from "../components/teacher/TeacherStudentScorecard";
import TeacherDataManagement from "../components/teacher/TeacherDataManagement";

const TeacherPage = ({ user, onLogout, students, setStudents }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsCollection = collection(db, "students");
        const studentSnapshot = await getDocs(studentsCollection);
        const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [setStudents]);

  const menuItems = [
    { id: 'dashboard', label: 'Institution Analytics', icon: LayoutDashboard },
    { id: 'data', label: 'Student Registry (CSV Import)', icon: Database },
    { id: 'scorecards', label: 'Student Scorecards', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <Topbar user={{...user, name: 'Administrator'}} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-gray-100/50">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'dashboard' && <TeacherDashboard students={students} />}
            {activeTab === 'scorecards' && <TeacherStudentScorecard students={students} />}
            {activeTab === 'data' && <TeacherDataManagement students={students} setStudents={setStudents} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherPage;