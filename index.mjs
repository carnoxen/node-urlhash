import express from 'express';
import { createHmac } from 'crypto';
import mysql from 'mysql';

// Configure your application to use Thymeleaf via the express-thymeleaf module
const app = express();

const connection = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "url_shortening_project",
    port: "3306",
});
connection.connect();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

// Render views as you would normally in response to requests
app.get('/', (_request, response) => {
    response.render('index');
});

app.get('/link', (request, response) => {
    connection.query("select url from shortenings where hash like ?", 
        [request.query.hash], 
        (error, results) => {
            if (!error) {
                response.redirect(results[0].url);
            }
            else {
                console.error(error);
                response.redirect("/");
            }
        });
});

app.post('/insert', (request, response) => {
    //
    const url = request.body.url;
    const hash = createHmac("sha256", "hello world")
                    .update(url)
                    .digest('hex').toString();

    connection.query("insert into shortenings values(?,?)", 
        [hash, url], 
        (error, _) => {
            if (!error) {
                //
                response.render("insert", {result: `${hash}: ${url}`});
            }
            else {
                response.render("insert", {result: `already generated`});
            }
        });
});

app.listen(3000, () => console.log(`hello http://localhost:3000 !`));