// src/App.tsx
import React, { useEffect, useState } from 'react';
import { TimerQuiz } from './ClockQuiz';
import { KbcQuiz} from './Quiz';
import yaml from "js-yaml";
const App: React.FC = () => {

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/config.yaml")
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

  return (
    <div className="App">
       {config.quiz_type.kbc_quiz && <KbcQuiz quiz_options={config.kbc_quiz_options} />}
      {config.quiz_type.timer_quiz && <TimerQuiz quiz_options={config.timer_quiz_options} />}
    </div>
  );
};

export default App;
