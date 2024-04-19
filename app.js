require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger
const swaggerUi = require("swagger-ui-express");
const apiDocumentation = require('./docs/api-docs.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocumentation));
// End Swagger

// penanganan untuk usersRoute
const usersRoutes = require("./routes/api/v1/usersRoute");
app.use('/api/v1', usersRoutes);

// penanganan untuk accountsRoute
const accountsRoute = require("./routes/api/v1/accountsRoute");
app.use('/api/v1', accountsRoute);

// penanganan untuk transactionsRoute
const transactionsRoute = require("./routes/api/v1/transactionsRoute");
app.use('/api/v1', transactionsRoute);

// penanganan untuk authRoute
const authRoute = require("./routes/api/v1/authRoutes")
app.use('/api/v1/', authRoute)

module.exports = app;
