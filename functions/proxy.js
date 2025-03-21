export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/proxy/', '');

    let targetUrl;
    if (path === 'usernames/users') {
        targetUrl = 'https://users.roblox.com/v1/usernames/users';
    } else if (path.startsWith('users/')) {
        targetUrl = `https://users.roblox.com/v1/${path}`;
    } else if (path === 'avatar-headshot') {
        targetUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot${url.search}`;
    } else {
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Configura a requisição pra API do Roblox
    const init = {
        method: request.method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    // Lida com o corpo da requisição pra POST
    if (request.method === 'POST') {
        try {
            const body = await request.json();
            init.body = JSON.stringify(body);
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    try {
        const response = await fetch(targetUrl, init);
        const text = await response.text(); // Pega a resposta como texto pra depuração

        // Tenta parsear a resposta como JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from Roblox API', rawResponse: text }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Roblox API error', status: response.status, data }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch data from Roblox API', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}