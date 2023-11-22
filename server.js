require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
