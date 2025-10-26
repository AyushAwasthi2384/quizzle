import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getOptionStyle, calculatePoints } from '@/lib/quizUtils';
import Countdown from '@/components/quiz/Countdown';
import { Check } from 'lucide-react';

const ParticipantPlay = () => {
  const { quizId, participantId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [delayComplete, setDelayComplete] = useState(false);
  const [answerId, setAnswerId] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId || !participantId) return;

    const fetchData = async () => {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizData) {
        setQuiz(quizData);

        if (quizData.status === 'finished') {
          navigate(`/play/results/${quizId}/${participantId}`);
          return;
        }

        // Fetch current question
        const { data: questions } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index');

        if (questions && questions.length > 0) {
          const currentIndex = quizData.current_question_index || 0;
          setCurrentQuestion(questions[currentIndex]);
          setDelayComplete(false);
          setSelectedOption(null);
          setSubmitted(false);
          setAnswerId(null);
          
          // Start 5-second delay
          setTimeout(() => {
            setDelayComplete(true);
            setStartTime(Date.now());
          }, 5000);
        }
      }

      const { data: participantData } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (participantData) setParticipant(participantData);
    };

    fetchData();

    // Subscribe to quiz updates
    const channel = supabase
      .channel('quiz-updates-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quizzes',
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          if (payload.new.status === 'finished') {
            navigate(`/play/results/${quizId}/${participantId}`);
          } else {
            // Reload page when question changes
            window.location.reload();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId, participantId, navigate]);

  const handleAnswer = async (optionIndex: number) => {
    if (submitted) return;

    setSelectedOption(optionIndex);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = optionIndex === currentQuestion.correct_option_index;
    const points = calculatePoints(isCorrect, timeTaken, quiz?.time_per_question || 30);

    // Save or update answer
    if (answerId) {
      // Update existing answer
      await supabase
        .from('answers')
        .update({
          selected_option_index: optionIndex,
          time_taken: timeTaken,
          points_earned: points,
        })
        .eq('id', answerId);
    } else {
      // Insert new answer
      const { data } = await supabase
        .from('answers')
        .insert({
          participant_id: participantId,
          question_id: currentQuestion.id,
          selected_option_index: optionIndex,
          time_taken: timeTaken,
          points_earned: points,
        })
        .select()
        .single();
      
      if (data) setAnswerId(data.id);
    }

    // Update participant score
    const newScore = (participant?.score || 0) - (participant?.lastQuestionPoints || 0) + points;
    await supabase
      .from('participants')
      .update({ score: newScore })
      .eq('id', participantId);
    
    setParticipant({ ...participant, score: newScore, lastQuestionPoints: points });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleTimeUp = () => {
    if (!submitted) {
      setSubmitted(true);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/20 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {participant?.display_name}
          </div>
          <div className="text-2xl font-bold">Score: {participant?.score || 0}</div>
        </Card>

        {/* Delay Message or Timer */}
        {!delayComplete ? (
          <Card className="p-8 text-center bg-gradient-to-br from-secondary/10 to-primary/10">
            <h3 className="text-2xl font-bold mb-2">Get Ready!</h3>
            <p className="text-muted-foreground">Question starting in a moment...</p>
          </Card>
        ) : !submitted && (
          <div className="max-w-md mx-auto">
            <Countdown
              totalSeconds={quiz?.time_per_question || 30}
              onComplete={handleTimeUp}
            />
          </div>
        )}

        {/* Answer Buttons */}
        {submitted ? (
          <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-3xl font-bold mb-2">Answer Submitted!</h2>
            <p className="text-muted-foreground">
              Waiting for others to answer...
            </p>
          </Card>
        ) : delayComplete ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((index) => {
                const style = getOptionStyle(index);
                const isSelected = selectedOption === index;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`h-32 text-2xl font-bold ${style.bgClass} hover:opacity-80 transition-all hover:scale-105 active:scale-95 ${
                      isSelected ? 'ring-4 ring-white ring-offset-2' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">{style.icon}</div>
                      <div>{style.name}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            {selectedOption !== null && !submitted && (
              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="w-5 h-5 mr-2" />
                Submit Answer
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
            {[0, 1, 2, 3].map((index) => {
              const style = getOptionStyle(index);
              return (
                <div
                  key={index}
                  className={`h-32 rounded-lg ${style.bgClass} flex items-center justify-center`}
                >
                  <div className="flex flex-col items-center gap-2 text-white">
                    <div className="text-4xl">{style.icon}</div>
                    <div className="text-2xl font-bold">{style.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantPlay;
