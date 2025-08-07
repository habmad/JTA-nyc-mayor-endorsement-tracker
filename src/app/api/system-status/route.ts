import { NextResponse } from 'next/server';
import { getMockSystemStatus } from '../../../lib/system-status';

export async function GET() {
  try {
    // In production, this would connect to Redis and get real queue stats
    const status = getMockSystemStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting system status:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
} 