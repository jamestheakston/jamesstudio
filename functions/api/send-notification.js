export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, name, ref } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert into callbacks table in Supabase
    const supabaseUrl = 'https://pkqkqijmohbvfxxnzhyy.supabase.co';
    const supabaseKey = 'sb_publishable_Raqakv5Z4U8Wr7zmzIvLDA_TsnBSFyS';
    
    await fetch(`${supabaseUrl}/rest/v1/callbacks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        ref: ref,
        name: name,
        email: email
      })
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'James Studio <noreply@email.jamesstudio.uk>',
        to: email,
        subject: "We'll be in touch soon!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1A1A1A; color: #FAF9F6; padding: 20px; text-align: center; }
              .content { background: #FAF9F6; padding: 30px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>James Studio</h1>
              </div>
              <div class="content">
                <h2>Hello${name ? ' ' + name : ''}!</h2>
                <p>Thanks for your interest in working with James Studio. We're currently at capacity, but we'll be in touch as soon as we have availability to discuss your project.</p>
                <p>We appreciate your patience and look forward to connecting with you soon.</p>
                <p>Best regards,<br>The James Studio Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
