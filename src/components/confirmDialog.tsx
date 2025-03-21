import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { useState } from "react";

export const themeColors = {
  primary: "#7A4BAF", // Purple shade for buttons
  secondary: "#E39A26", // Gold for highlights
  background: "#0D0D0D", // Dark theme background
  text: "#FFFFFF", // White text for readability
};

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedOption: string | null;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, onClose, onConfirm, selectedOption }) => {
  const [isClicked, setIsClicked] = useState(false);
  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true); // Disable button after first click
      onConfirm(); // Call the confirmation function
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "transparent",
          padding: "20px",
          position: "relative",
          overflow: "hidden",
          border: "2px solid #7A4BAF", // Purple border
          borderRadius: "6px",
        },
      }}
    >
      {/* Background Design */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: " #000000",
          opacity: 0.8, // Slight transparency
          zIndex: -1, // Moves it behind text
        }}
      ></div>

      <DialogTitle
        sx={{
          color: themeColors.secondary, // Gold color
          fontWeight: "bold",
          fontSize: "1.8rem",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Lock Your Answer?
      </DialogTitle>
      <DialogContent
        sx={{
          color: themeColors.text, // White text
          fontSize: "1.3rem",
          textAlign: "center",
          fontWeight: "500",
          paddingBottom: "16px",
        }}
      >
        Are you sure you want to lock <b style={{ color: themeColors.secondary }}>{selectedOption}</b>?
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#333", // Dark button
            color: themeColors.text,
            fontWeight: "bold",
            fontSize: ".9rem",
            "&:hover": { backgroundColor: "#555" },
          }}
        >
          No
        </Button>
        <Button
          onClick={handleClick}
          disabled={isClicked}
          sx={{
            backgroundColor: themeColors.primary, // Purple shade
            color: themeColors.text,
            fontWeight: "bold",
            fontSize: ".9rem",
            "&:hover": { backgroundColor: "#5E3B91" }, // Darker purple
          }}
        >
          Yes, Lock It!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
