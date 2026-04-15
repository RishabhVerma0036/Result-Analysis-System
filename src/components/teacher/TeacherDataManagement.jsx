import { useState } from "react";
import { User, Plus } from "lucide-react";
import AlertMessage from "../common/AlertMessage";

const TeacherDataManagement = ({ students, setStudents, curriculum, setRegisteredUsers }) => {
  const [formData, setFormData] = useState({ roll: '', name: '', email: '', classStr: Object.keys(curriculum)[0] || '', section: 'A', currentSem: '1' });
  const [notification, setNotification] = useState(null);

  const handleManualAdd = (e) => {
    e.preventDefault();
    const { roll, name, email, classStr, section, currentSem } = formData;
    const semNum = Number(currentSem);
    
    const subs = curriculum[classStr]?.[semNum] || [];
    const newSubjectsObj = {};
    subs.forEach(sub => newSubjectsObj[sub] = { ext: 0, int: 0 });
    
    const newId = `STU${Date.now()}`;
    const newStudent = {
      id: newId,
      roll, name, class: classStr, section, currentSem: semNum,
      cgpa: 0, email, phone: 'Not Provided',
      semesters: [{ sem: semNum, subjects: newSubjectsObj, sgpa: 0 }]
    };
    
    setStudents([...students, newStudent]);

    if (setRegisteredUsers) {
      setRegisteredUsers(prev => [...prev, {
        id: newId,
        name,
        email,
        password: 'password123', 
        role: 'student'
      }]);
    }
    
    setFormData({ roll: '', name: '', email: '', classStr: Object.keys(curriculum)[0] || '', section: 'A', currentSem: '1' });
    
    setNotification({ type: 'success', text: `Student ${name} (${roll}) registered successfully. Default login password is 'password123'.` });
    setTimeout(() => setNotification(null), 8000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <AlertMessage message={notification?.text} type={notification?.type} />

      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-2">Student Registry</h2>
      
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
          <div className="p-2 bg-blue-50 rounded-full text-[#003366]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Enroll New Student</h3>
            <p className="text-xs text-gray-500 mt-0.5">Registering a student automatically provisions their scorecard and login credentials.</p>
          </div>
        </div>
        
        <form onSubmit={handleManualAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Doe" className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Roll Number</label>
              <input type="text" required value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} placeholder="e.g. CS2024-55" className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. student@university.edu" className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Class/Major</label>
              <select value={formData.classStr} onChange={e => setFormData({...formData, classStr: e.target.value, currentSem: Object.keys(curriculum[e.target.value] || {})[0]})} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer">
                {Object.keys(curriculum).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Semester</label>
                <select value={formData.currentSem} onChange={e => setFormData({...formData, currentSem: e.target.value})} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white cursor-pointer">
                  {(formData.classStr && curriculum[formData.classStr] ? Object.keys(curriculum[formData.classStr]) : []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Section</label>
                <input type="text" required value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="e.g. A" className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button type="submit" className="w-full sm:w-auto bg-[#003366] text-white px-8 py-2.5 text-sm font-semibold rounded shadow hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Enlist Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDataManagement;