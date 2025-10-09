import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, this would be from database
let deliveryCharges: any[] = [];

// GET /api/delivery-charges/agency/[agencyId] - Get delivery charge for agency
export async function GET(
  request: NextRequest,
  { params }: { params: { agencyId: string } }
) {
  try {
    // TODO: Add authentication check here
    // const user = await authenticateUser(request);
    
    const agencyId = params.agencyId;

    // Find delivery charge for agency
    const charge = deliveryCharges.find(c => c.agencyId === agencyId);

    if (!charge) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No delivery charge found for this agency'
      });
    }

    return NextResponse.json({
      success: true,
      data: charge
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch delivery charge',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
