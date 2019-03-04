import * as express from 'express';
import * as bodyParser from 'body-parser';
import { routes } from './routes/routes';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import * as path from 'path';
import * as db from './helpers/db';
import * as cors from 'cors';
import { environment } from './environments/environment';

const app = express();
let port = process.env.PORT || 3333;

class Server {

  constructor() {
    this.initExpressMiddleware();
    this.initDB();
    this.initRoutes();
    this.start();
  }

  start() {
    app.listen(port, (err) => {
      if (err) {
        console.error(err);
      }

      // Initial database population
      db.populate();

      // TODO: 
      // Update BP responses every 1 minute
      schedule.scheduleJob('*/1 * * * *', function () {
        db.createResponseList();
      });
      // Update Proposals and Producers list every 24h 
      schedule.scheduleJob('0 0 0 * * *', function () {
        db.createProposalsList();
        db.createProducersList();
      })
      console.log(`Listening at http://localhost:${port}`);
    });
  }

  initExpressMiddleware() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    if (environment.production) {
      app.use(express.static(path.join(__dirname, '../whichbpstovotefor')));
    }
  }

  initDB() {
    // connect to the database
    const dbUrl = 'mongodb://localhost/votersurveydb';
    mongoose.Promise = global.Promise;
    mongoose.connect(dbUrl);
    mongoose.connection.on('connected', function () {
      console.log("Mongoose default connection is open to ");
    });
    mongoose.connection.on('error', function (err) {
      console.log("Mongoose default connection has occured " + err + " error");
    });
    mongoose.connection.on('disconnected', function () {
      console.log("Mongoose default connection is disconnected");
    });
    process.on('SIGINT', function () {
      mongoose.connection.close(function () {
        console.log("Mongoose default connection is disconnected due to application termination");
        process.exit(0);
      });
    });
  }

  initRoutes() {
    // Register API Routes
    routes(app);
    if (environment.production) {
      // redirect all others to the index (HTML5 history)
      app.all('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../whichbpstovotefor/index.html'));
      });
    }
  }
}

let server = new Server();