module.exports = sql_login = { 
    server: '127.0.0.1',
    authentication: {
        type: 'default',
        options: {
        userName: 'sa',
        password: 'DinosWithTacos4',
        }
    },
    options: {
        port: 1433,
        trustServerCertificate: true,
        database: 'TargetDB'
    }
};