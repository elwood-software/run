import { BaseLogHandler, LevelName } from "../deps.ts";

export class StageLogHandler extends BaseLogHandler {
  constructor(levelName: LevelName) {
    super(levelName);
  }

  override log(message: string) {
  }
}
