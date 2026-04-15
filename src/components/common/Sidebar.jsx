const Sidebar = ({ menuItems, activeTab, setActiveTab }) => (
  <aside className="w-16 sm:w-60 bg-gray-100 border-r border-gray-300 flex flex-col shrink-0">
    <nav className="flex-1 py-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-center sm:justify-start gap-3 px-0 sm:px-6 py-3 text-sm transition-colors border-l-4 ${
              isActive 
                ? 'bg-white border-[#003366] text-[#003366] font-semibold shadow-sm' 
                : 'border-transparent text-gray-700 hover:bg-gray-200'
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);

export default Sidebar;
