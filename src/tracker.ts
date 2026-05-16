import * as path from "path";
import * as vscode from "vscode";
import { StorageManager } from "./storage";

const HEARTBEAT_SECONDS = 60;
const IDLE_THRESHOLD_SECONDS = 300;

export class TimeTracker implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private timer: NodeJS.Timeout | undefined;
  private lastActiveAt = Date.now();
  private currentProjectPath: string | undefined;
  private currentProjectName: string | undefined;

  public constructor(
    private readonly storage: StorageManager,
    private readonly onTick: () => void
  ) {
    this.bindEvents();
    this.refreshCurrentProject();
    this.onTick();
    this.startHeartbeat();
  }

  public getDisplayState(): { projectName: string; totalSeconds: number } | undefined {
    if (!this.currentProjectPath || !this.currentProjectName) {
      return undefined;
    }

    const totalSeconds = this.storage.getProjectTime(this.currentProjectPath);
    return {
      projectName: this.currentProjectName,
      totalSeconds
    };
  }

  public dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables.length = 0;
  }

  private bindEvents(): void {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(() => {
        this.markActive();
      })
    );

    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(() => {
        this.markActive();
      })
    );

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => {
        this.refreshCurrentProject();
        this.markActive();
        this.onTick();
      })
    );

    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.refreshCurrentProject();
        this.onTick();
      })
    );
  }

  private startHeartbeat(): void {
    this.timer = setInterval(() => {
      void this.handleHeartbeat();
    }, HEARTBEAT_SECONDS * 1000);
  }

  private async handleHeartbeat(): Promise<void> {
    if (!this.currentProjectPath || !this.currentProjectName) {
      this.onTick();
      return;
    }

    const idleSeconds = (Date.now() - this.lastActiveAt) / 1000;
    if (idleSeconds > IDLE_THRESHOLD_SECONDS) {
      this.onTick();
      return;
    }

    await this.storage.updateProjectTime(
      this.currentProjectPath,
      this.currentProjectName,
      HEARTBEAT_SECONDS
    );

    this.onTick();
  }

  private markActive(): void {
    this.lastActiveAt = Date.now();
  }

  private refreshCurrentProject(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.currentProjectPath = undefined;
      this.currentProjectName = undefined;
      return;
    }

    const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    if (!folder) {
      this.currentProjectPath = undefined;
      this.currentProjectName = undefined;
      return;
    }

    this.currentProjectPath = folder.uri.fsPath;
    this.currentProjectName = path.basename(folder.uri.fsPath) || folder.name;
  }
}
