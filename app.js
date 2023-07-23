const express = require("express")
const app = express()
const http = require('http');
const cors = require('cors')
const { Server } = require("socket.io")
app.use(express.json())
const db = require("./db/db")
const jwt = require('jsonwebtoken');


app.use(cors({
    origin: '*'
}));

// const server = app.use('/api/v1', (require("./routes/index")))
app.get('/list', (req, res) => {

    db.query(`SELECT * FROM user.user;`, (err, result) => {
        if (err) {
            res.status(400).json({ errors: err, })
        }
        return res.status(200).json({ result: result })
    })
})
app.get('/theme/:id', (req, res) => {
    const Id = req.params.id
    console.log("first", req.params.id)
    db.query(`SELECT * FROM user.theme_preference where USER_ID='${Id}';`, (err, result) => {
        if (err) {
            res.status(400).json({ errors: err, })
        }
        return res.status(200).json({ result: result })
    })
})
app.post('/login', (req, res) => {
    let query01 = `SELECT * FROM user.user u where u.USER_NAME ='${req.body.USER_NAME}'`;
    db.query(query01, (err, r) => {
        if (err) {
            return res.status(400).json({
                code: 'err',
                status: 400,
                message: err,
                data: []
            })
        }
        if (r.length > 0) {

            if (r.length > 0) {
                var token = jwt.sign({
                    userdetails: r[0],
                    exptime: new Date().getTime(),
                }, "ajay",
                    { expiresIn: "5h" });

                var logtime = new Date();
                return res.status(200).send(
                    {
                        code: 'ok',
                        error: null,
                        status: 200,
                        message: "Succesfully logged in",
                        data: r,
                        'token': token
                    });
            } else {
                console.log("no data found");
                return res.status(400).json({
                    code: 'ok',
                    error: null,
                    message: "The password that you've entered is incorrect",
                    data: null,
                    token: null
                })
            }

            // console.log(`${e}`);
            // return res.status(400).json({
            //     code: 'error',
            //     error: e,
            //     data: null,
            //     token: null
            // })

        } else {
            return res.status(400).json({
                code: 'err',
                status: 400,
                message: "The user name that you've entered is incorrect.!",
                data: []
            })
        }
    })
})

// app.get('/themeColor', (req, res) = () => {
//     db.query(`SELECT * FROM user.user;`, (err, result) => {
//         if (err) {
//             res.status(400).json({ errors: err, })
//         }
//         return res.status(200).json({ result: result })
//     })
// })
const server = app

let myserver = http.Server(server);

const io = new Server(myserver, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
var color
io.on("connect", (socket) => {
    console.log("user connected", socket.id)

    socket.on("color", (data) => {
        socket.join(data)
        console.log("data", data)
        color = data
        db.query(`INSERT INTO user.theme_preference (USER_ID, PRIMARY_COLOUR, SECONDARY_COLOUR, TEXT_COLOUR, FONT_SIZE, FONT) VALUES (?,?,?,?,?,?);`,
            [data.USER_ID, data.PRIMARY_COLOUR, data.SECONDARY_COLOUR, data.TEXT_COLOUR, data.FONT_SIZE, data.FONT]
            , (err, result) => {
                if (err) {
                    console.error('Error saving data to database:', err.message);
                    socket.emit('insertResult', { success: false, message: 'Error saving data to database' });
                } else {
                    console.log('Data saved to database:', result);
                    socket.emit('insertResult', { success: true, message: 'Data saved successfully', data });
                }
            })

        console.log("color", color.length)
        // if (color.length > 0) {
        //     console.log("in if")
        //     app.post((req, res) => { 
        //         db.query(`INSERT INTO user.theme_preference (USER_ID, PRIMARY_COLOUR, SECONDARY_COLOUR, TEXT_COLOUR,FONT_SIZE,FONT) VALUES (1,${color}, "val",SECONDARY_COLOUR, TEXT_COLOUR,12,FONT);`, (err, result) => {
        //             if (err) {
        //                 res.status(400).json({ errors: err, })
        //             }
        //             return (res.status(200).json({ result: result }))

        //         })
        //     })
        // }

        console.log("data from frontend", data)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id)
    })
})

console.log(color)

const PORT = 5001
myserver.listen(PORT, () => {
    console.log("connected 5001")
})