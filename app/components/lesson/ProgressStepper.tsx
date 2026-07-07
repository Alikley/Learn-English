"use client";

type Props = {
  sections: string[];
  currentIndex: number;
};

export default function ProgressStepper({ sections, currentIndex }: Props) {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      {sections.map((label, index) => {
        const active = index === currentIndex;
        const done = index < currentIndex;

        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }
              `}
            >
              {done ? "✓" : index + 1}
            </div>

            {index !== sections.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  index < currentIndex ? "bg-green-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
