'use strict';

import * as vscode from 'vscode';
import TimePeriodCalculator = require('../src/TimePeriodCalculator');
import TimePeriodController = require('../src/TimePeriodController');
import LogSynthom = require('../src/logAnalytics');
import LogSynthomController = require('../src/logAnalyticsController');
const open = require('open');
import fs from 'fs';
import path = require('path');

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    // create a new time calculator and controller
    //const timeCalculator = new TimePeriodCalculator();
    //const timeController = new TimePeriodController(timeCalculator);

    // create log level colorizer and controller
    //const customPatternDecorator = new CustomPatternDecorator();
    //const customPatternController = new CustomPatternController(customPatternDecorator);

    // create log synthoms and controller
    const logSynthoms = new LogSynthom();
    const logSynthomController = new LogSynthomController(logSynthoms);
    

    // Add to a list of disposables which are disposed when this extension is deactivated.
    //context.subscriptions.push(timeController, customPatternController, logSynthomController);
    context.subscriptions.push(
        vscode.commands.registerCommand('analyseLog.log', () => {
            //criar document temporario com o retorno do assemblePage()
            
            let page = assemblePage(logSynthomController.searchSynthom());
            console.log(page);
            fs.writeFileSync(path.join(__dirname, '/loganalyser.html'), page);

            open(path.join(__dirname, '/loganalyser.html'), {
                app: 'Chrome',
                wait: true
            }).then(cp => console.log('child process:', cp)).catch(console.error);

        }));
}

// this method is called when your extension is deactivated
export function deactivate() {
    // Nothing to do here
}

function assemblePage(data: string): string | any {
    
    return `<!DOCTYPE html>
            <html lang="en">
            <html>
            
            </html>
            
            <body>
                <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
            
                <script type="text/javascript">
                    google.charts.load("current", { packages: ["timeline"] });
                    google.charts.setOnLoadCallback(drawChart);
                    function drawChart() {
            
                        var container = document.getElementById('example3.1');
                        var chart = new google.visualization.Timeline(container);
                        var options = {
                            width: 1800,
                            height: 1800,
                            title: 'Log Analyser',
                            colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
                          };
                        var dataTable = new google.visualization.DataTable();
                        dataTable.addColumn({ type: 'string', id: 'Nível' });
                        dataTable.addColumn({ type: 'string', id: 'Procedure' });
                        dataTable.addColumn({ type: 'date', id: 'Data Inicial' });
                        dataTable.addColumn({ type: 'date', id: 'Data Final' });
                        dataTable.addRows(` + data + `);
            
                        chart.draw(dataTable, options);
                    }
                </script>
            
                <div id="example3.1" style="height: 800px;"></div>
            </body>
            
            </html>`;
}