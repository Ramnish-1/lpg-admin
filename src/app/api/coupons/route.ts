import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let coupons: any[] = [];
let nextId = 1;

// GET /api/coupons - Get all coupons with pagination
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedCoupons = coupons.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: {
        coupons: paginatedCoupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(coupons.length / limit),
          totalItems: coupons.length,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch coupons',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const body = await request.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minAmount, 
      maxAmount, 
      expiryDate, 
      expiryTime, 
      agencyId 
    } = body;

    // Validation
    if (!code || !discountType || !discountValue || !minAmount || !expiryDate || !expiryTime) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Required fields: code, discountType, discountValue, minAmount, expiryDate, expiryTime' 
        },
        { status: 400 }
      );
    }

    if (discountType !== 'percentage' && discountType !== 'fixed') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'discountType must be either "percentage" or "fixed"' 
        },
        { status: 400 }
      );
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Percentage discount must be between 0 and 100' 
        },
        { status: 400 }
      );
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fixed discount must be a positive number' 
        },
        { status: 400 }
      );
    }

    if (minAmount < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Minimum amount must be a positive number' 
        },
        { status: 400 }
      );
    }

    if (maxAmount !== null && maxAmount < minAmount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Maximum amount must be greater than minimum amount' 
        },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = coupons.find(c => c.code === code.toUpperCase());
    if (existingCoupon) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Coupon code already exists' 
        },
        { status: 400 }
      );
    }

    // Create new coupon
    const newCoupon = {
      id: `coupon-${nextId++}`,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minAmount,
      maxAmount,
      expiryDate,
      expiryTime,
      agencyId: agencyId || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    coupons.push(newCoupon);

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
