(function(){
    $.fn.jsConsole = function(data){
        if(!data) data={};
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