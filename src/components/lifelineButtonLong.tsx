import { Box, Typography } from "@mui/material";
import { basePath } from "../Constants";

interface LifelineButtonProps {
  onClick: () => void;
  isDisabled: boolean;
  imageSrc: string;
  label: string;
}


console.log(`basePath: ${basePath}`)
const LifelineButton: React.FC<LifelineButtonProps> = ({
  onClick,
  isDisabled,
  imageSrc,
  label,
}) => {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={isDisabled}
      sx={{
        opacity: isDisabled ? 0.5 : 1,
        position: "relative",
        padding: 0,
        margin: 0,
        border: "none",
        background: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        width: 200,
        height: 35,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.1s ease-in-out",
        "&:hover": {
          opacity: isDisabled ? 0.5 : 0.9,
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
        src={`${basePath}/${imageSrc}`}
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
          color: "#ffffff",
          fontWeight: "medium",
          width: "100%",
          textShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default LifelineButton;
