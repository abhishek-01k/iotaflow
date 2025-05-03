import { NextRequest, NextResponse } from 'next/server';
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client';
import { getFaucetHost, requestIotaFromFaucetV1 } from '@iota/iota-sdk/faucet';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid address. Address must start with 0x.' },
        { status: 400 }
      );
    }

    // Request IOTA from faucet (using devnet for testing)
    let results = [];
    for(let i = 0; i < 10; i++) {
      const result = await requestIotaFromFaucetV1({
        host: getFaucetHost('testnet'),
        recipient: address,
      });
      results.push(result);
    }
    const result = results[results.length - 1]; // Keep last result for response

    return NextResponse.json({ success: true, message: 'Tokens requested successfully', data: result });
  } catch (error) {
    console.error('Error requesting tokens from faucet:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to request tokens from faucet' 
      },
      { status: 500 }
    );
  }
} 