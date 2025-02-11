const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());

const ORDER_BOOK_APIS = {
    "Binance": "https://api.binance.com/api/v3/depth?symbol=",
    "OKX": "https://www.okx.com/api/v5/market/books?instId=",
    "KuCoin": "https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=",
    "Mexc": "https://www.mexc.com/open/api/v2/market/depth?symbol="
};

const SYMBOL_CONVERSION = {
    "Binance": symbol => `${symbol}USDT`,
    "OKX": symbol => `${symbol}-USDT`,
    "KuCoin": symbol => `${symbol}-USDT`,
    "Mexc": symbol => `${symbol}_USDT`
};

app.get("/orderbook/:exchange/:symbol", async (req, res) => {
    const { exchange, symbol } = req.params;

    if (!ORDER_BOOK_APIS[exchange]) {
        return res.status(400).json({ error: "Exchange não suportada" });
    }

    const url = ORDER_BOOK_APIS[exchange] + SYMBOL_CONVERSION[exchange](symbol);

    try {
        const response = await axios.get(url);
        let buyOrders = [];
        let sellOrders = [];

        if (exchange === "Binance" && response.data.asks && response.data.bids) {
            buyOrders = response.data.bids.slice(0, 10);
            sellOrders = response.data.asks.slice(0, 10);
        } else if (exchange === "OKX" && response.data.data && response.data.data.length > 0) {
            buyOrders = response.data.data[0].bids.slice(0, 10);
            sellOrders = response.data.data[0].asks.slice(0, 10);
        } else if (exchange === "KuCoin" && response.data.data && response.data.data.bids) {
            buyOrders = response.data.data.bids.slice(0, 10);
            sellOrders = response.data.data.asks.slice(0, 10);
        } else if (exchange === "Mexc" && response.data.data && response.data.data.bids) {
            buyOrders = response.data.data.bids.slice(0, 10);
            sellOrders = response.data.data.asks.slice(0, 10);
        }

        return res.json({ exchange, buyOrders, sellOrders });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar book de ofertas", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
