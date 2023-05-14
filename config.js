let Url = "http://3.128.124.147:3112/"

module.exports = {
  localhost: 'http://localhost:3112',
    port: 3112,
    secretKey: "sk_test_51N4WoVI2yiufpT7jErxTFyOz0zDugh6hotEEDT092FTU6ERTa9s2LBGZPss6B9m1pYeMGTGatWMjtFCfxUu812dw00XczZt9Ss",
    production: {


        username: '',
        password: '',
        host: '',
        port: '',
        dbName: '',
        authDb: 'admin'
    },
    local: {
        database: "mongodb+srv://Amjad:LbgHEqYLbB5LR8Sp@clustera.aecwc.mongodb.net/Darkom",
        username: 'Darkom',
        password: 'LbgHEqYLbB5LR8Sp',
    },

    liveUrl: "http://3.128.124.147:3112/",         

    dev_mode: true,
    __root_dir: __dirname,
    __site_url: 'http://3.128.124.147:3112/',
    limit:10
}
