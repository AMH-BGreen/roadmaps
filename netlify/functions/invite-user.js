const CORS = {
  'Access-Control-Allow-Origin': 'https://amh-productroadmaps.netlify.app',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, role } = body;
  if (!name || !email || !role) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'name, email, and role are required' }) };
  }

  const domain     = process.env.AUTH0_DOMAIN;
  const clientId   = process.env.AUTH0_M2M_CLIENT_ID;
  const secret     = process.env.AUTH0_M2M_CLIENT_SECRET;
  const connection = process.env.AUTH0_CONNECTION || 'Username-Password-Authentication';

  try {
    // Get M2M management token
    const tokenRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: secret,
        audience: `https://${domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });
    const tokenJson = await tokenRes.json();
    console.log('Token response:', JSON.stringify(tokenJson));
    const { access_token, error: tokenErr, error_description } = tokenJson;
    if (tokenErr) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: tokenErr, detail: error_description }) };

    // Create the user
    const createRes = await fetch(`https://${domain}/api/v2/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        connection,
        user_metadata: { role },
        password: `Tmp!${Math.random().toString(36).slice(2)}${Date.now()}`,
        verify_email: false,
      }),
    });
    const newUser = await createRes.json();
    if (!createRes.ok) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: newUser.message || 'Failed to create user' }) };
    }

    // Send password-reset email — this is the invite the user receives
    await fetch(`https://${domain}/dbconnections/change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, email, connection }),
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, userId: newUser.user_id }),
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
