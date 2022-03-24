interface IConfigBase {}

// 根据项目需求而定的接口
interface IConfigDynamic {
  /**电报机器人 api码 */
  BOT_TOKEN: string;
  /** 超级管理员密码 */
  PASS: string;
}
interface IConfig extends IConfigBase, IConfigDynamic {}

export default IConfig;
