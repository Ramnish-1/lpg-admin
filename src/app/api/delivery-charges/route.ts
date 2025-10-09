import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let deliveryCharges: any[] = [];
let nextId = 1;

// POST /api/delivery-charges - Create delivery charge
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const body = await request.json();
    const { agencyId, chargeType, ratePerKm, fixedAmount, deliveryRadius, status } = body;

    // Validation
    if (!agencyId || !chargeType) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'agencyId and chargeType are required' 
        },
        { status: 400 }
      );
    }

    if (!deliveryRadius || deliveryRadius < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'deliveryRadius is required and must be a positive number' 
        },
        { status: 400 }
      );
    }

    if (chargeType !== 'per_km' && chargeType !== 'fixed') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'chargeType must be either "per_km" or "fixed"' 
        },
        { status: 400 }
      );
    }

    if (chargeType === 'per_km' && (!ratePerKm || ratePerKm < 0)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'ratePerKm is required and must be a positive number for per_km charge' 
        },
        { status: 400 }
      );
    }

    if (chargeType === 'fixed' && (!fixedAmount || fixedAmount < 0)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'fixedAmount is required and must be a positive number for fixed charge' 
        },
        { status: 400 }
      );
    }

    // Check if agency already has a delivery charge
    const existingCharge = deliveryCharges.find(c => c.agencyId === agencyId);
    if (existingCharge) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Agency already has a delivery charge. Please update the existing one.' 
        },
        { status: 400 }
      );
    }

    // Create new delivery charge
    const newCharge = {
      id: `delivery-charge-${nextId++}`,
      agencyId,
      chargeType,
      ratePerKm: chargeType === 'per_km' ? ratePerKm : null,
      fixedAmount: chargeType === 'fixed' ? fixedAmount : null,
      deliveryRadius,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    deliveryCharges.push(newCharge);

    return NextResponse.json({
      success: true,
      message: 'Delivery charge created successfully',
      data: newCharge
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create delivery charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
