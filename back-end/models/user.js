const { mongoose, Schema } = require('mongoose');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        isPremiumUser: {
            type: Boolean,
            required: true
        },
        totalExpenses: {
            type: Number,
            required: true
        }
    }
);

module.exports = mongoose.model('User', userSchema);