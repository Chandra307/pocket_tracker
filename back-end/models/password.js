const { mongoose, Schema } = require('mongoose');

const resetPasswordSchema = new Schema(
    {
        uuid: {
            type: Schema.Types.UUID,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
)

// const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
//     id: {
//         type: Sequelize.UUID,
//         primaryKey: true,
//         allowNull: false
//     },
//     isActive:Sequelize.BOOLEAN
// })

module.exports = mongoose.model('ForgotPasswordRequest', resetPasswordSchema);