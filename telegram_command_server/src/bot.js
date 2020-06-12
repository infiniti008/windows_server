var TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var download = require('./downlod');
var allowedIds = '208067133|291820174';

var command = {
    '/echo':' - Команда ЭХО',
    '/help':' - Справка о доступных командах',
    'Скачать файл по ссылке':' - Отправте ссылку и следуйте инструкциям',
    'Поставить торрент на закачку': ' - Отправьте торрент файл'
};

var in_load = false; //Для определения что уже есть текущая загрузка
var linc = {};
var add_li = {};
let loadFileNames = {};

var token = process.env.TELEGRAM_TOKEN;
function start_bot(){
    var bot = new TelegramBot(token, { polling: true });
    console.log('We start telegramm bot!');
    
    bot.onText(/\/start/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = `Приветствуем в мире хаоса`;
        bot.sendMessage(chatId, resp);
        console.log("Новый чувак: " + chatId);
    });

    bot.onText(/\/stop/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = `Еще увидимся`;
        bot.sendMessage(chatId, resp);
    });

    bot.onText(/\/echo (.+)/, function (msg, match) {
        var chatId = msg.chat.id;
        var resp = match[1];
        bot.sendMessage(chatId, resp);
    });

    bot.onText(/\/help/, function (msg, match) {
        if(allowedIds.indexOf(String(chatId)) >= 0){
            var help = 'Я умею выполнять следующие команды: \n';
            for(var j in command){
                help += j + command[j] + '\n';
            }
            var chatId = msg.chat.id;
            bot.sendMessage(chatId, help);
        }
        else {
            bot.sendMessage(chatId, 'Иди лесом. Ты не наш чувак!');
        }
    });
        
    bot.onText(/\/add_link/, function (msg, match) {
        var chatId = msg.chat.id;
        if(allowedIds.indexOf(String(chatId)) >= 0){
            if (in_load == false){
                var resp = 'Теперь можете прислать ссылку на файл.';
                bot.sendMessage(chatId, resp);
                add_li[chatId] = 1;
            }
            else{
                bot.sendMessage(chatId, 'Идет загрузка другого файла, попробуйте позже!');
            }
        }
        else {
            bot.sendMessage(chatId, 'Иди лесом. Ты не наш чувак!');
        }
    });
    
    // // Listen for any kind of message. There are different kinds of
    // // messages.
    bot.on('message', function (msg) {
        try{
            var chatId = msg.chat.id;
            if(allowedIds.indexOf(String(chatId)) >= 0){
            
                if(msg.document){
                    if(msg.document.file_name.substring((msg.document.file_name.length - 8), msg.document.file_name.length) == '.torrent'){
                        bot.sendMessage(chatId, 'Мы добавили ваш торрент файл в текущие загрузки.');
                        // console.log(msg.document);
                        var fileId = msg.document.file_id;
                        var downloadDir = process.env.PATH_TO_LOAD_TORRENT_FILES;
                        bot.downloadFile(fileId, downloadDir)
                        .then(
                            response => {
                                var oldPath = response;
                                var newPath = process.env.PATH_TO_WATCH_TORRENT_FILES + '\\' + msg.document.file_name;
                                fs.rename(oldPath, newPath, function () {
                                    console.log('success rename');
                                });
                                console.log('Fulfilled: ${response}' + response);
                            },
                        error => console.log('Rejected: ' + error)
                        );
                    }
                    else{
                        bot.sendMessage(chatId, 'Вы прислали не торрент файл!');
                    }
                }

                if( msg.entities && msg.entities[0].type == 'url' && !in_load ){
                    try{
                        in_load = true;
                        
                        linc[chatId] = msg.text;
                        let fileName = linc[chatId].substring((linc[chatId].lastIndexOf('/') + 1), (linc[chatId].lastIndexOf('.') ));
                        let fileExtension = linc[chatId].substring(linc[chatId].lastIndexOf('.'), linc[chatId].length);
                        let filePath = fileName + fileExtension;
                        loadFileNames[chatId] = filePath

                        let response = `- Ответьте "yes" для сохранения с текущим именем ${filePath}\n- Пришлите другое имя файла с таким же расширением "${fileExtension}"!\n- Ответьте "no" для отмены загрузки`;
                        bot.sendMessage(chatId, response);
                    }
                    catch(err){
                        in_load = false;
                        linc[chatId] = null;
                        loadFileNames[chatId] = null;
                        console.log(err);
                        bot.sendMessage(chatId, "ALARM! Че-то пошло не так!!!");
                    }
                }
                else if( in_load && linc[chatId] && loadFileNames[chatId] && msg.text == "yes" ){
                    bot.sendMessage(chatId, "Присели-начали со старым именем");
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
                            resetAllDependencies();
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
                            resetAllDependencies();
                        }
                    }
                    download.start_load_as(mult, linc[chatId], chatId, loadFileNames[chatId]);
                }
                else if( in_load && linc[chatId] && loadFileNames[chatId] && ( msg.text.substring( (msg.text.length - 3), msg.text.length) === loadFileNames[chatId].substring( (loadFileNames[chatId].length - 3), loadFileNames[chatId].length) ) ){
                    bot.sendMessage(chatId, "Присели-начали со новым именем");
                    loadFileNames[chatId] = msg.text;
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
                            resetAllDependencies();
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
                            resetAllDependencies();
                        }
                    }
                    download.start_load_as(mult, linc[chatId], chatId, loadFileNames[chatId]);
                }
                else if(in_load && msg.text !== "yes"){
                    resetAllDependencies();
                    bot.sendMessage(chatId, "Ну нет так нет!");
                }
                else if(in_load){
                    resetAllDependencies();
                    bot.sendMessage(chatId, "Ждем с моря погоды, и когда загрузится предыдущий файл");
                }
                else {
                    resetAllDependencies();
                    var help = 'Оказываем услуги согласно прейскуранту: \n';
                    for(var j in command){
                        help += j + command[j] + '\n';
                    }
                    bot.sendMessage(chatId, "Кукуха поехала такое слать???\n" + help);
                }
            }
            else {
                bot.sendMessage(chatId, 'Иди лесом. Ты не наш чувак!');
            }
        }
        catch(err){
            console.log(err);
            bot.sendMessage(msg.chat.id, "ALARM! Это вообще конец!!!");
        }
    });
}

function resetAllDependencies(){
    in_load = false;
    linc = {};
    loadFileNames = {};
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