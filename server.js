const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT;

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB, {}).then(() => console.log('Database connected'));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
