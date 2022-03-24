/** 文件信息 */
interface IFileInfo {
  adminId: number;
  /** 白名单 */
  whilteList: string[];
  /** 敏感词 */
  wordList: string[];
}

export default IFileInfo;
