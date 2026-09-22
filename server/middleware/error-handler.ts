import { Request, Response, NextFunction } from "express"

export class HttpError extends Error {
  statusCode: number
  code: string
  errors?: Record<string, string[]>

  constructor(statusCode: number, code: string, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = "HttpError"
    this.statusCode = statusCode
    this.code = code
    this.errors = errors
  }
}

export function errorHandler(
  err: Error | HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as HttpError).statusCode || 500
  const code = (err as HttpError).code || "INTERNAL_SERVER_ERROR"
  const message = err.message || "An unexpected error occurred."
  const errors = (err as HttpError).errors

  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err)
  }

  res.status(statusCode).json({
    status: statusCode,
    code,
    message,
    ...(errors ? { errors } : {}),
  })
}
