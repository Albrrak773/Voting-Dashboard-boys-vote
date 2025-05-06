export default async (req, res) => {
  var formCode = "waR9keQ2snus";
  const { offset = "0" } = req.query;
  const submissions_url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true&limit=150` + `&offset=${offset}`;
    const token = process.env.API_TOKEN;
    if (!token) return res.status(500).json({ error: 'Missing token' });
  
    // <-- use the global fetch
    const apiRes = await fetch(submissions_url, {
      headers: {method: 'GET', 'Authorization': `Bearer ${token}` }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
    console.log("fetch_submissions STATUS CODE: ", apiRes.status);
    
  };
  