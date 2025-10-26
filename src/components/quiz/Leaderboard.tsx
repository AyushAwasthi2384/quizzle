import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  previousRank?: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  showTop?: number;
  showMovement?: boolean;
}

const Leaderboard = ({ entries, showTop = 10, showMovement = true }: LeaderboardProps) => {
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);
  const displayEntries = sortedEntries.slice(0, showTop);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getMovementIcon = (currentRank: number, previousRank?: number) => {
    if (!previousRank || !showMovement) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (currentRank < previousRank) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (currentRank > previousRank) return <ArrowDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 animate-fade-in">
      {displayEntries.map((entry, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;

        return (
          <Card
            key={entry.id}
            className={`p-4 transition-all duration-300 animate-slide-up ${
              isTopThree ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 min-w-[60px]">
                  {getRankIcon(rank) || (
                    <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
                  )}
                  {getMovementIcon(rank, entry.previousRank)}
                </div>
                <span className={`font-semibold truncate ${isTopThree ? 'text-lg' : ''}`}>
                  {entry.name}
                </span>
              </div>
              <div className={`font-bold ${isTopThree ? 'text-xl' : 'text-lg'}`}>
                {entry.score.toLocaleString()}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default Leaderboard;
