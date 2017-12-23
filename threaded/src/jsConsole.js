(function(){
    $.fn.workerJsConsole = function(data){
        var console = this.console(data);
        
        var LineNumber = $.fn.console.LineNumber;
        var PlainText = $.fn.console.PlainText;
        
        console.onInput = function(text){
            var This = this;
            if(this.waitingForResponse) return true;
             
            if(!this.worker) this.setupWorker();
            this.worker.postMessage({type:"js-console-exec", data:text});
            this.waitingForResponse = true;
            this.stopExecutionMessageTimeout = setTimeout(function(){
                This.info("It seems like the code is taking a while to execute,\n you can press ctrl+c to stop the code from executing if you think it is stuck.");
            }, 4000);
        };
        console.onElementRemove = function(obj){
            if(obj && obj.workerDataID!=null){
                this.removeWorkerReturnData(obj.workerDataID);
            }
        };
        console.onRightClick = function(obj){
            console.worker.postMessage({type:"js-console-getData", id:obj.outputLineData.workerDataID, path:obj.getPath()});
            return true; //stops propagation
        };
        console.onTerminate = function(){
            this.terminateWorker();
            this.setupWorker();
            return true;
        };
        
        console.removeWorkerReturnData = function(id){ //remove data of an object returned by the worker
            this.worker.postMessage({type:"js-console-removeData", id:id});
        };
        console.setupWorker = function(){
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
                            args.unshift(new LineNumber(null, null, data.trace.split("\n")[2+(data.traceOffset||0)]));
                        }
                        
                        if(data.cmd=="timeEnd"){
                            data.cmd = "log";
                            args[0] = new PlainText(args[0]);
                        }
                        
                        var elData = This[data.cmd].apply(This, args);
                        if(elData){
                            elData.workerDataID = data.returnDataID;
                        }else if(data.cmd=="log"){ //no message was added, counter was incremented
                            This.removeWorkerReturnData(data.returnDataID);
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
                
                
                for(var i=0; i<This.workerListeners.length; i++){
                    var l = This.workerListeners[i];
                    l.apply(This.worker, arguments);
                }
            }
        };
        console.terminateWorker = function(){
            if(this.worker){
                this.waitingForResponse = false;
                clearTimeout(this.stopExecutionMessageTimeout);
                
                this.worker.terminate();
                this.worker = null;
                for(var i=0; i<this.terminateListeners.length; i++){
                    this.terminateListeners[i]();
                }
            }
        };
        console.workerFile = data.worker||"jsConsole.sf.js";
        console.workerListeners = [];
        console.terminateListeners = [];
        console.setupWorker();
        
        return console;
    };
})();