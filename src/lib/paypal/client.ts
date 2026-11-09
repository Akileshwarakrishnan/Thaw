export interface PayPalConfig {
  clientId?: string;
  clientSecret?: string;
  env?: "sandbox" | "live";
  webhookId?: string;
}

export interface PayPalTrackerPayload {
  transaction_id: string;
  tracking_number: string;
  status: "SHIPPED" | "DELIVERED" | "ON_HOLD";
  carrier: "FEDEX" | "UPS" | "USPS" | "DHL" | "OTHER";
}

export interface PayPalRefundPayload {
  capture_id: string;
  amount?: {
    value: string;
    currency_code: string;
  };
  note_to_payer?: string;
}

export class PayPalClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: PayPalConfig) {
    this.clientId = config?.clientId || process.env.PAYPAL_CLIENT_ID || "";
    this.clientSecret = config?.clientSecret || process.env.PAYPAL_CLIENT_SECRET || "";
    const env = config?.env || process.env.PAYPAL_ENV || "sandbox";
    this.baseUrl =
      env === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
  }

  public isConfigured(): boolean {
    return Boolean(
      this.clientId &&
      this.clientSecret &&
      !this.clientId.startsWith("mock_")
    );
  }

  /**
   * Fetch OAuth 2.0 Access Token
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.isConfigured()) {
      return "mock_sandbox_access_token_thaw_demo";
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PayPal OAuth failure (${response.status}): ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  /**
   * Upload shipment tracking to PayPal
   * Calls POST /v1/shipping/trackers
   */
  async uploadTracking(tracker: PayPalTrackerPayload): Promise<{
    tracker_id: string;
    status: string;
  }> {
    if (!this.isConfigured()) {
      // Return simulated success with authentic PayPal sandbox response shape
      return {
        tracker_id: `TRK-${Date.now().toString(36).toUpperCase()}`,
        status: "SHIPPED",
      };
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v1/shipping/trackers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackers: [
          {
            transaction_id: tracker.transaction_id,
            tracking_number: tracker.tracking_number,
            status: tracker.status,
            carrier: tracker.carrier,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal Tracking API error: ${errorText}`);
    }

    const data = await response.json();
    return data.trackers?.[0] || { tracker_id: "SYNCED", status: tracker.status };
  }

  /**
   * Issue a full or partial refund on a captured payment
   * Calls POST /v2/payments/captures/{capture_id}/refund
   */
  async issueRefund(payload: PayPalRefundPayload): Promise<{
    refund_id: string;
    status: string;
    amount?: { value: string; currency_code: string };
  }> {
    if (!this.isConfigured()) {
      return {
        refund_id: `RFD-${Date.now().toString(36).toUpperCase()}`,
        status: "COMPLETED",
        amount: payload.amount || { value: "49.99", currency_code: "USD" },
      };
    }

    const token = await this.getAccessToken();
    const body: Record<string, unknown> = {};
    if (payload.amount) {
      body.amount = payload.amount;
    }
    if (payload.note_to_payer) {
      body.note_to_payer = payload.note_to_payer;
    }

    const response = await fetch(
      `${this.baseUrl}/v2/payments/captures/${payload.capture_id}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal Refund API error: ${errorText}`);
    }

    const data = await response.json();
    return {
      refund_id: data.id,
      status: data.status,
      amount: data.amount,
    };
  }

  /**
   * Fetch Disputes from PayPal Customer Disputes API
   * Calls GET /v1/customer/disputes
   */
  async listDisputes(): Promise<Array<{
    dispute_id: string;
    reason: string;
    status: string;
    dispute_amount: { value: string; currency_code: string };
    create_time: string;
    seller_response_due_date?: string;
  }>> {
    if (!this.isConfigured()) {
      return [];
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v1/customer/disputes?page_size=20`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PayPal Disputes API error: ${err}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Verify Incoming PayPal Webhook Signature
   * Calls POST /v1/notifications/verify-webhook-signature
   */
  async verifyWebhookSignature(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookEvent: Record<string, unknown>;
  }): Promise<boolean> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!this.isConfigured() || !webhookId || webhookId.startsWith("mock_")) {
      // In demo / sandbox test mode without live signature certificate, verify structure
      return Boolean(params.transmissionId && params.transmissionSig);
    }

    const token = await this.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: params.authAlgo,
          cert_url: params.certUrl,
          transmission_id: params.transmissionId,
          transmission_sig: params.transmissionSig,
          transmission_time: params.transmissionTime,
          webhook_id: webhookId,
          webhook_event: params.webhookEvent,
        }),
      }
    );

    if (!response.ok) return false;
    const result = await response.json();
    return result.verification_status === "SUCCESS";
  }
}

export const paypalClient = new PayPalClient();
