importScripts('../jsConsole.sf.js');
self.onmessage = function(e){
    if(jsConsoleOnMessage.apply(self, arguments)) return; //call caught by js console
    
    if(e.data.type=="info"){ //some listener to show how to receive data
        console.info(e.data.data);
    }
}

postMessage({type:"load"}); //some event to show how to receive data

function sum(input){ //some function to be callable from the console
    if(typeof(input)=="object"){
        var keys = Object.keys(input);
        console.log("objectKeys:", keys); //some console.log you might have for debugging
        var out = 0;
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var val = input[key];
            if(typeof(val)=="number")
                out += val;
        }
        return out;
    }else{
        return false;
    }
}