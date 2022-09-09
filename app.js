const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;  // middle ware function - to funnel the query resquest.. and direct to the right resolvers
const { buildSchema } = require('graphql'); //LHS syntax is called as object destructuring
const mongoose = require('mongoose')

const Event = require('./models/event');

const app = express();

//const events = [];

app.use(bodyParser.json());

//! - not nullable
//RootQuery -> events : returns the list of events
//RootMutation -> createEvent -> function to create event, returns the name of the event
//rootValue -> all the resolveres for all the endpoints.. names should be same as RootQuery and RootMutation
//resolvers return everything, and allow graphql package to restrict data as per what is requested on the front end
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!    
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema{
            query:  RootQuery
            mutation: RootMutation
        }
    `), // would be defined by the 'graphql' package
    rootValue: {
        events: () => {
           return Event.find().then(events=>{
                return events.map(event => {
                    return {...event._doc, _id: event._doc._id.toString()};
                });
           }).catch(err=>{
                throw err;
           });
            //return events;
        },
        createEvent: (args) => {
            // const event = {
            //     _id : Math.random().toString(),
            //     title: args.eventInput.title,
            //     description: args.eventInput.description,
            //     price: +args.eventInput.price,
            //     date: args.eventInput.date
            // };
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            //events.push(event);
            return event.save().then(result => {
                console.log(result);
                return {...result._doc};
            }).catch(err=>{
                console.log(err);
                throw err;
            });
            return event;
        }
    }, //point at js object that has all the resolver functions in it
    graphiql: true
}));

/*
app.get('/',(req, res, next)=>{
    res.send("Hello World!!");
})
*/

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
}@cluster0.wzzz8s3.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(3000);
}).catch(err => {
    console.log(err);
});

