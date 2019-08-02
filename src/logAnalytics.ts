'use strict';

import { stringify } from "querystring";

// import * as moment from 'moment';
class LogObject {
    public datetimeStart: string;
    public datetimeEnd: string;
    public processId: number;
    public threadId: number;
    public level: number;
    public type: string;
    public message: string;
    public totalTime: string;
    public host: LogObject;
    public childs: LogObject[];
}

class LogSynthom {

    //                                       idThread      tipo
    // [19/07/16@18:41:19.634-0300] P-012080 T-002856 2 AS 4GLTRACE       Run bosau/bosaucontrolprocessrules.p PERSIST [returnTipoBotao - fch/fchsauMD/fchsaucontrolprocessrules.p @ 1302]
    // Datetime                     idProcesso        nivel               message
    public logResult: LogObject[];

    public analytics(logLine: string): any {
        if (logLine.length == 0)
            return;

        let actualHostObject: LogObject = undefined;

        let logGroups = new RegExp('(^\\[[\\d/@:.-]+]) (P-\\d{6}) (T-\\d{6}) (\\d{1}) (\\w+ [\\w ]{14}) (.+)', 'gm');

        let match = logGroups.exec(logLine);
        while (match) {

            let logData: LogObject = new LogObject();
            logData.processId = Number.parseInt(match[2]);
            logData.threadId = Number.parseInt(match[3]);
            logData.level = Number.parseInt(match[4]);
            logData.type = match[5];
            logData.message = match[6];

            let runMatch = new RegExp('(^Run|Func) ([\\w]+) (.+) (\\[.*\\])').exec(logData.message);
            if (runMatch) {
                logData.host = actualHostObject;
                if (actualHostObject != undefined) {
                    actualHostObject.childs.push(logData);
                }
                actualHostObject = logData;
            }

            // arrumar (^Run|Func) ([\\w]+) (.+) (\\[.*\\])
            // nao bate com Run createAuthorization [getAllGuide - rtp/rtdocguia.p @ 1021]

            let returnMatch = new RegExp('(^Return) from (.+) (\\[.*\\])').exec(logData.message);
            if (returnMatch) {
                actualHostObject = logData.host;
            }

            match = logGroups.exec(logLine);
        }
    }

    // Verify if a handle has been deleted
    private verifyHandles(data: string): any {
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
    private keyEvents(data: string): any {
        //Return from containsAnyError "no"
    }

}

export = LogSynthom;
