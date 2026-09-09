export async function onRequest(context) {
  const { request, env } = context;

  // Check if maintenance mode is enabled
  if (env.UNDER_MAINTENANCE === 'true') {
    // Return maintenance page
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Maintenance — James Studio</title>
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: #FAF9F6;
            color: #1A1A1A;
        }
        h1, .geometric-font {
            font-family: 'Syne', sans-serif;
            letter-spacing: -0.03em;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-2xl">
        <div class="float-animation mb-8">
            <svg class="w-24 h-24 mx-auto text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" stroke-width="1.5"/>
                <path d="M2 12h20" stroke-width="1.5"/>
            </svg>
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 geometric-font">Under Maintenance</h1>
        <p class="text-neutral-600 text-lg leading-relaxed mb-8">
            We're currently performing some improvements to serve you better. We'll be back shortly.
        </p>
        <div class="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <a href="mailto:hello@jamesstudio.uk" class="hover:underline">hello@jamesstudio.uk</a>
        </div>
    </div>
</body>
</html>
    `, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // If not in maintenance mode, continue with normal request
  return await context.next();
}
