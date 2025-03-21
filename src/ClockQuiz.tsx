import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  IconButton,
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
import { basePath, themeColors } from "./Constants";
import OptionButton from "./components/optionButtonLong";
import LifelineButton from "./components/lifelineButton";
import RulesDialog from "./components/rulesDialog";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import ConfirmationDialog from "./components/confirmDialog";

export interface Question {
  question: string;        // The question text
  options: string[];       // Answer choices
  correctAnswer: string;   // The correct answer
  // isAnswered?: boolean;    // Whether the question has been answered
  // selectedAnswer?: string; // User's selected answer (if any)
  // isSkipped?: boolean;     // If the question was skipped (or marked for review)
  // index?: number;          // Question index in the list
}

interface TimerQuizProps {
  quiz_options: {
    total_questions: number;
    passing_percentage: number;
    total_time: number;
    "5050_lifeline": boolean;
    swap_question: boolean;
    background: string;
    rules: string[];
  };
}

export function TimerQuiz({ quiz_options }: TimerQuizProps) {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
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

  const totalTime = quiz_options.total_time;

  const [student, setStudent] = useState<string | null>(null);


  const [tempSelected, setTempSelected] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOptionClick = (option: string) => {
    setTempSelected(option);
    setShowConfirm(true);
  };


  const cancelAnswer = () => {
    setShowConfirm(false);
    setTempSelected(null);
  };

  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [showRulesDialog, setShowRulesDialog] = useState(true);

  const getColorBasedOnTime = () => {
    if (timeLeft <= totalTime * 0.2) {
      return "red";
    }
    return themeColors.secondary;
  };

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
    setShowConfirm(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (!isRunning) return;

    if (Object.keys(selectedAnswers).length === totalQuestions) {
      console.log("All questions answered. Stopping timer.", Object.keys(selectedAnswers).length + 1);
      setIsRunning(false);
      return;
    }

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
      const studentName = getSCORMValue("cmi.learner_name");
      console.log("Welcome,", studentName);
      setStudent(studentName ? studentName : null);

      const version = getSCORMValue("cmi._version");
      console.log("SCORM Version:", version);

      const status = getSCORMValue("cmi.completion_status");
      console.log("Completion Status:", status);

      setSCORMValue("cmi.score.max", "100");
      setSCORMValue("cmi.score.min", "0");
      setSCORMValue("cmi.score.raw", "0");
      setSCORMValue("cmi.completion_status", "incomplete");
    }
  }, []);

  const handleAnswer = (selected: string) => {
    if (selectedAnswers[currentQuestion]) return; // Prevent re-selection

    // Update selected answers with functional update to avoid stale state
    setSelectedAnswers(prev => {
      const updatedAnswers = { ...prev, [currentQuestion]: selected };

      // Find unanswered questions based on the latest state
      const unansweredIndexes = questions
        .slice(0, totalQuestions)
        .map((_, index) => index)
        .filter(index => !(index in updatedAnswers)); // Unanswered questions

      // console.log("Updated selectedAnswers:", updatedAnswers);
      // console.log("Unanswered Questions:", unansweredIndexes);

      // Handle progress and navigation
      setProgress(prevProgress => {
        const nextProgress = prevProgress + 1;

        if (nextProgress < totalQuestions) {
          console.log("Next sequential question", nextProgress, totalQuestions, selected);
          setCurrentQuestion(currentQuestion + 1);
        } else if (unansweredIndexes.length > 0) {
          console.log("Jumping to first unanswered question:", unansweredIndexes[0]);
          setCurrentQuestion(unansweredIndexes[0]); // Move to next unanswered question
        } else {
          console.log("All questions answered. Showing results.");
          setShowResult(true);
        }

        return nextProgress;
      });

      return updatedAnswers;
    });

    setSelectedAnswer(selected);

    // Check correctness and update score
    const correct = selected === questions[currentQuestion].correctAnswer;
    if (correct) setScore(prevScore => prevScore + 1);

    // Record interaction
    recordInteraction({
      id: `Q${currentQuestion + 1}`,
      type: "choice",
      learnerResponse: selected,
      correctResponse: questions[currentQuestion].correctAnswer,
      result: correct ? "correct" : "incorrect",
      question: questions[currentQuestion].question
    });






    // Handle SCORM updates when quiz is completed
    if (Object.keys(selectedAnswers).length + 1 == totalQuestions) {

      console.log("Quiz completed. Calculating score...", progress, Object.keys(selectedAnswers).length, totalQuestions);
      setTimeout(() => {
        const finalScore = score + (correct ? 1 : 0);
        const scorePercentage = (finalScore / totalQuestions) * 100;

        console.log("Final Score:", finalScore, "Percentage:", scorePercentage);

        setPassed(scorePercentage >= quiz_options.passing_percentage);

        if (scorePercentage >= quiz_options.passing_percentage) {
          console.log("Playing applause sound");
          applauseSound.play();
        } else {
          console.log("Playing sad sound");
          sadSound.play();
        }

        // SCORM tracking updates
        setSCORMValue("cmi.objectives.0.id", "quiz_1");
        setSCORMValue("cmi.objectives.0.score.raw", finalScore.toString());
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
      }, 500);
    }

    // Reset UI selections
    setSelectedAnswer(null);
    setDisabledOptions([]);
  };

  const confirmAnswer = () => {
    console.log("ConfirmAnswer")
    // setTimeout(() => {
    if (tempSelected !== null) {
      handleAnswer(tempSelected);
      setShowConfirm(false);
      setTempSelected(null);
      //   }
      // }, 1000);

    };
  }


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
      // Create a new question list excluding the current question
      // const updatedQuestions = questions.filter((_, index) => index !== currentQuestion);


      let updatedQuestions = questions.filter((_, index) => index !== currentQuestion);

      // Insert the last question in place of the removed question
      updatedQuestions = [
        ...updatedQuestions.slice(0, currentQuestion),
        questions[totalQuestions],
        ...updatedQuestions.slice(currentQuestion)
      ];

      setQuestions(updatedQuestions); // Update the questions list
      setSwapQuestion(false); // Reset swap state

      // Move to the next question, ensuring we don't go out of bounds
      if (currentQuestion >= updatedQuestions.length) {
        setCurrentQuestion(updatedQuestions.length - 1);
      } else {
        setCurrentQuestion(currentQuestion);
      }
    }
  };


  return (

    <>
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
        <Card sx={{ width: "100%", p: 4, maxWidth: '60%', backgroundColor: `rgba(0, 0, 0, 1)`, boxShadow: 0 }}>
          <CardContent>

            {/* <Box m={2} display={isRunning ? "block" : "none"}>
              <ClockLinearProgressWithLabel
                value={(timeLeft / totalTime) * 100}
                barColor={barColor}
              />
            </Box> */}

            {showRulesDialog ? ( // Show loader while loading
              <RulesDialog open={showRulesDialog}  onClose={handleDialogClose} student={student} rules={quiz_options.rules} />
            ) : (
              !showResult ? (
                <>
                  <Box  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        mb: 1,
                      }}
                    >
                      <Typography
                        color={themeColors.warning}
                        textAlign="left"
                        fontWeight="medium"
                        variant="body1"
                        sx={{ fontSize: "1.5rem", flex: 1 }} // Allows text to take available space
                      >
                        Question {currentQuestion + 1}
                      </Typography>


                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3, // Increased spacing between arrows
                          flexShrink: 0, // Prevents the icons from shrinking
                        }}
                      >
                        <IconButton
                          color="warning"
                          onClick={() => setCurrentQuestion(currentQuestion - 1)}
                          disabled={currentQuestion === 0} // Disable when on the first question
                        >
                          <ArrowBack sx={{ fontSize: "1.8rem" }} />
                        </IconButton>

                        <IconButton
                          color="warning"
                          onClick={() => {
                            setCurrentQuestion(prev => prev + 1);
                            setProgress(prev => prev + 1);
                          }}
                          disabled={currentQuestion === totalQuestions - 1} // Disable when on the last question
                        >
                          <ArrowForward sx={{ fontSize: "1.8rem" }} />
                        </IconButton>
                      </Box>


                    </Box>

                    <Typography
                      color="#FFFFFF"
                      textAlign="left"
                      fontWeight="medium"
                      variant="body1"
                      paragraph
                    >
                      {questions[currentQuestion].question}
                    </Typography>
                  </Box>

                  <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ mt: 1 }}
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
                          handleAnswer={handleOptionClick}
                          disabledOptions={
                            selectedAnswers[currentQuestion] !== undefined
                              ? [questions[currentQuestion].options.indexOf(selectedAnswers[currentQuestion]!)]
                              : disabledOptions
                          }
                          selectedAnswer={selectedAnswer}
                        />

                        {showConfirm && selectedAnswers[currentQuestion] === undefined && (
                          <ConfirmationDialog
                            open={showConfirm}
                            onClose={cancelAnswer}
                            onConfirm={confirmAnswer}
                            selectedOption={`Option ${String.fromCharCode(97 + (questions[currentQuestion].options.indexOf(tempSelected ?? "") ?? 0)).toUpperCase()}`}
                          />
                        )}



                      </Grid>
                    ))}
                  </Grid>
                  <CardActions sx={{ justifyContent: "space-between", flexDirection: 'column', mt: 3 }}>
                    <Box display="flex" justifyContent="space-evenly" alignItems="center" width="100%">
                      {quiz_options["5050_lifeline"] && (
                        <LifelineButton
                          onClick={use5050Lifeline}
                          isDisabled={
                            questions[currentQuestion].options.length !== 4 ||
                            !lifeline5050 ||
                            selectedAnswer !== null ||
                            selectedAnswers[currentQuestion] !== undefined 
                          }
                          imageSrc="images/50_50_lifeline_button.png"
                          label="50:50 Lifeline"
                        />
                      )}
                      {quiz_options.swap_question && (
                        <LifelineButton
                          onClick={useSwapQuestion}
                          isDisabled={
                            !swapQuestion ||
                            selectedAnswer !== null ||
                            selectedAnswers[currentQuestion] !== undefined 
                          }
                          imageSrc="images/50_50_lifeline_button.png"
                          label="Swap Question"
                        />
                      )}
                    </Box>

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

                  <Box mt={2} mb={2} width="100%">
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

                  </Box>



                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: themeColors.primary,
                      color: "#ffffff",
                      border: ".5px solid #ffa500",
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

      <Box sx={{
        position: "fixed",
        bottom: 56, // Adjust this value to move it higher above the bottom
        left: "50%",
        transform: "translateX(-50%)", // Centers the button horizontally
        zIndex: 1000, // Ensures it stays above other elements
      }}
      >
        <Box
          component="button"
          sx={{
            position: "relative",
            padding: 0,
            margin: 0,
            border: "none",
            background: "none",
            width: 200,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src={`${basePath}/images/timer_box.png`}
            alt="button"
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
          <Typography

            variant="body1"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              // fontSize: "14px",
              color: "#ffffff",
              letterSpacing: '3.5px',
              // fontFamily:'Share Tech Mono',
              // fontFamily: 'Orbitron',
              textAlign: 'center',
              alignItems: "center", // Center vertically
              justifyContent: "center", // Center horizontally
              fontWeight: "medium",
              display: "flex",
              width: "100%",
              textShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            {formatTime(timeLeft)}
            {/* <Timer /> */}

          </Typography>

        </Box>
      </Box>
    </>
  );
}
