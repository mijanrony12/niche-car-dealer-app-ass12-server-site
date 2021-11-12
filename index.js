const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3zhcn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// work start here
async function run() {
    try
    {
        await client.connect();
        const database = client.db('Car_Dealer_App')
        const productsCollection = database.collection('products');
      const ordersCollection = database.collection('orders');
      const usersCollection =database.collection('users')
      const reviewCollection =database.collection('review')
        //get all products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find({}).toArray()
            res.json(result)
        });
        
       // add a product
      app.post('/products', async (req, res) => {
             const product = req.body;
             const result = await productsCollection.insertOne(product)
             res.json(result);
      });


      //delete single product
      app.delete('/products/:id', async (req, res) => {
              const id = req.params.id
              const query ={_id: ObjectId(id) }
             const result = await productsCollection.deleteOne(query)
             res.json(result);
        });
      
      // get order list by single user
      app.get('/orders', async (req, res) => {
        const email = req.query.email;
        let query={}
        if (email)
        {
           query={email: email}
        }
        const cursor = ordersCollection.find(query)
        const orders = await cursor.toArray()
        res.json(orders)
      })

     //post database order
      app.post('/orders', async(req,res)=> {
        const order = req.body
        const result = await ordersCollection.insertOne(order);
        res.json(result)
        
      })

      //update order 
      app.put('/orders/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
              $set: {status: 'Shipped'  },
              };
        
        const result = await ordersCollection.updateOne(filter, updateDoc, options)
        res.json(result)
        
      })

      //delete single order
      app.delete('/orders/:id', async (req, res) => {
              const id = req.params.id
              const query ={_id: ObjectId(id) }
             const result = await ordersCollection.deleteOne(query)
             res.json(result);
             console.log(result)
        });
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email
        const query = { email: email }
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.Role === "Admin")
        {
           isAdmin=true
        }
         res.json({admin: isAdmin})
     })
      //post users from ui
      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.json(result)
      })
      //update role in user
      app.put("/users/admin", async (req, res) => {
        const email = req.body;
        console.log(email)
        const filter = { email: email.email }
        const updateDoc = { $set: { Role: 'Admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc)
        console.log(result)
        res.json(result)
        
      })

      //review api insert
       app.post('/review', async(req,res)=> {
        const order = req.body
        const result = await reviewCollection.insertOne(order);
        res.json(result)
        
      })

      //get review
      app.get('/reviews', async (req, res) => {
        const cursor = reviewCollection.find({})
        const result = await cursor.toArray()
        res.json(result)
      })


    }
    finally
    {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello Car dealer App!')
})

app.listen(port, () => {
  console.log(`listening port:${port}`)
})