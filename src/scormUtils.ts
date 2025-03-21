let scormAPI: any = null;
let interactionIndex = 0;

function formatTimestamp() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`; // Append 'Z' to indicate UTC
}

export function recordInteraction({
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
}) {
  if (scormAPI) {
    const index = interactionIndex++;
    const timestamp = formatTimestamp();  // SCORM format requires time in seconds
    const questionScore = result === "correct" ? 20 : 0;  // 20 points per correct answer
    
    scormAPI.SetValue(`cmi.interactions.${index}.id`, id);
    scormAPI.SetValue(`cmi.interactions.${index}.objectives.0.id`, id);
    scormAPI.SetValue(`cmi.interactions.${index}.description`, question);  // Question text for reference
    scormAPI.SetValue(`cmi.interactions.${index}.type`, type);
    scormAPI.SetValue(`cmi.interactions.${index}.learner_response`, learnerResponse);
    scormAPI.SetValue(`cmi.interactions.${index}.correct_responses.0.pattern`, correctResponse);
    scormAPI.SetValue(`cmi.interactions.${index}.result`, result);
    scormAPI.SetValue(`cmi.interactions.${index}.weighting`, "20");  // 20 points per question
    scormAPI.SetValue(`cmi.interactions.${index}.timestamp`, timestamp.toString());

    console.log(`Recorded interaction ${index}:`, {
      id,
      question,
      type,
      learnerResponse,
      correctResponse,
      result,
      questionScore,
      timestamp,
    });

  }
}



export function initSCORM() {
  console.log("Initializing SCORM...");

  // Check for the API object in the window and window.parent
  if (window.API_1484_11) {
    scormAPI = window.API_1484_11;
    console.log("SCORM 2004 API found in window.");
  } else if (window.parent && window.parent.API_1484_11) {
    scormAPI = window.parent.API_1484_11;
    console.log("SCORM 2004 API found in window.parent.");
  } else {
    console.error("SCORM 2004 API not found.");
    return false;
  }

  // Call Initialize for SCORM 2004
  if (scormAPI.Initialize) {
    const success = scormAPI.Initialize("");
    console.log("SCORM API initialized.");
    return success === "true";
  } else {
    console.error("Initialize function not found on SCORM API.");
    return false;
  }
}

export function terminateSCORM() {
  if (scormAPI) {
    if (scormAPI.Terminate) {
      const success = scormAPI.Terminate("");
      console.log("SCORM session terminated.");
      return success === "true";
    } else {
      console.error("Terminate function not found on SCORM API.");
    }
  }
}

export function setSCORMValue(key: string, value: string) {
  if (scormAPI) {
    if (scormAPI.SetValue) {
      const success = scormAPI.SetValue(key, value);
      console.log(`Set SCORM value: ${key} = ${value}`);
      return success === "true";
    } else {
      console.error("SetValue function not found on SCORM API.");
    }
  }
}

export function commitSCORM() {
  if (scormAPI) {
    if (scormAPI.Commit) {
      const success = scormAPI.Commit("");
      console.log("SCORM data committed.");
      return success === "true";
    } else {
      console.error("Commit function not found on SCORM API.");
    }
  }
}

export function getSCORMValue(key: string) {
  if (scormAPI) {
    if (scormAPI.GetValue) {
      const value = scormAPI.GetValue(key);
      console.log(`Got SCORM value: ${key} = ${value}`);
      return value;
    } else {
      console.error("GetValue function not found on SCORM API.");
      return null;
    }
  }
  console.error("SCORM API not initialized.");
  return null;
}
