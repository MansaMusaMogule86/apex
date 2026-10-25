import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { createApiApp } from '../app/server/app'

export const runtime = 'edge'

const app = createApiApp()

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app)