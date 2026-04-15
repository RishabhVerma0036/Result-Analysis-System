import { LogOut } from "lucide-react";

const Topbar = ({ user, onLogout }) => (
  <header className="bg-[#034da2] text-white shadow-sm h-14 flex items-center justify-between px-6 z-10 shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white text-[#003366] font-bold flex items-center justify-center rounded-sm">
        <img src="https://saraladmission.com/wp-content/uploads/2025/05/Jagannath-Institute-of-Management-Sciences-JIMS-Rohini-LOGO.png" alt="jims logo" />
      </div>
      <h1 className="text-lg font-semibold tracking-wide hidden sm:block">Result Analysis System</h1>
    </div>
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="text-right">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
      </div>
      <button onClick={onLogout} className="p-1.5 hover:bg-blue-800 rounded transition-colors" title="Log out">
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </header>
);

export default Topbar;
