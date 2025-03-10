import { CorsOptions } from 'cors'
import dotenv from 'dotenv'
dotenv.config()

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        const whitelist = [process.env.FRONTEND_URL]
        console.log(whitelist)
        if (process.argv[2] === '--api') {
            whitelist.push(undefined, null) //Enabling CORS for thunderclient to test my apis from IDE
        }
        //TODO fix this for production, cors origin is not working for render
        if (!origin  || whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS Error'))
        }
    }
}