import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await dbQuery(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
         AND table_name = 'talent_profiles' 
       ORDER BY ordinal_position`
    );
    
    return NextResponse.json({
      columns: result.rows.map((row: any) => row.column_name),
      rowCount: result.rowCount,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
