const client = require ('./database.js');
const cors = require('cors');
const express= require ('express');


const app = express();
const port=3000; //cambia el puerto por defecto al pueto 3000
app.use(express.json())//permite que nos regrese la info de la base de datos en formato json
app.use(cors())

app.get('/productos', async (req,res) =>{
    try {
        const result= await client.query(`SELECT * FROM productos`);
        res.json(result.rows)
    } catch (error) {
        console.error(error);
        res.status(500).send('error al obtener los productos');
        
    }
});

    app.listen(port,()=>{
        console.log(`Servidor corriendo en http://localhost:${port}`)
    })


// async function mostrardatos() {
//     try {
//         const result = await client.query("SELECT * FROM pedidos");
//         console.table(result.rows);


//     } catch(err){
//         console.error("error al obtener resultado",err);

//     }finally{
//         client.end();
//     }
// }

// mostrardatos();