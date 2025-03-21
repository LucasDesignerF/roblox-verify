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
        return new Response('Invalid endpoint', { status: 400 });
    }

    const init = {
        method: request.method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (request.method === 'POST') {
        init.body = await request.json();
    }

    try {
        const response = await fetch(targetUrl, init);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
