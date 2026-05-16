import * as crypto from "crypto";
import * as vscode from "vscode";

interface ProjectTimeRecord {
  /** 项目显示名称 */
  name: string;
  /** 累计专注时长，单位：秒 */
  duration: number;
  /** 最近一次更新时间戳（毫秒） */
  updatedAt: number;
}

/**
 * 统一管理插件的全局持久化数据（保存在 VS Code globalState）。
 * 说明：
 * - key 使用项目绝对路径的 MD5，避免特殊字符导致 key 解析问题。
 * - 所有 duration 以秒为单位，便于心跳机制直接累加。
 */
export class StorageManager {
  private static readonly KEY_PREFIX = "project_time";

  public constructor(private readonly globalState: vscode.Memento) {}

  /**
   * 读取项目累计时长（秒）。
   * @param projectPath 项目绝对路径
   */
  public getProjectTime(projectPath: string): number {
    if (!projectPath) {
      return 0;
    }

    const key = this.buildStorageKey(projectPath);
    const record = this.globalState.get<ProjectTimeRecord>(key);

    if (!record || !Number.isFinite(record.duration) || record.duration < 0) {
      return 0;
    }

    return Math.floor(record.duration);
  }

  /**
   * 为指定项目累加时长（秒）。
   * @param projectPath 项目绝对路径
   * @param projectName 项目名称（用于 UI 展示）
   * @param durationToAdd 本次新增时长（秒）
   */
  public async updateProjectTime(
    projectPath: string,
    projectName: string,
    durationToAdd: number
  ): Promise<void> {
    if (!projectPath || !projectName) {
      return;
    }

    if (!Number.isFinite(durationToAdd) || durationToAdd <= 0) {
      return;
    }

    const key = this.buildStorageKey(projectPath);
    const previous = this.globalState.get<ProjectTimeRecord>(key);

    const previousDuration =
      previous && Number.isFinite(previous.duration) && previous.duration > 0
        ? Math.floor(previous.duration)
        : 0;

    const nextRecord: ProjectTimeRecord = {
      name: projectName,
      duration: previousDuration + Math.floor(durationToAdd),
      updatedAt: Date.now()
    };

    await this.globalState.update(key, nextRecord);
  }

  /**
   * 将项目路径转换为稳定且安全的存储 key。
   */
  private buildStorageKey(projectPath: string): string {
    const hash = crypto.createHash("md5").update(projectPath).digest("hex");
    return `${StorageManager.KEY_PREFIX}:${hash}`;
  }
}
