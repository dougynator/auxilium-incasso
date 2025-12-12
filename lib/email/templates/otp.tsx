import React from 'react';

interface OTPEmailProps {
  code: string;
}

export function OTPEmail({ code }: OTPEmailProps) {
  return (
    <div>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        Auxilium Incasso
      </h1>
      
      <p>Beste gebruiker,</p>
      
      <p>
        U heeft ingelogd op het klantenportaal van Auxilium Incasso. 
        Gebruik de onderstaande code om uw aanmelding te voltooien:
      </p>
      
      <div style={{ 
        background: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          letterSpacing: '8px',
          color: '#2563eb'
        }}>
          {code}
        </div>
      </div>
      
      <p style={{ fontSize: '14px', color: '#666' }}>
        Deze code is 10 minuten geldig. Als u deze aanmelding niet heeft aangevraagd, 
        neem dan contact met ons op.
      </p>
      
      <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        Met vriendelijke groet,<br />
        Auxilium Incasso
      </p>
    </div>
  );
}

