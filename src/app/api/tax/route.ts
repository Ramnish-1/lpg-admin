import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let taxConfig = {
  id: null,
  percentage: 0,
  fixedAmount: 0
};

// GET /api/tax - Get current tax configuration
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    return NextResponse.json({
      success: true,
      data: taxConfig
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch tax configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/tax - Add/Update tax configuration
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    const body = await request.json();
    const { percentage, fixedAmount } = body;

    // Validation
    if (percentage !== undefined && fixedAmount !== undefined) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot set both percentage and fixed amount. Choose one.' 
        },
        { status: 400 }
      );
    }

    if (percentage !== undefined) {
      if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Percentage must be a number between 0 and 100' 
          },
          { status: 400 }
        );
      }
      taxConfig = {
        id: taxConfig.id || 1,
        percentage: percentage,
        fixedAmount: 0
      };
    } else if (fixedAmount !== undefined) {
      if (typeof fixedAmount !== 'number' || fixedAmount < 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Fixed amount must be a positive number' 
          },
          { status: 400 }
        );
      }
      taxConfig = {
        id: taxConfig.id || 1,
        percentage: 0,
        fixedAmount: fixedAmount
      };
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Either percentage or fixedAmount is required' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tax configuration saved successfully',
      data: taxConfig
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save tax configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/tax - Delete tax configuration
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await authenticateAdmin(request);
    
    taxConfig = {
      id: null,
      percentage: 0,
      fixedAmount: 0
    };

    return NextResponse.json({
      success: true,
      message: 'Tax configuration deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete tax configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
