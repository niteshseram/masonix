export function Logo({
  size,
}: Readonly<{
  size?: number;
}>) {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        width={size ?? 20}
        height={size ?? 20}
        aria-hidden="true"
      >
        <rect x="1" y="2" width="8" height="15" rx="2" fill="#2563eb" />
        <rect x="1" y="19" width="8" height="9" rx="2" fill="#60a5fa" />
        <rect x="12" y="2" width="8" height="8" rx="2" fill="#93c5fd" />
        <rect x="12" y="12" width="8" height="16" rx="2" fill="#3b82f6" />
        <rect x="23" y="2" width="8" height="11" rx="2" fill="#60a5fa" />
        <rect x="23" y="15" width="8" height="13" rx="2" fill="#bfdbfe" />
      </svg>
      <span className="font-mono text-sm font-bold text-zinc-100">masonix</span>
    </div>
  );
}
