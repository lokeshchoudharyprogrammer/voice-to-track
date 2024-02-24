
const mongoose = require('mongoose');

const dbs = () => {
    try {

        let connection = mongoose.connect("mongodb+srv://lokesh:lokeshcz@cluster0.dsoakmx.mongodb.net/AudioRecoding?retryWrites=true&w=majority&appName=Cluster0", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("connection",connection)

    } catch (error) {
        console.log("try again")
    }
}

module.exports = dbs