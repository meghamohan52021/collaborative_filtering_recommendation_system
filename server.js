const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import axios for making HTTP requests
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/data', express.static('data'));

// ngrok URL from Colab
const COLAB_API_URL = 'http://bdf4-35-226-32-27.ngrok-free.app';

// Endpoint for item-based recommendations
app.post('/recommend/item', async (req, res) => {
    const { item_id } = req.body;
    try {
        const response = await axios.post(`${COLAB_API_URL}/recommend/item`, { item_id });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error calling Colab API for item recommendations');
    }
});

// Endpoint for user-based recommendations
app.post('/recommend/user', async (req, res) => {
    const { user_id, min_similarity = 0.3 } = req.body;
    try {
        const response = await axios.post(`${COLAB_API_URL}/recommend/user`, { user_id, min_similarity });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error calling Colab API for user recommendations');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
