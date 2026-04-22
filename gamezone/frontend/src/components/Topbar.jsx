const Topbar = ({ title, children }) => {
  return (
    <header className="topbar bg-card border-b border-border flex items-center justify-between gap-3 px-4 md:px-6">
      {/* Mobile: title is absolutely centered. Desktop: normal left-aligned flow */}
      <h2 className="
        absolute left-1/2 -translate-x-1/2
        text-base font-semibold text-textMain truncate max-w-[55%]
        md:static md:left-auto md:translate-x-0 md:text-xl md:max-w-none
      ">
        {title}
      </h2>

      {/* Invisible spacer pushes children to the right on mobile */}
      <div className="flex-1 md:hidden" />

      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
    </header>
  );
};

export default Topbar;
