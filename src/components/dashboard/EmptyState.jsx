function EmptyState({ title, message, icon: Icon, action }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/5 dark:bg-[#1A1A22] dark:shadow-2xl">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-200 shadow-inner dark:bg-white/[0.02] dark:text-slate-600 dark:ring-white/5">
        {Icon ? <Icon className="h-10 w-10" /> : <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/5" />}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-500">{message}</p>
      
      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;


