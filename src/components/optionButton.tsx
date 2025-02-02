import { Box, Typography } from "@mui/material";
import { basePath } from "../Constants";

interface OptionButtonProps {
  option: string;
  index: number;
  handleAnswer: (option: string) => void;
  disabledOptions: number[];
  selectedAnswer: string | null;
  clickSound?: HTMLAudioElement;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  index,
  handleAnswer,
  disabledOptions,
  selectedAnswer,
}) => {
  const isDisabled =
    disabledOptions.includes(index) ||
    (selectedAnswer !== null && selectedAnswer !== option);

  const handleClick = () => {
    handleAnswer(option);
  };

  return (
    <Box
      component="button"
      sx={{
        position: "relative",
        padding: 0,
        margin: 0,
        border: "none",
        background: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        width: 300,
        height: 35,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          opacity: isDisabled ? 0.5 : 0.9,
        },
      }}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <Box
        component="img"
        src={`${basePath}/images/option_button.png`}
        alt="button"
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          opacity: isDisabled ? 0.5 : 1,
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
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {String.fromCharCode(65 + index)}. {option}
      </Typography>
    </Box>
  );
};

export default OptionButton;
