import express from 'express';
import { createHmac } from 'crypto';
import mysql from 'mysql';

//used program: node.js, express, nodejs crypto, ejs
const connection = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "url_shortening_project",
    port: "3306",
});
connection.connect();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// home page
app.get('/', (_request, response) => {
    response.render('index');
});

// redirect action
app.get('/link', (request, response) => {
    connection.query("select url from shortenings where hash like ?", 
        [request.query.hash.trim()], 
        (error, results) => {
            if (!error) {
                response.redirect(results[0].url);
            }
            else {
                console.error(error);
                response.render("index", {result: `hash not found`});
            }
        });
});

// insert hash and url
app.post('/insert', (request, response) => {
    //
    const url = request.body.url.trim();
    const hash = createHmac("sha256", "hello world")
                    .update(url)
                    .digest('hex').toString();

    connection.query("insert into shortenings values(?,?)", 
        [hash, url], 
        (error, _) => {
            if (!error) {
                //
                response.render("index", {result: `hash generated: ${hash}(${url})`});
            }
            else {
                response.render("index", {result: `already generated. your hash is ${hash}`});
            }
        });
});

// app execute
app.listen(3000, () => console.log(`hello http://localhost:3000 !`));