import { CorsOptions } from 'cors'
import dotenv from 'dotenv'
dotenv.config()

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        const whitelist = [process.env.FRONTEND_URL]
        if (process.argv[2] === '--api') {
            whitelist.push(undefined, null) //Enabling CORS for thunderclient to test my apis from IDE
        }
        console.log(origin)
        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS Error'))
        }
    }
}