// Cloudflare Worker for contact form with Turnstile validation
// Environment variables should be set in Cloudflare dashboard:
// - TURNSTILE_SECRET
// - RESEND_API_KEY  
// - DESTINATION_EMAIL

export default {
  async fetch(request, env, ctx) {
    // Get environment variables
    const TURNSTILE_SECRET = env.TURNSTILE_SECRET;
    const RESEND_API_KEY = env.RESEND_API_KEY;
    const DESTINATION_EMAIL = env.DESTINATION_EMAIL || 'hello@jamesstudio.uk';

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle GET requests for health check
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          hasTurnstileSecret: !!TURNSTILE_SECRET,
          hasResendApiKey: !!RESEND_API_KEY,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Validate required environment variables
    if (!TURNSTILE_SECRET || !RESEND_API_KEY) {
      console.error('Missing required environment variables', {
        hasTurnstileSecret: !!TURNSTILE_SECRET,
        hasResendApiKey: !!RESEND_API_KEY
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error: Missing environment variables',
          debug: {
            hasTurnstileSecret: !!TURNSTILE_SECRET,
            hasResendApiKey: !!RESEND_API_KEY,
            message: 'Please set TURNSTILE_SECRET and RESEND_API_KEY in Cloudflare Worker environment variables'
          }
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    // Only handle POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const formData = await request.formData();
      const token = formData.get('cf-turnstile-response');
      const name = formData.get('name');
      const email = formData.get('email');
      const projectType = formData.get('projectType');
      const message = formData.get('message');

      console.log('Form data received:', {
        hasToken: !!token,
        hasName: !!name,
        hasEmail: !!email,
        hasMessage: !!message,
        tokenLength: token?.length
      });

      // Validate required fields
      if (!token || !name || !email || !message) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      // Get client IP
      const ip = request.headers.get('CF-Connecting-IP') || 
                 request.headers.get('X-Forwarded-For') || 
                 'unknown';

      // Validate Turnstile token
      const turnstileValidation = await validateTurnstile(token, ip, TURNSTILE_SECRET);
      
      if (!turnstileValidation.success) {
        console.error('Turnstile validation failed:', turnstileValidation['error-codes']);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Security verification failed',
            codes: turnstileValidation['error-codes']
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      // Send email using Resend
      const emailResult = await sendEmail({
        apiKey: RESEND_API_KEY,
        to: DESTINATION_EMAIL,
        from: 'James Studio <noreply@email.jamesstudio.uk>',
        subject: `New Project Brief from ${name}`,
        text: `
Name: ${name}
Email: ${email}
Project Type: ${projectType || 'Not specified'}
Message: ${message}

---
This message was sent from the James Studio contact form.
Turnstile verified: ${turnstileValidation.hostname}
        `.trim(),
        html: `
<h2>New Project Brief</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Project Type:</strong> ${projectType || 'Not specified'}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
<hr>
<p><em>This message was sent from the James Studio contact form.</em></p>
<p><em>Turnstile verified: ${turnstileValidation.hostname}</em></p>
        `
      });

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to send message'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Message sent successfully' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  }
};

async function validateTurnstile(token, remoteip, secret) {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteip && remoteip !== 'unknown') {
    formData.append('remoteip', remoteip);
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

async function sendEmail({ apiKey, to, from, subject, text, html }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: subject,
        text: text,
        html: html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return { success: false, error: result.message || 'Email sending failed' };
    }

    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}