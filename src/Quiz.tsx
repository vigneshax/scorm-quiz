import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import questionsCsv from "./questions.csv";
import Papa from "papaparse";

import {
  initSCORM,
  terminateSCORM,
  setSCORMValue,
  getSCORMValue,
  commitSCORM,
  recordInteraction,
} from "./ScormMock";
import { correctComments, incorrectComments, moneyLadder, themeColors } from "./Constants";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export function KbcQuiz() {
  const [comment, setComment] = useState<string | null>("Welcome to the KBC Game!");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lifeline5050, setLifeline5050] = useState(true);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state

  const fetchQuestions = async () => {
    setLoading(true); // Set loading to true
    const response = await fetch(questionsCsv);
    const text = await response.text();

    Papa.parse(text, {
      header: true,
      complete: (results: any) => {
        // Filter out empty rows
        const validRows = results.data.filter((item: any) => item.question && item.options && item.correctAnswer);

        const parsedQuestions = validRows.map((item: any) => {
          // Check if the options exist and is a string before splitting
          const options = typeof item.options === 'string' ? item.options.split("|") : [];

          return {
            question: item.question || "No question provided", // Fallback for undefined question
            options: options.length > 0 ? options : ["No options available"], // Fallback for options
            correctAnswer: item.correctAnswer || "No answer provided", // Fallback for undefined answer
          };
        });

        setQuestions(parsedQuestions);
        setLoading(false); // Set loading to false once questions are loaded
      },
    });
  };


  useEffect(() => {
    fetchQuestions();
    const initialized = initSCORM();
    if (initialized) {
      const studentName = getSCORMValue("cmi.core.student_name");
      console.log("Welcome,", studentName);
      setSCORMValue("cmi.score.max", "100");
      setSCORMValue("cmi.score.min", "0");
      setSCORMValue("cmi.score.raw", "0");
      setSCORMValue("cmi.completion_status", "incomplete");
    }
  }, []);

  const handleAnswer = (selected: string) => {
    setSelectedAnswer(selected);
    const currentQ = questions[currentQuestion];
    const correct = selected === currentQ.correctAnswer;


    const randomComment = correct
      ? correctComments[Math.floor(Math.random() * correctComments.length)]
      : incorrectComments[Math.floor(Math.random() * incorrectComments.length)];
    setComment(randomComment);
    setAlertSeverity(correct ? "success" : "error");

    recordInteraction({
      id: `Q${currentQuestion + 1}`,
      type: "choice",
      learnerResponse: selected,
      correctResponse: currentQ.correctAnswer,
      result: correct ? "correct" : "incorrect",
      question: questions[currentQuestion].question
    });


    if (correct) setScore((prevScore) => prevScore + 1);

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
        setCurrentQuestion(currentQuestion + 1);

        const scorePercentage = ((score + (correct ? 1 : 0)) / questions.length) * 100;
        console.log(score, questions.length, scorePercentage)
        const { resultMessage, severity } = (() => {
          if ((score + (correct ? 1 : 0)) === questions.length) {
            return { resultMessage: "Outstanding Performance! You're a quiz master! 🏆", severity: "success" as const };
          } else if (score > questions.length / 2) {
            return { resultMessage: "Great effort! You did really well. 🌟", severity: "info" as const };
          } else {
            return { resultMessage: "Good try! Keep practicing to improve! 👍", severity: "error" as const };
          }
        })();

        setComment(resultMessage);
        setAlertSeverity(severity);


        // Update the objective when quiz ends
        setSCORMValue("cmi.objectives.0.id", "quiz_1"); // Use a unique objective ID
        setSCORMValue("cmi.objectives.0.score.raw", (score + (correct ? 1 : 0)).toString());
        setSCORMValue("cmi.objectives.0.score.max", questions.length.toString());
        setSCORMValue("cmi.objectives.0.score.min", "0");
        setSCORMValue("cmi.objectives.0.success_status", scorePercentage >= 70 ? "passed" : "failed");
        setSCORMValue("cmi.objectives.0.completion_status", "completed");
        setSCORMValue("cmi.objectives.0.progress_measure", (scorePercentage / 100).toString());

        setSCORMValue("cmi.score.raw", scorePercentage.toString());
        setSCORMValue("cmi.score.scaled", (scorePercentage / 100).toString());
        setSCORMValue("cmi.success_status", scorePercentage >= 70 ? "passed" : "failed");
        setSCORMValue("cmi.completion_status", "completed");
        setSCORMValue("cmi.exit", "suspend");
        commitSCORM();
        terminateSCORM();
      }
      setSelectedAnswer(null);
      setDisabledOptions([]);
    }, 1000);
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

  return (
    <Box
  minHeight="100vh"
  display="flex"
  alignItems="center"
  justifyContent="center"
  sx={{
    backgroundImage: "url('/questions background_v2.jpg')",
    backgroundSize: "cover", // Ensures the image covers the entire box
    backgroundRepeat: "no-repeat", // Prevents the image from repeating
    backgroundPosition: "center", // Centers the image
  }}
  bgcolor={themeColors.background}
>
  {/* Add your content here */}

      <Card sx={{ width: "100%", p: 4, maxWidth: 600, bgcolor:"transparent" }}>
        <CardHeader
          title={
            <Typography variant="h5" align="center" color={themeColors.primary}>
              Kaun Banega Crorepati
            </Typography>
          }
        />

        <CardContent>
          <Box mt={2} mb={2}>
            <LinearProgress
              // color={themeColors.primary}
              variant="determinate"
              value={(currentQuestion / questions.length) * 100}
              sx={{
                height: 10, borderRadius: 5, backgroundColor: themeColors.background, // Custom background color
                "& .MuiLinearProgress-bar": {
                  backgroundColor: themeColors.warning, // Custom progress color
                },
              }}
            />
          </Box>

          {loading ? ( // Show loader while loading
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            !showResult ? (
              <>
                <Typography variant="h6" gutterBottom color={themeColors.primary}>
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
                        style={{
                          backgroundColor:
                            disabledOptions.includes(index)
                              ? themeColors.background // Use a distinct color for disabled options
                              : selectedAnswer === option
                                ? themeColors.primary
                                : themeColors.secondary,
                          color: "#ffffff",
                        }}
                        onClick={() => handleAnswer(option)}
                        disabled={disabledOptions.includes(index) || selectedAnswer !== null}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <CardActions sx={{ justifyContent: "space-between", flexDirection: 'column', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={use5050Lifeline}
                    disabled={!lifeline5050 || selectedAnswer !== null}
                    startIcon={<HelpCircle size={20} />}
                    sx={{
                      backgroundColor: themeColors.primary,
                    }}
                  >
                    50:50 Lifeline
                  </Button>
                  <Box mt={2} width="100%">
                    <Alert
                      severity={alertSeverity}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center", // Ensure the text is centered
                      }}
                    >
                      {comment}
                    </Alert>

                  </Box>

                </CardActions>
              </>
            ) : (
              <Box textAlign="center" sx={{ p: 4, bgcolor: themeColors.warning, borderRadius: 2, boxShadow: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                  {/* Emoji on the left */}
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    🎉
                  </Typography>

                  {/* Main text */}
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: themeColors.primary }}>
                    Quiz Completed!
                  </Typography>

                  {/* Emoji on the right */}
                  <Typography variant="h4" sx={{ ml: 2 }}>
                    🎉
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 2, color: themeColors.success }}>
                  Your Score: <strong>{score}</strong> out of <strong>{questions.length}</strong>
                </Typography>

                <Box mt={2} mb={2} width="100%">
                  <Alert
                    severity={alertSeverity}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center", // Ensure the text is centered
                    }}
                  >
                    {comment}
                  </Alert>

                </Box>


                <Button
                  variant="contained"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: "#ffffff",
                    padding: '12px 20px',
                    transition: 'background-color 0.3s ease',
                  }}
                  fullWidth
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = themeColors.success)} // Change color on hover
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = themeColors.primary)} // Revert color
                >
                  Please close the session using X icon above..
                </Button>
              </Box>
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
