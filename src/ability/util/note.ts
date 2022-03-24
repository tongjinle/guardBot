import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import IFileInfo from "./IFileInfo";

const file: string = path.join(__dirname, "../../../fileinfo.json");
const read: () => Promise<IFileInfo> = async () => {
  if (!fs.existsSync(file)) {
    const empty: IFileInfo = {
      adminId: null,
      whilteList: [],
      wordList: [],
    };
    jsonfile.writeFileSync(file, empty);
  }

  return jsonfile.readFileSync(file);
};

const write: (info: IFileInfo) => Promise<void> = async (info) => {
  jsonfile.writeFileSync(file, info);
};

const note = { read, write };

export default note;
