const {Client}= require("pg");

const client = new Client({
    host:"localhost",
    user: "postgres",
    password: "inventariopedro",
    database:"postgres",
    port:"5432"
})

client.connect()

.then(()=>{
    console.log("conexion con exito a la base de datos")
}).catch(err=>{
    console.log("error el la conexion", err.stack)
})

module.exports=client