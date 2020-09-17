# People counter

One way to effectively monitor the status of the restrooms is to install people counters that track the number of individuals who go in and out of the bathrooms throughout the day. After a certain number of people have passed through a restroom, a member of your team can head in to freshen it up, restocking supplies, cleaning fixtures and making repairs.

This project uses a common camera camlitycs with a webhooks to count people. For the screen server information uses nodejs.

## NodeJS

How to install:

> npm install
>> npm start

## Endpoints

> localhost:3000/reset
>> Reset the counter

> localhost:3000/counter
>> Show the screen info

> localhost:3000
>> Webhook endpoint POST method

## Generate Bundle
> npm i nexe -g
>> nexe -r "express/**/*" -t x64-8.0.0