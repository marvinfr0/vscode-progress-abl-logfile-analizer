import * as vscode from 'vscode';

// import * as moment from 'moment';
class LogObject {
  public datetimeStart: string;
  public datetimeEnd: string;
  public totalTime: string;
  public processId: string;
  public threadId: string;
  public level: number;
  public type: string;
  public message: string;
  public host: LogObject;
  public childs: LogObject[];
}

class LogSynthom {

  public logResult: LogObject[];

  public analytics(logLine: string): string {
    if (logLine.length == 0)
      return;

    let topTotalTimes: LogObject[] = new Array();
    let actualHostObject: LogObject = undefined;
    let lastHostObject: LogObject = undefined;
    let totalTime = '';
    let result = '';

    let logGroups = new RegExp('(^\\[[\\d/@:.-]+]) (P-\\d{6}) (T-\\d{6}) (\\d{1}) (\\w+ [\\w ]{14}) (.+)', 'gm');

    let match = logGroups.exec(logLine);
    let level = 0;
    while (match) {

      let runMatch = new RegExp('(^Run|Func) (.+) (\\[.*\\])').exec(match[6]);
      if (runMatch) {

        let logData: LogObject = new LogObject();
        logData.datetimeStart = convertProgressDate(match[0]);
        logData.processId = match[2];
        logData.threadId = match[3];
        logData.level = Number.parseInt(match[4]);
        logData.type = match[5];
        logData.message = match[6];
        logData.childs = new Array();
        logData.host = actualHostObject;

        if (actualHostObject != undefined) {
          actualHostObject.childs.push(logData);
        }
        actualHostObject = logData;

        if(totalTime == ''){
          totalTime =  "['0', 'Tempo Total', " + actualHostObject.datetimeStart;
        }

        level++;

      }

      let returnMatch = new RegExp('(^Return) from (.+) (\\[.*\\])').exec(match[6]);
      if (returnMatch && actualHostObject != undefined) {
        actualHostObject.datetimeEnd = convertProgressDate(match[0]);

        if (topTotalTimes.length == 20) {
          if (topTotalTimes[topTotalTimes.length - 1].totalTime < actualHostObject.totalTime) {
            topTotalTimes.shift();
            topTotalTimes.push(actualHostObject);
          }
        } else {
          topTotalTimes.push(actualHostObject);
        }

        result += "['" + level + "', '" + actualHostObject.message + "', " + actualHostObject.datetimeStart + ", " + actualHostObject.datetimeEnd + "],";
        lastHostObject = actualHostObject;
        actualHostObject = actualHostObject.host;
        level--;
      }
      match = logGroups.exec(logLine);
    }

    totalTime += ", " + lastHostObject.datetimeEnd + "],";
    result = "[" + totalTime + result + "]";

    return result;
    // vscode.commands.registerCommand('log.GetAnalytics', () => {
    // 	vscode.window.
    // })

  }
}


function convertProgressDate(date: string): string | any {
  //[19/08/07@11:07:27.463-0300]

  date = date.replace('\]', '').replace('\[', '').replace('@', ' ');


  let handleReg = new RegExp('(\\d{2})/(\\d{2})/(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2}).(\\d{3})', 'gm');
  let match = handleReg.exec(date);
  if(match) {
    return "new Date(" + Number(match[1])+ ", " + Number(match[2]) + ", " + Number(match[3]) + ", " + Number(match[4]) + ", " + Number(match[5]) + ", " + Number(match[6]) + ","+ Number(match[7]) + ")";
  }
}


// Verify if a handle has been deleted
function verifyHandles(data: string): any {
  let handles: Map<string, string> = new Map<string, string>();

  let handleReg = new RegExp('(Created|Deleted|Deleted-by-GC)+([\\w .-]+)(Handle:)(\\d{4})', 'gm');
  const logLevelRanges = [];

  let match = handleReg.exec(data);
  while (match) {
    if (match[1] == "Created") {
      if (!handles.has(match[4]))
        handles.set(match[4], "Created");
    } else {
      handles.set(match[4], "Deleted");
    }
    match = handleReg.exec(data);
  }

  let message: string = "";
  handles.forEach((key, val) => {
    if (key == "Created")
      message = "Handle:" + val + " não foi deletado.";
  });
  return message;
}

//Separate key events importants to GPS log
function keyEvents(data: string): any {
  //Return from containsAnyError "no"
}

export = LogSynthom;