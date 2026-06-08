function FilterBar({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22] ${className}`}>
      <div className="grid gap-3 lg:grid-cols-12">{children}</div>
    </div>
  );
}

export default FilterBar;

