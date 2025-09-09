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
        "Top 3 challenges in your term",
        "Area DRRs are least prepared for",
        "Focused learning sessions needed",
        "Preferred session format at RZI",
        "Valued learning experience at RZI",
        "Value in a ‘Problem Solving Booth’",
        "Previous RZIs attended",
        "Willingness to be a panelist/speaker",
        "Additional Feedback"
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
