// Color and shape mapping for quiz options
export const OPTION_STYLES = [
  {
    color: 'hsl(0 85% 60%)',
    name: 'Red',
    shape: 'circle',
    icon: '●',
    bgClass: 'bg-red-500',
  },
  {
    color: 'hsl(221 83% 53%)',
    name: 'Blue',
    shape: 'triangle',
    icon: '▲',
    bgClass: 'bg-blue-500',
  },
  {
    color: 'hsl(48 100% 67%)',
    name: 'Yellow',
    shape: 'square',
    icon: '■',
    bgClass: 'bg-yellow-500',
  },
  {
    color: 'hsl(142 71% 45%)',
    name: 'Green',
    shape: 'diamond',
    icon: '◆',
    bgClass: 'bg-green-500',
  },
];

// Generate random PIN
export const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate points based on time taken
export const calculatePoints = (isCorrect: boolean, timeTaken: number, totalTime: number): number => {
  if (!isCorrect) return 0;
  
  const basePoints = 1000;
  const timeBonus = Math.floor((1 - timeTaken / totalTime) * 500);
  
  return basePoints + timeBonus;
};

// Get option style by index
export const getOptionStyle = (index: number) => {
  return OPTION_STYLES[index % OPTION_STYLES.length];
};
