import mongoose, {Schema, Document} from "mongoose";

export interface AuthInterface extends Document {
    email: string,
    password: string,
    name: string,
    confirmed: boolean
}

const AuthSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const Auth = mongoose.model<AuthInterface>('Auth', AuthSchema)
export default Auth