export default async (req, res) => {
    var formCode = "waR9keQ2snus";
    const questions_url = `https://api.fillout.com/v1/api/forms/${formCode}`
      const token = process.env.API_TOKEN;
      if (!token) return res.status(500).json({ error: 'Missing token' });
    
      // <-- use the global fetch
      const apiRes = await fetch(questions_url, {
        headers: {method: 'GET', 'Authorization': `Bearer ${token}` }
      });
      const data = await apiRes.json();
      console.log("fetch_questions STATUS CODE: ", apiRes.status);
      res.status(apiRes.status).json(data);
    };
    