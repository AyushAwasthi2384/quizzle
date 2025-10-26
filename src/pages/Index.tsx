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
