import { User } from "lucide-react";

const StudentProfile = ({ student, user }) => {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-gray-300 pb-2">
        <h2 className="text-xl font-semibold text-gray-800">Student Record</h2>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="bg-gray-50 border-r border-gray-200 p-8 flex flex-col items-center justify-center min-w-[240px]">
          <div className="w-28 h-28 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm">
            <User className="w-12 h-12" />
          </div>
          <p className="font-bold text-lg text-gray-800 text-center mb-1">{user?.name || student.name}</p>
          <p className="text-xs text-gray-500 font-medium bg-gray-200/80 px-3 py-1 rounded-full border border-gray-300/50">
            {user?.email || student.email}
          </p>
        </div>
        
        <div className="p-6 sm:p-8 flex-1 text-sm">
          <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-5 uppercase tracking-wide text-xs">Academic Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            <div>
              <span className="text-gray-500 block text-xs font-semibold uppercase mb-1.5">Class/Major</span>
              <p className="font-medium text-gray-800">{student.class}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs font-semibold uppercase mb-1.5">Current Semester</span>
              <p className="font-medium text-gray-800">Semester {student.currentSem}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs font-semibold uppercase mb-1.5">Section</span>
              <p className="font-medium text-gray-800">{student.section}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-xs font-semibold uppercase mb-1.5">Enrollment No.</span>
              <p className="font-medium text-gray-800">{student.roll}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
