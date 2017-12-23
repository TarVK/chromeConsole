(function(){
    var console = self.console;
    self.window = self;
    
    var onMessage = function(e){
        if(e.data){
            if(e.data.type=="js-console-exec"){
                try{
                    var resp = self.eval(e.data.data+"\n//# sourceURL=console");
                    postMessage({
                        type:"js-console-output", 
                        cmd:"output", 
                        data:[extendedJSON.stringify(resp, true)],
                        returnDataID: Return.store([resp]),
                        ret: true
                    });
                }catch(e){
                    postMessage({
                        type:"js-console-output", 
                        cmd:"error", 
                        data:[extendedJSON.stringify(e, true)],
                        returnDataID: Return.store([e]),
                        ret: true
                    });
                }
                self.console = console; //for if people overwrite stuff by mistake
                return true;
            }else if(e.data.type=="js-console-removeData"){
                Return.remove(e.data.id);
                return true;
            }else if(e.data.type=="js-console-getData"){
                postMessage({
                    type:"js-console-getData",
                    variable: Return.get(e.data.id, e.data.path)
                });
                return true;
            }
        }
    };
    if(!self.onmessage) self.onmessage = onMessage;
    self.jsConsoleOnMessage = onMessage;
    
    //reference previously logged objects
    var Return = {
        data: {},
        id: 0,
        tempID: 0,
        store: function(data){
            var id = this.id++;
            this.data[id] = data;
            return id;    
        },
        get: function(id, path){
            var data = this.data[id];
            var tempID;
            do{
                tempID = "temp"+this.tempID++;
            }while(self[tempID]);
            
            var obj = data;
            var parts = path.split(".");
            for(var i=0; i<parts.length && typeof(obj)=="object"; i++)
                obj = obj[parts[i]];
            self[tempID] = obj;
            return tempID;
        },
        remove: function(id){
            delete this.data[id];
        }
    };
    
    //console stuffs
    console.print = function(type, traceOffset){
        var args = [];
        var start = 2;
        var stack = new Error("").stack;
        if(typeof(traceOffset)=="string"){
            stack = traceOffset;
            traceOffset = arguments[2];
            start++;
        }
        
        for(var i=start; i<arguments.length; i++){
            args[i-start] = extendedJSON.stringify(arguments[i], true);
        }
        
        var objects = Array.from(arguments);
        objects.shift(); objects.shift();
        postMessage({
            type:"js-console-output", 
            cmd:type, 
            data:args, 
            trace: stack,
            traceOffset: traceOffset,
            returnDataID: Return.store(objects),
        });
    };
    console.error = console.print.bind(console, "error", 0);
    console.warn = console.print.bind(console, "warn", 0);
    console.info = console.print.bind(console, "info", 0);
    console.log = console.print.bind(console, "log", 0);
    console.clear = function(){
        setTimeout(function(){
            console.print("clear", 0);
            console.print("info", 1, "Console was cleared");
        });
    };
    console.time = function(label){
        var now = new Date();
        label = label || "default";
        this.times = this.times || {};
        this.times[label] = now;
    };
    console.timeEnd = function(label){
        var now = new Date();
        label = label || "default";
        if(!this.times[label]){
            console.print("timeEnd", 1, label+": 0ms");
        }else{
            var diff = now - this.times[label];
            console.print("timeEnd", 1, label+": "+diff+"ms");
            delete this.times[label];
        }
    };
})();