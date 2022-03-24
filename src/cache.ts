import md5 from "md5";

/** 用以映射action中的数据
 * 因为action自带的data的字节限制在64byte
 */
const dict: { [name: string]: string } = {};

/**
 * 通过md5的key获取对应的值
 * @param name md5的key
 * @returns 返回对应的值
 */
function get(name: string) {
  return dict[name];
}
function _set(name: string, value: string) {
  dict[name] = value;
}

/**
 * 保存值,返回对饮的md5的key
 * @param value 要保存的值
 * @returns md5的key
 */
function set(value: string) {
  let name: string = md5(value);
  _set(name, value);
  return name;
}
const cache = {
  get,
  set,
};

export default cache;
