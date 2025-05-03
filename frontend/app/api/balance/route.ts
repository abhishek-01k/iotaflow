import { NextRequest, NextResponse } from 'next/server';
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client';

export async function GET(request: NextRequest) {
  try {
    // Get address from query params
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid address. Address must start with 0x.' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll return a mock balance
    // In a production app, you would connect to the IOTA network and query the actual balance
    
    // Simulate a random balance between 0 and 1000 IOTA
    const mockBalance = Math.floor(Math.random() * 1000);
    
    return NextResponse.json({ 
      success: true, 
      balance: mockBalance 
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch balance' 
      },
      { status: 500 }
    );
  }
} 