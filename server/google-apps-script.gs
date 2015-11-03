// LICENSES http://www.apache.org/licenses/LICENSE-2.0
var SHEET_NAME = 'Your_sheet_name';
var SHEET_ID = 'Your_Sheet_ID'
function setData(parameters) {
  var lock = LockService.getPublicLock();
  lock.waitLock(30000); 
   
  try {
    var doc = SpreadsheetApp.openById(SHEET_ID);//doc id for target spreadsheet
    var sheet = doc.getSheetByName(SHEET_NAME);
    var headRow = parameters.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1; // get next row
    var row = [];
    // loop through the header columns
    for (i in headers){
      if (headers[i] == "timestamp"){ // special case if you include a 'Timestamp' column
        row.push(new Date());
      } else if (headers[i] == "username"){ // special case if you include a 'email' column
        row.push(Session.getEffectiveUser().getEmail());
      } else { // else use header name to get data
        row.push(parameters[headers[i]]);
      }
    }
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
    return getData();
  } catch(e){
    // if error return this
    return {"result": JSON.stringify(e)};
  } finally { //release lock
    lock.releaseLock();
  }
}
