// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { useNavigate } from 'react-router-dom';
// import { Sparkles, Users } from 'lucide-react';

// const Index = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex flex-col">
//       {/* Header */}
//       <header className="p-6">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Sparkles className="w-8 h-8 text-primary" />
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               QuizMaster
//             </h1>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <main className="flex-1 flex items-center justify-center p-6">
//         <div className="max-w-4xl w-full space-y-12 animate-fade-in">
//           {/* Title */}
//           <div className="text-center space-y-4">
//             <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-scale-in">
//               Live Quiz Platform
//             </h2>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               Host interactive quizzes for events, classrooms, or competitions. Engage your audience with real-time questions and instant leaderboards!
//             </p>
//           </div>

//           {/* Action Cards */}
//           <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
//             <Card
//               className="p-8 hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-primary"
//               onClick={() => navigate('/host/create')}
//             >
//               <div className="space-y-4">
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold">Host a Quiz</h3>
//                 <p className="text-muted-foreground">
//                   Create and host your own quiz with custom questions. Perfect for events, classrooms, and team building!
//                 </p>
//                 <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90">
//                   Create Quiz
//                 </Button>
//               </div>
//             </Card>

//             <Card
//               className="p-8 hover:shadow-2xl transition-all cursor-pointer group border-2 hover:border-secondary"
//               onClick={() => navigate('/join')}
//             >
//               <div className="space-y-4">
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center group-hover:scale-110 transition-transform">
//                   <Users className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold">Join a Quiz</h3>
//                 <p className="text-muted-foreground">
//                   Enter a PIN to join an ongoing quiz. Answer questions and compete for the top spot on the leaderboard!
//                 </p>
//                 <Button className="w-full mt-4 bg-gradient-to-r from-secondary to-primary hover:opacity-90">
//                   Join Quiz
//                 </Button>
//               </div>
//             </Card>
//           </div>

//           {/* Features */}
//           <div className="grid md:grid-cols-3 gap-6 text-center">
//             <div className="space-y-2">
//               <div className="text-4xl font-bold text-primary">Real-time</div>
//               <p className="text-sm text-muted-foreground">Live updates and instant feedback</p>
//             </div>
//             <div className="space-y-2">
//               <div className="text-4xl font-bold text-accent">Engaging</div>
//               <p className="text-sm text-muted-foreground">Fun colors and shapes system</p>
//             </div>
//             <div className="space-y-2">
//               <div className="text-4xl font-bold text-secondary">Competitive</div>
//               <p className="text-sm text-muted-foreground">Speed-based scoring and leaderboards</p>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="p-6 text-center text-sm text-muted-foreground">
//         <p>© 2024 QuizMaster. Perfect for events, festivals, and competitions.</p>
//       </footer>
//     </div>
//   );
// };

// export default Index;



import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 text-white">
        
        {/* Host Panel (Left) */}
        <div
          className="group relative flex flex-col justify-center items-center text-center p-12 bg-purple-700 hover:bg-purple-800 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/host/create')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <Sparkles className="w-24 h-24 text-yellow-300 transition-transform duration-300 group-hover:scale-110" />
            <h1 className="text-6xl font-extrabold text-shadow-lg tracking-tight">
              QUIZZLE
            </h1>
            <p className="text-xl text-purple-200 max-w-sm">
              Create, host, and play. The ultimate live quiz platform.
            </p>
            <Button
              size="lg"
              className="w-full max-w-xs text-lg font-bold bg-yellow-400 text-purple-900 hover:bg-yellow-300 group-hover:scale-105 transition-transform duration-300"
            >
              Host a Quiz
            </Button>
          </div>
        </div>

        {/* Join Panel (Right) */}
        <div
          className="group relative flex flex-col justify-center items-center text-center p-12 bg-teal-600 hover:bg-teal-700 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/join')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <Users className="w-24 h-24 text-teal-100 transition-transform duration-300 group-hover:scale-110" />
            <h1 className="text-5xl font-bold text-shadow-lg">
              Join a Game
            </h1>
            <p className="text-xl text-teal-100 max-w-sm">
              Got a Game PIN? Jump in and compete for the top spot!
            </p>
            <Button
              size="lg"
              className="w-full max-w-xs text-lg font-bold bg-white text-teal-900 hover:bg-gray-100 group-hover:scale-105 transition-transform duration-300"
            >
              Join Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-300 bg-black/10 backdrop-blur-sm z-20">
        © 2024 QUIZZLE. All rights reserved. by Ayush Awasthi
      </footer>
    </div>
  );
};

export default Index;
