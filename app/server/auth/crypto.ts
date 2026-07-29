import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEYLEN = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, KEYLEN) as Buffer
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algo, saltB64, hashB64] = encodedHash.split('$')
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false
  const salt = Buffer.from(saltB64, 'base64url')
  const expected = Buffer.from(hashB64, 'base64url')
  const derived = await scrypt(password, salt, expected.length) as Buffer
  if (expected.length !== derived.length) return false
  return timingSafeEqual(expected, derived)
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('base64url')
}
