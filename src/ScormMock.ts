let scormData: any = {
  "cmi.core.student_name": "John Doe",
  "cmi.core.score.raw": "0",
  "cmi.core.lesson_status": "incomplete",
  "cmi.core.exit": "",
  "cmi.interactions": [],
  "cmi.objectives": [],
};

let interactionIndex = 0;
let objectiveIndex = 0;

export const initSCORM = () => {
  console.log("SCORM API Initialized.");
  return true; // Simulate successful initialization
};

export const terminateSCORM = () => {
  console.log("SCORM API Terminated.");
};

export const getSCORMValue = (key: string) => {
  const value = scormData[key] || "";
  console.log(`SCORM Get Value: ${key} = ${value}`);
  return value;
};

export const setSCORMValue = (key: string, value: any) => {
  console.log(`SCORM Set Value: ${key} = ${value}`);
  if (key.startsWith("cmi.interactions.")) {
    const match = key.match(/cmi\.interactions\.(\d+)\.(.+)/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2];
      scormData["cmi.interactions"][index] = scormData["cmi.interactions"][index] || {};
      scormData["cmi.interactions"][index][field] = value;
    }
  } else if (key.startsWith("cmi.objectives.")) {
    const match = key.match(/cmi\.objectives\.(\d+)\.(.+)/);
    if (match) {
      const index = parseInt(match[1], 10);
      const field = match[2];
      scormData["cmi.objectives"][index] = scormData["cmi.objectives"][index] || {};
      scormData["cmi.objectives"][index][field] = value;
    }
  } else {
    scormData[key] = value;
  }
};

export const commitSCORM = () => {
  console.log("SCORM Data Committed:", JSON.stringify(scormData, null, 2));
};

// Record interaction
export const recordInteraction = ({
  id,
  question,
  type,
  learnerResponse,
  correctResponse,
  result,
}: {
  id: string;
  question: string;
  type: string;
  learnerResponse: string;
  correctResponse: string;
  result: string;
}) => {
  const index = interactionIndex++;
  scormData["cmi.interactions"][index] = {
    id,
    question,
    type,
    learner_response: learnerResponse,
    correct_responses: [{ pattern: correctResponse }],
    result,
    timestamp: formatTimestamp(),
  };
  console.log(`Recorded Interaction [${index}]:`, scormData["cmi.interactions"][index]);
};

// Record objective
export const recordObjective = ({
  id,
  score,
  successStatus,
  completionStatus,
  description,
}: {
  id: string;
  score: number;
  successStatus: "passed" | "failed" | "unknown";
  completionStatus: "completed" | "incomplete" | "not attempted" | "unknown";
  description: string;
}) => {
  const index = objectiveIndex++;
  scormData["cmi.objectives"][index] = {
    id,
    score: {
      raw: score,
      min: 0,
      max: 100,
    },
    success_status: successStatus,
    completion_status: completionStatus,
    description,
  };
  console.log(`Recorded Objective [${index}]:`, scormData["cmi.objectives"][index]);
};

// Format timestamp for SCORM
const formatTimestamp = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};
