const express = require("express");
const app = express();
//add cors
const cors = require("cors");

// Configure CORS properly
const corsOptions = {
    origin: [
        'https://www.sunartstudio.in',
        'https://sunartstudio.in',
        'http://localhost:3000',
        'http://localhost:5173', // for Vite dev server
        'https://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//use cors
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

//import routes here
const homeRoutes = require("./routes/homeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set("view engine", "ejs");
// Serve static files
app.use(express.static("public"));

//routes
app.use("/api", homeRoutes);
app.use("/api/gallery", galleryRoutes);

//admin
app.use("/api/admin", adminRoutes);

module.exports = app;
