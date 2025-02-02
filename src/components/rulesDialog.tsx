import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Card, CardHeader, CardContent, CardActions, Box } from '@mui/material';
import { basePath } from '../Constants';

interface RulesDialogProps {
  onClose: () => void;
}

const RulesDialog: React.FC<RulesDialogProps> = ({ onClose }) => {
  return (
    <Card sx={{ bgcolor: "transparent", p: 2 }}>
      <CardHeader
        sx={{
          color: "#ffa500",
          textAlign: "center",
          mb: 2,
        }}

        titleTypographyProps={{ fontFamily: "Orbitron", fontWeight: "medium", }}
        title="Rules"
      />
      <CardContent>
        <Typography sx={{ color: "white", mb: 1 }}>
          <span style={{ color: "#ffa500", fontWeight: "bold" }}>1.</span> You will have 10 seconds to answer each question.
        </Typography>
        <Typography sx={{ color: "white", mb: 1 }}>
          <span style={{ color: "#ffa500", fontWeight: "bold" }}>2.</span> If the time runs out, the question will be skipped, and you will move to the next one.
        </Typography>
        <Typography sx={{ color: "white", mb: 1 }}>
          <span style={{ color: "#ffa500", fontWeight: "bold" }}>3.</span> Try to answer as many questions as you can.
        </Typography>
        <Typography sx={{ color: "white", mb: 1 }}>
          <span style={{ color: "#ffa500", fontWeight: "bold" }}>4.</span> Once you start, the timer will automatically keep running.
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: "flex", // Use flexbox
          justifyContent: "center", // Center horizontally
          mt: 2, // Add some margin on top
        }}
      >
        <Box
          component="button"
          onClick={() => onClose()}
          sx={{
            opacity: 1,
            position: "relative",
            padding: 0,
            margin: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            width: 150,
            height: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.1s ease-in-out",
            "&:hover": {
              opacity: 0.9,
            },
            "&:active": {
              transform: "scale(0.95)",
            },
            "&:disabled": {
              pointerEvents: "none",
            },
          }}
        >
          <Box
            component="img"
            src={`${basePath}/images/50_50_lifeline_button.png`}
            alt="button"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "14px",
              // color: "#ffffff",
              fontWeight: "bold",
              letterSpacing: "2px",
              width: "100%",
              // textShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            START QUIZ
          </Typography>
        </Box>
      </CardActions>
    </Card>
  );
};

export default RulesDialog;
