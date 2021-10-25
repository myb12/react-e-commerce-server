const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

//Database configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ig1ef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    try {
        await client.connect();
        const database = client.db("simpleEcommerceDb");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //GET API 
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const count = await cursor.count();

            const page = req.query.page;
            const size = +req.query.size;
            let products;

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();

            } else {
                products = await cursor.toArray();
            }


            res.send({
                count,
                products
            });
        })

        //GET product using keys
        app.post('/products/by_keys', async (req, res) => {
            const keys = req.body;

            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();

            res.json(products)
        })

        //POST api for Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            
            res.json(result);
        })
    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Simple e-commerce is running');
});

app.listen(port, () => {
    console.log('Server is running om port', port);
})