import express from 'express';
import { createHmac } from 'crypto';
import mysql from 'mysql2';
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import { env } from 'process';
import { urlTable } from './db/schema.js';
import { eq, sql } from 'drizzle-orm';

const db = drizzle(env["DATABASE_URL"]!);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// home page
app.get('/', (_request, response) => {
    response.render('index');
});

// redirect action
app.get('/:id', async (request, response) => {
    const url = await db.select().from(urlTable)
        .where(eq(urlTable.id, request.params["id"]));
    if (url.length !== 0) {
        response.redirect(url[0]!.url);
    }
    else {
        console.error(`hash not found`);
        response.render("index", { result: `hash not found` });
    }
});

// insert hash and url
app.post('/', async (request, response) => {
    const url = `${request.body!}`.trim();
    const hash = createHmac("sha256", "hello world")
        .update(url)
        .digest('hex').toString();
    await db.insert(urlTable).values({
        id: hash,
        url,
    })
        .onDuplicateKeyUpdate({ set: {} });

    response.render("index", { result: `Hash is ${hash}` });
});

// app execute
app.listen(3000, () => console.log(`hello http://localhost:3000 !`));