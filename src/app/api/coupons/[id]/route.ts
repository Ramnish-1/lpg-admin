import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
// This would be imported from a shared data store
let coupons: any[] = [];

// PUT /api/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const couponId = params.id;
    const body = await request.json();
    const { 
      code, 
      discountValue, 
      maxAmount, 
      isActive 
    } = body;

    // Find coupon
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    if (couponIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Coupon not found' 
        },
        { status: 404 }
      );
    }

    const coupon = coupons[couponIndex];

    // Validation for updates
    if (code && code !== coupon.code) {
      // Check if new code already exists
      const existingCoupon = coupons.find(c => c.code === code.toUpperCase() && c.id !== couponId);
      if (existingCoupon) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Coupon code already exists' 
          },
          { status: 400 }
        );
      }
    }

    if (discountValue !== undefined) {
      if (coupon.discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Percentage discount must be between 0 and 100' 
          },
          { status: 400 }
        );
      }

      if (coupon.discountType === 'fixed' && discountValue < 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Fixed discount must be a positive number' 
          },
          { status: 400 }
        );
      }
    }

    if (maxAmount !== undefined && maxAmount !== null && maxAmount < coupon.minAmount) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Maximum amount must be greater than minimum amount' 
        },
        { status: 400 }
      );
    }

    // Update coupon
    const updatedCoupon = {
      ...coupon,
      ...(code && { code: code.toUpperCase() }),
      ...(discountValue !== undefined && { discountValue }),
      ...(maxAmount !== undefined && { maxAmount }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    coupons[couponIndex] = updatedCoupon;

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const couponId = params.id;

    // Find coupon
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    if (couponIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Coupon not found' 
        },
        { status: 404 }
      );
    }

    // Remove coupon
    coupons.splice(couponIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete coupon',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
