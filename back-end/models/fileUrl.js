const { mongoose, Schema } = require('mongoose');

const fileSchema = new Schema(
    {
        fileUrl: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
);

// const DownloadedFile = sequelize.define('DownloadedFile', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     fileUrl: Sequelize.STRING
// });

module.exports = mongoose.model('FileUrl', fileSchema);