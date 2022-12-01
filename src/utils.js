/// @ts-check

function valueToString(x) {
  if (typeof x === 'string') {
    return '"' + x + '"'
  }
  const s = JSON.stringify(x)
  // @ts-ignore
  const maxN = chai.config.truncateThreshold || 100
  if (s.length > maxN) {
    return s.substring(0, maxN) + '...'
  }
  return s
}

module.exports = { valueToString }
