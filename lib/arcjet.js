import arcjet, { tokenBucket } from '@arcjet/next'

export const aj=arcjet({
    key:process.env.ARCJET_KEY,
    characteristics: ["userId"],
    rules:[
        tokenBucket({
            mode:"LIVE",
            refillRate:10,
            interval:3600,
            capacity:10,
        })
    ]
})