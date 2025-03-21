// src/App.tsx
import React, { useEffect, useState } from 'react';
import { TimerQuiz } from './ClockQuiz';
// import { KbcQuiz} from './Quiz';
import yaml from "js-yaml";
// import { KbcQuizLong } from './QuizLong';
import { basePath } from './Constants';
import { createTheme, ThemeProvider } from '@mui/material';

const App: React.FC = () => {

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    
    fetch(`${basePath}/config.yaml`)
      .then((response) => response.text())
      .then((text) => {
        const parsedData = yaml.load(text);
        setConfig(parsedData);
      })
      .catch((error) => console.error("Error loading YAML:", error));
  }, []);

  if (!config) {
    return <p>Loading...</p>;
  }


  const theme = createTheme({
    typography: {
      fontFamily: 'Cinzel, serif',
      h1: {
        fontSize: '32px',
        fontWeight: 700,
        color: '#FFD700', // Golden color for headers
        letterSpacing: '1px',
      },
      h2: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#FFA500',
      },
      body1: {
        fontSize: '18px',
        fontWeight: 500,
        color: '#FFFFFF',
        letterSpacing: '0.5px',
        lineHeight: '1.6',
        wordSpacing: '2px',
      },
    },
    palette: {
      primary: {
        main: "#FFD700", // KBC-like golden theme
      },
      warning: {
        main: "#ffa500", // Red for wrong answers
      },
      background: {
        default: "#000E2E", // Dark blue KBC theme
      },
      text: {
        primary: "#FFFFFF", // White text
        secondary: "#FFD700", // Gold highlights
      },
    },
  });

  
  return (
    <ThemeProvider   theme={theme}>
    <div className="App">
      {/* {config.quiz_type.kbc_quiz && <KbcQuiz quiz_options={config.kbc_quiz_options} />} */}
      { <TimerQuiz quiz_options={config.quiz_options} />} 
      {/* {config.quiz_type.kbc_long_quiz && <KbcQuizLong quiz_options={config.kbc_long_quiz_options} />} */}
    </div>
    </ThemeProvider>
  );
};

export default App;
