import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { themeColors } from "../Constants";

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  userResponses: { question: string; userAnswer: string; correctAnswer: string }[];
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({ open, onClose, userResponses }) => {
  return (
    <Dialog open={open} onClose={onClose}  maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: themeColors.primary,
          color: "#fff",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.5rem",
          padding: "16px",
        }}
      >
        📜 Review Your Answers
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: themeColors.background,
          padding: "20px",
        }}
      >
        {userResponses.length > 0 ? (
          userResponses.map((response, index) => {
            const isCorrect = response.userAnswer === response.correctAnswer;
            return (
              <Card
                key={index}
                sx={{
                  m: 2,

                  boxShadow: 3,
                  borderLeft: `8px solid ${isCorrect ? themeColors.success : "red"}`,
                  backgroundColor: "#fff",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: themeColors.primary }}>
                    {`Q${index + 1}: ${response.question}`}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    {isCorrect ? (
                      <CheckCircleIcon sx={{ color: themeColors.success, mr: 1 }} />
                    ) : (
                      <CancelIcon sx={{ color: "red", mr: 1 }} />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        color: isCorrect ? themeColors.success : "red",
                        fontWeight: "bold",
                      }}
                    >
                      Your Answer: {response.userAnswer}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: themeColors.secondary,
                      fontWeight: "bold",
                      mt: 1,
                    }}
                  >
                    ✅ Correct Answer: {response.correctAnswer}
                  </Typography>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: themeColors.primary,
            }}
          >
            No responses available for review.
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: themeColors.background,
          padding: "12px",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: themeColors.primary,
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;
