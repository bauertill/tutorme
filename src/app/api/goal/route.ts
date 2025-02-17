import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal } = body;

    // TODO: Add your logic to save the goal (e.g., to a database)
    console.log('Received goal:', goal);

    return NextResponse.json({ message: 'Goal saved successfully', goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save goal' },
      { status: 500 }
    );
  }
} 
