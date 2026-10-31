export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('GROQ_API_KEY exists:', !!env.GROQ_API_KEY);
    console.log('GROQ_API_KEY length:', env.GROQ_API_KEY?.length);

    if (!env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured. Please add it to Cloudflare Pages Environment Variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call Groq API (without site scraping for now to test)
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for James Studio, a UK-based web development and design agency. Be friendly, professional, and helpful. Keep responses concise and relevant to web development, design, and the agency\'s services. Suggest they visit https://jamesstudio.uk for more details or contact hello@jamesstudio.uk.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('Groq API response status:', groqResponse.status);

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return new Response(JSON.stringify({ error: `Failed to get response from AI: ${errorData}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groqData = await groqResponse.json();
    console.log('Groq API response data:', JSON.stringify(groqData).substring(0, 500));

    const aiResponse = groqData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function fetchSiteContent() {
  try {
    // Define pages to fetch
    const pages = [
      'https://jamesstudio.uk/',
      'https://jamesstudio.uk/#services',
      'https://jamesstudio.uk/#about',
      'https://jamesstudio.uk/#contact',
    ];

    let content = '';

    for (const url of pages) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; JamesStudioBot/1.0)',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          // Extract text content from HTML
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          content += `\n\n--- Content from ${url} ---\n${text.substring(0, 2000)}`;
        }
      } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
        // Continue with other pages even if one fails
      }
    }

    return content || 'Failed to fetch site content. Please visit https://jamesstudio.uk for more information.';
  } catch (error) {
    console.error('Error fetching site content:', error);
    return 'Unable to fetch site content. Please visit https://jamesstudio.uk for more information.';
  }
}
