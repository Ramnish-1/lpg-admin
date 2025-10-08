import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let platformCharge = {
  id: null,
  amount: 0
};

// GET /api/platform-charge - Get current platform charge
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    return NextResponse.json({
      success: true,
      data: platformCharge
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch platform charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/platform-charge - Add/Update platform charge
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    const body = await request.json();
    const { amount } = body;

    // Validation
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount is required' 
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount must be a positive number' 
        },
        { status: 400 }
      );
    }

    platformCharge = {
      id: platformCharge.id || 1,
      amount: amount
    };

    return NextResponse.json({
      success: true,
      message: 'Platform charge saved successfully',
      data: platformCharge
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save platform charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/platform-charge - Delete platform charge
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    platformCharge = {
      id: null,
      amount: 0
    };

    return NextResponse.json({
      success: true,
      message: 'Platform charge deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete platform charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
