import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export function useQRCode(text: string) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text) return;

    const generateQR = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = await QRCode.toDataURL(text, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error('QR Code generation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [text]);

  return { qrCodeUrl, isLoading, error };
}