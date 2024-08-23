const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/";
const cache = new Map();
const CACHE_EXPIRY = 3600000;

app.post('/convert', async (req, res) => {
    const { from_currency, to_currency, amount } = req.body;

    if (!from_currency || !to_currency || amount == null) {
        return res.status(400).json({ error: "Invalid request parameters" });
    }

    try {
        const cachedData = cache.get(from_currency);
        let data;

        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
            data = cachedData.rates;
        } else {
            const response = await axios.get(`${EXCHANGE_RATE_API_URL}${from_currency}`);
            if (response.status !== 200 || !response.data.rates) {
                return res.status(404).json({ error: "Currency not found" });
            }
            data = response.data.rates;
            cache.set(from_currency, { rates: data, timestamp: Date.now() });
        }

        const rate = data[to_currency];
        if (!rate) {
            return res.status(404).json({ error: "Target currency not found" });
        }

        const converted_amount = amount * rate;

        return res.json({
            from_currency,
            to_currency,
            original_amount: amount,
            converted_amount,
            rate
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/clear-cache', (req, res) => {
    cache.clear();
    res.json({ message: "Cache cleared successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
