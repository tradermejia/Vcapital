import React, { useState } from 'react';
import { bancolombiaService } from '../services/bancolombiaService';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BancolombiaPaymentButton({ paymentDetails, onSuccess, onError }) {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionInfo, setTransactionInfo] = useState(null);

  const handlePayment = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      
      const response = await bancolombiaService.processOnClickPayment(paymentDetails || {});
      
      if (response && response.data && response.data.responseCode === '200') {
        setStatus('success');
        setTransactionInfo(response.data);
        if (onSuccess) onSuccess(response.data);
      } else {
        setStatus('error');
        setErrorMessage(response?.data?.responseText || 'Respuesta inesperada del servidor.');
        if (onError) onError(response);
      }
    } catch (error) {
      console.error("Error procesando el pago:", error);
      setStatus('error');
      setErrorMessage(error.message);
      if (onError) onError(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <button
        onClick={handlePayment}
        disabled={status === 'loading' || status === 'success'}
        className={`w-full relative group overflow-hidden rounded-xl font-semibold text-lg p-4 transition-all duration-300 transform
          ${status === 'success' ? 'bg-green-600 text-white cursor-default' : ''}
          ${status === 'error' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
          ${status === 'idle' || status === 'loading' ? 'bg-[#FFD100] text-black hover:bg-[#e6bd00] hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-500/20' : ''}
        `}
      >
        <div className="flex items-center justify-center gap-2 relative z-10">
          {status === 'idle' && (
            <>
              <CreditCard className="w-6 h-6" />
              <span>Pago Rápido Bancolombia</span>
            </>
          )}
          {status === 'loading' && (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Procesando pago...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-6 h-6" />
              <span>¡Pago Exitoso!</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-6 h-6" />
              <span>Reintentar Pago</span>
            </>
          )}
        </div>
      </button>

      {status === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full border border-red-200">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {status === 'success' && transactionInfo && (
        <div className="text-sm text-green-800 bg-green-50 p-4 rounded-lg w-full border border-green-200 shadow-sm">
          <p className="font-semibold mb-1">Detalles de la Transacción:</p>
          <ul className="space-y-1 font-mono text-xs opacity-80">
            <li>Ref: {transactionInfo.transactionNumber}</li>
            <li>Estado: {transactionInfo.transactionStatus}</li>
            <li>Fecha: {new Date(transactionInfo.transactionDate).toLocaleString()}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
