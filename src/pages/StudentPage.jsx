import { useState } from "react";
import { LayoutDashboard, Calculator, Target, User } from 'lucide-react';

import Topbar from "../components/common/Topbar";
import Sidebar from "../components/common/Sidebar";
import StudentDashboard from "../components/student/StudentDashboard";
import StudentCalculator from "../components/student/StudentCalculator";
import StudentPredictor from "../components/student/StudentPredictor";
import StudentProfile from "../components/student/StudentProfile";

const StudentPage = ({ student, onLogout, setStudentsData }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'calculator', label: 'SGPA Estimator', icon: Calculator },
    { id: 'predictor', label: 'CGPA Estimator', icon: Target }, // RENAMED HERE
    { id: 'profile', label: 'My Record', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <Topbar user={student} onLogout={onLogout} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto bg-gray-100/50">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'dashboard' && <StudentDashboard student={student} setStudentsData={setStudentsData} />}
            {/* PASSING STUDENT PROP DOWN HERE */}
            {activeTab === 'calculator' && <StudentCalculator student={student} />} 
            {activeTab === 'predictor' && <StudentPredictor student={student} />}
            {activeTab === 'profile' && <StudentProfile student={student} user={student} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPage;