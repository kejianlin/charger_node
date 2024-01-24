module.exports={
    apps: [{
        name: 'charger_node_v2',
        script: 'index.js',
        dev: {
            NODE_ENV: 'dev',
            NODE_CONFIG_DIR: './config/dev',
            DEBUG: 'socket:*'
        },
        env_production: {
            NODE_ENV: 'production',
            NODE_CONFIG_DIR: './config/production',
            DEBUG: 'socket:*'
        }
    }],
    deploy: {
        production: {
            user: 'iot-admin',
            host: ["119.23.18.135"],
            repo: "/home/iot-git/reps/charger_node_v2",
            ref: 'origin/master',
            path: "/home/iot-admin/node/charger_node_v2",
            'post-deploy': "export  PATH=$PATH:$HOME/.nvm/versions/node/v10.6.0/bin/ && npm install && pm2 reload ecosystem.config.js --env production"
        },
        dev: {
            user: 'alfred',
            host: ["120.78.64.2"],
            repo: "/home/alfred/rep/charger_node_v2.git",
            ref: "origin/master",
            path: "/home/alfred/project/charger_node_v2",
            'post-deploy': "export PATH=$PATH:$HOME/.nvm/versions/node/v10.7.0/bin/ && npm install && pm2 reload ecosystem.config.js --env dev"
        },
    }
}