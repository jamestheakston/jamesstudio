export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { email } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ error: 'Invalid email format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Send welcome email using Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'James Studio <security@jamesstudio.uk>',
                to: email,
                subject: 'Welcome to James Studio Security Updates',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Welcome to Security Updates</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1A1A1A; background-color: #FAF9F6; margin: 0; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="background: #1A1A1A; padding: 30px; text-align: center;">
                                <h1 style="color: #FAF9F6; margin: 0; font-size: 24px; font-weight: bold;">JAMES STUDIO</h1>
                            </div>
                            <div style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; font-size: 22px;">Welcome to Security Updates</h2>
                                <p style="margin: 0 0 20px 0;">Hi there,</p>
                                <p style="margin: 0 0 20px 0;">Thank you for signing up for our security newsletter. You're now subscribed to receive timely updates about:</p>
                                <ul style="margin: 0 0 20px 0; padding-left: 20px;">
                                    <li style="margin-bottom: 10px;">Security vulnerabilities and updates</li>
                                    <li style="margin-bottom: 10px;">Maintenance windows</li>
                                    <li style="margin-bottom: 10px;">Best practices to keep your website safe</li>
                                </ul>
                                <p style="margin: 0 0 20px 0;">We'll only send you security-related emails—no spam, no marketing fluff.</p>
                                <p style="margin: 0 0 20px 0;">If you have any questions, feel free to reach out to us at <a href="mailto:hello@jamesstudio.uk" style="color: #1A1A1A;">hello@jamesstudio.uk</a>.</p>
                                <p style="margin: 0;">Best regards,<br>The James Studio Team</p>
                            </div>
                            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                                <p style="margin: 0;">&copy; 2026 James Studio. All rights reserved.</p>
                                <p style="margin: 10px 0 0 0;">This email was sent to ${email}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            }),
        });

        if (!resendResponse.ok) {
            const errorText = await resendResponse.text();
            console.error('Resend API error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to send email' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const resendData = await resendResponse.json();

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Welcome email sent successfully',
            id: resendData.id 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Newsletter signup error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
