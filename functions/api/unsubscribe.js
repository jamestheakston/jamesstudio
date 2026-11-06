export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { email, token } = await request.json();

        if (!email || !token) {
            return new Response(JSON.stringify({ error: 'Email and token are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Delete from security_users table in Supabase using email and token
        const supabaseUrl = 'https://pkqkqijmohbvfxxnzhyy.supabase.co';
        const supabaseKey = 'sb_publishable_Raqakv5Z4U8Wr7zmzIvLDA_TsnBSFyS';
        
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/security_users?email=eq.${email}&unsubscribe_token=eq.${token}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            }
        });

        if (!supabaseResponse.ok) {
            const errorText = await supabaseResponse.text();
            console.error('Supabase error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to unsubscribe' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
