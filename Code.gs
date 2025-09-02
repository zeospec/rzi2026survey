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
        "Your current role in Rotaract",
        "Your District Number",
        "Top 3 challenges in your term",
        "Area DRRs are least prepared for",
        "Focused training sessions needed",
        "Preferred session format at RZI",
        "Valued learning experience at RZI",
        "Value in a ‘Problem Solving Booth’",
        "Previous RZIs attended",
        "Willingness to be a panelist/speaker"
      ]);
    }

    const data = e.parameter;

    // Get all selected challenges and join them
    const challenges = e.parameters.challenges ? e.parameters.challenges.join(', ') : '';
    const trainingNeeds = e.parameters.training_needs ? e.parameters.training_needs.join(', ') : '';
    const sessionFormat = e.parameters.session_format ? e.parameters.session_format.join(', ') : '';

    // Create a new row with the form data
    const newRow = [
      new Date(),
      data.role,
      data.district_number,
      challenges,
      data.least_prepared,
      trainingNeeds,
      sessionFormat,
      data.learning_experience,
      data.problem_solving_booth,
      data.previous_rzis,
      data.willing_to_speak
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
