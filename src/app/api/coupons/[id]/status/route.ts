import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
// This would be imported from a shared data store
let coupons: any[] = [];

// PATCH /api/coupons/[id]/status - Toggle coupon status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const couponId = params.id;
    const body = await request.json();
    const { isActive } = body;

    // Validation
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'isActive must be a boolean value' 
        },
        { status: 400 }
      );
    }

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

    // Update coupon status
    const updatedCoupon = {
      ...coupons[couponIndex],
      isActive,
      updatedAt: new Date().toISOString()
    };

    coupons[couponIndex] = updatedCoupon;

    return NextResponse.json({
      success: true,
      message: isActive ? 'Coupon activated successfully' : 'Coupon deactivated successfully',
      data: updatedCoupon
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update coupon status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
