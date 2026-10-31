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

    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch site content for context
    const siteContent = await fetchSiteContent();

    // Call Groq API with site context
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
            content: `You are a helpful assistant for James Studio, a UK-based web development and design agency. Be friendly, professional, and helpful. Keep responses concise and relevant to web development, design, and the agency's services.

Here is information about James Studio from their website https://jamesstudio.uk:

${siteContent}

When answering questions, use this information. If the information isn't available here, suggest they visit https://jamesstudio.uk for more details or contact hello@jamesstudio.uk.`
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

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
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
        const response = await fetch(url);
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
        console.error(`Failed to fetch ${url}:`, error);
      }
    }

    return content || 'Failed to fetch site content. Please visit https://jamesstudio.uk for more information.';
  } catch (error) {
    console.error('Error fetching site content:', error);
    return 'Unable to fetch site content. Please visit https://jamesstudio.uk for more information.';
  }
}
