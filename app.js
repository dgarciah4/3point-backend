const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
 
const { Client } = require("pg")
const dotenv = require("dotenv")
dotenv.config()
 
const connectDb = async () => {
    try {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT
        })
 
        await client.connect()
        const res = await client.query('SELECT * FROM some_table')
        console.log(res)
        await client.end()
    } catch (error) {
        console.log(error)
    }
}
 
connectDb()

/* connecting to a pool: allows to make multiple connection request to server.
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
 
const connectDb = async () => {
    try {
        const pool = new Pool({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: process.env.PGPORT,
        });
 
        await pool.connect()
        const res = await pool.query('SELECT * FROM clients')
        console.log(res)
        await pool.end()
    } catch (error) {
        console.log(error)
    }
}
 
connectDb()
*/
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
var sess; // global session, NOT recommended, only for demonstration purposes


app.use((err, req, res, next) => {
  res.status(500).send('Something broke!')
});

router.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

router.get('/', (req, res) => {
  sess = req.session;
  if (sess.email) {
    return res.redirect('/admin');
  }
  res.send('Ok');
});
 
router.post('/login', (req, res) => {
  sess = req.session;
  sess.email = req.body.email;
  res.end('done');
});
 
router.get('/admin', (req, res) => {
  sess = req.session;
  if (sess.email) {
    res.write(`Hello ${sess.email}`);
    res.end('Logout');
  } else {
    res.write('Please login first.');
    res.end('Login');
  }
});
 
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });
});
 
app.use('/', router);
 
app.listen(process.env.PORT || 3000, () => {
  console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});