import { prisma } from './prisma';

export async function trackEvent(
  eventName: string,
  eventData?: Record<string, any>,
  userId?: string
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        eventData: eventData ? JSON.stringify(eventData) : null,
        userId,
      },
    });

    // Also log to console
    console.log(`📊 Analytics: ${eventName}`, eventData);

    // Push to dataLayer for GTM integration (if window exists)
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Event names
export const EVENTS = {
  APPLICATION_SUBMITTED: 'application_submitted',
  STATUS_CHANGED: 'status_changed',
  CLARIFICATION_REQUESTED: 'clarification_requested',
  APPLICATION_APPROVED: 'application_approved',
  PRODUCT_DRAFTED: 'product_drafted',
  PRODUCT_PUBLISHED: 'product_published',
  FINANCE_ADDED: 'finance_added',
  ADDRESS_ADDED: 'address_added',
  CHECKLIST_COMPLETED: 'checklist_completed',
  FIRST_ORDER_SIMULATED: 'first_order_simulated',
  DASHBOARD_WIDGET_VIEWED: 'dashboard_widget_viewed',
};
