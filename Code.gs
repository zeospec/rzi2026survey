// 1. Set the name of the sheet where you want to store the data
const SHEET_NAME = "Responses";

// 2. This function runs when the form is submitted
function doPost(e) {
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // If the sheet doesn't exist, create it and add headers
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Your Name",
        "Your current role in Rotaract",
        "Your District Number",
        "What were your top 3 challenges in your term?",
        "Which area do you feel DRRs are least prepared for at the start of their term?",
        "Which of the following areas need focused learning sessions at RZI?",
        "Preferred session format at RZI",
        "What kind of learning experience would you value most at RZI?",
        "Would you find value in a 'Problem Solving Booth' at RZI where experienced leaders guide on specific issues?",
        "How many previous RZIs have you attended?",
        "Would you be willing to be a panelist/speaker at RZI if invited?",
        "Do you have additional feedback or suggestions for improving the RZI experience?"
      ]);
    }

    const data = e.parameter;

    // Helpers to read multi-select fields
    const joinMulti = (arr) => (Array.isArray(arr) ? arr.join(', ') : (arr ? String(arr) : ''));

    // Multi-select fields
    const challenges = joinMulti(e.parameters.challenges);
    const trainingNeeds = joinMulti(e.parameters.training_needs);
    const sessionFormat = joinMulti(e.parameters.session_format);
    const learningExperience = joinMulti(e.parameters.learning_experience);

    // Create a new row with the form data
    const newRow = [
      new Date(),
      data.name || '',
      data.role || '',
      data.district_number || '',
      challenges,
      data.least_prepared || '',
      trainingNeeds,
      sessionFormat,
      learningExperience,
      data.problem_solving_booth || '',
      data.previous_rzis || '',
      data.willing_to_speak || '',
      data.feedback || ''
    ];

    // Append the new row to the sheet
    sheet.appendRow(newRow);

    // Return a success response
    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return an error response
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
