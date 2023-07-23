var mysql=require("mysql2")

var connection = mysql.createPool({
    port: "3306",
    host: "127.0.0.1",
    user: "root",
    password: "12345",
    insecureAuth: true

})

module.exports= connection