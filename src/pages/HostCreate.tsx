import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import {
  Triangle,
  Square,
  Circle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generatePin } from '@/lib/quizUtils';
import { useToast } from '@/hooks/use-toast';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}
const optionColors = [
  {
    // Red
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-900',
    placeholder: 'placeholder:text-red-500/70',
    focusRing: 'focus:border-red-500 focus:ring-red-500/20',
    Icon: Circle, // Kahoot-style shape
  },
  {
    // Blue
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    placeholder: 'placeholder:text-blue-500/70',
    focusRing: 'focus:border-blue-500 focus:ring-blue-500/20',
    Icon: Triangle, // (Rhombus/Diamond isn't in lucide, Square is close)
  },
  {
    // Yellow
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    placeholder: 'placeholder:text-yellow-500/70',
    focusRing: 'focus:border-yellow-500 focus:ring-yellow-500/20',
    Icon: Square,
  },
  {
    // Green
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-900',
    placeholder: 'placeholder:text-green-500/70',
    focusRing: 'focus:border-green-500 focus:ring-green-500/20',
    Icon: Square, // Kahoot uses a square for green
  },
];
const optionBaseClasses =
  'flex-1 p-4 text-lg font-medium border-2 rounded-xl shadow-sm focus:ring-4';

const HostCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState(200);
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Please enter a quiz title', variant: 'destructive' });
      return;
    }

    if (questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
      toast({ title: 'Error', description: 'Please fill in all questions and options', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const pin = generatePin();

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          pin,
          time_per_question: timePerQuestion,
          max_participants: maxParticipants,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: question, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quiz.id,
            order_index: i,
            text: q.text,
            correct_option_index: q.correctIndex,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options
        for (let j = 0; j < q.options.length; j++) {
          const { error: optionError } = await supabase
            .from('options')
            .insert({
              question_id: question.id,
              order_index: j,
              text: q.options[j],
            });

          if (optionError) throw optionError;
        }
      }

      toast({ title: 'Success!', description: 'Quiz created successfully' });
      navigate(`/host/lobby/${quiz.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({ title: 'Error', description: 'Failed to create quiz', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="font-bold text-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg p-2 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Use bg-white/90 for a slightly transparent, "frosted glass" look */}
        <Card className="p-8 md:p-12 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-sm">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gray-800 bg-clip-text text-transparent">
            Create Your Quiz
          </h1>

          {/* Basic Info */}
          <div className="space-y-6 mb-10">
            <div>
              <Label htmlFor="title" className="font-bold text-base text-gray-600">
                Quiz Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. '80s Movie Trivia'"
                className="mt-2 text-lg p-4 bg-white/70 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl shadow-sm"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-bold text-base text-gray-600">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A fun description for your players..."
                className="mt-2 text-lg p-4 bg-white/70 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl shadow-sm min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="time" className="font-bold text-base text-gray-600">
                  Time Per Question (sec)
                </Label>
                <Input
                  id="time"
                  type="number"
                  min="5"
                  max="300"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
                  className="mt-2 text-lg p-4 bg-white/70 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl shadow-sm"
                />
              </div>

              <div>
                <Label htmlFor="max" className="font-bold text-base text-gray-600">
                  Max Participants
                </Label>
                <Input
                  id="max"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="mt-2 text-lg p-4 bg-white/70 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-gray-800">Questions</h2>
              <Button
                onClick={addQuestion}
                size="lg"
                className="font-bold rounded-lg shadow-md bg-purple-600 text-white hover:bg-purple-700 transition-all hover:shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card
                key={qIndex}
                className="p-6 space-y-6 border-2 border-gray-200 bg-white rounded-xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-purple-700">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="font-bold text-base text-gray-600">
                    Question Text *
                  </Label>
                  <Input
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'text', e.target.value)
                    }
                    placeholder="What is the capital of France?"
                    className="mt-2 text-lg p-4 bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-base text-gray-600">
                    Options *
                  </Label>
                  {question.options.map((option, oIndex) => {
                    // Get the color config for this option index
                    const colorConfig =
                      optionColors[oIndex % optionColors.length];
                    const Icon = colorConfig.Icon;

                    return (
                      <div key={oIndex} className="flex items-center gap-4">
                        {/* This is the check-mark selector */}
                        <div
                          className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer transition-all shadow-md ${question.correctIndex === oIndex
                              ? 'bg-green-500 text-white ring-4 ring-green-200 scale-105'
                              : 'bg-white border-2 border-gray-300 text-gray-400 hover:bg-gray-100'
                            }`}
                          onClick={() =>
                            updateQuestion(qIndex, 'correctIndex', oIndex)
                          }
                        >
                          {question.correctIndex === oIndex ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            // Show the shape icon when not selected
                            <Icon className={`w-6 h-6 ${oIndex === 3 && "rotate-45"}`} />
                          )}
                        </div>
                        {/* This is the colored input field */}
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, e.target.value)
                          }
                          placeholder={`Option ${oIndex + 1}`}
                          className={`${optionBaseClasses} ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} ${colorConfig.placeholder} ${colorConfig.focusRing}`}
                        />
                      </div>
                    );
                  })}
                  <p className="text-sm font-medium text-gray-500 text-center pt-2">
                    Click the shape to mark the correct answer
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* The big final button */}
          <Button
            className="w-full mt-12 py-8 text-2xl font-extrabold rounded-2xl shadow-xl hover:scale-[1.02] transition-transform bg-purple-600 text-white hover:bg-purple-700 focus:ring-4 focus:ring-purple-300"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Quiz & Get PIN'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default HostCreate;
