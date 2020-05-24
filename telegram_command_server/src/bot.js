var TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var download = require('./downlod');

var command = {
    '/echo':' - Команда ЭХО.',
    '/help':' - Справка о доступных командах.',
    '/add_torrent':' - Функция добавления торрент файла для закачки.',
    '/add_link':' - Функция загрузки файла по прямой ссылке.',
    '/save_as':' - Функция Загрузки файла с указанием имени.'
};

var in_load = false; //Для определения что уже есть текущая загрузка
var linc = {};
var add_torr = {};
var add_li = {};
var path_to_save = process.env.PATH_TO_DIRECT_LOAD_FILES + '/';
var save_name = '';

var token = process.env.TELEGRAM_TOKEN;
function start_bot(){
    var bot = new TelegramBot(token, { polling: true });
    console.log('We start telegramm bot!');
    
    bot.onText(/\/echo (.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];
        bot.sendMessage(chatId, resp);
    });
    
    bot.onText(/\/save_as (.+) (.+)/, function (msg, match){
    	var chatId = msg.chat.id;
   	    save_name = match[1];
	    if (in_load == false){
                    bot.sendMessage(chatId, 'Мы получили вашу ссылку, начинаем загрузку файла!');
                    // console.log('12232342342354354');
                    linc[chatId] = match[2];
                    var mult = {
                        start : function(text){
                            in_load = true;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        stop : function(text){
                            in_load = false;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        progress : function(text){
                            in_load = true;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        ero : function(text){
                            in_load = false;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        }
                    }
                    download.start_load_as(mult, linc[chatId], chatId, save_name);
                }
                else{
                    bot.sendMessage(chatId, 'Идет загрузка другого файла, попробуйте позже!');
                }
    });

    bot.onText(/\/help/, function (msg, match) {
        var help = 'Я умею выполнять следующие команды: \n';
        for(var j in command){
            help += j + command[j] + '\n';
        }
        var chatId = msg.chat.id;
        bot.sendMessage(chatId, help);
    });
    
    bot.onText(/\/add_torrent/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = 'Теперь можете прислать торрент файл.';
        bot.sendMessage(chatId, resp);
        add_torr[chatId] = 1;
    });
    
    bot.onText(/\/add_link/, function (msg, match) {
        var chatId = msg.chat.id;
        if (in_load == false){
            var resp = 'Теперь можете прислать ссылку на файл.';
            bot.sendMessage(chatId, resp);
            add_li[chatId] = 1;
        }
        else{
            bot.sendMessage(chatId, 'Идет загрузка другого файла, попробуйте позже!');
        }
    });
    
    // // Listen for any kind of message. There are different kinds of
    // // messages.
    bot.on('message', function (msg) {
        var chatId = msg.chat.id;
        if(save_name.length >= 2){
            save_name = '';
        }
        if(msg.document){
            if(add_torr[chatId] == 1 && msg.document.file_name.substring((msg.document.file_name.length - 8), msg.document.file_name.length) == '.torrent'){
                bot.sendMessage(chatId, 'Мы добавили ваш торрент файл в текущие загрузки.');
                // console.log(msg.document);
                var fileId = msg.document.file_id;
                var downloadDir = process.env.PATH_TO_LOAD_TORRENT_FILES;
                bot.downloadFile(fileId, downloadDir)
                .then(
                    response => {
                        // var mode = '777';
                        var oldPath = response;
                        // fs.chmodSync(oldPath, mode);
                        var newPath = process.env.PATH_TO_WATCH_TORRENT_FILES + '/' + msg.document.file_name;
                        // var newPath = __dirname + '/gut/' + msg.document.file_name;
                        fs.rename(oldPath, newPath, function () {
                            console.log('success rename');
                        });
                        console.log('Fulfilled: ${response}' + response);
                    },
                error => console.log('Rejected: ' + error)
                );
                add_torr[chatId] = 0;
            }
            else if(add_torr[chatId] == 0){
                bot.sendMessage(chatId, 'Чтобы добавить торрент файл в загрузки начните с команды /add_torrent');
                add_torr[chatId] = 0;
            }
            else{
                bot.sendMessage(chatId, 'Вы прислали не торрент файл!\nНачните сново с команды /add_torrent');
                add_torr[chatId] = 0;
            }
        }
        if(add_li[chatId] == 1 && msg.entities){
            if (msg.entities[0].type == 'url'){
                if (in_load == false){
                    bot.sendMessage(chatId, 'Мы получили вашу ссылку, начинаем загрузку файла!');
                    // console.log('12232342342354354');
                    linc[chatId] = msg.text;
                    var mult = {
                        start : function(text){
                            in_load = true;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        stop : function(text){
                            in_load = false;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        progress : function(text){
                            in_load = true;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        },
                        ero : function(text){
                            in_load = false;
                            console.log(text);
                            bot.sendMessage(chatId, text);
                        }
                    }
                    download.start_load(mult, linc[chatId], chatId);
                }
                else{
                    bot.sendMessage(chatId, 'Идет загрузка другого файла, попробуйте позже!');
                }
            }
            else{
                add_li[chatId] = 0;
                in_load = false;
                bot.sendMessage(chatId, 'Вы прислали не ссылку! Начните сначала с команды /add_link');
            }
        }
        else if( matchCommand(msg.text) ){
            add_li[chatId] = 0;
            add_torr[chatId] = 0;
            bot.sendMessage(chatId, 'Я не умею выполнять такие команды!\nКоманда /help поможет Вам узнать мои функции.');
        }
    });
}

function matchCommand(r){
    for(var i in command){
        if(r == i){
            return(true);
        }
    }
    return false;
}

module.exports = {
    start_bot
}