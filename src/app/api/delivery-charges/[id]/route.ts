import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let deliveryCharges: any[] = [];

// PUT /api/delivery-charges/[id] - Update delivery charge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const chargeId = params.id;
    const body = await request.json();
    const { chargeType, ratePerKm, fixedAmount, deliveryRadius, status } = body;

    // Find delivery charge
    const chargeIndex = deliveryCharges.findIndex(c => c.id === chargeId);
    if (chargeIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Delivery charge not found' 
        },
        { status: 404 }
      );
    }

    const existingCharge = deliveryCharges[chargeIndex];

    // Validation
    if (chargeType && chargeType !== 'per_km' && chargeType !== 'fixed') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'chargeType must be either "per_km" or "fixed"' 
        },
        { status: 400 }
      );
    }

    const newChargeType = chargeType || existingCharge.chargeType;

    if (newChargeType === 'per_km' && ratePerKm !== undefined && ratePerKm < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'ratePerKm must be a positive number' 
        },
        { status: 400 }
      );
    }

    if (newChargeType === 'fixed' && fixedAmount !== undefined && fixedAmount < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'fixedAmount must be a positive number' 
        },
        { status: 400 }
      );
    }

    if (deliveryRadius !== undefined && deliveryRadius < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'deliveryRadius must be a positive number' 
        },
        { status: 400 }
      );
    }

    // Update delivery charge
    const updatedCharge = {
      ...existingCharge,
      chargeType: newChargeType,
      ratePerKm: newChargeType === 'per_km' ? (ratePerKm !== undefined ? ratePerKm : existingCharge.ratePerKm) : null,
      fixedAmount: newChargeType === 'fixed' ? (fixedAmount !== undefined ? fixedAmount : existingCharge.fixedAmount) : null,
      deliveryRadius: deliveryRadius !== undefined ? deliveryRadius : existingCharge.deliveryRadius,
      status: status !== undefined ? status : existingCharge.status,
      updatedAt: new Date().toISOString()
    };

    deliveryCharges[chargeIndex] = updatedCharge;

    return NextResponse.json({
      success: true,
      message: 'Delivery charge updated successfully',
      data: updatedCharge
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update delivery charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery-charges/[id] - Delete delivery charge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const chargeId = params.id;

    // Find delivery charge
    const chargeIndex = deliveryCharges.findIndex(c => c.id === chargeId);
    if (chargeIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Delivery charge not found' 
        },
        { status: 404 }
      );
    }

    // Remove delivery charge
    deliveryCharges.splice(chargeIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Delivery charge deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete delivery charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
