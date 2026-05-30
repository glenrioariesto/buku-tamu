import { NextResponse } from 'next/server';
import { z } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

type RouteHandler = (req: Request) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.status },
        );
      }
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}

export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Validation error';
    throw new AppError(message, 400);
  }
  return result.data;
}
