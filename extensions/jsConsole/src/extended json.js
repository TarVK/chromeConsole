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