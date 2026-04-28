module.exports = async (req, res) => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, role } = req.body || {};
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email, and role are required' });
  }

  const domain     = process.env.AUTH0_DOMAIN;
  const clientId   = process.env.AUTH0_M2M_CLIENT_ID;
  const secret     = process.env.AUTH0_M2M_CLIENT_SECRET;
  const connection = process.env.AUTH0_CONNECTION || 'Username-Password-Authentication';

  try {
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
    const { access_token, error: tokenErr, error_description } = tokenJson;
    if (tokenErr) return res.status(500).json({ error: tokenErr, detail: error_description });

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
      return res.status(400).json({ error: newUser.message || 'Failed to create user' });
    }

    await fetch(`https://${domain}/dbconnections/change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, email, connection }),
    });

    return res.status(200).json({ success: true, userId: newUser.user_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
