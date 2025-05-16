interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
  type?: string;
  timestamp?: string;
  debug?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const sendEmailNotification = async (
  type: 'contact' | 'modification' | 'order',
  data: any
): Promise<ApiResponse> => {
  try {
    // First check server health with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal
      });
      if (!healthResponse.ok) {
        throw new Error(`Email service unavailable (status: ${healthResponse.status})`);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name === 'AbortError') {
        throw new Error('Email service timeout - server not responding');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    const endpointMap = {
      contact: '/notify/contact',
      modification: '/notify/modification',
      order: '/notify/order'
    };

    const response = await fetch(`${API_BASE_URL}${endpointMap[type]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      data: await response.json(),
      type,
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorDetails = {
          name: errorObj.name,
          message: errorObj.message,
          stack: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined,
          type,
          timestamp: new Date().toISOString()
      };
      console.error(`Error sending ${type} email:`, errorDetails);
    return {
      success: false,
      error: errorObj.message,
      type,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { debug: errorDetails })
    };
  }
};