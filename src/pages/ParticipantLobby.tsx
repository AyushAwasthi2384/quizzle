import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock } from 'lucide-react';

const ParticipantLobby = () => {
  const { quizId, participantId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);

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

      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quizId);

      setParticipantCount(count || 0);
    };

    fetchData();

    // Subscribe to quiz status changes
    const channel = supabase
      .channel('quiz-status-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quizzes',
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          if (payload.new.status === 'playing') {
            navigate(`/play/${quizId}/${participantId}`);
          }
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel('participants-count-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `quiz_id=eq.${quizId}`,
        },
        async () => {
          const { count } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quizId);
          setParticipantCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(participantsChannel);
    };
  }, [quizId, participantId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/20 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-12 text-center space-y-8 animate-pulse">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{quiz?.title}</h1>
          {quiz?.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-lg">
            Welcome, <span className="font-bold text-primary">{participant?.display_name}</span>!
          </div>

          <Card className="p-6 bg-gradient-to-r from-secondary/10 to-primary/10">
            <Users className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <div className="text-sm text-muted-foreground">Players Joined</div>
            <div className="text-3xl font-bold text-secondary">{participantCount}</div>
          </Card>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5 animate-spin" />
            <span>Waiting for host to start...</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParticipantLobby;
