// src/scormUtils.ts

let scormAPI: any = null;

export function initSCORM() {
  console.log("Initializing SCORM...");

  // Check for the API object in the window and window.parent
  if (window.API) {
    scormAPI = window.API;
    console.log("SCORM API found in window.");
  } else if (window.parent && window.parent.API) {
    scormAPI = window.parent.API;
    console.log("SCORM API found in window.parent.");
  } else {
    console.error("SCORM API not found.");
    return false;
  }

  // Call LMSInitialize (or Initialize for SCORM 2004)
  if (scormAPI.LMSInitialize) {
    scormAPI.LMSInitialize("");
    console.log("SCORM API initialized.");
    return true;
  } else if (scormAPI.Initialize) {
    scormAPI.Initialize("");
    console.log("SCORM API initialized.");
    return true;
  } else {
    console.error("LMSInitialize or Initialize function not found on SCORM API.");
    return false;
  }
}

export function terminateSCORM() {
  if (scormAPI) {
    if (scormAPI.LMSFinish) {
      scormAPI.LMSFinish("");
      console.log("SCORM session terminated.");
    } else if (scormAPI.Terminate) {
      scormAPI.Terminate("");
      console.log("SCORM session terminated.");
    } else {
      console.error("LMSFinish or Terminate function not found on SCORM API.");
    }
  }
}

export function setSCORMValue(key: string, value: string) {
  if (scormAPI) {
    if (scormAPI.LMSSetValue) {
      scormAPI.LMSSetValue(key, value);
      console.log(`Set SCORM value: ${key} = ${value}`);
    } else if (scormAPI.SetValue) {
      scormAPI.SetValue(key, value);
      console.log(`Set SCORM value: ${key} = ${value}`);
    } else {
      console.error("LMSSetValue or SetValue function not found on SCORM API.");
    }
  }
}

export function commitSCORM() {
  if (scormAPI) {
    if (scormAPI.LMSCommit) {
      scormAPI.LMSCommit("");
      console.log("SCORM data committed.");
    } else if (scormAPI.Commit) {
      scormAPI.Commit("");
      console.log("SCORM data committed.");
    } else {
      console.error("LMSCommit or Commit function not found on SCORM API.");
    }
  }
}

export function getSCORMValue(key: string) {
  if (scormAPI) {
    if (scormAPI.LMSGetValue) {
      return scormAPI.LMSGetValue(key);
    } else if (scormAPI.GetValue) {
      return scormAPI.GetValue(key);
    } else {
      console.error("LMSGetValue or GetValue function not found on SCORM API.");
      return null;
    }
  }
  console.error("SCORM API not initialized.");
  return null;
}
