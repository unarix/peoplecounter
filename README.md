# People counter

This project uses camlitycs with a webhook to the root server endpoint to count people.

## NodeJS

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