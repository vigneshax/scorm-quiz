import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import questionsCsv from "./questions.csv";
import Papa from "papaparse";
import { Howl } from 'howler';
import Confetti from "react-confetti";

import {
  initSCORM,
  terminateSCORM,
  setSCORMValue,
  getSCORMValue,
  commitSCORM,
  recordInteraction,
} from "./scormUtils";

import { basePath, correctComments, incorrectComments, LinearProgressWithLabel, themeColors } from "./Constants";
import LifelineButton from "./components/lifelineButton";
import OptionButton from "./components/optionButton";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface KbcQuizProps {
  quiz_options: {
    total_questions: number;
    passing_percentage: number;
    "5050_lifeline": boolean;
    swap_question: boolean;
  };
}

export function KbcQuiz({ quiz_options }: KbcQuizProps) {
  const [comment, setComment] = useState<string | null>("Welcome to the KBC Game!");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const totalQuestions = quiz_options.total_questions;
  const [showResult, setShowResult] = useState(false);
  const [lifeline5050, setLifeline5050] = useState(true);
  const [swapQuestion, setSwapQuestion] = useState(true);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);


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


  const applauseSound = new Howl({ src: [`${basePath}/sounds/Applause.mp3`] });
  const sadSound = new Howl({ src: [`${basePath}/sounds/SadViolin.mp3`] });
  const clickSound = new Howl({ src: [`${basePath}/sounds/Click.mp3`], preload: true });

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

      if (progress + 1 < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
        setProgress(progress + 1);

      } else {
        setShowResult(true);
        setCurrentQuestion(currentQuestion + 1);
        setProgress(progress + 1);

        const scorePercentage = ((score + (correct ? 1 : 0)) / totalQuestions) * 100;
        console.log(scorePercentage)
        setPassed(scorePercentage >= quiz_options.passing_percentage);
        console.log(score, totalQuestions, scorePercentage)
        if (scorePercentage >= quiz_options.passing_percentage) {
          console.log("applauseSound")
          applauseSound.play();
        } else {
          console.log("sadSound")
          sadSound.play();
        }
        const { resultMessage, severity } = (() => {
          if ((score + (correct ? 1 : 0)) === totalQuestions) {
            return { resultMessage: "Outstanding Performance! You're a quiz master! 🏆", severity: "success" as const };
          } else if (score > totalQuestions / 2) {
            return { resultMessage: "Great effort! You did really well. 🌟", severity: "info" as const };
          } else {
            return { resultMessage: "Good try! Keep practicing to improve! 👍", severity: "error" as const };
          }


        })();

        setComment(resultMessage);
        setAlertSeverity(severity);
        console.log(passed, "Passed")


        // Update the objective when quiz ends
        setSCORMValue("cmi.objectives.0.id", "quiz_1"); // Use a unique objective ID
        setSCORMValue("cmi.objectives.0.score.raw", (score + (correct ? 1 : 0)).toString());
        setSCORMValue("cmi.objectives.0.score.max", totalQuestions.toString());
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


      console.log(progress)
      console.log("progress")
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

  const useSwapQuestion = () => {
    if (swapQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      setSwapQuestion(false);
    }
  };
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: "url('images/questions_background_v2.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      bgcolor={themeColors.background}
    >

      <Card sx={{ width: "100%", p: 4, maxWidth: 500, bgcolor: "transparent" }}>
        <CardContent>
          <Box mt={2} mb={2}>
            <LinearProgressWithLabel
              variant="determinate"
              value={(progress / totalQuestions) * 100}
              sx={{
                height: 10, borderRadius: 5, backgroundColor: themeColors.background,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: themeColors.secondary,
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

                <Typography color={themeColors.warning} textAlign={"center"} fontWeight={"bold"} variant="body1" paragraph>
                  {questions[currentQuestion].question}
                </Typography>

                <Grid
                  container
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                >
                  {questions[currentQuestion].options.map((option, index) => (
                    <Grid
                      item
                      xs={6}
                      key={index}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <OptionButton
                        key={index}
                        option={option}
                        index={index}
                        handleAnswer={handleAnswer}
                        disabledOptions={disabledOptions}
                        selectedAnswer={selectedAnswer}
                      />
                    </Grid>
                  ))}
                </Grid>

                <CardActions sx={{ justifyContent: "space-between", flexDirection: 'column', mt: 3 }}>

                  <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%">
                    {quiz_options["5050_lifeline"] && <LifelineButton
                      onClick={use5050Lifeline}
                      isDisabled={!lifeline5050 || selectedAnswer !== null}
                      imageSrc="images/50_50_lifeline_button.png"
                      label="50:50 Lifeline"
                    />}
                    {quiz_options.swap_question && <LifelineButton
                      onClick={useSwapQuestion}
                      isDisabled={!swapQuestion || selectedAnswer !== null}
                      imageSrc="images/50_50_lifeline_button.png"
                      label="Swap Question"
                    />}
                  </Box>

                  {/* <Box mt={2} width="100%">
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

                  </Box>  */}



                </CardActions>
              </>
            ) : (
              <Box textAlign="center" sx={{ p: 4 }}>




                <Box display="flex" justifyContent="center" alignItems="center" mb={2}>


                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: "white" }}>
                    Quiz Completed!
                  </Typography>


                </Box>
                {passed ? (
                  <>

                    <Confetti
                      width={window.innerWidth}
                      height={window.innerHeight}
                      recycle={true}
                    />
                    <Typography variant="h1" gutterBottom sx={{ color: "green", fontSize: "2rem", fontWeight: 'bold' }}>
                      Congratulations!
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h1" gutterBottom sx={{ color: "red", fontSize: "2rem", fontWeight: 'bold' }}>
                      Better Luck Next Time 😢
                    </Typography>
                  </>
                )}
                <Typography variant="h6" sx={{ mb: 2, color: themeColors.success }}>
                  Your Score: <strong>{score}</strong> out of <strong>{totalQuestions}</strong>
                </Typography>

                {/* <Box mt={2} mb={2} width="100%">
                  {/* <Alert
                    severity={alertSeverity}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center", // Ensure the text is centered
                    }}
                  >
                    {comment}
                  </Alert> */}

                {/* </Box>  */}



                <Button
                  variant="contained"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: "#ffffff",
                    border: "2px solid white",
                    borderRadius: '10px'
                    // padding: '12px 20px',
                    // transition: 'background-color 0.3s ease',
                  }}
                // fullWidth


                >
                  Please close the session...
                </Button>
              </Box>
            )
          )}
        </CardContent>
      </Card>


    </Box>
  );
}
