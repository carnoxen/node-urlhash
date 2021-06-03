import express from 'express';
import expressThymeleaf from 'express-thymeleaf';
import { TemplateEngine } from 'thymeleaf';
import { createHmac } from 'crypto';
import mysql from 'mysql';

// Configure your application to use Thymeleaf via the express-thymeleaf module
const app = express();
const templateEngine = new TemplateEngine();

const connection = mysql.createConnection({
    user: "root",
    password: "1234",
    database: "url_shortening_project",
    port: "3306",
});
connection.connect();

app.use(express.json());

app.engine('html', expressThymeleaf(templateEngine));
app.set('view engine', 'html');

// Render views as you would normally in response to requests
app.get('/', (_request, response) => {
    response.render('index');
});

app.get('/:hash', (request, response) => {
    connection.query("select url from shortenings where hash like ?", 
        [request.params.hash], 
        (error, results) => {
            if (!error) {
                response.redirect(results[0].url);
            }
            else {
                console.error(error);
            }
        });
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
            }
        });
});

app.post('/insert', (request, response) => {
    //
    const url = request.body.url;
    const hash = createHmac("sha256", "hello world")
                    .update(url)
                    .digest('hex').toString();

    connection.query("insert into shortenings values(?,?)", [hash, url]);
    response.render("insert", {hash, url});
});

app.listen(3000);