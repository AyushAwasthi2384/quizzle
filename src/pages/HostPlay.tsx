import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
// import Countdown from '@/components/quiz/Countdown'; // This component is embedded below
import Leaderboard from '@/components/quiz/Leaderboard';
import { Check, X, Users, Triangle, Square, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress'; // Added Progress import

// --- Countdown Component (Embedded) ---
// This is the small countdown component suitable for the header
interface CountdownProps {
  totalSeconds: number;
  onComplete: () => void;
  isPaused: boolean; 
}

const Countdown = ({ totalSeconds, onComplete, isPaused }: CountdownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  // Reset timer when totalSeconds changes (new question)
  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      // onComplete(); // onComplete is called by the interval
      return;
    }

    // Do nothing if paused
    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(); // Ensure onComplete is called
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete, isPaused]);

  const progress = (secondsLeft / totalSeconds) * 100;
  const isLowTime = secondsLeft <= 5;

  return (
    <div className="w-full space-y-2 animate-fade-in text-right">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
        <span className={`text-2xl font-bold ${isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}`}>
          {secondsLeft}s
        </span>
      </div>
      <Progress 
        value={progress} 
        className={`h-3 transition-all ${isLowTime ? 'bg-destructive/20 [&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
      />
    </div>
  );
};
// --- End Countdown Component ---


// --- Helper Function for Option Styles ---
const getOptionStyle = (index) => {
  switch (index) {
    case 0:
      return {
        name: 'Triangle',
        icon: <Circle className="w-10 h-10" />,
        bgClass: 'bg-[hsl(var(--quiz-red))]',
        textClass: 'text-white',
      };
    case 1:
      return {
        name: 'Square',
        icon: <Triangle className="w-10 h-10" />,
        bgClass: 'bg-[hsl(var(--quiz-blue))]',
        textClass: 'text-white',
      };
    case 2:
      return {
        name: 'Circle',
        icon: <Square className="w-10 h-10" />,
        bgClass: 'bg-[hsl(var(--quiz-yellow))]',
        textClass: 'text-gray-900', // Yellow needs dark text
      };
    case 3:
      return {
        name: 'Square', // Kahoot uses a square for green too
        icon: <Square className="w-10 h-10 transform rotate-45" />,
        bgClass: 'bg-[hsl(var(--quiz-green))]',
        textClass: 'text-white',
      };
    default:
      return {
        name: 'Option',
        icon: null,
        bgClass: 'bg-muted',
        textClass: 'text-foreground',
      };
  }
};
// --- End Helper ---


const HostPlay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [delayComplete, setDelayComplete] = useState(false);

  // ... (useEffect for fetchData) ...
  useEffect(() => {
    if (!quizId) return;

    const fetchData = async () => {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizData) {
        setQuiz(quizData);
        setCurrentIndex(quizData.current_question_index || 0);
      }

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsData) {
        setQuestions(questionsData);
      }

      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quizId);

      setTotalParticipants(count || 0);
    };

    fetchData();
  }, [quizId]);

  // ... (useEffect for question/options/subscriptions) ...
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const question = questions[currentIndex];
      setCurrentQuestion(question);
      setShowResults(false);
      setTimeUp(false);
      setShowLeaderboard(false);
      setDelayComplete(false);
      
      // Start 5-second "get ready" delay
      const delayTimer = setTimeout(() => {
        setDelayComplete(true);
      }, 5000);

      const fetchOptions = async () => {
        const { data } = await supabase
          .from('options')
          .select('*')
          .eq('question_id', question.id)
          .order('order_index');

        if (data) setOptions(data);
      };

      fetchOptions();

      const fetchAnsweredCount = async () => {
        const { count } = await supabase
          .from('answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', question.id);
        setAnsweredCount(count || 0);
      };
      
      fetchAnsweredCount();

      // Subscribe to answers
      const channel = supabase
        .channel(`answers-${question.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'answers',
            filter: `question_id=eq.${question.id}`,
          },
          (payload) => {
            // Increment count manually is faster than re-fetching
            setAnsweredCount((prevCount) => prevCount + 1);
          }
        )
        .subscribe();


      return () => {
        supabase.removeChannel(channel);
        clearTimeout(delayTimer);
      };
    }
  }, [currentIndex, questions]);

  // ... (handleTimeUp) ...
  const handleTimeUp = useCallback(async () => {
    if (timeUp) return; // Prevent multiple calls
    setTimeUp(true);
    setShowResults(true);
    
    // Fetch leaderboard data
    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false });
    
    setLeaderboardData(participants || []);
    
    // Automatically show leaderboard after 3 seconds
    setTimeout(() => {
      setShowLeaderboard(true);
    }, 3000);
  }, [quizId, timeUp]);

  // ... (useEffect for all answered) ...
  useEffect(() => {
    if (answeredCount > 0 && answeredCount === totalParticipants && !timeUp) {
      handleTimeUp();
    }
  }, [answeredCount, totalParticipants, timeUp, handleTimeUp]);

  // ... (handleShowLeaderboard) ...
  const handleShowLeaderboard = useCallback(async () => {
    // This button is a manual override in case auto-transition fails
    if (leaderboardData.length === 0) {
      const { data: participants } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });
      setLeaderboardData(participants || []);
    }
    setShowLeaderboard(true);
  }, [quizId, leaderboardData]);

  // ... (handleNext) ...
  const handleNext = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnsweredCount(0); // Reset for next question

      await supabase
        .from('quizzes')
        .update({ current_question_index: nextIndex })
        .eq('id', quizId);
    } else {
      // Quiz finished
      await supabase
        .from('quizzes')
        .update({ status: 'finished' })
        .eq('id', quizId);

      navigate(`/host/results/${quizId}`);
    }
  }, [currentIndex, questions.length, quizId, navigate]);


  // --- RENDER LOGIC ---

  if (!currentQuestion || options.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-bold text-primary">Loading question...</div>
      </div>
    );
  }

  // --- LEADERBOARD VIEW ---
  if (showLeaderboard) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <header className="w-full bg-card shadow-lg z-10 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
          <div className="text-right">
            <div className="text-lg font-semibold">{quiz?.title}</div>
            <div className="text-sm text-muted-foreground">After Question {currentIndex + 1}</div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
          <Leaderboard 
            entries={leaderboardData.map(p => ({
              id: p.id,
              name: p.display_name,
              score: p.score
            }))}
            showTop={10}
            showMovement={false} // Movement is complex, skipping for now
          />
        </main>
        
        {/* Footer */}
        <footer className="w-full bg-card/80 backdrop-blur-sm shadow-inner p-4 z-10 flex justify-end">
          <Button
            onClick={handleNext}
            size="lg"
            className="text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Results'}
          </Button>
        </footer>
      </div>
    );
  }

  // --- QUESTION VIEW ---
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="w-full bg-card shadow-lg z-10 p-4 grid grid-cols-3 items-center">
        {/* Left: Question Count */}
        <div className="text-left">
          <div className="text-lg font-bold text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        
        {/* Center: Answer Count */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-3xl font-bold text-primary">
              {answeredCount} / {totalParticipants}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">Answers</div>
        </div>
        
        {/* Right: Time (MOVED) */}
        <div className="text-right w-full"> {/* Added fixed width to prevent layout shift */}
          {!delayComplete ? (
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground mb-1">Get Ready...</div>
              <div className="text-3xl font-extrabold text-muted-foreground animate-pulse">
                ...
              </div>
            </div>
          ) : showResults || timeUp ? (
             <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground mb-1">Time's Up!</div>
              <div className="text-3xl font-extrabold text-destructive">
                0s
              </div>
            </div>
          ) : (
            <Countdown
              totalSeconds={quiz?.time_per_question || 30}
              onComplete={handleTimeUp}
              isPaused={showResults || timeUp} 
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 max-w-5xl text-foreground">
          {currentQuestion.text}
        </h1>

        {/* Timer / Status (REMOVED FROM HERE) */}
        {/* <div className="h-24 flex items-center justify-center mb-8"> ... </div> */}

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl mt-8"> {/* Added margin-top */}
          {options.map((option, index) => {
            const style = getOptionStyle(index);
            const isCorrect = index === currentQuestion.correct_option_index;

            return (
              <Card
                key={option.id}
                className={`relative p-6 transition-all duration-300 rounded-lg shadow-xl
                  flex items-center gap-6 min-h-[120px]
                  ${style.bgClass} ${style.textClass}
                  ${showResults && !isCorrect ? 'opacity-30' : 'opacity-100'}
                  ${showResults && isCorrect ? 'ring-4 ring-white shadow-2xl scale-105' : ''}
                `}
              >
                {/* Shape Icon */}
                <div className="flex-shrink-0 text-6xl">
                  {style.icon}
                </div>
                
                {/* Text */}
                <span className="text-3xl font-bold">{option.text}</span>

                {/* Result Badge */}
                {showResults && isCorrect && (
                  <div className="absolute top-[-15px] right-4 bg-white text-green-600 px-4 py-1 rounded-full text-lg font-bold shadow-lg">
                    <Check className="inline w-5 h-5 mr-1" />
                    Correct
                  </div>
                )}
                {showResults && !isCorrect && (
                   <div className="absolute top-4 right-4 bg-black/20 p-2 rounded-full">
                    <X className="w-8 h-8 text-white/70" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-card/80 backdrop-blur-sm shadow-inner p-4 z-10 flex justify-between items-center">
        <div className="text-lg font-bold text-muted-foreground">
          {quiz?.title}
        </div>
        
        {(showResults || timeUp) && (
          <Button
            onClick={handleShowLeaderboard}
            size="lg"
            className="text-lg font-bold animate-bounce-in bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            Show Leaderboard
          </Button>
        )}
      </footer>
    </div>
  );
};

export default HostPlay;

