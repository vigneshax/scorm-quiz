// src/KbcQuiz.tsx
import { useState, useEffect } from "react";
import { HelpCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import {
  initSCORM,
  terminateSCORM,
  setSCORMValue,
  getSCORMValue,
  commitSCORM,
} from "./scormUtils";

const questions = [
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Charles Dickens", "Jane Austen", "Harper Lee", "Mark Twain"],
    correctAnswer: "Harper Lee",
  },
  {
    question: "What is the capital of Japan?",
    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    correctAnswer: "Tokyo",
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Silver", "Oxygen", "Iron"],
    correctAnswer: "Oxygen",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Leonardo da Vinci",
      "Pablo Picasso",
      "Claude Monet",
    ],
    correctAnswer: "Leonardo da Vinci",
  },
];

const moneyLadder = [
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

export function KbcQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lifeline5050, setLifeline5050] = useState(true);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const initialized = initSCORM();
    if (initialized) {
      const studentName = getSCORMValue("cmi.core.student_name");
      console.log("Welcome,", studentName);
    }

    return () => {
      terminateSCORM();
    };
  }, []);

  useEffect(() => {
    if (isAnswerCorrect !== null) {
      const timer = setTimeout(() => {
        if (isAnswerCorrect) {
          if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
            setScore(score + 1);
          } else {
            setShowResult(true);
            const scorePercentage = ((score + 1) / questions.length) * 100;
            setSCORMValue("cmi.core.score.raw", scorePercentage.toString());
            setSCORMValue(
              "cmi.core.lesson_status",
              scorePercentage >= 70 ? "passed" : "failed"
            );
            setSCORMValue("cmi.core.exit", "suspend");
            commitSCORM();
          }
        } else {
          setShowResult(true);
        }
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setDisabledOptions([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnswerCorrect, currentQuestion, score]);

  const handleAnswer = (selected: string) => {
    setSelectedAnswer(selected);
    const correct = selected === questions[currentQuestion].correctAnswer;
    setIsAnswerCorrect(correct);
  };

  const use5050Lifeline = () => {
    if (lifeline5050) {
      const correctAnswer = questions[currentQuestion].correctAnswer;
      const incorrectOptions = questions[currentQuestion].options.filter(
        (option) => option !== correctAnswer
      );
      const randomIncorrect =
        incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      const newDisabledOptions = questions[currentQuestion].options
        .map((option, index) =>
          option !== correctAnswer && option !== randomIncorrect ? index : -1
        )
        .filter((index) => index !== -1);
      setDisabledOptions(newDisabledOptions);
      setLifeline5050(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setLifeline5050(true);
    setDisabledOptions([]);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={4}
      bgcolor="linear-gradient(to bottom, #6a1b9a, #1976d2)"
    >
      <Card sx={{ width: "100%", maxWidth: 600 }}>
        <CardHeader
          title={
            <Typography variant="h5" align="center">
              Kaun Banega Crorepati
            </Typography>
          }
        />
        <CardContent>
          {!showResult ? (
            <>
              <Typography variant="h6" gutterBottom>
                Question {currentQuestion + 1}
              </Typography>
              <Typography variant="body1" paragraph>
                {questions[currentQuestion].question}
              </Typography>
              <Grid container spacing={2}>
                {questions[currentQuestion].options.map((option, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      fullWidth
                      variant={
                        selectedAnswer === option
                          ? option === questions[currentQuestion].correctAnswer
                            ? "contained"
                            : "outlined"
                          : "text"
                      }
                      color={
                        option === questions[currentQuestion].correctAnswer
                          ? "success"
                          : selectedAnswer === option
                          ? "error"
                          : "primary"
                      }
                      onClick={() => handleAnswer(option)}
                      disabled={
                        disabledOptions.includes(index) ||
                        selectedAnswer !== null
                      }
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <CardActions sx={{ justifyContent: "space-between", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={use5050Lifeline}
                  disabled={!lifeline5050 || selectedAnswer !== null}
                  startIcon={<HelpCircle size={20} />}
                >
                  50:50 Lifeline
                </Button>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Current Prize: {moneyLadder[score]}
                </Typography>
              </CardActions>
              {isAnswerCorrect !== null && (
                <Box
                  mt={2}
                  p={1}
                  borderRadius={1}
                  bgcolor={isAnswerCorrect ? "success.light" : "error.light"}
                  color={isAnswerCorrect ? "success.dark" : "error.dark"}
                >
                  {isAnswerCorrect ? (
                    <Typography variant="body1">
                      <CheckCircle style={{ verticalAlign: "middle" }} /> Correct! Moving to the next question...
                    </Typography>
                  ) : (
                    <Typography variant="body1">
                      <XCircle style={{ verticalAlign: "middle" }} /> Incorrect. The correct answer was{" "}
                      {questions[currentQuestion].correctAnswer}.
                    </Typography>
                  )}
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                Quiz Completed!
              </Typography>
              <Typography variant="h6">
                Your Score: {score} out of {questions.length}
              </Typography>
              <Typography
                variant="h5"
                color="success"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                You Won: {moneyLadder[score]}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={restartQuiz}
                fullWidth
              >
                Play Again
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
