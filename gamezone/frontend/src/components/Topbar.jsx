const Topbar = ({ title, children }) => {
  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between gap-3">
      {/* On mobile, offset title to the right so it doesn't sit under the hamburger button */}
      <h2 className="text-xl font-semibold text-textMain pl-10 md:pl-0 truncate">{title}</h2>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {children}
        </div>
      )}
    </header>
  );
};

export default Topbar;
