module.exports = {
    apps : [
        {
            name: 'telegram_command_server',
            script: './telegram_command_server/index.js',
            autorestart: false,
            watch: false,
            env: {
                "TELEGRAM_TOKEN": "374896790:AAFHPIXGoMXGfdIV3zWweKIcJaTc6C6ZQEE",
                "NTBA_FIX_319": "1",
                "PATH_TO_DIRECT_LOAD_FILES": "TBD",
                "PATH_TO_LOAD_TORRENT_FILES": "TBD",
                "PATH_TO_WATCH_TORRENT_FILES": "TBD"
            },
            env_development: {
                "TELEGRAM_TOKEN": "374896790:AAFHPIXGoMXGfdIV3zWweKIcJaTc6C6ZQEE",
                "NTBA_FIX_319": "1",
                "PATH_TO_DIRECT_LOAD_FILES": "D:\\My programming\\windows_server\\path_to_direct_load",
                "PATH_TO_LOAD_TORRENT_FILES": "D:\\My programming\\windows_server\\path_to_save_torrents",
                "PATH_TO_WATCH_TORRENT_FILES": "D:\\My programming\\windows_server\\path_to_watch_torrents"
            }
        }
    ]
};