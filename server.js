const express = require('express');
const connectDB = require('./config/db');

const app = express();

const PORT = process.env.PORT || 5100;

app.listen(PORT, () => console.log(`Server is running successfully at port ${PORT}`));

app.get('/',(req,res) => res.send("app running"));

app.use(express.json());
app.use(express.static('uploads'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Accept, Content-Type, Authorization, x-auth-token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    next();
})

app.use('/api/users', require('./routes/api/users'));
app.use('/api/productsMaster', require('./routes/api/MASTER/productsMaster'));
app.use('/api/products', require('./routes/api/products'));
app.use('/api/deliveryBoys', require('./routes/api/deliveryBoys'));
app.use('/api/carts', require('./routes/api/carts'));
app.use('/api/orders', require('./routes/api/orders'));
app.use('/api/sliderImages', require('./routes/api/sliderImages'))

connectDB();