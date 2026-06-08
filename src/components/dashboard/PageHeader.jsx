function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          <span>Admin</span>
          <span className="opacity-30">/</span>
          <span className="text-slate-600 dark:text-slate-400">{title}</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}


export default PageHeader;

