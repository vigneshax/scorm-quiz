import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Timer } from 'lucide-react';


export const basePath = process.env.PUBLIC_URL || "";

export function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'white' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}


// export function ClockLinearProgressWithLabel(props) {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//       <Box sx={{ width: '100%', mr: 1 }}>
//         <LinearProgress variant="determinate" {...props} />
//       </Box>
//       <Box sx={{ minWidth: 35 }}>
//         <Typography variant="body2" sx={{ color: 'white' }}>
//           {props.value}
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

export function ClockLinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={props.value}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: themeColors.background,
            "& .MuiLinearProgress-bar": {
              backgroundColor: props.barColor,
            },
          }}
        />
      </Box>
      

    </Box>
  );
}


export const boxButtonSX = {
  position: 'relative',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  width: 300,
  height: 35,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.1s ease-in-out', // Smooth transition for the press effect
  '&:hover': {
    opacity: 0.9, // Hover effect
  },
  '&:active': {
    transform: 'scale(0.95)', // Button slightly shrinks when clicked
  },
  '&:disabled': {
    opacity: 0.5, // Dim disabled buttons
    pointerEvents: 'none', // Disable click events
  },
};

export const themeColors = {
  primary: "#74347c",
  secondary: "#ec873a",
  success: "#34947c",
  warning: "#ffa500",
  background: "#e1e5e3",
};

// https://drive.google.com/file/d/1IzTOCLp96d06TsYpYzmHTLKLJVhVWW10/view?usp=drive_link

// https://drive.google.com/file/d/1p7UYJVwSOfvWm_YKbEPtYt1DnFZCL2jT/view?usp=drive_link
export const correctComments = [
  "Fantastic work! You nailed it!",
  "Good job, correct answer!",
  "You're on fire! Keep it going!",
  "That’s the spirit! Well done!",
  "Brilliant! You’re doing great!",
  "Awesome! You’ve got this!",
  "Spot on! Keep the streak alive!",
  "Correct! Your hard work is paying off!",
  "Excellent choice! You’re unstoppable!",
  "Superb! That’s another one right!",
];

export const incorrectComments = [
  "Oh no, not quite right. Let’s get the next one!",
  "Dang it, we'll get the next one!",
  "Close, but not this time. Keep going!",
  "Don’t worry! You’re learning with each step.",
  "Oops! Let’s focus on the next question.",
  "Not quite, but you’ve got the next one!",
  "Mistakes are just stepping stones to success!",
  "Don’t let this one get you down. Onward!",
  "Almost had it! Let’s move forward.",
  "Incorrect, but don’t give up. You’ve got this!",
];
//  export  const questions = [
//     {
//       question: "Which planet is known as the Red Planet?",
//       options: ["Venus", "Mars", "Jupiter", "Saturn"],
//       correctAnswer: "Mars",
//     },
//     {
//       question: "Who wrote 'To Kill a Mockingbird'?",
//       options: ["Charles Dickens", "Jane Austen", "Harper Lee", "Mark Twain"],
//       correctAnswer: "Harper Lee",
//     },
//     {
//       question: "What is the capital of Japan?",
//       options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
//       correctAnswer: "Tokyo",
//     },
//     {
//       question: "Which element has the chemical symbol 'O'?",
//       options: ["Gold", "Silver", "Oxygen", "Iron"],
//       correctAnswer: "Oxygen",
//     },
//     {
//       question: "Who painted the Mona Lisa?",
//       options: [
//         "Vincent van Gogh",
//         "Leonardo da Vinci",
//         "Pablo Picasso",
//         "Claude Monet",
//       ],
//       correctAnswer: "Leonardo da Vinci",
//     },
//   ];


export const moneyLadder = [
  "₹1,000",
  "₹2,000",
  "₹3,000",
  "₹5,000",
  "₹10,000",
  "₹20,000",
  "₹40,000",
  "₹80,000",
  "₹1,60,000",
  "₹3,20,000",
  "₹6,40,000",
  "₹12,50,000",
  "₹25,00,000",
  "₹50,00,000",
  "₹1,00,00,000",
  "₹7,00,00,000",
];
