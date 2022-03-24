import IConfig from "./iconfig";
import baseConf from "./base";
import testConf from "./test";
import devConf from "./dev";
import dockerConf from "./docker";
import prodConf from "./product";

const env = process.env.NODE_ENV || "dev";
console.log("node env:", env);

let conf: IConfig = null;
if ("test" === env) {
  conf = Object.assign({}, baseConf, testConf);
} else if ("dev" === env) {
  conf = Object.assign({}, baseConf, devConf);
} else if ("product" === env) {
  conf = Object.assign({}, baseConf, prodConf);
} else if ("docker" === env) {
  conf = Object.assign({}, baseConf, dockerConf);
} else {
  throw "invalid environment: " + env;
}

export default conf;
