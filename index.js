
if (process.env.NODE_ENV !== "production") {
    require('dotenv').load()
}

require(__dirname + '/server.js').start()
