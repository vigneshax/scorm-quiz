import { useState, useEffect } from "react";
import { HelpCircle, Timer } from "lucide-react";
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
import { Howl } from 'howler';
import Confetti from "react-confetti";

import yaml from "js-yaml";


import {
  initSCORM,
  terminateSCORM,
  setSCORMValue,
  getSCORMValue,
  commitSCORM,
  recordInteraction,
} from "./scormUtils";

import { basePath, correctComments, incorrectComments, LinearProgressWithLabel, themeColors } from "./Constants";
import LifelineButton from "./components/lifelineButtonLong";
import OptionButton from "./components/optionButtonLong";
import { ArrowBigLeft, ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import ReviewDialog from "./components/reviewDialog";

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface KbcQuizProps {
  quiz_options: {
    total_questions: number;
    passing_percentage: number;
    total_time: number;
    "5050_lifeline": boolean;
    swap_question: boolean;
    background: string;
  };
}

export function KbcQuizLong({ quiz_options }: KbcQuizProps) {
  const [config, setConfig] = useState<any>(null);
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

  const [openReview, setOpenReview] = useState(false);
  const [userResponses, setUserResponses] = useState<
    { question: string; userAnswer: string; correctAnswer: string }[]
  >([]);


  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const totalTime = quiz_options.total_time;

  const handleOpenReview = () => setOpenReview(true);
  const handleCloseReview = () => setOpenReview(false);

  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [showRulesDialog, setShowRulesDialog] = useState(true);

  const getColorBasedOnTime = () => {
    if (timeLeft <= totalTime * 0.2) {
      return "red";
    }
    return themeColors.secondary;
  };

  const barColor = getColorBasedOnTime();
  const fetchQuestions = async () => {
    setLoading(true);
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

  const [isRunning, setIsRunning] = useState(false);

  const handleTimeOut = () => {
    setIsRunning(false);
    setDisabledOptions([0, 1, 2, 3])
    // handleAnswer("Time Out")

    setTimeout(() => {
      setShowResult(true);
      if (passed) {
        console.log("applauseSound")
        applauseSound.play();
      } else {
        console.log("sadSound")
        sadSound.play();
      }
    }, 1000);
  };


  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      console.log("calling timeLeft = 0", isRunning);

      // setIsRunning(false); // Stop the timer
      setDisabledOptions([0, 1, 2, 3]); // Disable options immediately

      // Trigger result after a delay
      setTimeout(() => {
        setShowResult(true);
        if (passed) {
          console.log("applauseSound");
          applauseSound.play();
        } else {
          console.log("sadSound");
          sadSound.play();
        }
      }, 1000);

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);


  const handleDialogClose = () => {
    setInterval(() => {

      setShowRulesDialog(false);
      setIsRunning(true);
    }, 1000);
  };

  const formatTime = (secondsInput: number) => {
    const minutes = Math.floor(secondsInput / 60);
    const seconds = Math.floor(secondsInput % 60);
    const ms = Math.floor((secondsInput % 1) * 100);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
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
    // setTime(timelimit);
    const currentQ = questions[currentQuestion];
    const correct = selected === currentQ.correctAnswer;

    setUserResponses((prev) => [
      ...prev,
      { question: currentQ.question, userAnswer: selected, correctAnswer: currentQ.correctAnswer },
    ]);

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

        setTimeLeft(0);
        // setIsRunning(false);
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

      // setTime(timelimit);
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
        backgroundImage: `url(${quiz_options.background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      bgcolor={themeColors.background}
    >

      <Card sx={{
        width: { xs: "100%", sm: "90%", md: "80%", lg: "60%", xl: "40%" },
        p: 3,
        boxShadow: "none",
        maxWidth: { xs: "100%", sm: 800, md: 800 }, // Responsive max width
        bgcolor: "transparent",
        position: "absolute",
        top: { xs: 10, sm: 5, md: 15, lg: 5, xl: 25 }, // Responsive top position
        right: { xs: 10, sm: 25, md: 50, lg: 40, xl: 100 } // Responsive right position
      }}>
        <CardContent >
          <Box sx={{}} mt={4} mb={1}  >
            {/* <ArrowLeftCircle/> */}
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
            {/* <ArrowRightCircle/> */}

          </Box>



          {loading ? ( // Show loader while loading
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            !showResult ? (
              <>

                <Typography sx={{ mb: 3 }} color={themeColors.warning} textAlign={"center"} fontWeight={"bold"} variant="body1" paragraph>
                  {questions[currentQuestion].question}
                </Typography>

                <Grid
                  container
                  spacing={{ lg: 2 }}
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

                <CardActions sx={{ justifyContent: "space-between", flexDirection: 'column', mt: 2 }}>

                  <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%">
                    {quiz_options["5050_lifeline"] && <LifelineButton
                      onClick={use5050Lifeline}
                      isDisabled={!lifeline5050 || questions[currentQuestion].options.length != 4 || selectedAnswer !== null}
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
.                </CardActions>
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
                  onClick={handleOpenReview}
                  style={{
                    backgroundColor: themeColors.primary,
                    color: "#ffffff",
                    // border: "2px solid white",
                    borderRadius: '10px',
                    marginRight: '20px',
                    // padding: '12px 20px',
                    // transition: 'background-color 0.3s ease',
                  }}

 >
                  Review the Answers
                </Button>

                <Button
                  variant="outlined"
                  style={{
                    // backgroundColor: themeColors.primary,
                    color: "#ffffff",
                    border: "2px solid white",
                    borderRadius: '10px'
                  }}
                >
                  Please close the session...
                </Button>

                <ReviewDialog open={openReview} onClose={handleCloseReview} userResponses={userResponses} />;
              </Box>
            )
          )}
        </CardContent>
      </Card>


    </Box>
  );
}
