import * as vscode from "vscode";
import { StorageManager } from "./storage";
import { TimeTracker } from "./tracker";

let tracker: TimeTracker | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext): void {
  console.log("[focus-time-tracker] activate called");

  const storage = new StorageManager(context.globalState);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
  statusBarItem.command = "focusTimeTracker.showStatus";
  statusBarItem.text = "$(clock) Focus: --";
  statusBarItem.tooltip = "Focus Time Tracker";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const refreshStatusBar = (): void => {
    if (!statusBarItem || !tracker) {
      return;
    }

    const state = tracker.getDisplayState();
    if (!state) {
      statusBarItem.text = "$(clock) Focus: 无项目";
      statusBarItem.tooltip = "请在工作区中打开一个文件后开始计时";
      statusBarItem.show();
      return;
    }

    const totalMinutes = Math.floor(state.totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    statusBarItem.text = `$(clock) ${state.projectName}: ${hours}小时 ${minutes}分钟`;
    statusBarItem.tooltip = "Focus Time Tracker: 当前工作区净活跃时长";
    statusBarItem.show();
  };

  tracker = new TimeTracker(storage, refreshStatusBar);
  context.subscriptions.push(tracker);

  const showStatusCmd = vscode.commands.registerCommand("focusTimeTracker.showStatus", () => {
    refreshStatusBar();
  });
  context.subscriptions.push(showStatusCmd);

  refreshStatusBar();
}

export function deactivate(): void {
  if (tracker) {
    tracker.dispose();
    tracker = undefined;
  }

  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = undefined;
  }
}
