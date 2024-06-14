
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const PORT = 5000


mongoose.connect("mongodb://localhost/mello_den", () => console.log("Connected to database..."))
const DB = mongoose.connection
DB.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use(express.json())

/* REST API */ {
    /*  AUTHENTICATION
        * GET           /auth
        * PUT           /login 
        * PUT           /logout
        * PUT           /verify
        * POST          /register-user
        - DELETE        /delete-user
    */

    /*  USERS
        * GET           /users/:username/profile
        * PUT+          /users/:username/edit-profile
    */

    /*  ANOUCEMENTS & EVENTS
        - GET           /annoucements
        * POST          /annoucements/add
        * DELETE        /annoucements/remove
    
        - GET           /calendar/
        * POST          /calendar/add
        * DELETE        /calendar/remove
    */

    /*  STATS
        * GET           /stats/winners
        * GET           /stats/calendar
        * GET+          /stats/:username/retrieve-form  
        * GET+          /stats/:username/check-form
        * POST+         /stats/:username/submit
        * DELETE+       /stats/:username/delete
    */
}




const server = app.listen(port, () => {
    console.log(`server listening on port ${port}\n`)
});


process.on('SIGINT', () => {
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    })

    // if (db) {
    //     db.close()
    //         .then(() => {
    //             server.close(() => console.log("Server closed. Database instance disconnected"))
    //         })
    //         .catch((err) => console.log(err))
    // }
});