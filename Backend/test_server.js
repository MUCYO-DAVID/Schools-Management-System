const express = require('express');
const app = express();
const port = process.env.PORT || 5001; // Use a different port to avoid conflicts

app.get('/', (req, res) => {
  res.send('Test server is running!');
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
