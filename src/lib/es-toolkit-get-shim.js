// Shim for es-toolkit/compat/get used by recharts 3.x
// Implements lodash-compatible _.get(object, path, defaultValue)
function get(object, path, defaultValue) {
  if (object == null) return defaultValue
  const keys = Array.isArray(path)
    ? path
    : String(path).replace(/\[(\d+)\]/g, '.$1').split('.')
  let result = object
  for (const key of keys) {
    if (result == null) return defaultValue
    result = result[key]
  }
  return result === undefined ? defaultValue : result
}

module.exports = get
module.exports.default = get
