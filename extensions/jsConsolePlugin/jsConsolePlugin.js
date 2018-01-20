(function(){
    var theme = "xcode";
    
    var load = function(paths, callback){
        var script = document.createElement('script');
        script.setAttribute('src',paths.shift());
        document.head.appendChild(script);
        script.onload = function(){
            if(paths.length>0){
                load(paths, callback)
            }else{
                callback();
            }    
        };
    };
    load([
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.js", 
            "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js",
            "https://cdn.rawgit.com/TarVK/chromeConsole/master/console.js"
        ], function(){
            var first = true;
            $(window).click(function(){
                if(first){
                    first = false;
                    createWindow();
                }
            });
            
            var createWindow = function(){
                var seperateWindow = window.open("", "jsConsole", "height=300,width=700");
                    
                //get required style elements
                var editor = ace.edit(document.createElement("div"));
                editor.setTheme("ace/theme/xcode");
                
                var styleInterval = setInterval(function(){
                    var themeStyle = $("style#ace-"+theme)[0];
                    var aceStyle1 = $("style[id='ace_editor.css']")[0];
                    var aceStyle2 = $("style#ace-tm")[0];
                    if(themeStyle && aceStyle1 && aceStyle2){
                        clearInterval(styleInterval);
                        seperateWindow.document.open().write(
                            "<html>"+
                                "<head>"+
                                    $("style#ace-"+theme)[0].outerHTML+
                                    $("style[id='ace_editor.css']")[0].outerHTML+
                                    $("style#ace-tm")[0].outerHTML+
                                    "<style>"+
                                        "html, body, .console{width:100%;height:100%;margin:0px;}"+
                                    "</style>"+
                                    '<link rel="stylesheet" href="https://cdn.rawgit.com/TarVK/chromeConsole/master/console.css" type="text/css" />'+
                                    "<title>js Console Plugin</title>"+
                                "</head>"+
                                "<body>"+
                                    "<div class=console></div>"+
                                "</body>"+
                            "</html>");
                        createConsole(seperateWindow.document);
                    }
                }, 100);
                
                $(window).on('beforeunload', function(){
                    seperateWindow.document.open().write("<script>window.close()<\/script>"); 
                });
                seperateWindow.history.pushState("console", "console", "jsConsole");
            }
            var createConsole = function(doc){
                var cons = $(doc).find(".console").console({theme:theme, onInput: function(text){
                    try{
                        cons.output(window.eval(text));
                    }catch(e){
                        cons.error(e);
                    }
                }});
                var wrap = function(method){
                    return function(){
                        cons[method].apply(cons, arguments);
                    }
                }
                console.log = wrap("log");
                console.error = wrap("error");
                console.warn = wrap("warn");
                console.time = wrap("time");
                console.timeEnd = wrap("timeEnd");
                console.clear = wrap("clear");
            }
        }
    );
})();