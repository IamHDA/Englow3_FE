const stats = [
  { value: "150K+", label: "Active Learners", accent: true },
  { value: "98.4%", label: "Band Score Gain", accent: false },
  { value: "4.9 / 5", label: "User Rating", accent: true },
] as const;

export function LearnerStats() {
  return (
    <section aria-label="Englow3 in numbers" className="w-full lg:w-[600px]">
      <div className="h-[3px] w-full rounded-[2px] bg-slate-200/95" />

      <dl className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-5 py-2 lg:flex-nowrap lg:gap-x-20 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="whitespace-nowrap font-bold">
            <dt
              className={`text-[26px] leading-tight ${
                stat.accent ? "text-amber-600" : "text-black"
              }`}
            >
              {stat.value}
            </dt>
            <dd className="text-[15px] leading-normal text-black">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
