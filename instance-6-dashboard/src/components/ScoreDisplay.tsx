export default function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-score-good border-score-good" :
    score >= 40 ? "text-score-medium border-score-medium" :
    "text-score-bad border-score-bad";

  const bgColor =
    score >= 70 ? "bg-green-50" :
    score >= 40 ? "bg-amber-50" :
    "bg-red-50";

  return (
    <div className={`inline-flex flex-col items-center rounded-2xl border-4 ${color} ${bgColor} px-10 py-8`}>
      <span className={`text-6xl font-bold ${color.split(" ")[0]}`}>{score}</span>
      <span className="mt-1 text-sm font-medium text-text-secondary uppercase tracking-wider">
        Reputation Score
      </span>
      <span className="text-xs text-text-secondary mt-1">out of 100</span>
    </div>
  );
}
