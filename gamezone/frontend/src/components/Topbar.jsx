const Topbar = ({ title, children }) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-textMain">{title}</h2>
      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
};

export default Topbar;
