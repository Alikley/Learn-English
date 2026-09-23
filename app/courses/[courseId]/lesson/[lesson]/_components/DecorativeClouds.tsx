// ========================================
// ابرهای نرم تزئینی پس‌زمینهٔ صفحهٔ درس
// (از صفحهٔ درس تفکیک شد — v1.0.2.7 ریفکتوری گام ۲)
// ========================================

export default function DecorativeClouds() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute top-24 -left-16 w-64 h-64 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute top-[42%] right-[12%] w-40 h-40 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute bottom-[18%] -left-10 w-72 h-72 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute -bottom-20 right-[28%] w-80 h-80 rounded-full bg-white/35 blur-3xl" />
      <div className="absolute top-[64%] left-[38%] w-24 h-24 rounded-full bg-white/20 blur-2xl" />
    </div>
  );
}
