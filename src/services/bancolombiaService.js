/**
 * Servicio para integrarse con la API de Pagos Automáticos (Button Payment) de Bancolombia.
 * NOTA DE SEGURIDAD: En un entorno de producción, la función `getBancolombiaToken`
 * debe ser trasladada a un backend para no exponer el CLIENT_SECRET.
 */

// Generador de UUID para message-id
const generateUUID = () => {
  return crypto.randomUUID();
};

export const bancolombiaService = {
  /**
   * Obtiene el token de autorización OAuth2 (Client Credentials).
   */
  async getToken() {
    const clientId = import.meta.env.VITE_BANCOLOMBIA_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_BANCOLOMBIA_CLIENT_SECRET;
    const oauthUrl = import.meta.env.VITE_BANCOLOMBIA_OAUTH_URL || 'https://gw-sandbox-qa.apps.ambientesbc.com/security/oauth-provider/oauth2/token';

    if (!clientId || !clientSecret) {
      throw new Error("Credenciales de Bancolombia no configuradas en el entorno.");
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    // Agrega scope si es necesario, según la documentación
    params.append('scope', 'ButtonPayment:write:app');

    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  },

  /**
   * Ejecuta la intención de pago automático (Button Payment / onClickPayment)
   */
  async processOnClickPayment(paymentDetails) {
    const apiUrl = import.meta.env.VITE_BANCOLOMBIA_API_URL || 'https://gw-sandbox-qa.apps.ambientesbc.com/public-partner/sb/v2/operations/cross-product/payments/button-payment-instruction/management/onClickPayment';
    
    // 1. Obtener token
    const token = await this.getToken();

    // 2. Preparar payload (simulación de device fingerprint para el entorno de Sandbox)
    const payload = {
      data: {
        payInformation: {
          relationshipId: paymentDetails.relationshipId || "Re2ca8533a2664085b8ef83e4f8f9b319",
          transferAmount: paymentDetails.amount || "2.45",
          commerceTransferButtonId: paymentDetails.buttonId || "w0mp1B0toN",
          transferReference: paymentDetails.reference || "RANDOM_REFERENCE" + Math.floor(Math.random() * 10000),
          transferDescription: paymentDetails.description || "Compra de prueba",
          confirmationUrl: paymentDetails.confirmationUrl || "https://tudominio.com/api/callback",
          sourceIP: "127.0.0.1"
        }
      }
    };

    // 3. Preparar Headers (muchos son mandatorios para la trazabilidad)
    const headers = {
      'Accept': 'application/vnd.bancolombia.v4+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'message-id': generateUUID(),
      // Mocked Fingerprint Data (Reemplazar con extracción real en prod)
      'cityIp': 'Medellin',
      'countryIp': 'CO',
      'deviceId': generateUUID(), // Identificador simulado del dispositivo
      'devicePrint': 'TimeZone:America/Bogota, Browser:Chrome',
      'httpAccept': 'text/html,application/xhtml+xml,application/xml',
      'httpAcceptEncoding': 'gzip, deflate, br',
      'httpAcceptLanguage': 'es-CO,es;q=0.9',
      'httpReferrer': window.location.href,
      'latitudeIp': '6.2442',
      'longitudeIp': '-75.5812',
      'nameLine': paymentDetails.customerName || 'Cliente Pruebas',
      'networkProviderIp': 'Proveedor XYZ',
      'postalcodeIp': '050001',
      'userAgent': navigator.userAgent
    };

    // 4. Ejecutar petición
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error en la transacción de pago: ${response.status} - ${errorData.title || response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  }
};
