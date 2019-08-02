'use strict';

import * as vscode from 'vscode';
import { StatusBarItem } from 'vscode';
import LogSynthom = require('./logAnalytics');

class TimePeriodController {

    private _logSynthom: LogSynthom;
    private _disposable: vscode.Disposable;
    private _statusBarItem: vscode.StatusBarItem;

    constructor(logSynthom: LogSynthom) {
        this._logSynthom = logSynthom;

        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        // subscribe to selection change and editor activation events
        const subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        // update the counter for the current file
        this.searchSynthom(this._statusBarItem);

        // create a combined disposable from both event subscriptions
        this._disposable = vscode.Disposable.from(...subscriptions);
    }

    public dispose() {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }

    public searchSynthom(statusBarItem: StatusBarItem) {

        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        const doc = editor.document;

        let text = this._logSynthom.analytics(doc.getText(editor.selection));
        this._statusBarItem.text = text;
        this._statusBarItem.show();




        // // Only update status if an log file
        // if (doc.languageId === 'log') {

        //     this._statusBarItem.text = '';
        //     const timePeriod = this._logSynthom.getTimePeriod(doc.getText(editor.selection));

        //     if (timePeriod !== undefined) {

        //         // Update the status bar
        //         this._statusBarItem.text = this._logSynthom.convertToDisplayString(timePeriod);
        //         this._statusBarItem.show();

        //     } else {
        //         this._statusBarItem.hide();
        //     }

        // } else {
        //     this._statusBarItem.hide();
        // }
    }

    private _onEvent() {
        this.searchSynthom(this._statusBarItem);
    }
}

export = TimePeriodController;
