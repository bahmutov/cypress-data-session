// from simple-sha256
// but with the fix https://github.com/feross/simple-sha256/pull/2
module.exports = sha256

const crypto = globalThis.crypto || globalThis.msCrypto
const subtle = crypto.subtle || crypto.webkitSubtle

function sha256sync(buf) {
  throw new Error('No support for sha256.sync() in the browser, use sha256()')
}

function hashCode(s) {
  return s.split('').reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
}

/**
 * Computes hash of the given string
 * @param {string} s - string to hash
 */
async function sha256(s) {
  const buf = typeof s === 'string' ? strToBuf(s) : s

  // Browsers throw if they lack support for an algorithm.
  // Promise will be rejected on non-secure origins. (http://goo.gl/lq4gCo)
  try {
    const hash = await subtle.digest({ name: 'sha-256' }, buf)
    return hex(new Uint8Array(hash))
  } catch (err) {
    // use plain JavaScript
    return hashCode(s)
  }
}

function strToBuf(str) {
  const len = str.length
  const buf = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buf[i] = str.charCodeAt(i)
  }
  return buf
}

function hex(buf) {
  const len = buf.length
  const chars = []
  for (let i = 0; i < len; i++) {
    const byte = buf[i]
    chars.push((byte >>> 4).toString(16))
    chars.push((byte & 0x0f).toString(16))
  }
  return chars.join('')
}
