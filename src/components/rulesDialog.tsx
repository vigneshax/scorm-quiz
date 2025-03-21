import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { basePath, themeColors } from '../Constants';

interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
  student: string | null;
  rules: string[];
}

const RulesDialog: React.FC<RulesDialogProps> = ({ open, onClose, student, rules }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false} // Override default width limits
      fullWidth
      PaperProps={{
        sx: {
          width: "auto",
          backgroundColor: "#0D0D0D",
          padding: "20px",
          border: "1px solid #7A4BAF",
          borderRadius: "6px",
        },
      }}
    >

      <DialogTitle sx={{ color: themeColors.primary, textAlign: "center", fontWeight: "bold" }}>
        Welcome {student}
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center" sx={{ color: themeColors.warning, mb: 2 }}>
          Here are the rules:
        </Typography>

        {rules.map((rule, index) => (
          <Typography key={index} sx={{ color: "white", mb: 1 }}>
            <span style={{ color: "#ffa500", fontWeight: "bold" }}>{index + 1}.</span> {rule}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ backgroundColor: themeColors.primary, '&:hover': { backgroundColor: themeColors.secondary } }}
        >
          Start Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RulesDialog;
