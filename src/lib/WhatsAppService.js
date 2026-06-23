export const WhatsAppService = {
  generateWaMeLink(phone, message) {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    let formattedPhone = cleanPhone;
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+57" + formattedPhone;
    }
    const waPhone = formattedPhone.replace("+", "");
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  },

  async sendProgrammaticMessage(phone, templateName, variables) {
    await new Promise(resolve => setTimeout(resolve, 800));

    let messageText = "";
    if (templateName === "delivery_alert") {
      messageText = `¡Hola, ${variables.residentName}! Su paquete con guía/código ${variables.trackingNumber || variables.packageId} ha llegado a recepción. Use el código de retiro ${variables.otp} para reclamarlo.`;
    } else if (templateName === "preregister_confirm") {
      messageText = `Hola, ${variables.residentName}. Hemos registrado su aviso de llegada de paquete para la guía ${variables.trackingNumber}.`;
    } else {
      messageText = `Notificación de paquete para ${variables.residentName}. Estado: ${templateName}.`;
    }

    const logEntry = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      phone,
      templateName,
      message: messageText,
      status: "enviado"
    };

    const currentLogs = JSON.parse(localStorage.getItem("portier_whatsapp_logs") || "[]");
    currentLogs.unshift(logEntry);
    localStorage.setItem("portier_whatsapp_logs", JSON.stringify(currentLogs));

    return logEntry;
  }
};
