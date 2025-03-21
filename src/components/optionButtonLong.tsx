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

  const imageSrc = `${basePath}/images/options_button_resized_large.png`

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
        width: 550,
        height: 75,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          opacity: isDisabled ? 0.5 : 1,
        },
      }}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <Box
        component="img"
        src={imageSrc}
        alt="button"
        sx={{
          width: "100%",
          minHeight: "20px",
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
          color: "#ffffff",
          fontWeight: "medium",
          width: "90%",
          opacity: isDisabled ? 0.5 : 1,
          letterSpacing: '0.5px',
          lineHeight: '1',
          wordSpacing: '2px',
        }}
      >
        <span style={{ color: "#ffa500", fontWeight: "bold" }}>{String.fromCharCode(65 + index)}.</span>  {option}
      </Typography>
    </Box>
  );
};

export default OptionButton;
