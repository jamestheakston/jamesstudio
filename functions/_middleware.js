/**
 * Cloudflare Pages Middleware
 * Set MAINTENANCE_MODE to true to enable maintenance mode
 * Set MAINTENANCE_MODE to false to disable maintenance mode
 */

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = true;

// Pick one of the following maintenance types:
// - 'generic': General maintenance message
// - 'christmas': Holiday themed maintenance page
// - 'holiday': General holiday themed maintenance page
// Change content of maintenance page accordingly
// Or set MAINTENANCE_MODE to false to disable
const MAINTENANCE_TYPE = 'christmas';

export function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Check if maintenance mode is enabled
  if (MAINTENANCE_MODE) {
    // Skip maintenance mode for favicon files
    if (url.pathname.includes('favicon')) {
      return context.next();
    }
    
    // Get maintenance page content based on type
    let title, message, emoji, background, containerBg;
    
    switch (MAINTENANCE_TYPE) {
      case 'christmas':
        title = 'Merry Christmas!';
        message = 'We\'re taking a holiday break to celebrate with family. We\'ll be back in the new year with fresh ideas. Wishing you a wonderful holiday season!';
        emoji = '🎄';
        background = '#0f3460';
        containerBg = '#16213e';
        break;
      case 'holiday':
        title = 'On Holiday';
        message = 'We\'re currently enjoying some time off. The site will be back online soon. Thank you for your patience!';
        emoji = '🏖️';
        background = '#e8f4f8';
        containerBg = '#ffffff';
        break;
      case 'generic':
      default:
        title = 'We\'ll be back soon';
        message = 'We\'re currently performing scheduled maintenance. The site will be back online shortly. Thank you for your patience.';
        emoji = '';
        background = '#FAF9F6';
        containerBg = '#ffffff';
        break;
    }
    
    // Return maintenance page
    return new Response(
      `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Maintenance - James Studio</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: ${background};
            color: #1A1A1A;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            text-align: center;
            padding: 60px 40px;
            background: ${containerBg};
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
            font-family: 'Syne', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 16px;
        }
        p {
            font-size: 1.1rem;
            color: #666;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #1A1A1A;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 32px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .logo {
            font-family: 'Syne', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 24px;
            display: inline-block;
        }
        .logo span {
            background: #1A1A1A;
            color: #FAF9F6;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-left: 8px;
        }
        .emoji {
            font-size: 4rem;
            margin-bottom: 24px;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">JAMES<span>Studio</span></div>
        ${emoji ? `<span class="emoji">${emoji}</span>` : '<div class="spinner"></div>'}
        <h1>${title}</h1>
        <p>${message}</p>
    </div>
</body>
</html>
      `,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
        status: 503,
      }
    );
  }
  
  // If maintenance mode is off, proceed normally
  return context.next();
}
