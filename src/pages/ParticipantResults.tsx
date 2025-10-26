import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import Leaderboard from '@/components/quiz/Leaderboard';
import Confetti from '@/components/quiz/Confetti';
import { Home, Trophy } from 'lucide-react';

const ParticipantResults = () => {
  const { quizId, participantId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || !participantId) return;

    const fetchData = async () => {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizData) setQuiz(quizData);

      const { data: participantData } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (participantData) setParticipant(participantData);

      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });

      if (participantsData) {
        const leaderboard = participantsData.map(p => ({
          id: p.id,
          name: p.display_name,
          score: p.score,
        }));
        setParticipants(leaderboard);

        const userRank = leaderboard.findIndex(p => p.id === participantId) + 1;
        setRank(userRank);
      }

      setLoading(false);
    };

    fetchData();
  }, [quizId, participantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold text-primary">Loading results...</div>
      </div>
    );
  }

  const isWinner = rank <= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/20 p-6">
      {isWinner && <Confetti />}
      
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <Card className={`p-8 text-center ${isWinner ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary' : ''}`}>
          {isWinner && <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce-in" />}
          <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-xl text-muted-foreground">{quiz?.title}</p>
        </Card>

        {/* Your Stats */}
        <Card className="p-8 text-center bg-gradient-to-r from-secondary/10 to-primary/10">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Your Name</div>
              <div className="text-3xl font-bold text-primary">{participant?.display_name}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Your Rank</div>
                <div className="text-5xl font-bold text-accent">#{rank}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your Score</div>
                <div className="text-5xl font-bold text-secondary">{participant?.score}</div>
              </div>
            </div>
            {isWinner && (
              <div className="text-xl font-semibold text-primary animate-pulse">
                🎉 Congratulations! You're in the top 3! 🎉
              </div>
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">Final Leaderboard</h2>
          <Leaderboard entries={participants} showTop={10} showMovement={false} />
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')} size="lg" variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantResults;
