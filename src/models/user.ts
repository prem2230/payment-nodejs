import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../types";
import bcrypt from 'bcryptjs';

interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
    email: {
        type: String,
        required: true,
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
    phone: {
        type: String
    }
}, {
    timestamps: true
});

//Pre-save hook - runs before saving to database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Without this check:
// Password would be re - hashed every time you save the user
// Even if you only changed the email, password gets hashed again
// Results in corrupted password(hash of a hash)

// With this check:
// Only hashes when password is actually new or changed
// Prevents unnecessary re - hashing
// Keeps existing passwords working

// It's a Mongoose built-in method that tracks document state changes!

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);