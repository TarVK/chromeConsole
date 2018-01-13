var isWorker = typeof(window)=="undefined" || !window.document;

//extended json
var extendedJSON = (function(){
    var out = {};
    out.specialObjects = [
        [RegExp, "regex", function(obj){
            return obj.toString();
        }, function(data){
            var m = data.match(/\/(.*)\/(.*)/);
            return new RegExp(m[1], m[2]);
        }], 
        [Function, "function", function(obj){
            return obj.name;
        }, function(data){
            var func = function(){};
            Object.defineProperty(func, "name", {value:data});
            return func;
        }], 
        [Error, "error", function(obj){
            return JSON.stringify({type:obj.constructor.name, message:obj.message, stack:obj.stack}); 
        }, function(data){
            var obj = JSON.parse(data);
            var error = new window[obj.type](obj.message);
            error.stack = obj.stack;
            return error;
        }],
    ];
    
    out.pathSymbol = Symbol("path");
    out.convertingSymbol = Symbol("converting");
    
    out.encodeVal = function(val, type){
        if(typeof(val)=="symbol") return "Symbol:symbol";
        return type+":"+val;
    };
    out.decodeVal = function(val){
        var m = val.match(/^(\w+):([^]*)$/);
        return [m[1], m[2]];
    };
    out.encode = function(obj, encodeAll, getterObj, path, symbol){
        path = path||"root";
        if(!symbol) symbol = Symbol("lastConvertIdentifier");
        getterObj = getterObj||obj; //getterObj is the objet that the proto is in the descedents of
        
        if(obj === null || obj === undefined){
            return out.encodeVal(obj, "constant");
        }else if(!(obj instanceof Object)){
            return out.encodeVal(obj, typeof(obj));
        }else{
            //encode special objects
            for(var i=0; i<out.specialObjects.length; i++){
                var so = out.specialObjects[i];
                if(obj instanceof so[0]){
                    return out.encodeVal(so[2](obj), so[1]);
                }
            }
            
            //ecnode regular object
            var type = obj.__proto__.constructor.name;
            var ret = {type:type, properties:{}};
            
            var keys = encodeAll?Object.getOwnPropertyNames(obj):Object.keys(obj);
            if(!(obj instanceof Array) && encodeAll) keys.push("__proto__");
            
            obj[out.pathSymbol] = path;
            obj[out.convertingSymbol] = symbol;
            var index = 0;
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                try{
                    //get the property (works with property getters)
                    var o;
                    if(key=="__proto__") o = obj[key];
                    else o = getterObj[key];
                
                    //process property 
                    var s;
                    var p = o && (s=Object.getOwnPropertyDescriptor(o, out.pathSymbol)) && s.value; //use ownPropertyDescriptor, so it doesn't take the value of __protot__
                    
                    if(p!=null && (s=Object.getOwnPropertyDescriptor(o, out.convertingSymbol)) && s.value==symbol){
                        ret.properties[index++] = [key, out.encodeVal(p, "object")];
                    }else{
                        ret.properties[index++] = [key, out.encode(o, encodeAll, key=="__proto__"?getterObj:null, path+"."+key, symbol)];
                    }
                }catch(e){} //catch illegal invocation that tends to occur
            }
            
            return ret;
        }
    };
    out.decode = function(obj, container, root){
        if(!root){
            var container = {};
            return out.decode({type:"object", properties:{0:["root", obj]}}, container, container).root;
        }
        
        if(!(obj instanceof Object)){
            if(!obj) return obj; //catch undefined or other things that leaked through
            
            var data = out.decodeVal(obj);
            var type = data[0];
            data = data[1];
            if(type=="number"){
                return Number(data);
            }else if(type=="string"){
                return data;
            }else if(type=="boolean"){
                return data=="true";
            }else if(type=="constant"){
                return {"null":null, "undefined":undefined}[data];
            }else if(type=="Symbol"){
                return Symbol("SomeSymbol");
            }else if(type=="object"){
                var parts = data.split(".");
                var o = root;
                for(var i=0; i<parts.length && o; i++){
                    o = o[parts[i]];
                }
                return o;
            }
            
            //decode special objects
            for(var i=0; i<out.specialObjects.length; i++){
                var so = out.specialObjects[i];
                if(type == so[1]){
                    return so[3](data);
                }
            }
            
            return null;
        }else{
            var objKeys = Object.keys(obj.properties);
            for(var i=0; i<objKeys.length; i++){
                var d = obj.properties[i];
                if(d){
                    var key = d[0];
                    var o = d[1];
                    
                    if(o instanceof Object){
                        var type = o.type;
                        var cont;
                        if(type=="Object"){
                            cont = {};
                        }else if(type=="Array"){
                            cont = [];
                        }else{
                            cont = {};
                        }
                        
                        container[key] = cont;
                        out.decode(o, cont, root);
                    }else{
                        container[key] = out.decode(o, null, root);
                    }
                }
            }
            return container;
        }
    };
    
    out.stringify = function(data, all){
        return JSON.stringify(out.encode(data, all));
    };
    out.parse = function(text){
        return out.decode(JSON.parse(text));
    };
    
    return out;
})();

//worker code
if(isWorker)
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
    console.time = console.print.bind(console, "time", 0);
    console.timeEnd = console.print.bind(console, "timeEnd", 0);
    console.clear = function(){
        setTimeout(function(){
            console.print("clear", 0);
            console.print("info", 1, "Console was cleared");
        });
    };
})();

//page code
if(!isWorker)
(function(){
    $.fn.jsConsole = function(data){
        var console = this.console(data);
        
        var LineNumber = $.fn.console.LineNumber;
        var PlainText = $.fn.console.PlainText;
        
        console.onInput(function(text){
            var This = this;
            if(this.waitingForResponse) return true;
             
            if(!this.worker) this.setupWorker();
            this.worker.postMessage({type:"js-console-exec", data:text});
            this.waitingForResponse = true;
            this.stopExecutionMessageTimeout = setTimeout(function(){
                This.info("It seems like the code is taking a while to execute,\nYou can press ctrl+c/cmd+c to stop the code from executing if you think it is stuck.");
            }, 4000);
        });
        console.onElementRemove(function(obj){
            if(obj && obj.workerDataID!=null){
                this.$removeWorkerReturnData(obj.workerDataID);
            }
        });
        console.onRightClick(function(obj){
            console.worker.postMessage({type:"js-console-getData", id:obj.outputLineData.workerDataID, path:obj.getPath()});
            return true; //stops propagation
        });
        console.onTerminate(function(){
            this.terminateWorker();
            this.setupWorker();
            return true;
        });
        
        console.$removeWorkerReturnData = function(id){ //remove data of an object returned by the worker
            this.worker.postMessage({type:"js-console-removeData", id:id});
        };
        console.setupWorker = function(workerFile){
            if(workerFile) this.workerFile = workerFile;
            
            var This = this;
            if(this.worker) this.terminateWorker();
            this.worker = new Worker(this.workerFile);
            
            this.worker.onmessage = function(e){
                var data = e.data;
                if(data){
                    if(data.type=="js-console-output"){
                        var args = data.data;
                        for(var i=0; i<args.length; i++)
                            args[i] = extendedJSON.parse(args[i]);
                        if(data.trace){
                            var pos = data.cmd.match(/timeEnd|time/)?"push":"unshift";
                            args[pos](new LineNumber(null, null, data.trace.split("\n")[2+(data.traceOffset||0)]));
                        }
                        
                        var elData = This[data.cmd].apply(This, args);
                        if(elData){
                            elData.workerDataID = data.returnDataID;
                        }else if(data.cmd=="log"){ //no message was added, counter was incremented
                            This.$removeWorkerReturnData(data.returnDataID);
                        }
                        
                        if(data.ret){
                            This.waitingForResponse = false;
                            clearTimeout(This.stopExecutionMessageTimeout);
                        }
                        
                        return;
                    }else if(data.type=="js-console-getData"){
                        This.inputEditor.insert(data.variable);
                        This.inputEditor.focus();
                    }   
                }
                
                var args = Array.from(arguments);
                args.unshift("workerMessage");
                This.$trigger.apply(This, args);
            }
        };
        console.terminateWorker = function(){
            if(this.worker){
                this.waitingForResponse = false;
                clearTimeout(this.stopExecutionMessageTimeout);
                
                this.worker.terminate();
                this.worker = null;
            }
        };
        
        var orPrint = console.$print;
        console.setForwardOutput = function(val){
            if(typeof(val)=="string") val = val.split(",|");
            this.forwardOutput = val;
            console.$print = function(type){
                if(window.console[type] && (val==true || val.indexOf(type)!=-1) && window.console!=console){
                    var args = [];
                    for(var i=1; i<arguments.length; i++){
                        if(arguments[i] instanceof $.fn.console.LineNumber) continue;
                        if(arguments[i] instanceof $.fn.console.PlainText) args.push(arguments[i].text);
                        else args.push(arguments[i]);
                    }
                    window.console[type].apply(window.console, args);
                }
                return orPrint.apply(this, arguments);
            };
        };
        if(data.forwardOutput) console.setForwardOutput(data.forwardOutput);
        
        //worker events
        console.listeners.workerMessage = [];
        if(data.onWorkerMessage) 
            console.listeners.workerMessage.push(data.onWorkerMessage);
        console.onWorkerMessage = function(func, remove){
            this.on("workerMessage", func, remove);
        };
        
        //worker setup
        console.workerFile = data.worker||"jsConsole.sf.js";
        console.setupWorker();
        
        return console;
    };
})();
