import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Join = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!pin.trim() || !displayName.trim()) {
      toast({ title: 'Error', description: 'Please enter both PIN and name', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Find quiz by PIN
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('pin', pin.trim())
        .single();

      if (quizError || !quiz) {
        toast({ title: 'Error', description: 'Invalid PIN', variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (quiz.status === 'finished') {
        toast({ title: 'Error', description: 'This quiz has already ended', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check participant count
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id);

      if (count && count >= quiz.max_participants) {
        toast({ title: 'Room Full', description: 'This quiz has reached maximum capacity', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Create participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          quiz_id: quiz.id,
          display_name: displayName.trim(),
        })
        .select()
        .single();

      if (participantError) {
        console.error('Error creating participant:', participantError);
        toast({ title: 'Error', description: 'Failed to join quiz', variant: 'destructive' });
        setLoading(false);
        return;
      }

      toast({ title: 'Success!', description: 'Joined quiz successfully' });

      if (quiz.status === 'playing') {
        navigate(`/play/${quiz.id}/${participant.id}`);
      } else {
        navigate(`/play/lobby/${quiz.id}/${participant.id}`);
      }
    } catch (error) {
      console.error('Error joining quiz:', error);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/20 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 space-y-6 animate-scale-in">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary mx-auto flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Join Quiz
          </h1>
          <p className="text-muted-foreground">
            Enter the PIN and your name to join
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="pin">Quiz PIN</Label>
            <Input
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              className="mt-1 text-center text-2xl tracking-widest font-bold"
            />
          </div>

          <div>
            <Label htmlFor="name">Your Display Name</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleJoin}
          className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-90"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Quiz'}
        </Button>
      </Card>
    </div>
  );
};

export default Join;
