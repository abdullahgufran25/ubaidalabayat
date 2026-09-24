const crypto = require('crypto');

/**
 * Meta WhatsApp Business Cloud API Client Service
 */
class WhatsAppClient {
  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';
  }

  get baseUrl() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    return `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}`;
  }

  get accessToken() {
    return process.env.WHATSAPP_ACCESS_TOKEN;
  }

  /**
   * Verify Meta webhook signature using WHATSAPP_APP_SECRET
   * @param {Buffer|string} rawBody
   * @param {string} signatureHeader
   * @returns {boolean}
   */
  verifySignature(rawBody, signatureHeader) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret) {
      // If secret is not configured in environment, skip strict signature check
      return true;
    }
    if (!signatureHeader) {
      return false;
    }

    try {
      const elements = signatureHeader.split('=');
      const signatureHash = elements[1];
      const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

      return signatureHash === expectedHash;
    } catch (err) {
      console.error('WhatsApp signature verification error:', err.message);
      return false;
    }
  }

  /**
   * Send a raw payload to WhatsApp Graph API
   */
  async sendMessagePayload(payload) {
    if (!this.accessToken || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.warn(
        'WhatsApp credentials (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID) not set. Simulating message dispatch.'
      );
      return { simulated: true, payload };
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('WhatsApp API response error:', data);
        throw new Error(
          data?.error?.message || `WhatsApp API error with status ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error('WhatsApp message send failure:', error.message);
      throw error;
    }
  }

  /**
   * Send text message to customer WhatsApp
   * @param {string} to - Recipient phone number (e.g. "923121464275")
   * @param {string} text - Message body
   */
  async sendText(to, text) {
    if (!to || !text) return;
    const cleanTo = String(to).replace(/\D/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    return await this.sendMessagePayload(payload);
  }

  /**
   * Send an image from Cloudinary or public URL
   * @param {string} to - Recipient phone number
   * @param {string} imageUrl - Cloudinary public URL
   * @param {string} [caption] - Optional caption
   */
  async sendImage(to, imageUrl, caption = '') {
    if (!to || !imageUrl) return;
    const cleanTo = String(to).replace(/\D/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'image',
      image: {
        link: imageUrl,
        ...(caption ? { caption } : {}),
      },
    };

    return await this.sendMessagePayload(payload);
  }

  /**
   * Mark an incoming message as read
   * @param {string} messageId - wamid
   */
  async markAsRead(messageId) {
    if (!messageId || !this.accessToken || !process.env.WHATSAPP_PHONE_NUMBER_ID) return;

    try {
      await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
    } catch (err) {
      // Non-critical, ignore
    }
  }
}

module.exports = new WhatsAppClient();
