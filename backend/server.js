const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const projectsRoute = require('./Routes/projects');
const purchasesRoute = require('./Routes/purchases');
const createOrderRoute = require('./Routes/createorder');
const otpRoute = require('./Routes/otp');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/projects', projectsRoute);
app.use('/purchase', purchasesRoute);
app.use('/create-order', createOrderRoute);

app.use('/otp', otpRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
