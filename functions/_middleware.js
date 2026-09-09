export async function onRequest(context) {
  const { request, env } = context;

  // ═══════════════════════════════════════════════════════════════
  // MAINTENANCE MODE CONTROL
  // Set this to 'true' to enable maintenance mode
  // Set this to 'false' to disable maintenance mode
  // ═══════════════════════════════════════════════════════════════
  const MAINTENANCE_MODE = 'true'; // Change to 'true' to enable
  // ═══════════════════════════════════════════════════════════════

  // Environment variable overrides file setting (if set in Cloudflare dashboard)
  const envMaintenance = env.UNDER_MAINTENANCE === 'true';
  const isMaintenanceEnabled = envMaintenance !== undefined ? envMaintenance : MAINTENANCE_MODE === 'true';

  if (isMaintenanceEnabled) {
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
        h1, h2, .geometric-font {
            font-family: 'Syne', sans-serif;
            letter-spacing: -0.03em;
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-2xl">
        <!-- James Studio Logo -->
        <div class="mb-12">
            <a href="#" class="geometric-font text-3xl md:text-4xl font-extrabold tracking-tighter flex items-center justify-center gap-2">
                JAMES<span class="text-xs bg-[#1A1A1A] text-[#FAF9F6] px-2 py-0.5 rounded-full uppercase tracking-widest">Studio</span>
            </a>
        </div>
        
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">We'll be back soon</h1>
        
        <p class="text-neutral-600 text-lg leading-relaxed mb-8">
            We're currently performing scheduled maintenance to improve our services. This shouldn't take long, and we apologize for any inconvenience.
        </p>
        
        <div class="bg-white rounded-2xl border border-[#1A1A1A]/10 p-6 md:p-8 mb-8">
            <h2 class="text-xl font-bold mb-4">What's happening?</h2>
            <ul class="text-left text-neutral-600 space-y-3 text-sm">
                <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-[#1A1A1A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>System upgrades and performance improvements</span>
                </li>
                <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-[#1A1A1A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Enhancing security measures</span>
                </li>
                <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-[#1A1A1A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Deploying new features and improvements</span>
                </li>
            </ul>
        </div>
        
        <div class="space-y-4">
            <p class="text-sm text-neutral-500">
                Need to reach us urgently?
            </p>
            <div class="flex items-center justify-center gap-6 text-sm">
                <a href="mailto:hello@jamesstudio.uk" class="flex items-center gap-2 text-[#1A1A1A] hover:underline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    hello@jamesstudio.uk
                </a>
            </div>
        </div>
        
        <p class="text-xs text-neutral-400 mt-12">
            &copy; <span id="year">2026</span> James Studio. All rights engineered under geometric rules.
        </p>
    </div>
    
    <script>
        document.getElementById('year').textContent = new Date().getFullYear();
    </script>
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
