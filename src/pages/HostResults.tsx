// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { supabase } from '@/integrations/supabase/client';
// import Leaderboard from '@/components/quiz/Leaderboard';
// import Confetti from '@/components/quiz/Confetti';
// import { Home, Trophy } from 'lucide-react';

// const HostResults = () => {
//   const { quizId } = useParams();
//   const navigate = useNavigate();
//   const [quiz, setQuiz] = useState<any>(null);
//   const [participants, setParticipants] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!quizId) return;

//     const fetchData = async () => {
//       const { data: quizData } = await supabase
//         .from('quizzes')
//         .select('*')
//         .eq('id', quizId)
//         .single();

//       if (quizData) setQuiz(quizData);

//       const { data: participantsData } = await supabase
//         .from('participants')
//         .select('*')
//         .eq('quiz_id', quizId)
//         .order('score', { ascending: false });

//       if (participantsData) {
//         const leaderboard = participantsData.map(p => ({
//           id: p.id,
//           name: p.display_name,
//           score: p.score,
//         }));
//         setParticipants(leaderboard);
//       }

//       setLoading(false);
//     };

//     fetchData();
//   }, [quizId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-pulse text-2xl font-bold text-primary">Loading results...</div>
//       </div>
//     );
//   }

//   const topThree = participants.slice(0, 3);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
//       <Confetti />
      
//       <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
//         {/* Header */}
//         <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary">
//           <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce-in" />
//           <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//             Quiz Complete!
//           </h1>
//           <p className="text-xl text-muted-foreground">{quiz?.title}</p>
//           <div className="mt-4 text-sm text-muted-foreground">
//             {participants.length} participants competed
//           </div>
//         </Card>

//         {/* Podium */}
//         {topThree.length > 0 && (
//           <div className="grid md:grid-cols-3 gap-6">
//             {/* 2nd Place */}
//             {topThree[1] && (
//               <Card className="p-6 text-center order-1 md:order-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
//                 <div className="text-6xl mb-2">🥈</div>
//                 <div className="text-2xl font-bold mb-1">{topThree[1].name}</div>
//                 <div className="text-3xl font-bold text-secondary">{topThree[1].score}</div>
//               </Card>
//             )}

//             {/* 1st Place */}
//             {topThree[0] && (
//               <Card className="p-8 text-center order-0 md:order-2 border-4 border-primary bg-gradient-to-br from-primary/10 to-accent/10 animate-scale-in">
//                 <div className="text-8xl mb-3">🏆</div>
//                 <div className="text-3xl font-bold mb-2">{topThree[0].name}</div>
//                 <div className="text-4xl font-bold text-primary">{topThree[0].score}</div>
//               </Card>
//             )}

//             {/* 3rd Place */}
//             {topThree[2] && (
//               <Card className="p-6 text-center order-2 md:order-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
//                 <div className="text-6xl mb-2">🥉</div>
//                 <div className="text-2xl font-bold mb-1">{topThree[2].name}</div>
//                 <div className="text-3xl font-bold text-accent">{topThree[2].score}</div>
//               </Card>
//             )}
//           </div>
//         )}

//         {/* Full Leaderboard */}
//         <div>
//           <h2 className="text-2xl font-bold mb-4 text-center">Final Leaderboard</h2>
//           <Leaderboard entries={participants} showTop={participants.length} showMovement={false} />
//         </div>

//         {/* Actions */}
//         <div className="flex gap-4 justify-center">
//           <Button onClick={() => navigate('/')} size="lg" variant="outline">
//             <Home className="w-4 h-4 mr-2" />
//             Back to Home
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HostResults;



import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import Leaderboard from '@/components/quiz/Leaderboard';
import Confetti from '@/components/quiz/Confetti'; // Assuming you have this
import { Home, Trophy } from 'lucide-react';

const HostResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for staged animations
  const [visibleWinners, setVisibleWinners] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const topThree = participants.slice(0, 3);

  useEffect(() => {
    if (!quizId) return;

    const fetchData = async () => {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizData) setQuiz(quizData);

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
      }

      setLoading(false);
    };

    fetchData();
  }, [quizId]);

  // Staged animation effect
  useEffect(() => {
    if (loading || topThree.length === 0) return;

    const timers = [
      // Show 3rd place (index 2)
      setTimeout(() => {
        setVisibleWinners(prev => [...prev, 2]);
      }, 500), // 0.5s delay

      // Show 2nd place (index 1)
      setTimeout(() => {
        setVisibleWinners(prev => [...prev, 1]);
      }, 3000), // 2.0s delay

      // Show 1st place (index 0)
      setTimeout(() => {
        setVisibleWinners(prev => [...prev, 0]);
      }, 6000), // 3.5s delay
      
      // Show full leaderboard
      setTimeout(() => {
        setShowLeaderboard(true);
      }, 7000), // 5.0s delay
    ];

    return () => timers.forEach(clearTimeout);
  }, [loading, topThree.length]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-bold text-primary">Calculating results...</div>
      </div>
    );
  }

  // Helper to get animation classes
  const getPodiumClasses = (index) => {
    const isVisible = visibleWinners.includes(index);
    let baseClasses = 'transition-all duration-1000 transform flex flex-col justify-center';

    if (index === 0) { // 1st Place
      baseClasses += ' ease-[cubic-bezier(0.25,1.5,0.5,1)]'; // Bouncy
      return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`;
    }
    
    // 2nd & 3rd Place
    baseClasses += ' ease-out';
    return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;
  };

  return (
    <div className="min-h-screen bg-background p-6 overflow-hidden">
      <Confetti />
      
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <Card className="p-8 text-center bg-card shadow-xl">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h1 className="text-5xl font-bold mb-2 bg-primary bg-clip-text text-transparent">
            Quiz Complete!
          </h1>
          <p className="text-xl text-muted-foreground">{quiz?.title}</p>
        </Card>

        {/* Podium */}
        {topThree.length > 0 && (
          <div className="flex justify-center items-end gap-4 h-[450px] md:h-[400px]">
            {/* 2nd Place */}
            <div className={getPodiumClasses(1)}>
              {topThree[1] && (
                <Card className="p-6 text-center w-52 md:w-64 h-72 bg-card shadow-lg">
                  <div className="text-8xl mb-4">🥈</div>
                  <div className="text-2xl font-bold mb-1 truncate" title={topThree[1].name}>{topThree[1].name}</div>
                  <div className="text-3xl font-bold text-secondary">{topThree[1].score}</div>
                </Card>
              )}
            </div>

            {/* 1st Place */}
            <div className={getPodiumClasses(0)}>
              {topThree[0] && (
                <Card className="p-8 text-center w-60 md:w-72 h-80 border-4 border-primary bg-card shadow-2xl z-10">
                  <div className="text-9xl mb-4">🏆</div>
                  <div className="text-3xl font-bold mb-2 truncate" title={topThree[0].name}>{topThree[0].name}</div>
                  <div className="text-4xl font-bold text-primary">{topThree[0].score}</div>
                </Card>
              )}
            </div>

            {/* 3rd Place */}
            <div className={getPodiumClasses(2)}>
              {topThree[2] && (
                <Card className="p-6 text-center w-52 md:w-64 h-64 bg-card shadow-lg">
                  <div className="text-8xl mb-4">🥉</div>
                  <div className="text-2xl font-bold mb-1 truncate" title={topThree[2].name}>{topThree[2].name}</div>
                  <div className="text-3xl font-bold text-accent">{topThree[2].score}</div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className={`transition-opacity duration-1000 ${showLeaderboard ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Final Leaderboard</h2>
          <Leaderboard entries={participants} showTop={participants.length} showMovement={false} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pt-8">
          <Button onClick={() => navigate('/')} size="lg" variant="outline" className="text-lg">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostResults;
