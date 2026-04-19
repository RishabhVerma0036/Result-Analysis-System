import { LogOut } from "lucide-react";

const Topbar = ({ user, onLogout }) => (
  <header className="bg-[#034da2] text-white shadow-sm h-14 flex items-center justify-between px-6 z-10 shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white text-[#003366] font-bold flex items-center justify-center rounded-3xl">
        <img src="https://scontent.fdel11-2.fna.fbcdn.net/v/t39.30808-6/450968149_899666258859148_3807760969516313790_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=qwp58RBub6EQ7kNvwF0-e_n&_nc_oc=Adpcv2DKPzecldqZmsWZVYsToGySSl3DW-w9m4Jbq5UVIIvvKZS9I92jWxYtpsMOiLTHnmSq1IRaGHjMUBS5vnEI&_nc_zt=23&_nc_ht=scontent.fdel11-2.fna&_nc_gid=izNS2faqTKXYy19z3cTSGA&_nc_ss=7a389&oh=00_Af3wqqZhkg2vqB1BwkE1vRRjaBJSi-mjYmE1OA6uIz2Auw&oe=69EA54D7" alt="jims logo" />
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
