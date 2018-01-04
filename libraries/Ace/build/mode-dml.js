ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        }, 
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

ace.define("ace/mode/javascript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

var JavaScriptHighlightRules = function(options) {
    var keywordMapper = this.createKeywordMapper({
        "variable.language":
            "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"  + // Constructors
            "Namespace|QName|XML|XMLList|"                                             + // E4X
            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"   +
            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"                    +
            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"   + // Errors
            "SyntaxError|TypeError|URIError|"                                          +
            "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
            "isNaN|parseFloat|parseInt|"                                               +
            "JSON|Math|"                                                               + // Other
            "this|arguments|prototype|window|document"                                 , // Pseudo
        "keyword":
            "const|yield|import|get|set|async|await|" +
            "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
            "if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
            "__parent__|__count__|escape|unescape|with|__proto__|" +
            "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
        "storage.type":
            "const|let|var|function",
        "constant.language":
            "null|Infinity|NaN|undefined",
        "support.function":
            "alert",
        "constant.language.boolean": "true|false"
    }, "identifier");
    var kwBeforeRe = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";

    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "u{[0-9a-fA-F]{1,6}}|" + // es6 unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-7][0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";

    this.$rules = {
        "no_regex" : [
            DocCommentHighlightRules.getStartRule("doc-start"),
            comments("no_regex"),
            {
                token : "string",
                regex : "'(?=.)",
                next  : "qstring"
            }, {
                token : "string",
                regex : '"(?=.)',
                next  : "qqstring"
            }, {
                token : "constant.numeric", // hexadecimal, octal and binary
                regex : /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
            }, {
                token : "constant.numeric", // decimal integers and floats
                regex : /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
            }, {
                token : [
                    "storage.type", "punctuation.operator", "support.function",
                    "punctuation.operator", "entity.name.function", "text","keyword.operator"
                ],
                regex : "(" + identifierRe + ")(\\.)(prototype)(\\.)(" + identifierRe +")(\\s*)(=)",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "keyword.operator", "text", "storage.type",
                    "text", "paren.lparen"
                ],
                regex : "(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text",
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(function)(\\s+)(" + identifierRe + ")(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "punctuation.operator",
                    "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "text", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : "keyword",
                regex : "from(?=\\s*('|\"))"
            }, {
                token : "keyword",
                regex : "(?:" + kwBeforeRe + ")\\b",
                next : "start"
            }, {
                token : ["support.constant"],
                regex : /that\b/
            }, {
                token : ["storage.type", "punctuation.operator", "support.function.firebug"],
                regex : /(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/
            }, {
                token : keywordMapper,
                regex : identifierRe
            }, {
                token : "punctuation.operator",
                regex : /[.](?![.])/,
                next  : "property"
            }, {
                token : "storage.type",
                regex : /=>/
            }, {
                token : "keyword.operator",
                regex : /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
                next  : "start"
            }, {
                token : "punctuation.operator",
                regex : /[?:,;.]/,
                next  : "start"
            }, {
                token : "paren.lparen",
                regex : /[\[({]/,
                next  : "start"
            }, {
                token : "paren.rparen",
                regex : /[\])}]/
            }, {
                token: "comment",
                regex: /^#!.*$/
            }
        ],
        property: [{
                token : "text",
                regex : "\\s+"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text",
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : "punctuation.operator",
                regex : /[.](?![.])/
            }, {
                token : "support.function",
                regex : /(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/
            }, {
                token : "support.function.dom",
                regex : /(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/
            }, {
                token :  "support.constant",
                regex : /(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/
            }, {
                token : "identifier",
                regex : identifierRe
            }, {
                regex: "",
                token: "empty",
                next: "no_regex"
            }
        ],
        "start": [
            DocCommentHighlightRules.getStartRule("doc-start"),
            comments("start"),
            {
                token: "string.regexp",
                regex: "\\/",
                next: "regex"
            }, {
                token : "text",
                regex : "\\s+|^$",
                next : "start"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "regex": [
            {
                token: "regexp.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "string.regexp",
                regex: "/[sxngimy]*",
                next: "no_regex"
            }, {
                token : "invalid",
                regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
            }, {
                token : "constant.language.escape",
                regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
            }, {
                token : "constant.language.delimiter",
                regex: /\|/
            }, {
                token: "constant.language.escape",
                regex: /\[\^?/,
                next: "regex_character_class"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp"
            }
        ],
        "regex_character_class": [
            {
                token: "regexp.charclass.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "constant.language.escape",
                regex: "]",
                next: "regex"
            }, {
                token: "constant.language.escape",
                regex: "-"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp.charachterclass"
            }
        ],
        "function_arguments": [
            {
                token: "variable.parameter",
                regex: identifierRe
            }, {
                token: "punctuation.operator",
                regex: "[, ]+"
            }, {
                token: "punctuation.operator",
                regex: "$"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                consumeLineEnd  : true
            }, {
                token : "string",
                regex : '"|$',
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ],
        "qstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                consumeLineEnd  : true
            }, {
                token : "string",
                regex : "'|$",
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ]
    };


    if (!options || !options.noES6) {
        this.$rules.no_regex.unshift({
            regex: "[{}]", onMatch: function(val, state, stack) {
                this.next = val == "{" ? this.nextState : "";
                if (val == "{" && stack.length) {
                    stack.unshift("start", state);
                }
                else if (val == "}" && stack.length) {
                    stack.shift();
                    this.next = stack.shift();
                    if (this.next.indexOf("string") != -1 || this.next.indexOf("jsx") != -1)
                        return "paren.quasi.end";
                }
                return val == "{" ? "paren.lparen" : "paren.rparen";
            },
            nextState: "start"
        }, {
            token : "string.quasi.start",
            regex : /`/,
            push  : [{
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "paren.quasi.start",
                regex : /\${/,
                push  : "start"
            }, {
                token : "string.quasi.end",
                regex : /`/,
                next  : "pop"
            }, {
                defaultToken: "string.quasi"
            }]
        });

        if (!options || options.jsx != false)
            JSX.call(this);
    }

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("no_regex") ]);

    this.normalizeRules();
};

oop.inherits(JavaScriptHighlightRules, TextHighlightRules);

function JSX() {
    var tagRegex = identifierRe.replace("\\d", "\\d\\-");
    var jsxTag = {
        onMatch : function(val, state, stack) {
            var offset = val.charAt(1) == "/" ? 2 : 1;
            if (offset == 1) {
                if (state != this.nextState)
                    stack.unshift(this.next, this.nextState, 0);
                else
                    stack.unshift(this.next);
                stack[2]++;
            } else if (offset == 2) {
                if (state == this.nextState) {
                    stack[1]--;
                    if (!stack[1] || stack[1] < 0) {
                        stack.shift();
                        stack.shift();
                    }
                }
            }
            return [{
                type: "meta.tag.punctuation." + (offset == 1 ? "" : "end-") + "tag-open.xml",
                value: val.slice(0, offset)
            }, {
                type: "meta.tag.tag-name.xml",
                value: val.substr(offset)
            }];
        },
        regex : "</?" + tagRegex + "",
        next: "jsxAttributes",
        nextState: "jsx"
    };
    this.$rules.start.unshift(jsxTag);
    var jsxJsRule = {
        regex: "{",
        token: "paren.quasi.start",
        push: "start"
    };
    this.$rules.jsx = [
        jsxJsRule,
        jsxTag,
        {include : "reference"},
        {defaultToken: "string"}
    ];
    this.$rules.jsxAttributes = [{
        token : "meta.tag.punctuation.tag-close.xml",
        regex : "/?>",
        onMatch : function(value, currentState, stack) {
            if (currentState == stack[0])
                stack.shift();
            if (value.length == 2) {
                if (stack[0] == this.nextState)
                    stack[1]--;
                if (!stack[1] || stack[1] < 0) {
                    stack.splice(0, 2);
                }
            }
            this.next = stack[0] || "start";
            return [{type: this.token, value: value}];
        },
        nextState: "jsx"
    },
    jsxJsRule,
    comments("jsxAttributes"),
    {
        token : "entity.other.attribute-name.xml",
        regex : tagRegex
    }, {
        token : "keyword.operator.attribute-equals.xml",
        regex : "="
    }, {
        token : "text.tag-whitespace.xml",
        regex : "\\s+"
    }, {
        token : "string.attribute-value.xml",
        regex : "'",
        stateName : "jsx_attr_q",
        push : [
            {token : "string.attribute-value.xml", regex: "'", next: "pop"},
            {include : "reference"},
            {defaultToken : "string.attribute-value.xml"}
        ]
    }, {
        token : "string.attribute-value.xml",
        regex : '"',
        stateName : "jsx_attr_qq",
        push : [
            {token : "string.attribute-value.xml", regex: '"', next: "pop"},
            {include : "reference"},
            {defaultToken : "string.attribute-value.xml"}
        ]
    },
    jsxTag
    ];
    this.$rules.reference = [{
        token : "constant.language.escape.reference.xml",
        regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
    }];
}

function comments(next) {
    return [
        {
            token : "comment", // multi line comment
            regex : /\/\*/,
            next: [
                DocCommentHighlightRules.getTagRule(),
                {token : "comment", regex : "\\*\\/", next : next || "pop"},
                {defaultToken : "comment", caseInsensitive: true}
            ]
        }, {
            token : "comment",
            regex : "\\/\\/",
            next: [
                DocCommentHighlightRules.getTagRule(),
                {token : "comment", regex : "$|^", next : next || "pop"},
                {defaultToken : "comment", caseInsensitive: true}
            ]
        }
    ];
}
exports.JavaScriptHighlightRules = JavaScriptHighlightRules;
});

ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {
    
    this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
    
        if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return "";
        }
    
        var fw = this._getFoldWidgetBase(session, foldStyle, row);
    
        if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart
    
        return fw;
    };

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);
        
        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);
        
        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }
            
            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };
    
    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };
    this.getCommentRegionBlock = function(session, line, row) {
        var startColumn = line.search(/\s*$/);
        var maxRow = session.getLength();
        var startRow = row;
        
        var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
        var depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        var endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/javascript",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/javascript_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = JavaScriptHighlightRules;
    
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};
    this.$quotes = {'"': '"', "'": "'", "`": "`"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start" || state == "no_regex") {
            var match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start" || endState == "no_regex") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "* ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/javascript_worker", "JavaScriptWorker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(results) {
            session.setAnnotations(results.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };

    this.$id = "ace/mode/javascript";
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define("ace/mode/css_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var supportType = exports.supportType = "align-content|align-items|align-self|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|border|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-collapse|border-color|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-shadow|box-sizing|caption-side|clear|clip|color|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|content|counter-increment|counter-reset|cursor|direction|display|empty-cells|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|font|font-family|font-size|font-size-adjust|font-stretch|font-style|font-variant|font-weight|hanging-punctuation|height|justify-content|left|letter-spacing|line-height|list-style|list-style-image|list-style-position|list-style-type|margin|margin-bottom|margin-left|margin-right|margin-top|max-height|max-width|min-height|min-width|nav-down|nav-index|nav-left|nav-right|nav-up|opacity|order|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-x|overflow-y|padding|padding-bottom|padding-left|padding-right|padding-top|page-break-after|page-break-before|page-break-inside|perspective|perspective-origin|position|quotes|resize|right|tab-size|table-layout|text-align|text-align-last|text-decoration|text-decoration-color|text-decoration-line|text-decoration-style|text-indent|text-justify|text-overflow|text-shadow|text-transform|top|transform|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|unicode-bidi|vertical-align|visibility|white-space|width|word-break|word-spacing|word-wrap|z-index";
var supportFunction = exports.supportFunction = "rgb|rgba|url|attr|counter|counters";
var supportConstant = exports.supportConstant = "absolute|after-edge|after|all-scroll|all|alphabetic|always|antialiased|armenian|auto|avoid-column|avoid-page|avoid|balance|baseline|before-edge|before|below|bidi-override|block-line-height|block|bold|bolder|border-box|both|bottom|box|break-all|break-word|capitalize|caps-height|caption|center|central|char|circle|cjk-ideographic|clone|close-quote|col-resize|collapse|column|consider-shifts|contain|content-box|cover|crosshair|cubic-bezier|dashed|decimal-leading-zero|decimal|default|disabled|disc|disregard-shifts|distribute-all-lines|distribute-letter|distribute-space|distribute|dotted|double|e-resize|ease-in|ease-in-out|ease-out|ease|ellipsis|end|exclude-ruby|fill|fixed|georgian|glyphs|grid-height|groove|hand|hanging|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|icon|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space|ideographic|inactive|include-ruby|inherit|initial|inline-block|inline-box|inline-line-height|inline-table|inline|inset|inside|inter-ideograph|inter-word|invert|italic|justify|katakana-iroha|katakana|keep-all|last|left|lighter|line-edge|line-through|line|linear|list-item|local|loose|lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|mathematical|max-height|max-size|medium|menu|message-box|middle|move|n-resize|ne-resize|newspaper|no-change|no-close-quote|no-drop|no-open-quote|no-repeat|none|normal|not-allowed|nowrap|nw-resize|oblique|open-quote|outset|outside|overline|padding-box|page|pointer|pre-line|pre-wrap|pre|preserve-3d|progress|relative|repeat-x|repeat-y|repeat|replaced|reset-size|ridge|right|round|row-resize|rtl|s-resize|scroll|se-resize|separate|slice|small-caps|small-caption|solid|space|square|start|static|status-bar|step-end|step-start|steps|stretch|strict|sub|super|sw-resize|table-caption|table-cell|table-column-group|table-column|table-footer-group|table-header-group|table-row-group|table-row|table|tb-rl|text-after-edge|text-before-edge|text-bottom|text-size|text-top|text|thick|thin|transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|use-script|vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|z-index|zero";
var supportConstantColor = exports.supportConstantColor = "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
var supportConstantFonts = exports.supportConstantFonts = "arial|century|comic|courier|cursive|fantasy|garamond|georgia|helvetica|impact|lucida|symbol|system|tahoma|times|trebuchet|utopia|verdana|webdings|sans-serif|serif|monospace";

var numRe = exports.numRe = "\\-?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))";
var pseudoElements = exports.pseudoElements = "(\\:+)\\b(after|before|first-letter|first-line|moz-selection|selection)\\b";
var pseudoClasses  = exports.pseudoClasses =  "(:)\\b(active|checked|disabled|empty|enabled|first-child|first-of-type|focus|hover|indeterminate|invalid|last-child|last-of-type|link|not|nth-child|nth-last-child|nth-last-of-type|nth-of-type|only-child|only-of-type|required|root|target|valid|visited)\\b";

var CssHighlightRules = function() {

    var keywordMapper = this.createKeywordMapper({
        "support.function": supportFunction,
        "support.constant": supportConstant,
        "support.type": supportType,
        "support.constant.color": supportConstantColor,
        "support.constant.fonts": supportConstantFonts
    }, "text", true);

    this.$rules = {
        "start" : [{
            include : ["strings", "url", "comments"]
        }, {
            token: "paren.lparen",
            regex: "\\{",
            next:  "ruleset"
        }, {
            token: "paren.rparen",
            regex: "\\}"
        }, {
            token: "string",
            regex: "@",
            next:  "media"
        }, {
            token: "keyword",
            regex: "#[a-z0-9-_]+"
        }, {
            token: "keyword",
            regex: "%"
        }, {
            token: "variable",
            regex: "\\.[a-z0-9-_]+"
        }, {
            token: "string",
            regex: ":[a-z0-9-_]+"
        }, {
            token : "constant.numeric",
            regex : numRe
        }, {
            token: "constant",
            regex: "[a-z0-9-_]+"
        }, {
            caseInsensitive: true
        }],
        
        "media": [{
            include : ["strings", "url", "comments"]
        }, {
            token: "paren.lparen",
            regex: "\\{",
            next:  "start"
        }, {
            token: "paren.rparen",
            regex: "\\}",
            next:  "start"
        }, {
            token: "string",
            regex: ";",
            next:  "start"
        }, {
            token: "keyword",
            regex: "(?:media|supports|document|charset|import|namespace|media|supports|document"
                + "|page|font|keyframes|viewport|counter-style|font-feature-values"
                + "|swash|ornaments|annotation|stylistic|styleset|character-variant)"
        }],

        "comments" : [{
            token: "comment", // multi line comment
            regex: "\\/\\*",
            push: [{
                token : "comment",
                regex : "\\*\\/",
                next : "pop"
            }, {
                defaultToken : "comment"
            }]
        }],

        "ruleset" : [{
            regex : "-(webkit|ms|moz|o)-",
            token : "text"
        }, {
            token : "paren.rparen",
            regex : "\\}",
            next : "start"
        }, {
            include : ["strings", "url", "comments"]
        }, {
            token : ["constant.numeric", "keyword"],
            regex : "(" + numRe + ")(ch|cm|deg|em|ex|fr|gd|grad|Hz|in|kHz|mm|ms|pc|pt|px|rad|rem|s|turn|vh|vm|vw|%)"
        }, {
            token : "constant.numeric",
            regex : numRe
        }, {
            token : "constant.numeric",  // hex6 color
            regex : "#[a-f0-9]{6}"
        }, {
            token : "constant.numeric", // hex3 color
            regex : "#[a-f0-9]{3}"
        }, {
            token : ["punctuation", "entity.other.attribute-name.pseudo-element.css"],
            regex : pseudoElements
        }, {
            token : ["punctuation", "entity.other.attribute-name.pseudo-class.css"],
            regex : pseudoClasses
        }, {
            include: "url"
        }, {
            token : keywordMapper,
            regex : "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
        }, {
            caseInsensitive: true
        }],
        
        url: [{
            token : "support.function",
            regex : "(?:url(:?-prefix)?|domain|regexp)\\(",
            push: [{
                token : "support.function",
                regex : "\\)",
                next : "pop"
            }, {
                defaultToken: "string"
            }]
        }],
        
        strings: [{
            token : "string.start",
            regex : "'",
            push : [{
                token : "string.end",
                regex : "'|$",
                next: "pop"
            }, {
                include : "escapes"
            }, {
                token : "constant.language.escape",
                regex : /\\$/,
                consumeLineEnd: true
            }, {
                defaultToken: "string"
            }]
        }, {
            token : "string.start",
            regex : '"',
            push : [{
                token : "string.end",
                regex : '"|$',
                next: "pop"
            }, {
                include : "escapes"
            }, {
                token : "constant.language.escape",
                regex : /\\$/,
                consumeLineEnd: true
            }, {
                defaultToken: "string"
            }]
        }],
        escapes: [{
            token : "constant.language.escape",
            regex : /\\([a-fA-F\d]{1,6}|[^a-fA-F\d])/
        }]
        
    };

    this.normalizeRules();
};

oop.inherits(CssHighlightRules, TextHighlightRules);

exports.CssHighlightRules = CssHighlightRules;

});

ace.define("ace/mode/css_completions",["require","exports","module"], function(require, exports, module) {
"use strict";

var propertyMap = {
    "background": {"#$0": 1},
    "background-color": {"#$0": 1, "transparent": 1, "fixed": 1},
    "background-image": {"url('/$0')": 1},
    "background-repeat": {"repeat": 1, "repeat-x": 1, "repeat-y": 1, "no-repeat": 1, "inherit": 1},
    "background-position": {"bottom":2, "center":2, "left":2, "right":2, "top":2, "inherit":2},
    "background-attachment": {"scroll": 1, "fixed": 1},
    "background-size": {"cover": 1, "contain": 1},
    "background-clip": {"border-box": 1, "padding-box": 1, "content-box": 1},
    "background-origin": {"border-box": 1, "padding-box": 1, "content-box": 1},
    "border": {"solid $0": 1, "dashed $0": 1, "dotted $0": 1, "#$0": 1},
    "border-color": {"#$0": 1},
    "border-style": {"solid":2, "dashed":2, "dotted":2, "double":2, "groove":2, "hidden":2, "inherit":2, "inset":2, "none":2, "outset":2, "ridged":2},
    "border-collapse": {"collapse": 1, "separate": 1},
    "bottom": {"px": 1, "em": 1, "%": 1},
    "clear": {"left": 1, "right": 1, "both": 1, "none": 1},
    "color": {"#$0": 1, "rgb(#$00,0,0)": 1},
    "cursor": {"default": 1, "pointer": 1, "move": 1, "text": 1, "wait": 1, "help": 1, "progress": 1, "n-resize": 1, "ne-resize": 1, "e-resize": 1, "se-resize": 1, "s-resize": 1, "sw-resize": 1, "w-resize": 1, "nw-resize": 1},
    "display": {"none": 1, "block": 1, "inline": 1, "inline-block": 1, "table-cell": 1},
    "empty-cells": {"show": 1, "hide": 1},
    "float": {"left": 1, "right": 1, "none": 1},
    "font-family": {"Arial":2,"Comic Sans MS":2,"Consolas":2,"Courier New":2,"Courier":2,"Georgia":2,"Monospace":2,"Sans-Serif":2, "Segoe UI":2,"Tahoma":2,"Times New Roman":2,"Trebuchet MS":2,"Verdana": 1},
    "font-size": {"px": 1, "em": 1, "%": 1},
    "font-weight": {"bold": 1, "normal": 1},
    "font-style": {"italic": 1, "normal": 1},
    "font-variant": {"normal": 1, "small-caps": 1},
    "height": {"px": 1, "em": 1, "%": 1},
    "left": {"px": 1, "em": 1, "%": 1},
    "letter-spacing": {"normal": 1},
    "line-height": {"normal": 1},
    "list-style-type": {"none": 1, "disc": 1, "circle": 1, "square": 1, "decimal": 1, "decimal-leading-zero": 1, "lower-roman": 1, "upper-roman": 1, "lower-greek": 1, "lower-latin": 1, "upper-latin": 1, "georgian": 1, "lower-alpha": 1, "upper-alpha": 1},
    "margin": {"px": 1, "em": 1, "%": 1},
    "margin-right": {"px": 1, "em": 1, "%": 1},
    "margin-left": {"px": 1, "em": 1, "%": 1},
    "margin-top": {"px": 1, "em": 1, "%": 1},
    "margin-bottom": {"px": 1, "em": 1, "%": 1},
    "max-height": {"px": 1, "em": 1, "%": 1},
    "max-width": {"px": 1, "em": 1, "%": 1},
    "min-height": {"px": 1, "em": 1, "%": 1},
    "min-width": {"px": 1, "em": 1, "%": 1},
    "overflow": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
    "overflow-x": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
    "overflow-y": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
    "padding": {"px": 1, "em": 1, "%": 1},
    "padding-top": {"px": 1, "em": 1, "%": 1},
    "padding-right": {"px": 1, "em": 1, "%": 1},
    "padding-bottom": {"px": 1, "em": 1, "%": 1},
    "padding-left": {"px": 1, "em": 1, "%": 1},
    "page-break-after": {"auto": 1, "always": 1, "avoid": 1, "left": 1, "right": 1},
    "page-break-before": {"auto": 1, "always": 1, "avoid": 1, "left": 1, "right": 1},
    "position": {"absolute": 1, "relative": 1, "fixed": 1, "static": 1},
    "right": {"px": 1, "em": 1, "%": 1},
    "table-layout": {"fixed": 1, "auto": 1},
    "text-decoration": {"none": 1, "underline": 1, "line-through": 1, "blink": 1},
    "text-align": {"left": 1, "right": 1, "center": 1, "justify": 1},
    "text-transform": {"capitalize": 1, "uppercase": 1, "lowercase": 1, "none": 1},
    "top": {"px": 1, "em": 1, "%": 1},
    "vertical-align": {"top": 1, "bottom": 1},
    "visibility": {"hidden": 1, "visible": 1},
    "white-space": {"nowrap": 1, "normal": 1, "pre": 1, "pre-line": 1, "pre-wrap": 1},
    "width": {"px": 1, "em": 1, "%": 1},
    "word-spacing": {"normal": 1},
    "filter": {"alpha(opacity=$0100)": 1},

    "text-shadow": {"$02px 2px 2px #777": 1},
    "text-overflow": {"ellipsis-word": 1, "clip": 1, "ellipsis": 1},
    "-moz-border-radius": 1,
    "-moz-border-radius-topright": 1,
    "-moz-border-radius-bottomright": 1,
    "-moz-border-radius-topleft": 1,
    "-moz-border-radius-bottomleft": 1,
    "-webkit-border-radius": 1,
    "-webkit-border-top-right-radius": 1,
    "-webkit-border-top-left-radius": 1,
    "-webkit-border-bottom-right-radius": 1,
    "-webkit-border-bottom-left-radius": 1,
    "-moz-box-shadow": 1,
    "-webkit-box-shadow": 1,
    "transform": {"rotate($00deg)": 1, "skew($00deg)": 1},
    "-moz-transform": {"rotate($00deg)": 1, "skew($00deg)": 1},
    "-webkit-transform": {"rotate($00deg)": 1, "skew($00deg)": 1 }
};

var CssCompletions = function() {

};

(function() {

    this.completionsDefined = false;

    this.defineCompletions = function() {
        if (document) {
            var style = document.createElement('c').style;

            for (var i in style) {
                if (typeof style[i] !== 'string')
                    continue;

                var name = i.replace(/[A-Z]/g, function(x) {
                    return '-' + x.toLowerCase();
                });

                if (!propertyMap.hasOwnProperty(name))
                    propertyMap[name] = 1;
            }
        }

        this.completionsDefined = true;
    };

    this.getCompletions = function(state, session, pos, prefix) {
        if (!this.completionsDefined) {
            this.defineCompletions();
        }

        var token = session.getTokenAt(pos.row, pos.column);

        if (!token)
            return [];
        if (state==='ruleset'){
            var line = session.getLine(pos.row).substr(0, pos.column);
            if (/:[^;]+$/.test(line)) {
                /([\w\-]+):[^:]*$/.test(line);

                return this.getPropertyValueCompletions(state, session, pos, prefix);
            } else {
                return this.getPropertyCompletions(state, session, pos, prefix);
            }
        }

        return [];
    };

    this.getPropertyCompletions = function(state, session, pos, prefix) {
        var properties = Object.keys(propertyMap);
        return properties.map(function(property){
            return {
                caption: property,
                snippet: property + ': $0;',
                meta: "property",
                score: Number.MAX_VALUE
            };
        });
    };

    this.getPropertyValueCompletions = function(state, session, pos, prefix) {
        var line = session.getLine(pos.row).substr(0, pos.column);
        var property = (/([\w\-]+):[^:]*$/.exec(line) || {})[1];

        if (!property)
            return [];
        var values = [];
        if (property in propertyMap && typeof propertyMap[property] === "object") {
            values = Object.keys(propertyMap[property]);
        }
        return values.map(function(value){
            return {
                caption: value,
                snippet: value,
                meta: "property value",
                score: Number.MAX_VALUE
            };
        });
    };

}).call(CssCompletions.prototype);

exports.CssCompletions = CssCompletions;
});

ace.define("ace/mode/behaviour/css",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/mode/behaviour/cstyle","ace/token_iterator"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var CstyleBehaviour = require("./cstyle").CstyleBehaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;

var CssBehaviour = function () {

    this.inherit(CstyleBehaviour);

    this.add("colon", "insertion", function (state, action, editor, session, text) {
        if (text === ':') {
            var cursor = editor.getCursorPosition();
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();
            if (token && token.value.match(/\s+/)) {
                token = iterator.stepBackward();
            }
            if (token && token.type === 'support.type') {
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar === ':') {
                    return {
                       text: '',
                       selection: [1, 1]
                    };
                }
                if (!line.substring(cursor.column).match(/^\s*;/)) {
                    return {
                       text: ':;',
                       selection: [1, 1]
                    };
                }
            }
        }
    });

    this.add("colon", "deletion", function (state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected === ':') {
            var cursor = editor.getCursorPosition();
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();
            if (token && token.value.match(/\s+/)) {
                token = iterator.stepBackward();
            }
            if (token && token.type === 'support.type') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.end.column, range.end.column + 1);
                if (rightChar === ';') {
                    range.end.column ++;
                    return range;
                }
            }
        }
    });

    this.add("semicolon", "insertion", function (state, action, editor, session, text) {
        if (text === ';') {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar === ';') {
                return {
                   text: '',
                   selection: [1, 1]
                };
            }
        }
    });

};
oop.inherits(CssBehaviour, CstyleBehaviour);

exports.CssBehaviour = CssBehaviour;
});

ace.define("ace/mode/css",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/css_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/css_completions","ace/mode/behaviour/css","ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var CssHighlightRules = require("./css_highlight_rules").CssHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var CssCompletions = require("./css_completions").CssCompletions;
var CssBehaviour = require("./behaviour/css").CssBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = CssHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CssBehaviour();
    this.$completer = new CssCompletions();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.foldingRules = "cStyle";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        var match = line.match(/^.*\{\s*$/);
        if (match) {
            indent += tab;
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.getCompletions = function(state, session, pos, prefix) {
        return this.$completer.getCompletions(state, session, pos, prefix);
    };

    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/css_worker", "Worker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(e) {
            session.setAnnotations(e.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };

    this.$id = "ace/mode/css";
}).call(Mode.prototype);

exports.Mode = Mode;

});

ace.define("ace/mode/xml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var XmlHighlightRules = function(normalize) {
    var tagRegex = "[_:a-zA-Z\xc0-\uffff][-_:.a-zA-Z0-9\xc0-\uffff]*";

    this.$rules = {
        start : [
            {token : "string.cdata.xml", regex : "<\\!\\[CDATA\\[", next : "cdata"},
            {
                token : ["punctuation.instruction.xml", "keyword.instruction.xml"],
                regex : "(<\\?)(" + tagRegex + ")", next : "processing_instruction"
            },
            {token : "comment.start.xml", regex : "<\\!--", next : "comment"},
            {
                token : ["xml-pe.doctype.xml", "xml-pe.doctype.xml"],
                regex : "(<\\!)(DOCTYPE)(?=[\\s])", next : "doctype", caseInsensitive: true
            },
            {include : "tag"},
            {token : "text.end-tag-open.xml", regex: "</"},
            {token : "text.tag-open.xml", regex: "<"},
            {include : "reference"},
            {defaultToken : "text.xml"}
        ],

        processing_instruction : [{
            token : "entity.other.attribute-name.decl-attribute-name.xml",
            regex : tagRegex
        }, {
            token : "keyword.operator.decl-attribute-equals.xml",
            regex : "="
        }, {
            include: "whitespace"
        }, {
            include: "string"
        }, {
            token : "punctuation.xml-decl.xml",
            regex : "\\?>",
            next : "start"
        }],

        doctype : [
            {include : "whitespace"},
            {include : "string"},
            {token : "xml-pe.doctype.xml", regex : ">", next : "start"},
            {token : "xml-pe.xml", regex : "[-_a-zA-Z0-9:]+"},
            {token : "punctuation.int-subset", regex : "\\[", push : "int_subset"}
        ],

        int_subset : [{
            token : "text.xml",
            regex : "\\s+"
        }, {
            token: "punctuation.int-subset.xml",
            regex: "]",
            next: "pop"
        }, {
            token : ["punctuation.markup-decl.xml", "keyword.markup-decl.xml"],
            regex : "(<\\!)(" + tagRegex + ")",
            push : [{
                token : "text",
                regex : "\\s+"
            },
            {
                token : "punctuation.markup-decl.xml",
                regex : ">",
                next : "pop"
            },
            {include : "string"}]
        }],

        cdata : [
            {token : "string.cdata.xml", regex : "\\]\\]>", next : "start"},
            {token : "text.xml", regex : "\\s+"},
            {token : "text.xml", regex : "(?:[^\\]]|\\](?!\\]>))+"}
        ],

        comment : [
            {token : "comment.end.xml", regex : "-->", next : "start"},
            {defaultToken : "comment.xml"}
        ],

        reference : [{
            token : "constant.language.escape.reference.xml",
            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
        }],

        attr_reference : [{
            token : "constant.language.escape.reference.attribute-value.xml",
            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
        }],

        tag : [{
            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag.punctuation.end-tag-open.xml", "meta.tag.tag-name.xml"],
            regex : "(?:(<)|(</))((?:" + tagRegex + ":)?" + tagRegex + ")",
            next: [
                {include : "attributes"},
                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
            ]
        }],

        tag_whitespace : [
            {token : "text.tag-whitespace.xml", regex : "\\s+"}
        ],
        whitespace : [
            {token : "text.whitespace.xml", regex : "\\s+"}
        ],
        string: [{
            token : "string.xml",
            regex : "'",
            push : [
                {token : "string.xml", regex: "'", next: "pop"},
                {defaultToken : "string.xml"}
            ]
        }, {
            token : "string.xml",
            regex : '"',
            push : [
                {token : "string.xml", regex: '"', next: "pop"},
                {defaultToken : "string.xml"}
            ]
        }],

        attributes: [{
            token : "entity.other.attribute-name.xml",
            regex : tagRegex
        }, {
            token : "keyword.operator.attribute-equals.xml",
            regex : "="
        }, {
            include: "tag_whitespace"
        }, {
            include: "attribute_value"
        }],

        attribute_value: [{
            token : "string.attribute-value.xml",
            regex : "'",
            push : [
                {token : "string.attribute-value.xml", regex: "'", next: "pop"},
                {include : "attr_reference"},
                {defaultToken : "string.attribute-value.xml"}
            ]
        }, {
            token : "string.attribute-value.xml",
            regex : '"',
            push : [
                {token : "string.attribute-value.xml", regex: '"', next: "pop"},
                {include : "attr_reference"},
                {defaultToken : "string.attribute-value.xml"}
            ]
        }]
    };

    if (this.constructor === XmlHighlightRules)
        this.normalizeRules();
};


(function() {

    this.embedTagRules = function(HighlightRules, prefix, tag){
        this.$rules.tag.unshift({
            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(<)(" + tag + "(?=\\s|>|$))",
            next: [
                {include : "attributes"},
                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : prefix + "start"}
            ]
        });

        this.$rules[tag + "-end"] = [
            {include : "attributes"},
            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>",  next: "start",
                onMatch : function(value, currentState, stack) {
                    stack.splice(0);
                    return this.token;
            }}
        ];

        this.embedRules(HighlightRules, prefix, [{
            token: ["meta.tag.punctuation.end-tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(</)(" + tag + "(?=\\s|>|$))",
            next: tag + "-end"
        }, {
            token: "string.cdata.xml",
            regex : "<\\!\\[CDATA\\["
        }, {
            token: "string.cdata.xml",
            regex : "\\]\\]>"
        }]);
    };

}).call(TextHighlightRules.prototype);

oop.inherits(XmlHighlightRules, TextHighlightRules);

exports.XmlHighlightRules = XmlHighlightRules;
});

ace.define("ace/mode/html_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/css_highlight_rules","ace/mode/javascript_highlight_rules","ace/mode/xml_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var CssHighlightRules = require("./css_highlight_rules").CssHighlightRules;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var XmlHighlightRules = require("./xml_highlight_rules").XmlHighlightRules;

var tagMap = lang.createMap({
    a           : 'anchor',
    button 	    : 'form',
    form        : 'form',
    img         : 'image',
    input       : 'form',
    label       : 'form',
    option      : 'form',
    script      : 'script',
    select      : 'form',
    textarea    : 'form',
    style       : 'style',
    table       : 'table',
    tbody       : 'table',
    td          : 'table',
    tfoot       : 'table',
    th          : 'table',
    tr          : 'table'
});

var HtmlHighlightRules = function() {
    XmlHighlightRules.call(this);

    this.addRules({
        attributes: [{
            include : "tag_whitespace"
        }, {
            token : "entity.other.attribute-name.xml",
            regex : "[-_a-zA-Z0-9:.]+"
        }, {
            token : "keyword.operator.attribute-equals.xml",
            regex : "=",
            push : [{
                include: "tag_whitespace"
            }, {
                token : "string.unquoted.attribute-value.html",
                regex : "[^<>='\"`\\s]+",
                next : "pop"
            }, {
                token : "empty",
                regex : "",
                next : "pop"
            }]
        }, {
            include : "attribute_value"
        }],
        tag: [{
            token : function(start, tag) {
                var group = tagMap[tag];
                return ["meta.tag.punctuation." + (start == "<" ? "" : "end-") + "tag-open.xml",
                    "meta.tag" + (group ? "." + group : "") + ".tag-name.xml"];
            },
            regex : "(</?)([-_a-zA-Z0-9:.]+)",
            next: "tag_stuff"
        }],
        tag_stuff: [
            {include : "attributes"},
            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
        ]
    });

    this.embedTagRules(CssHighlightRules, "css-", "style");
    this.embedTagRules(new JavaScriptHighlightRules({jsx: false}).getRules(), "js-", "script");

    if (this.constructor === HtmlHighlightRules)
        this.normalizeRules();
};

oop.inherits(HtmlHighlightRules, XmlHighlightRules);

exports.HtmlHighlightRules = HtmlHighlightRules;
});

ace.define("ace/mode/behaviour/xml",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;
var lang = require("../../lib/lang");

function is(token, type) {
    return token.type.lastIndexOf(type + ".xml") > -1;
}

var XmlBehaviour = function () {

    this.add("string_dquotes", "insertion", function (state, action, editor, session, text) {
        if (text == '"' || text == "'") {
            var quote = text;
            var selected = session.doc.getTextRange(editor.getSelectionRange());
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                return {
                    text: quote + selected + quote,
                    selection: false
                };
            }

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (rightChar == quote && (is(token, "attribute-value") || is(token, "string"))) {
                return {
                    text: "",
                    selection: [1, 1]
                };
            }

            if (!token)
                token = iterator.stepBackward();

            if (!token)
                return;

            while (is(token, "tag-whitespace") || is(token, "whitespace")) {
                token = iterator.stepBackward();
            }
            var rightSpace = !rightChar || rightChar.match(/\s/);
            if (is(token, "attribute-equals") && (rightSpace || rightChar == '>') || (is(token, "decl-attribute-equals") && (rightSpace || rightChar == '?'))) {
                return {
                    text: quote + quote,
                    selection: [1, 1]
                };
            }
        }
    });

    this.add("string_dquotes", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
        if (text == '>') {
            var position = editor.getSelectionRange().start;
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken() || iterator.stepBackward();
            if (!token || !(is(token, "tag-name") || is(token, "tag-whitespace") || is(token, "attribute-name") || is(token, "attribute-equals") || is(token, "attribute-value")))
                return;
            if (is(token, "reference.attribute-value"))
                return;
            if (is(token, "attribute-value")) {
                var firstChar = token.value.charAt(0);
                if (firstChar == '"' || firstChar == "'") {
                    var lastChar = token.value.charAt(token.value.length - 1);
                    var tokenEnd = iterator.getCurrentTokenColumn() + token.value.length;
                    if (tokenEnd > position.column || tokenEnd == position.column && firstChar != lastChar)
                        return;
                }
            }
            while (!is(token, "tag-name")) {
                token = iterator.stepBackward();
                if (token.value == "<") {
                    token = iterator.stepForward();
                    break;
                }
            }

            var tokenRow = iterator.getCurrentTokenRow();
            var tokenColumn = iterator.getCurrentTokenColumn();
            if (is(iterator.stepBackward(), "end-tag-open"))
                return;

            var element = token.value;
            if (tokenRow == position.row)
                element = element.substring(0, position.column - tokenColumn);

            if (this.voidElements.hasOwnProperty(element.toLowerCase()))
                 return;

            return {
               text: ">" + "</" + element + ">",
               selection: [1, 1]
            };
        }
    });

    this.add("autoindent", "insertion", function (state, action, editor, session, text) {
        if (text == "\n") {
            var cursor = editor.getCursorPosition();
            var line = session.getLine(cursor.row);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (token && token.type.indexOf("tag-close") !== -1) {
                if (token.value == "/>")
                    return;
                while (token && token.type.indexOf("tag-name") === -1) {
                    token = iterator.stepBackward();
                }

                if (!token) {
                    return;
                }

                var tag = token.value;
                var row = iterator.getCurrentTokenRow();
                token = iterator.stepBackward();
                if (!token || token.type.indexOf("end-tag") !== -1) {
                    return;
                }

                if (this.voidElements && !this.voidElements[tag]) {
                    var nextToken = session.getTokenAt(cursor.row, cursor.column+1);
                    var line = session.getLine(row);
                    var nextIndent = this.$getIndent(line);
                    var indent = nextIndent + session.getTabString();

                    if (nextToken && nextToken.value === "</") {
                        return {
                            text: "\n" + indent + "\n" + nextIndent,
                            selection: [1, indent.length, 1, indent.length]
                        };
                    } else {
                        return {
                            text: "\n" + indent
                        };
                    }
                }
            }
        }
    });

};

oop.inherits(XmlBehaviour, Behaviour);

exports.XmlBehaviour = XmlBehaviour;
});

ace.define("ace/mode/folding/mixed",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(defaultMode, subModes) {
    this.defaultMode = defaultMode;
    this.subModes = subModes;
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {


    this.$getMode = function(state) {
        if (typeof state != "string") 
            state = state[0];
        for (var key in this.subModes) {
            if (state.indexOf(key) === 0)
                return this.subModes[key];
        }
        return null;
    };
    
    this.$tryMode = function(state, session, foldStyle, row) {
        var mode = this.$getMode(state);
        return (mode ? mode.getFoldWidget(session, foldStyle, row) : "");
    };

    this.getFoldWidget = function(session, foldStyle, row) {
        return (
            this.$tryMode(session.getState(row-1), session, foldStyle, row) ||
            this.$tryMode(session.getState(row), session, foldStyle, row) ||
            this.defaultMode.getFoldWidget(session, foldStyle, row)
        );
    };

    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var mode = this.$getMode(session.getState(row-1));
        
        if (!mode || !mode.getFoldWidget(session, foldStyle, row))
            mode = this.$getMode(session.getState(row));
        
        if (!mode || !mode.getFoldWidget(session, foldStyle, row))
            mode = this.defaultMode;
        
        return mode.getFoldWidgetRange(session, foldStyle, row);
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/folding/xml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/range","ace/mode/folding/fold_mode","ace/token_iterator"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var lang = require("../../lib/lang");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;
var TokenIterator = require("../../token_iterator").TokenIterator;

var FoldMode = exports.FoldMode = function(voidElements, optionalEndTags) {
    BaseFoldMode.call(this);
    this.voidElements = voidElements || {};
    this.optionalEndTags = oop.mixin({}, this.voidElements);
    if (optionalEndTags)
        oop.mixin(this.optionalEndTags, optionalEndTags);
    
};
oop.inherits(FoldMode, BaseFoldMode);

var Tag = function() {
    this.tagName = "";
    this.closing = false;
    this.selfClosing = false;
    this.start = {row: 0, column: 0};
    this.end = {row: 0, column: 0};
};

function is(token, type) {
    return token.type.lastIndexOf(type + ".xml") > -1;
}

(function() {

    this.getFoldWidget = function(session, foldStyle, row) {
        var tag = this._getFirstTagInLine(session, row);

        if (!tag)
            return this.getCommentFoldWidget(session, row);

        if (tag.closing || (!tag.tagName && tag.selfClosing))
            return foldStyle == "markbeginend" ? "end" : "";

        if (!tag.tagName || tag.selfClosing || this.voidElements.hasOwnProperty(tag.tagName.toLowerCase()))
            return "";

        if (this._findEndTagInLine(session, row, tag.tagName, tag.end.column))
            return "";

        return "start";
    };
    
    this.getCommentFoldWidget = function(session, row) {
        if (/comment/.test(session.getState(row)) && /<!-/.test(session.getLine(row)))
            return "start";
        return "";
    };
    this._getFirstTagInLine = function(session, row) {
        var tokens = session.getTokens(row);
        var tag = new Tag();

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (is(token, "tag-open")) {
                tag.end.column = tag.start.column + token.value.length;
                tag.closing = is(token, "end-tag-open");
                token = tokens[++i];
                if (!token)
                    return null;
                tag.tagName = token.value;
                tag.end.column += token.value.length;
                for (i++; i < tokens.length; i++) {
                    token = tokens[i];
                    tag.end.column += token.value.length;
                    if (is(token, "tag-close")) {
                        tag.selfClosing = token.value == '/>';
                        break;
                    }
                }
                return tag;
            } else if (is(token, "tag-close")) {
                tag.selfClosing = token.value == '/>';
                return tag;
            }
            tag.start.column += token.value.length;
        }

        return null;
    };

    this._findEndTagInLine = function(session, row, tagName, startColumn) {
        var tokens = session.getTokens(row);
        var column = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            column += token.value.length;
            if (column < startColumn)
                continue;
            if (is(token, "end-tag-open")) {
                token = tokens[i + 1];
                if (token && token.value == tagName)
                    return true;
            }
        }
        return false;
    };
    this._readTagForward = function(iterator) {
        var token = iterator.getCurrentToken();
        if (!token)
            return null;

        var tag = new Tag();
        do {
            if (is(token, "tag-open")) {
                tag.closing = is(token, "end-tag-open");
                tag.start.row = iterator.getCurrentTokenRow();
                tag.start.column = iterator.getCurrentTokenColumn();
            } else if (is(token, "tag-name")) {
                tag.tagName = token.value;
            } else if (is(token, "tag-close")) {
                tag.selfClosing = token.value == "/>";
                tag.end.row = iterator.getCurrentTokenRow();
                tag.end.column = iterator.getCurrentTokenColumn() + token.value.length;
                iterator.stepForward();
                return tag;
            }
        } while(token = iterator.stepForward());

        return null;
    };
    
    this._readTagBackward = function(iterator) {
        var token = iterator.getCurrentToken();
        if (!token)
            return null;

        var tag = new Tag();
        do {
            if (is(token, "tag-open")) {
                tag.closing = is(token, "end-tag-open");
                tag.start.row = iterator.getCurrentTokenRow();
                tag.start.column = iterator.getCurrentTokenColumn();
                iterator.stepBackward();
                return tag;
            } else if (is(token, "tag-name")) {
                tag.tagName = token.value;
            } else if (is(token, "tag-close")) {
                tag.selfClosing = token.value == "/>";
                tag.end.row = iterator.getCurrentTokenRow();
                tag.end.column = iterator.getCurrentTokenColumn() + token.value.length;
            }
        } while(token = iterator.stepBackward());

        return null;
    };
    
    this._pop = function(stack, tag) {
        while (stack.length) {
            
            var top = stack[stack.length-1];
            if (!tag || top.tagName == tag.tagName) {
                return stack.pop();
            }
            else if (this.optionalEndTags.hasOwnProperty(top.tagName)) {
                stack.pop();
                continue;
            } else {
                return null;
            }
        }
    };
    
    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var firstTag = this._getFirstTagInLine(session, row);
        
        if (!firstTag) {
            return this.getCommentFoldWidget(session, row)
                && session.getCommentFoldRange(row, session.getLine(row).length);
        }
        
        var isBackward = firstTag.closing || firstTag.selfClosing;
        var stack = [];
        var tag;
        
        if (!isBackward) {
            var iterator = new TokenIterator(session, row, firstTag.start.column);
            var start = {
                row: row,
                column: firstTag.start.column + firstTag.tagName.length + 2
            };
            if (firstTag.start.row == firstTag.end.row)
                start.column = firstTag.end.column;
            while (tag = this._readTagForward(iterator)) {
                if (tag.selfClosing) {
                    if (!stack.length) {
                        tag.start.column += tag.tagName.length + 2;
                        tag.end.column -= 2;
                        return Range.fromPoints(tag.start, tag.end);
                    } else
                        continue;
                }
                
                if (tag.closing) {
                    this._pop(stack, tag);
                    if (stack.length == 0)
                        return Range.fromPoints(start, tag.start);
                }
                else {
                    stack.push(tag);
                }
            }
        }
        else {
            var iterator = new TokenIterator(session, row, firstTag.end.column);
            var end = {
                row: row,
                column: firstTag.start.column
            };
            
            while (tag = this._readTagBackward(iterator)) {
                if (tag.selfClosing) {
                    if (!stack.length) {
                        tag.start.column += tag.tagName.length + 2;
                        tag.end.column -= 2;
                        return Range.fromPoints(tag.start, tag.end);
                    } else
                        continue;
                }
                
                if (!tag.closing) {
                    this._pop(stack, tag);
                    if (stack.length == 0) {
                        tag.start.column += tag.tagName.length + 2;
                        if (tag.start.row == tag.end.row && tag.start.column < tag.end.column)
                            tag.start.column = tag.end.column;
                        return Range.fromPoints(tag.start, end);
                    }
                }
                else {
                    stack.push(tag);
                }
            }
        }
        
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/folding/html",["require","exports","module","ace/lib/oop","ace/mode/folding/mixed","ace/mode/folding/xml","ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var MixedFoldMode = require("./mixed").FoldMode;
var XmlFoldMode = require("./xml").FoldMode;
var CStyleFoldMode = require("./cstyle").FoldMode;

var FoldMode = exports.FoldMode = function(voidElements, optionalTags) {
    MixedFoldMode.call(this, new XmlFoldMode(voidElements, optionalTags), {
        "js-": new CStyleFoldMode(),
        "css-": new CStyleFoldMode()
    });
};

oop.inherits(FoldMode, MixedFoldMode);

});

ace.define("ace/mode/html_completions",["require","exports","module","ace/token_iterator"], function(require, exports, module) {
"use strict";

var TokenIterator = require("../token_iterator").TokenIterator;

var commonAttributes = [
    "accesskey",
    "class",
    "contenteditable",
    "contextmenu",
    "dir",
    "draggable",
    "dropzone",
    "hidden",
    "id",
    "inert",
    "itemid",
    "itemprop",
    "itemref",
    "itemscope",
    "itemtype",
    "lang",
    "spellcheck",
    "style",
    "tabindex",
    "title",
    "translate"
];

var eventAttributes = [
    "onabort",
    "onblur",
    "oncancel",
    "oncanplay",
    "oncanplaythrough",
    "onchange",
    "onclick",
    "onclose",
    "oncontextmenu",
    "oncuechange",
    "ondblclick",
    "ondrag",
    "ondragend",
    "ondragenter",
    "ondragleave",
    "ondragover",
    "ondragstart",
    "ondrop",
    "ondurationchange",
    "onemptied",
    "onended",
    "onerror",
    "onfocus",
    "oninput",
    "oninvalid",
    "onkeydown",
    "onkeypress",
    "onkeyup",
    "onload",
    "onloadeddata",
    "onloadedmetadata",
    "onloadstart",
    "onmousedown",
    "onmousemove",
    "onmouseout",
    "onmouseover",
    "onmouseup",
    "onmousewheel",
    "onpause",
    "onplay",
    "onplaying",
    "onprogress",
    "onratechange",
    "onreset",
    "onscroll",
    "onseeked",
    "onseeking",
    "onselect",
    "onshow",
    "onstalled",
    "onsubmit",
    "onsuspend",
    "ontimeupdate",
    "onvolumechange",
    "onwaiting"
];

var globalAttributes = commonAttributes.concat(eventAttributes);

var attributeMap = {
    "html": {"manifest": 1},
    "head": {},
    "title": {},
    "base": {"href": 1, "target": 1},
    "link": {"href": 1, "hreflang": 1, "rel": {"stylesheet": 1, "icon": 1}, "media": {"all": 1, "screen": 1, "print": 1}, "type": {"text/css": 1, "image/png": 1, "image/jpeg": 1, "image/gif": 1}, "sizes": 1},
    "meta": {"http-equiv": {"content-type": 1}, "name": {"description": 1, "keywords": 1}, "content": {"text/html; charset=UTF-8": 1}, "charset": 1},
    "style": {"type": 1, "media": {"all": 1, "screen": 1, "print": 1}, "scoped": 1},
    "script": {"charset": 1, "type": {"text/javascript": 1}, "src": 1, "defer": 1, "async": 1},
    "noscript": {"href": 1},
    "body": {"onafterprint": 1, "onbeforeprint": 1, "onbeforeunload": 1, "onhashchange": 1, "onmessage": 1, "onoffline": 1, "onpopstate": 1, "onredo": 1, "onresize": 1, "onstorage": 1, "onundo": 1, "onunload": 1},
    "section": {},
    "nav": {},
    "article": {"pubdate": 1},
    "aside": {},
    "h1": {},
    "h2": {},
    "h3": {},
    "h4": {},
    "h5": {},
    "h6": {},
    "header": {},
    "footer": {},
    "address": {},
    "main": {},
    "p": {},
    "hr": {},
    "pre": {},
    "blockquote": {"cite": 1},
    "ol": {"start": 1, "reversed": 1},
    "ul": {},
    "li": {"value": 1},
    "dl": {},
    "dt": {},
    "dd": {},
    "figure": {},
    "figcaption": {},
    "div": {},
    "a": {"href": 1, "target": {"_blank": 1, "top": 1}, "ping": 1, "rel": {"nofollow": 1, "alternate": 1, "author": 1, "bookmark": 1, "help": 1, "license": 1, "next": 1, "noreferrer": 1, "prefetch": 1, "prev": 1, "search": 1, "tag": 1}, "media": 1, "hreflang": 1, "type": 1},
    "em": {},
    "strong": {},
    "small": {},
    "s": {},
    "cite": {},
    "q": {"cite": 1},
    "dfn": {},
    "abbr": {},
    "data": {},
    "time": {"datetime": 1},
    "code": {},
    "var": {},
    "samp": {},
    "kbd": {},
    "sub": {},
    "sup": {},
    "i": {},
    "b": {},
    "u": {},
    "mark": {},
    "ruby": {},
    "rt": {},
    "rp": {},
    "bdi": {},
    "bdo": {},
    "span": {},
    "br": {},
    "wbr": {},
    "ins": {"cite": 1, "datetime": 1},
    "del": {"cite": 1, "datetime": 1},
    "img": {"alt": 1, "src": 1, "height": 1, "width": 1, "usemap": 1, "ismap": 1},
    "iframe": {"name": 1, "src": 1, "height": 1, "width": 1, "sandbox": {"allow-same-origin": 1, "allow-top-navigation": 1, "allow-forms": 1, "allow-scripts": 1}, "seamless": {"seamless": 1}},
    "embed": {"src": 1, "height": 1, "width": 1, "type": 1},
    "object": {"param": 1, "data": 1, "type": 1, "height" : 1, "width": 1, "usemap": 1, "name": 1, "form": 1, "classid": 1},
    "param": {"name": 1, "value": 1},
    "video": {"src": 1, "autobuffer": 1, "autoplay": {"autoplay": 1}, "loop": {"loop": 1}, "controls": {"controls": 1}, "width": 1, "height": 1, "poster": 1, "muted": {"muted": 1}, "preload": {"auto": 1, "metadata": 1, "none": 1}},
    "audio": {"src": 1, "autobuffer": 1, "autoplay": {"autoplay": 1}, "loop": {"loop": 1}, "controls": {"controls": 1}, "muted": {"muted": 1}, "preload": {"auto": 1, "metadata": 1, "none": 1 }},
    "source": {"src": 1, "type": 1, "media": 1},
    "track": {"kind": 1, "src": 1, "srclang": 1, "label": 1, "default": 1},
    "canvas": {"width": 1, "height": 1},
    "map": {"name": 1},
    "area": {"shape": 1, "coords": 1, "href": 1, "hreflang": 1, "alt": 1, "target": 1, "media": 1, "rel": 1, "ping": 1, "type": 1},
    "svg": {},
    "math": {},
    "table": {"summary": 1},
    "caption": {},
    "colgroup": {"span": 1},
    "col": {"span": 1},
    "tbody": {},
    "thead": {},
    "tfoot": {},
    "tr": {},
    "td": {"headers": 1, "rowspan": 1, "colspan": 1},
    "th": {"headers": 1, "rowspan": 1, "colspan": 1, "scope": 1},
    "form": {"accept-charset": 1, "action": 1, "autocomplete": 1, "enctype": {"multipart/form-data": 1, "application/x-www-form-urlencoded": 1}, "method": {"get": 1, "post": 1}, "name": 1, "novalidate": 1, "target": {"_blank": 1, "top": 1}},
    "fieldset": {"disabled": 1, "form": 1, "name": 1},
    "legend": {},
    "label": {"form": 1, "for": 1},
    "input": {
        "type": {"text": 1, "password": 1, "hidden": 1, "checkbox": 1, "submit": 1, "radio": 1, "file": 1, "button": 1, "reset": 1, "image": 31, "color": 1, "date": 1, "datetime": 1, "datetime-local": 1, "email": 1, "month": 1, "number": 1, "range": 1, "search": 1, "tel": 1, "time": 1, "url": 1, "week": 1},
        "accept": 1, "alt": 1, "autocomplete": {"on": 1, "off": 1}, "autofocus": {"autofocus": 1}, "checked": {"checked": 1}, "disabled": {"disabled": 1}, "form": 1, "formaction": 1, "formenctype": {"application/x-www-form-urlencoded": 1, "multipart/form-data": 1, "text/plain": 1}, "formmethod": {"get": 1, "post": 1}, "formnovalidate": {"formnovalidate": 1}, "formtarget": {"_blank": 1, "_self": 1, "_parent": 1, "_top": 1}, "height": 1, "list": 1, "max": 1, "maxlength": 1, "min": 1, "multiple": {"multiple": 1}, "name": 1, "pattern": 1, "placeholder": 1, "readonly": {"readonly": 1}, "required": {"required": 1}, "size": 1, "src": 1, "step": 1, "width": 1, "files": 1, "value": 1},
    "button": {"autofocus": 1, "disabled": {"disabled": 1}, "form": 1, "formaction": 1, "formenctype": 1, "formmethod": 1, "formnovalidate": 1, "formtarget": 1, "name": 1, "value": 1, "type": {"button": 1, "submit": 1}},
    "select": {"autofocus": 1, "disabled": 1, "form": 1, "multiple": {"multiple": 1}, "name": 1, "size": 1, "readonly":{"readonly": 1}},
    "datalist": {},
    "optgroup": {"disabled": 1, "label": 1},
    "option": {"disabled": 1, "selected": 1, "label": 1, "value": 1},
    "textarea": {"autofocus": {"autofocus": 1}, "disabled": {"disabled": 1}, "form": 1, "maxlength": 1, "name": 1, "placeholder": 1, "readonly": {"readonly": 1}, "required": {"required": 1}, "rows": 1, "cols": 1, "wrap": {"on": 1, "off": 1, "hard": 1, "soft": 1}},
    "keygen": {"autofocus": 1, "challenge": {"challenge": 1}, "disabled": {"disabled": 1}, "form": 1, "keytype": {"rsa": 1, "dsa": 1, "ec": 1}, "name": 1},
    "output": {"for": 1, "form": 1, "name": 1},
    "progress": {"value": 1, "max": 1},
    "meter": {"value": 1, "min": 1, "max": 1, "low": 1, "high": 1, "optimum": 1},
    "details": {"open": 1},
    "summary": {},
    "command": {"type": 1, "label": 1, "icon": 1, "disabled": 1, "checked": 1, "radiogroup": 1, "command": 1},
    "menu": {"type": 1, "label": 1},
    "dialog": {"open": 1}
};

var elements = Object.keys(attributeMap);

function is(token, type) {
    return token.type.lastIndexOf(type + ".xml") > -1;
}

function findTagName(session, pos) {
    var iterator = new TokenIterator(session, pos.row, pos.column);
    var token = iterator.getCurrentToken();
    while (token && !is(token, "tag-name")){
        token = iterator.stepBackward();
    }
    if (token)
        return token.value;
}

function findAttributeName(session, pos) {
    var iterator = new TokenIterator(session, pos.row, pos.column);
    var token = iterator.getCurrentToken();
    while (token && !is(token, "attribute-name")){
        token = iterator.stepBackward();
    }
    if (token)
        return token.value;
}

var HtmlCompletions = function() {

};

(function() {

    this.getCompletions = function(state, session, pos, prefix) {
        var token = session.getTokenAt(pos.row, pos.column);

        if (!token)
            return [];
        if (is(token, "tag-name") || is(token, "tag-open") || is(token, "end-tag-open"))
            return this.getTagCompletions(state, session, pos, prefix);
        if (is(token, "tag-whitespace") || is(token, "attribute-name"))
            return this.getAttributeCompletions(state, session, pos, prefix);
        if (is(token, "attribute-value"))
            return this.getAttributeValueCompletions(state, session, pos, prefix);
        var line = session.getLine(pos.row).substr(0, pos.column);
        if (/&[a-z]*$/i.test(line))
            return this.getHTMLEntityCompletions(state, session, pos, prefix);

        return [];
    };

    this.getTagCompletions = function(state, session, pos, prefix) {
        return elements.map(function(element){
            return {
                value: element,
                meta: "tag",
                score: Number.MAX_VALUE
            };
        });
    };

    this.getAttributeCompletions = function(state, session, pos, prefix) {
        var tagName = findTagName(session, pos);
        if (!tagName)
            return [];
        var attributes = globalAttributes;
        if (tagName in attributeMap) {
            attributes = attributes.concat(Object.keys(attributeMap[tagName]));
        }
        return attributes.map(function(attribute){
            return {
                caption: attribute,
                snippet: attribute + '="$0"',
                meta: "attribute",
                score: Number.MAX_VALUE
            };
        });
    };

    this.getAttributeValueCompletions = function(state, session, pos, prefix) {
        var tagName = findTagName(session, pos);
        var attributeName = findAttributeName(session, pos);
        
        if (!tagName)
            return [];
        var values = [];
        if (tagName in attributeMap && attributeName in attributeMap[tagName] && typeof attributeMap[tagName][attributeName] === "object") {
            values = Object.keys(attributeMap[tagName][attributeName]);
        }
        return values.map(function(value){
            return {
                caption: value,
                snippet: value,
                meta: "attribute value",
                score: Number.MAX_VALUE
            };
        });
    };

    this.getHTMLEntityCompletions = function(state, session, pos, prefix) {
        var values = ['Aacute;', 'aacute;', 'Acirc;', 'acirc;', 'acute;', 'AElig;', 'aelig;', 'Agrave;', 'agrave;', 'alefsym;', 'Alpha;', 'alpha;', 'amp;', 'and;', 'ang;', 'Aring;', 'aring;', 'asymp;', 'Atilde;', 'atilde;', 'Auml;', 'auml;', 'bdquo;', 'Beta;', 'beta;', 'brvbar;', 'bull;', 'cap;', 'Ccedil;', 'ccedil;', 'cedil;', 'cent;', 'Chi;', 'chi;', 'circ;', 'clubs;', 'cong;', 'copy;', 'crarr;', 'cup;', 'curren;', 'Dagger;', 'dagger;', 'dArr;', 'darr;', 'deg;', 'Delta;', 'delta;', 'diams;', 'divide;', 'Eacute;', 'eacute;', 'Ecirc;', 'ecirc;', 'Egrave;', 'egrave;', 'empty;', 'emsp;', 'ensp;', 'Epsilon;', 'epsilon;', 'equiv;', 'Eta;', 'eta;', 'ETH;', 'eth;', 'Euml;', 'euml;', 'euro;', 'exist;', 'fnof;', 'forall;', 'frac12;', 'frac14;', 'frac34;', 'frasl;', 'Gamma;', 'gamma;', 'ge;', 'gt;', 'hArr;', 'harr;', 'hearts;', 'hellip;', 'Iacute;', 'iacute;', 'Icirc;', 'icirc;', 'iexcl;', 'Igrave;', 'igrave;', 'image;', 'infin;', 'int;', 'Iota;', 'iota;', 'iquest;', 'isin;', 'Iuml;', 'iuml;', 'Kappa;', 'kappa;', 'Lambda;', 'lambda;', 'lang;', 'laquo;', 'lArr;', 'larr;', 'lceil;', 'ldquo;', 'le;', 'lfloor;', 'lowast;', 'loz;', 'lrm;', 'lsaquo;', 'lsquo;', 'lt;', 'macr;', 'mdash;', 'micro;', 'middot;', 'minus;', 'Mu;', 'mu;', 'nabla;', 'nbsp;', 'ndash;', 'ne;', 'ni;', 'not;', 'notin;', 'nsub;', 'Ntilde;', 'ntilde;', 'Nu;', 'nu;', 'Oacute;', 'oacute;', 'Ocirc;', 'ocirc;', 'OElig;', 'oelig;', 'Ograve;', 'ograve;', 'oline;', 'Omega;', 'omega;', 'Omicron;', 'omicron;', 'oplus;', 'or;', 'ordf;', 'ordm;', 'Oslash;', 'oslash;', 'Otilde;', 'otilde;', 'otimes;', 'Ouml;', 'ouml;', 'para;', 'part;', 'permil;', 'perp;', 'Phi;', 'phi;', 'Pi;', 'pi;', 'piv;', 'plusmn;', 'pound;', 'Prime;', 'prime;', 'prod;', 'prop;', 'Psi;', 'psi;', 'quot;', 'radic;', 'rang;', 'raquo;', 'rArr;', 'rarr;', 'rceil;', 'rdquo;', 'real;', 'reg;', 'rfloor;', 'Rho;', 'rho;', 'rlm;', 'rsaquo;', 'rsquo;', 'sbquo;', 'Scaron;', 'scaron;', 'sdot;', 'sect;', 'shy;', 'Sigma;', 'sigma;', 'sigmaf;', 'sim;', 'spades;', 'sub;', 'sube;', 'sum;', 'sup;', 'sup1;', 'sup2;', 'sup3;', 'supe;', 'szlig;', 'Tau;', 'tau;', 'there4;', 'Theta;', 'theta;', 'thetasym;', 'thinsp;', 'THORN;', 'thorn;', 'tilde;', 'times;', 'trade;', 'Uacute;', 'uacute;', 'uArr;', 'uarr;', 'Ucirc;', 'ucirc;', 'Ugrave;', 'ugrave;', 'uml;', 'upsih;', 'Upsilon;', 'upsilon;', 'Uuml;', 'uuml;', 'weierp;', 'Xi;', 'xi;', 'Yacute;', 'yacute;', 'yen;', 'Yuml;', 'yuml;', 'Zeta;', 'zeta;', 'zwj;', 'zwnj;'];

        return values.map(function(value){
            return {
                caption: value,
                snippet: value,
                meta: "html entity",
                score: Number.MAX_VALUE
            };
        });
    };

}).call(HtmlCompletions.prototype);

exports.HtmlCompletions = HtmlCompletions;
});

ace.define("ace/mode/html",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text","ace/mode/javascript","ace/mode/css","ace/mode/html_highlight_rules","ace/mode/behaviour/xml","ace/mode/folding/html","ace/mode/html_completions","ace/worker/worker_client"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextMode = require("./text").Mode;
var JavaScriptMode = require("./javascript").Mode;
var CssMode = require("./css").Mode;
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var XmlBehaviour = require("./behaviour/xml").XmlBehaviour;
var HtmlFoldMode = require("./folding/html").FoldMode;
var HtmlCompletions = require("./html_completions").HtmlCompletions;
var WorkerClient = require("../worker/worker_client").WorkerClient;
var voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "menuitem", "param", "source", "track", "wbr"];
var optionalEndTags = ["li", "dt", "dd", "p", "rt", "rp", "optgroup", "option", "colgroup", "td", "th"];

var Mode = function(options) {
    this.fragmentContext = options && options.fragmentContext;
    this.HighlightRules = HtmlHighlightRules;
    this.$behaviour = new XmlBehaviour();
    this.$completer = new HtmlCompletions();
    
    this.createModeDelegates({
        "js-": JavaScriptMode,
        "css-": CssMode
    });
    
    this.foldingRules = new HtmlFoldMode(this.voidElements, lang.arrayToMap(optionalEndTags));
};
oop.inherits(Mode, TextMode);

(function() {

    this.blockComment = {start: "<!--", end: "-->"};

    this.voidElements = lang.arrayToMap(voidElements);

    this.getNextLineIndent = function(state, line, tab) {
        return this.$getIndent(line);
    };

    this.checkOutdent = function(state, line, input) {
        return false;
    };

    this.getCompletions = function(state, session, pos, prefix) {
        return this.$completer.getCompletions(state, session, pos, prefix);
    };

    this.createWorker = function(session) {
        if (this.constructor != Mode)
            return;
        var worker = new WorkerClient(["ace"], "ace/mode/html_worker", "Worker");
        worker.attachToDocument(session.getDocument());

        if (this.fragmentContext)
            worker.call("setOptions", [{context: this.fragmentContext}]);

        worker.on("error", function(e) {
            session.setAnnotations(e.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };

    this.$id = "ace/mode/html";
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define("ace/mode/tex_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var TexHighlightRules = function(textClass) {

    if (!textClass)
        textClass = "text";

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "%.*$"
            }, {
                token : textClass, // non-command
                regex : "\\\\[$&%#\\{\\}]"
            }, {
                token : "keyword", // command
                regex : "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b",
               next : "nospell"
            }, {
                token : "keyword", // command
                regex : "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])"
            }, {
               token : "paren.keyword.operator",
                regex : "[[({]"
            }, {
               token : "paren.keyword.operator",
                regex : "[\\])}]"
            }, {
                token : textClass,
                regex : "\\s+"
            }
        ],
        "nospell" : [
           {
               token : "comment",
               regex : "%.*$",
               next : "start"
           }, {
               token : "nospell." + textClass, // non-command
               regex : "\\\\[$&%#\\{\\}]"
           }, {
               token : "keyword", // command
               regex : "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b"
           }, {
               token : "keyword", // command
               regex : "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])",
               next : "start"
           }, {
               token : "paren.keyword.operator",
               regex : "[[({]"
           }, {
               token : "paren.keyword.operator",
               regex : "[\\])]"
           }, {
               token : "paren.keyword.operator",
               regex : "}",
               next : "start"
           }, {
               token : "nospell." + textClass,
               regex : "\\s+"
           }, {
               token : "nospell." + textClass,
               regex : "\\w+"
           }
        ]
    };
};

oop.inherits(TexHighlightRules, TextHighlightRules);

exports.TexHighlightRules = TexHighlightRules;
});

ace.define("ace/mode/java_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var JavaHighlightRules = function() {
    var keywords = (
    "abstract|continue|for|new|switch|" +
    "assert|default|goto|package|synchronized|" +
    "boolean|do|if|private|this|" +
    "break|double|implements|protected|throw|" +
    "byte|else|import|public|throws|" +
    "case|enum|instanceof|return|transient|" +
    "catch|extends|int|short|try|" +
    "char|final|interface|static|void|" +
    "class|finally|long|strictfp|volatile|" +
    "const|float|native|super|while"
    );

    var buildinConstants = ("null|Infinity|NaN|undefined");


    var langClasses = (
        "AbstractMethodError|AssertionError|ClassCircularityError|"+
        "ClassFormatError|Deprecated|EnumConstantNotPresentException|"+
        "ExceptionInInitializerError|IllegalAccessError|"+
        "IllegalThreadStateException|InstantiationError|InternalError|"+
        "NegativeArraySizeException|NoSuchFieldError|Override|Process|"+
        "ProcessBuilder|SecurityManager|StringIndexOutOfBoundsException|"+
        "SuppressWarnings|TypeNotPresentException|UnknownError|"+
        "UnsatisfiedLinkError|UnsupportedClassVersionError|VerifyError|"+
        "InstantiationException|IndexOutOfBoundsException|"+
        "ArrayIndexOutOfBoundsException|CloneNotSupportedException|"+
        "NoSuchFieldException|IllegalArgumentException|NumberFormatException|"+
        "SecurityException|Void|InheritableThreadLocal|IllegalStateException|"+
        "InterruptedException|NoSuchMethodException|IllegalAccessException|"+
        "UnsupportedOperationException|Enum|StrictMath|Package|Compiler|"+
        "Readable|Runtime|StringBuilder|Math|IncompatibleClassChangeError|"+
        "NoSuchMethodError|ThreadLocal|RuntimePermission|ArithmeticException|"+
        "NullPointerException|Long|Integer|Short|Byte|Double|Number|Float|"+
        "Character|Boolean|StackTraceElement|Appendable|StringBuffer|"+
        "Iterable|ThreadGroup|Runnable|Thread|IllegalMonitorStateException|"+
        "StackOverflowError|OutOfMemoryError|VirtualMachineError|"+
        "ArrayStoreException|ClassCastException|LinkageError|"+
        "NoClassDefFoundError|ClassNotFoundException|RuntimeException|"+
        "Exception|ThreadDeath|Error|Throwable|System|ClassLoader|"+
        "Cloneable|Class|CharSequence|Comparable|String|Object"
    );

    var keywordMapper = this.createKeywordMapper({
        "variable.language": "this",
        "keyword": keywords,
        "constant.language": buildinConstants,
        "support.function": langClasses
    }, "identifier");

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "\\/\\/.*$"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            }, {
                token : "string", // single line
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "constant.numeric", // hex
                regex : /0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*)[LlSsDdFfYy]?\b/
            }, {
                token : "constant.numeric", // float
                regex : /[+-]?\d[\d_]*(?:(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?)?[LlSsDdFfYy]?\b/
            }, {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "lparen",
                regex : "[[({]"
            }, {
                token : "rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
};

oop.inherits(JavaHighlightRules, TextHighlightRules);

exports.JavaHighlightRules = JavaHighlightRules;
});

ace.define("ace/mode/php_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules","ace/mode/html_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;

var PhpLangHighlightRules = function() {
    var docComment = DocCommentHighlightRules;
    var builtinFunctions = lang.arrayToMap(
        ('abs|acos|acosh|addcslashes|addslashes|aggregate|aggregate_info|aggregate_methods|aggregate_methods_by_list|aggregate_methods_by_regexp|' +
        'aggregate_properties|aggregate_properties_by_list|aggregate_properties_by_regexp|aggregation_info|amqpconnection|amqpexchange|amqpqueue|' +
        'apache_child_terminate|apache_get_modules|apache_get_version|apache_getenv|apache_lookup_uri|apache_note|apache_request_headers|' +
        'apache_reset_timeout|apache_response_headers|apache_setenv|apc_add|apc_bin_dump|apc_bin_dumpfile|apc_bin_load|apc_bin_loadfile|' +
        'apc_cache_info|apc_cas|apc_clear_cache|apc_compile_file|apc_dec|apc_define_constants|apc_delete|apc_delete_file|apc_exists|apc_fetch|' +
        'apc_inc|apc_load_constants|apc_sma_info|apc_store|apciterator|apd_breakpoint|apd_callstack|apd_clunk|apd_continue|apd_croak|' +
        'apd_dump_function_table|apd_dump_persistent_resources|apd_dump_regular_resources|apd_echo|apd_get_active_symbols|apd_set_pprof_trace|' +
        'apd_set_session|apd_set_session_trace|apd_set_session_trace_socket|appenditerator|array|array_change_key_case|array_chunk|array_combine|' +
        'array_count_values|array_diff|array_diff_assoc|array_diff_key|array_diff_uassoc|array_diff_ukey|array_fill|array_fill_keys|array_filter|' +
        'array_flip|array_intersect|array_intersect_assoc|array_intersect_key|array_intersect_uassoc|array_intersect_ukey|array_key_exists|' +
        'array_keys|array_map|array_merge|array_merge_recursive|array_multisort|array_pad|array_pop|array_product|array_push|array_rand|' +
        'array_reduce|array_replace|array_replace_recursive|array_reverse|array_search|array_shift|array_slice|array_splice|array_sum|array_udiff|' +
        'array_udiff_assoc|array_udiff_uassoc|array_uintersect|array_uintersect_assoc|array_uintersect_uassoc|array_unique|array_unshift|' +
        'array_values|array_walk|array_walk_recursive|arrayaccess|arrayiterator|arrayobject|arsort|asin|asinh|asort|assert|assert_options|atan|' +
        'atan2|atanh|audioproperties|badfunctioncallexception|badmethodcallexception|base64_decode|base64_encode|base_convert|basename|' +
        'bbcode_add_element|bbcode_add_smiley|bbcode_create|bbcode_destroy|bbcode_parse|bbcode_set_arg_parser|bbcode_set_flags|bcadd|bccomp|bcdiv|' +
        'bcmod|bcmul|bcompiler_load|bcompiler_load_exe|bcompiler_parse_class|bcompiler_read|bcompiler_write_class|bcompiler_write_constant|' +
        'bcompiler_write_exe_footer|bcompiler_write_file|bcompiler_write_footer|bcompiler_write_function|bcompiler_write_functions_from_file|' +
        'bcompiler_write_header|bcompiler_write_included_filename|bcpow|bcpowmod|bcscale|bcsqrt|bcsub|bin2hex|bind_textdomain_codeset|bindec|' +
        'bindtextdomain|bson_decode|bson_encode|bumpValue|bzclose|bzcompress|bzdecompress|bzerrno|bzerror|bzerrstr|bzflush|bzopen|bzread|bzwrite|' +
        'cachingiterator|cairo|cairo_create|cairo_font_face_get_type|cairo_font_face_status|cairo_font_options_create|cairo_font_options_equal|' +
        'cairo_font_options_get_antialias|cairo_font_options_get_hint_metrics|cairo_font_options_get_hint_style|' +
        'cairo_font_options_get_subpixel_order|cairo_font_options_hash|cairo_font_options_merge|cairo_font_options_set_antialias|' +
        'cairo_font_options_set_hint_metrics|cairo_font_options_set_hint_style|cairo_font_options_set_subpixel_order|cairo_font_options_status|' +
        'cairo_format_stride_for_width|cairo_image_surface_create|cairo_image_surface_create_for_data|cairo_image_surface_create_from_png|' +
        'cairo_image_surface_get_data|cairo_image_surface_get_format|cairo_image_surface_get_height|cairo_image_surface_get_stride|' +
        'cairo_image_surface_get_width|cairo_matrix_create_scale|cairo_matrix_create_translate|cairo_matrix_invert|cairo_matrix_multiply|' +
        'cairo_matrix_rotate|cairo_matrix_transform_distance|cairo_matrix_transform_point|cairo_matrix_translate|cairo_pattern_add_color_stop_rgb|' +
        'cairo_pattern_add_color_stop_rgba|cairo_pattern_create_for_surface|cairo_pattern_create_linear|cairo_pattern_create_radial|' +
        'cairo_pattern_create_rgb|cairo_pattern_create_rgba|cairo_pattern_get_color_stop_count|cairo_pattern_get_color_stop_rgba|' +
        'cairo_pattern_get_extend|cairo_pattern_get_filter|cairo_pattern_get_linear_points|cairo_pattern_get_matrix|' +
        'cairo_pattern_get_radial_circles|cairo_pattern_get_rgba|cairo_pattern_get_surface|cairo_pattern_get_type|cairo_pattern_set_extend|' +
        'cairo_pattern_set_filter|cairo_pattern_set_matrix|cairo_pattern_status|cairo_pdf_surface_create|cairo_pdf_surface_set_size|' +
        'cairo_ps_get_levels|cairo_ps_level_to_string|cairo_ps_surface_create|cairo_ps_surface_dsc_begin_page_setup|' +
        'cairo_ps_surface_dsc_begin_setup|cairo_ps_surface_dsc_comment|cairo_ps_surface_get_eps|cairo_ps_surface_restrict_to_level|' +
        'cairo_ps_surface_set_eps|cairo_ps_surface_set_size|cairo_scaled_font_create|cairo_scaled_font_extents|cairo_scaled_font_get_ctm|' +
        'cairo_scaled_font_get_font_face|cairo_scaled_font_get_font_matrix|cairo_scaled_font_get_font_options|cairo_scaled_font_get_scale_matrix|' +
        'cairo_scaled_font_get_type|cairo_scaled_font_glyph_extents|cairo_scaled_font_status|cairo_scaled_font_text_extents|' +
        'cairo_surface_copy_page|cairo_surface_create_similar|cairo_surface_finish|cairo_surface_flush|cairo_surface_get_content|' +
        'cairo_surface_get_device_offset|cairo_surface_get_font_options|cairo_surface_get_type|cairo_surface_mark_dirty|' +
        'cairo_surface_mark_dirty_rectangle|cairo_surface_set_device_offset|cairo_surface_set_fallback_resolution|cairo_surface_show_page|' +
        'cairo_surface_status|cairo_surface_write_to_png|cairo_svg_surface_create|cairo_svg_surface_restrict_to_version|' +
        'cairo_svg_version_to_string|cairoantialias|cairocontent|cairocontext|cairoexception|cairoextend|cairofillrule|cairofilter|cairofontface|' +
        'cairofontoptions|cairofontslant|cairofonttype|cairofontweight|cairoformat|cairogradientpattern|cairohintmetrics|cairohintstyle|' +
        'cairoimagesurface|cairolineargradient|cairolinecap|cairolinejoin|cairomatrix|cairooperator|cairopath|cairopattern|cairopatterntype|' +
        'cairopdfsurface|cairopslevel|cairopssurface|cairoradialgradient|cairoscaledfont|cairosolidpattern|cairostatus|cairosubpixelorder|' +
        'cairosurface|cairosurfacepattern|cairosurfacetype|cairosvgsurface|cairosvgversion|cairotoyfontface|cal_days_in_month|cal_from_jd|cal_info|' +
        'cal_to_jd|calcul_hmac|calculhmac|call_user_func|call_user_func_array|call_user_method|call_user_method_array|callbackfilteriterator|ceil|' +
        'chdb|chdb_create|chdir|checkdate|checkdnsrr|chgrp|chmod|chop|chown|chr|chroot|chunk_split|class_alias|class_exists|class_implements|' +
        'class_parents|class_uses|classkit_import|classkit_method_add|classkit_method_copy|classkit_method_redefine|classkit_method_remove|' +
        'classkit_method_rename|clearstatcache|clone|closedir|closelog|collator|com|com_addref|com_create_guid|com_event_sink|com_get|' +
        'com_get_active_object|com_invoke|com_isenum|com_load|com_load_typelib|com_message_pump|com_print_typeinfo|com_propget|com_propput|' +
        'com_propset|com_release|com_set|compact|connection_aborted|connection_status|connection_timeout|constant|construct|construct|construct|' +
        'convert_cyr_string|convert_uudecode|convert_uuencode|copy|cos|cosh|count|count_chars|countable|counter_bump|counter_bump_value|' +
        'counter_create|counter_get|counter_get_meta|counter_get_named|counter_get_value|counter_reset|counter_reset_value|crack_check|' +
        'crack_closedict|crack_getlastmessage|crack_opendict|crc32|create_function|crypt|ctype_alnum|ctype_alpha|ctype_cntrl|ctype_digit|' +
        'ctype_graph|ctype_lower|ctype_print|ctype_punct|ctype_space|ctype_upper|ctype_xdigit|cubrid_affected_rows|cubrid_bind|' +
        'cubrid_client_encoding|cubrid_close|cubrid_close_prepare|cubrid_close_request|cubrid_col_get|cubrid_col_size|cubrid_column_names|' +
        'cubrid_column_types|cubrid_commit|cubrid_connect|cubrid_connect_with_url|cubrid_current_oid|cubrid_data_seek|cubrid_db_name|' +
        'cubrid_disconnect|cubrid_drop|cubrid_errno|cubrid_error|cubrid_error_code|cubrid_error_code_facility|cubrid_error_msg|cubrid_execute|' +
        'cubrid_fetch|cubrid_fetch_array|cubrid_fetch_assoc|cubrid_fetch_field|cubrid_fetch_lengths|cubrid_fetch_object|cubrid_fetch_row|' +
        'cubrid_field_flags|cubrid_field_len|cubrid_field_name|cubrid_field_seek|cubrid_field_table|cubrid_field_type|cubrid_free_result|' +
        'cubrid_get|cubrid_get_autocommit|cubrid_get_charset|cubrid_get_class_name|cubrid_get_client_info|cubrid_get_db_parameter|' +
        'cubrid_get_server_info|cubrid_insert_id|cubrid_is_instance|cubrid_list_dbs|cubrid_load_from_glo|cubrid_lob_close|cubrid_lob_export|' +
        'cubrid_lob_get|cubrid_lob_send|cubrid_lob_size|cubrid_lock_read|cubrid_lock_write|cubrid_move_cursor|cubrid_new_glo|cubrid_next_result|' +
        'cubrid_num_cols|cubrid_num_fields|cubrid_num_rows|cubrid_ping|cubrid_prepare|cubrid_put|cubrid_query|cubrid_real_escape_string|' +
        'cubrid_result|cubrid_rollback|cubrid_save_to_glo|cubrid_schema|cubrid_send_glo|cubrid_seq_drop|cubrid_seq_insert|cubrid_seq_put|' +
        'cubrid_set_add|cubrid_set_autocommit|cubrid_set_db_parameter|cubrid_set_drop|cubrid_unbuffered_query|cubrid_version|curl_close|' +
        'curl_copy_handle|curl_errno|curl_error|curl_exec|curl_getinfo|curl_init|curl_multi_add_handle|curl_multi_close|curl_multi_exec|' +
        'curl_multi_getcontent|curl_multi_info_read|curl_multi_init|curl_multi_remove_handle|curl_multi_select|curl_setopt|curl_setopt_array|' +
        'curl_version|current|cyrus_authenticate|cyrus_bind|cyrus_close|cyrus_connect|cyrus_query|cyrus_unbind|date|date_add|date_create|' +
        'date_create_from_format|date_date_set|date_default_timezone_get|date_default_timezone_set|date_diff|date_format|date_get_last_errors|' +
        'date_interval_create_from_date_string|date_interval_format|date_isodate_set|date_modify|date_offset_get|date_parse|date_parse_from_format|' +
        'date_sub|date_sun_info|date_sunrise|date_sunset|date_time_set|date_timestamp_get|date_timestamp_set|date_timezone_get|date_timezone_set|' +
        'dateinterval|dateperiod|datetime|datetimezone|db2_autocommit|db2_bind_param|db2_client_info|db2_close|db2_column_privileges|db2_columns|' +
        'db2_commit|db2_conn_error|db2_conn_errormsg|db2_connect|db2_cursor_type|db2_escape_string|db2_exec|db2_execute|db2_fetch_array|' +
        'db2_fetch_assoc|db2_fetch_both|db2_fetch_object|db2_fetch_row|db2_field_display_size|db2_field_name|db2_field_num|db2_field_precision|' +
        'db2_field_scale|db2_field_type|db2_field_width|db2_foreign_keys|db2_free_result|db2_free_stmt|db2_get_option|db2_last_insert_id|' +
        'db2_lob_read|db2_next_result|db2_num_fields|db2_num_rows|db2_pclose|db2_pconnect|db2_prepare|db2_primary_keys|db2_procedure_columns|' +
        'db2_procedures|db2_result|db2_rollback|db2_server_info|db2_set_option|db2_special_columns|db2_statistics|db2_stmt_error|db2_stmt_errormsg|' +
        'db2_table_privileges|db2_tables|dba_close|dba_delete|dba_exists|dba_fetch|dba_firstkey|dba_handlers|dba_insert|dba_key_split|dba_list|' +
        'dba_nextkey|dba_open|dba_optimize|dba_popen|dba_replace|dba_sync|dbase_add_record|dbase_close|dbase_create|dbase_delete_record|' +
        'dbase_get_header_info|dbase_get_record|dbase_get_record_with_names|dbase_numfields|dbase_numrecords|dbase_open|dbase_pack|' +
        'dbase_replace_record|dbplus_add|dbplus_aql|dbplus_chdir|dbplus_close|dbplus_curr|dbplus_errcode|dbplus_errno|dbplus_find|dbplus_first|' +
        'dbplus_flush|dbplus_freealllocks|dbplus_freelock|dbplus_freerlocks|dbplus_getlock|dbplus_getunique|dbplus_info|dbplus_last|dbplus_lockrel|' +
        'dbplus_next|dbplus_open|dbplus_prev|dbplus_rchperm|dbplus_rcreate|dbplus_rcrtexact|dbplus_rcrtlike|dbplus_resolve|dbplus_restorepos|' +
        'dbplus_rkeys|dbplus_ropen|dbplus_rquery|dbplus_rrename|dbplus_rsecindex|dbplus_runlink|dbplus_rzap|dbplus_savepos|dbplus_setindex|' +
        'dbplus_setindexbynumber|dbplus_sql|dbplus_tcl|dbplus_tremove|dbplus_undo|dbplus_undoprepare|dbplus_unlockrel|dbplus_unselect|' +
        'dbplus_update|dbplus_xlockrel|dbplus_xunlockrel|dbx_close|dbx_compare|dbx_connect|dbx_error|dbx_escape_string|dbx_fetch_row|dbx_query|' +
        'dbx_sort|dcgettext|dcngettext|deaggregate|debug_backtrace|debug_print_backtrace|debug_zval_dump|decbin|dechex|decoct|define|' +
        'define_syslog_variables|defined|deg2rad|delete|dgettext|die|dio_close|dio_fcntl|dio_open|dio_read|dio_seek|dio_stat|dio_tcsetattr|' +
        'dio_truncate|dio_write|dir|directoryiterator|dirname|disk_free_space|disk_total_space|diskfreespace|dl|dngettext|dns_check_record|' +
        'dns_get_mx|dns_get_record|dom_import_simplexml|domainexception|domattr|domattribute_name|domattribute_set_value|domattribute_specified|' +
        'domattribute_value|domcharacterdata|domcomment|domdocument|domdocument_add_root|domdocument_create_attribute|' +
        'domdocument_create_cdata_section|domdocument_create_comment|domdocument_create_element|domdocument_create_element_ns|' +
        'domdocument_create_entity_reference|domdocument_create_processing_instruction|domdocument_create_text_node|domdocument_doctype|' +
        'domdocument_document_element|domdocument_dump_file|domdocument_dump_mem|domdocument_get_element_by_id|domdocument_get_elements_by_tagname|' +
        'domdocument_html_dump_mem|domdocument_xinclude|domdocumentfragment|domdocumenttype|domdocumenttype_entities|' +
        'domdocumenttype_internal_subset|domdocumenttype_name|domdocumenttype_notations|domdocumenttype_public_id|domdocumenttype_system_id|' +
        'domelement|domelement_get_attribute|domelement_get_attribute_node|domelement_get_elements_by_tagname|domelement_has_attribute|' +
        'domelement_remove_attribute|domelement_set_attribute|domelement_set_attribute_node|domelement_tagname|domentity|domentityreference|' +
        'domexception|domimplementation|domnamednodemap|domnode|domnode_add_namespace|domnode_append_child|domnode_append_sibling|' +
        'domnode_attributes|domnode_child_nodes|domnode_clone_node|domnode_dump_node|domnode_first_child|domnode_get_content|' +
        'domnode_has_attributes|domnode_has_child_nodes|domnode_insert_before|domnode_is_blank_node|domnode_last_child|domnode_next_sibling|' +
        'domnode_node_name|domnode_node_type|domnode_node_value|domnode_owner_document|domnode_parent_node|domnode_prefix|domnode_previous_sibling|' +
        'domnode_remove_child|domnode_replace_child|domnode_replace_node|domnode_set_content|domnode_set_name|domnode_set_namespace|' +
        'domnode_unlink_node|domnodelist|domnotation|domprocessinginstruction|domprocessinginstruction_data|domprocessinginstruction_target|' +
        'domtext|domxml_new_doc|domxml_open_file|domxml_open_mem|domxml_version|domxml_xmltree|domxml_xslt_stylesheet|domxml_xslt_stylesheet_doc|' +
        'domxml_xslt_stylesheet_file|domxml_xslt_version|domxpath|domxsltstylesheet_process|domxsltstylesheet_result_dump_file|' +
        'domxsltstylesheet_result_dump_mem|dotnet|dotnet_load|doubleval|each|easter_date|easter_days|echo|empty|emptyiterator|' +
        'enchant_broker_describe|enchant_broker_dict_exists|enchant_broker_free|enchant_broker_free_dict|enchant_broker_get_error|' +
        'enchant_broker_init|enchant_broker_list_dicts|enchant_broker_request_dict|enchant_broker_request_pwl_dict|enchant_broker_set_ordering|' +
        'enchant_dict_add_to_personal|enchant_dict_add_to_session|enchant_dict_check|enchant_dict_describe|enchant_dict_get_error|' +
        'enchant_dict_is_in_session|enchant_dict_quick_check|enchant_dict_store_replacement|enchant_dict_suggest|end|ereg|ereg_replace|eregi|' +
        'eregi_replace|error_get_last|error_log|error_reporting|errorexception|escapeshellarg|escapeshellcmd|eval|event_add|event_base_free|' +
        'event_base_loop|event_base_loopbreak|event_base_loopexit|event_base_new|event_base_priority_init|event_base_set|event_buffer_base_set|' +
        'event_buffer_disable|event_buffer_enable|event_buffer_fd_set|event_buffer_free|event_buffer_new|event_buffer_priority_set|' +
        'event_buffer_read|event_buffer_set_callback|event_buffer_timeout_set|event_buffer_watermark_set|event_buffer_write|event_del|event_free|' +
        'event_new|event_set|exception|exec|exif_imagetype|exif_read_data|exif_tagname|exif_thumbnail|exit|exp|expect_expectl|expect_popen|explode|' +
        'expm1|export|export|extension_loaded|extract|ezmlm_hash|fam_cancel_monitor|fam_close|fam_monitor_collection|fam_monitor_directory|' +
        'fam_monitor_file|fam_next_event|fam_open|fam_pending|fam_resume_monitor|fam_suspend_monitor|fbsql_affected_rows|fbsql_autocommit|' +
        'fbsql_blob_size|fbsql_change_user|fbsql_clob_size|fbsql_close|fbsql_commit|fbsql_connect|fbsql_create_blob|fbsql_create_clob|' +
        'fbsql_create_db|fbsql_data_seek|fbsql_database|fbsql_database_password|fbsql_db_query|fbsql_db_status|fbsql_drop_db|fbsql_errno|' +
        'fbsql_error|fbsql_fetch_array|fbsql_fetch_assoc|fbsql_fetch_field|fbsql_fetch_lengths|fbsql_fetch_object|fbsql_fetch_row|' +
        'fbsql_field_flags|fbsql_field_len|fbsql_field_name|fbsql_field_seek|fbsql_field_table|fbsql_field_type|fbsql_free_result|' +
        'fbsql_get_autostart_info|fbsql_hostname|fbsql_insert_id|fbsql_list_dbs|fbsql_list_fields|fbsql_list_tables|fbsql_next_result|' +
        'fbsql_num_fields|fbsql_num_rows|fbsql_password|fbsql_pconnect|fbsql_query|fbsql_read_blob|fbsql_read_clob|fbsql_result|fbsql_rollback|' +
        'fbsql_rows_fetched|fbsql_select_db|fbsql_set_characterset|fbsql_set_lob_mode|fbsql_set_password|fbsql_set_transaction|fbsql_start_db|' +
        'fbsql_stop_db|fbsql_table_name|fbsql_tablename|fbsql_username|fbsql_warnings|fclose|fdf_add_doc_javascript|fdf_add_template|fdf_close|' +
        'fdf_create|fdf_enum_values|fdf_errno|fdf_error|fdf_get_ap|fdf_get_attachment|fdf_get_encoding|fdf_get_file|fdf_get_flags|fdf_get_opt|' +
        'fdf_get_status|fdf_get_value|fdf_get_version|fdf_header|fdf_next_field_name|fdf_open|fdf_open_string|fdf_remove_item|fdf_save|' +
        'fdf_save_string|fdf_set_ap|fdf_set_encoding|fdf_set_file|fdf_set_flags|fdf_set_javascript_action|fdf_set_on_import_javascript|fdf_set_opt|' +
        'fdf_set_status|fdf_set_submit_form_action|fdf_set_target_frame|fdf_set_value|fdf_set_version|feof|fflush|fgetc|fgetcsv|fgets|fgetss|file|' +
        'file_exists|file_get_contents|file_put_contents|fileatime|filectime|filegroup|fileinode|filemtime|fileowner|fileperms|filepro|' +
        'filepro_fieldcount|filepro_fieldname|filepro_fieldtype|filepro_fieldwidth|filepro_retrieve|filepro_rowcount|filesize|filesystemiterator|' +
        'filetype|filter_has_var|filter_id|filter_input|filter_input_array|filter_list|filter_var|filter_var_array|filteriterator|finfo_buffer|' +
        'finfo_close|finfo_file|finfo_open|finfo_set_flags|floatval|flock|floor|flush|fmod|fnmatch|fopen|forward_static_call|' +
        'forward_static_call_array|fpassthru|fprintf|fputcsv|fputs|fread|frenchtojd|fribidi_log2vis|fscanf|fseek|fsockopen|fstat|ftell|ftok|' +
        'ftp_alloc|ftp_cdup|ftp_chdir|ftp_chmod|ftp_close|ftp_connect|ftp_delete|ftp_exec|ftp_fget|ftp_fput|ftp_get|ftp_get_option|ftp_login|' +
        'ftp_mdtm|ftp_mkdir|ftp_nb_continue|ftp_nb_fget|ftp_nb_fput|ftp_nb_get|ftp_nb_put|ftp_nlist|ftp_pasv|ftp_put|ftp_pwd|ftp_quit|ftp_raw|' +
        'ftp_rawlist|ftp_rename|ftp_rmdir|ftp_set_option|ftp_site|ftp_size|ftp_ssl_connect|ftp_systype|ftruncate|func_get_arg|func_get_args|' +
        'func_num_args|function_exists|fwrite|gc_collect_cycles|gc_disable|gc_enable|gc_enabled|gd_info|gearmanclient|gearmanjob|gearmantask|' +
        'gearmanworker|geoip_continent_code_by_name|geoip_country_code3_by_name|geoip_country_code_by_name|geoip_country_name_by_name|' +
        'geoip_database_info|geoip_db_avail|geoip_db_filename|geoip_db_get_all_info|geoip_id_by_name|geoip_isp_by_name|geoip_org_by_name|' +
        'geoip_record_by_name|geoip_region_by_name|geoip_region_name_by_code|geoip_time_zone_by_country_and_region|getMeta|getNamed|getValue|' +
        'get_browser|get_called_class|get_cfg_var|get_class|get_class_methods|get_class_vars|get_current_user|get_declared_classes|' +
        'get_declared_interfaces|get_declared_traits|get_defined_constants|get_defined_functions|get_defined_vars|get_extension_funcs|get_headers|' +
        'get_html_translation_table|get_include_path|get_included_files|get_loaded_extensions|get_magic_quotes_gpc|get_magic_quotes_runtime|' +
        'get_meta_tags|get_object_vars|get_parent_class|get_required_files|get_resource_type|getallheaders|getconstant|getconstants|getconstructor|' +
        'getcwd|getdate|getdefaultproperties|getdoccomment|getendline|getenv|getextension|getextensionname|getfilename|gethostbyaddr|gethostbyname|' +
        'gethostbynamel|gethostname|getimagesize|getinterfacenames|getinterfaces|getlastmod|getmethod|getmethods|getmodifiers|getmxrr|getmygid|' +
        'getmyinode|getmypid|getmyuid|getname|getnamespacename|getopt|getparentclass|getproperties|getproperty|getprotobyname|getprotobynumber|' +
        'getrandmax|getrusage|getservbyname|getservbyport|getshortname|getstartline|getstaticproperties|getstaticpropertyvalue|gettext|' +
        'gettimeofday|gettype|glob|globiterator|gmagick|gmagickdraw|gmagickpixel|gmdate|gmmktime|gmp_abs|gmp_add|gmp_and|gmp_clrbit|gmp_cmp|' +
        'gmp_com|gmp_div|gmp_div_q|gmp_div_qr|gmp_div_r|gmp_divexact|gmp_fact|gmp_gcd|gmp_gcdext|gmp_hamdist|gmp_init|gmp_intval|gmp_invert|' +
        'gmp_jacobi|gmp_legendre|gmp_mod|gmp_mul|gmp_neg|gmp_nextprime|gmp_or|gmp_perfect_square|gmp_popcount|gmp_pow|gmp_powm|gmp_prob_prime|' +
        'gmp_random|gmp_scan0|gmp_scan1|gmp_setbit|gmp_sign|gmp_sqrt|gmp_sqrtrem|gmp_strval|gmp_sub|gmp_testbit|gmp_xor|gmstrftime|' +
        'gnupg_adddecryptkey|gnupg_addencryptkey|gnupg_addsignkey|gnupg_cleardecryptkeys|gnupg_clearencryptkeys|gnupg_clearsignkeys|gnupg_decrypt|' +
        'gnupg_decryptverify|gnupg_encrypt|gnupg_encryptsign|gnupg_export|gnupg_geterror|gnupg_getprotocol|gnupg_import|gnupg_init|gnupg_keyinfo|' +
        'gnupg_setarmor|gnupg_seterrormode|gnupg_setsignmode|gnupg_sign|gnupg_verify|gopher_parsedir|grapheme_extract|grapheme_stripos|' +
        'grapheme_stristr|grapheme_strlen|grapheme_strpos|grapheme_strripos|grapheme_strrpos|grapheme_strstr|grapheme_substr|gregoriantojd|' +
        'gupnp_context_get_host_ip|gupnp_context_get_port|gupnp_context_get_subscription_timeout|gupnp_context_host_path|gupnp_context_new|' +
        'gupnp_context_set_subscription_timeout|gupnp_context_timeout_add|gupnp_context_unhost_path|gupnp_control_point_browse_start|' +
        'gupnp_control_point_browse_stop|gupnp_control_point_callback_set|gupnp_control_point_new|gupnp_device_action_callback_set|' +
        'gupnp_device_info_get|gupnp_device_info_get_service|gupnp_root_device_get_available|gupnp_root_device_get_relative_location|' +
        'gupnp_root_device_new|gupnp_root_device_set_available|gupnp_root_device_start|gupnp_root_device_stop|gupnp_service_action_get|' +
        'gupnp_service_action_return|gupnp_service_action_return_error|gupnp_service_action_set|gupnp_service_freeze_notify|gupnp_service_info_get|' +
        'gupnp_service_info_get_introspection|gupnp_service_introspection_get_state_variable|gupnp_service_notify|gupnp_service_proxy_action_get|' +
        'gupnp_service_proxy_action_set|gupnp_service_proxy_add_notify|gupnp_service_proxy_callback_set|gupnp_service_proxy_get_subscribed|' +
        'gupnp_service_proxy_remove_notify|gupnp_service_proxy_set_subscribed|gupnp_service_thaw_notify|gzclose|gzcompress|gzdecode|gzdeflate|' +
        'gzencode|gzeof|gzfile|gzgetc|gzgets|gzgetss|gzinflate|gzopen|gzpassthru|gzputs|gzread|gzrewind|gzseek|gztell|gzuncompress|gzwrite|' +
        'halt_compiler|haruannotation|haruannotation_setborderstyle|haruannotation_sethighlightmode|haruannotation_seticon|' +
        'haruannotation_setopened|harudestination|harudestination_setfit|harudestination_setfitb|harudestination_setfitbh|harudestination_setfitbv|' +
        'harudestination_setfith|harudestination_setfitr|harudestination_setfitv|harudestination_setxyz|harudoc|harudoc_addpage|' +
        'harudoc_addpagelabel|harudoc_construct|harudoc_createoutline|harudoc_getcurrentencoder|harudoc_getcurrentpage|harudoc_getencoder|' +
        'harudoc_getfont|harudoc_getinfoattr|harudoc_getpagelayout|harudoc_getpagemode|harudoc_getstreamsize|harudoc_insertpage|harudoc_loadjpeg|' +
        'harudoc_loadpng|harudoc_loadraw|harudoc_loadttc|harudoc_loadttf|harudoc_loadtype1|harudoc_output|harudoc_readfromstream|' +
        'harudoc_reseterror|harudoc_resetstream|harudoc_save|harudoc_savetostream|harudoc_setcompressionmode|harudoc_setcurrentencoder|' +
        'harudoc_setencryptionmode|harudoc_setinfoattr|harudoc_setinfodateattr|harudoc_setopenaction|harudoc_setpagelayout|harudoc_setpagemode|' +
        'harudoc_setpagesconfiguration|harudoc_setpassword|harudoc_setpermission|harudoc_usecnsencodings|harudoc_usecnsfonts|' +
        'harudoc_usecntencodings|harudoc_usecntfonts|harudoc_usejpencodings|harudoc_usejpfonts|harudoc_usekrencodings|harudoc_usekrfonts|' +
        'haruencoder|haruencoder_getbytetype|haruencoder_gettype|haruencoder_getunicode|haruencoder_getwritingmode|haruexception|harufont|' +
        'harufont_getascent|harufont_getcapheight|harufont_getdescent|harufont_getencodingname|harufont_getfontname|harufont_gettextwidth|' +
        'harufont_getunicodewidth|harufont_getxheight|harufont_measuretext|haruimage|haruimage_getbitspercomponent|haruimage_getcolorspace|' +
        'haruimage_getheight|haruimage_getsize|haruimage_getwidth|haruimage_setcolormask|haruimage_setmaskimage|haruoutline|' +
        'haruoutline_setdestination|haruoutline_setopened|harupage|harupage_arc|harupage_begintext|harupage_circle|harupage_closepath|' +
        'harupage_concat|harupage_createdestination|harupage_createlinkannotation|harupage_createtextannotation|harupage_createurlannotation|' +
        'harupage_curveto|harupage_curveto2|harupage_curveto3|harupage_drawimage|harupage_ellipse|harupage_endpath|harupage_endtext|' +
        'harupage_eofill|harupage_eofillstroke|harupage_fill|harupage_fillstroke|harupage_getcharspace|harupage_getcmykfill|harupage_getcmykstroke|' +
        'harupage_getcurrentfont|harupage_getcurrentfontsize|harupage_getcurrentpos|harupage_getcurrenttextpos|harupage_getdash|' +
        'harupage_getfillingcolorspace|harupage_getflatness|harupage_getgmode|harupage_getgrayfill|harupage_getgraystroke|harupage_getheight|' +
        'harupage_gethorizontalscaling|harupage_getlinecap|harupage_getlinejoin|harupage_getlinewidth|harupage_getmiterlimit|harupage_getrgbfill|' +
        'harupage_getrgbstroke|harupage_getstrokingcolorspace|harupage_gettextleading|harupage_gettextmatrix|harupage_gettextrenderingmode|' +
        'harupage_gettextrise|harupage_gettextwidth|harupage_gettransmatrix|harupage_getwidth|harupage_getwordspace|harupage_lineto|' +
        'harupage_measuretext|harupage_movetextpos|harupage_moveto|harupage_movetonextline|harupage_rectangle|harupage_setcharspace|' +
        'harupage_setcmykfill|harupage_setcmykstroke|harupage_setdash|harupage_setflatness|harupage_setfontandsize|harupage_setgrayfill|' +
        'harupage_setgraystroke|harupage_setheight|harupage_sethorizontalscaling|harupage_setlinecap|harupage_setlinejoin|harupage_setlinewidth|' +
        'harupage_setmiterlimit|harupage_setrgbfill|harupage_setrgbstroke|harupage_setrotate|harupage_setsize|harupage_setslideshow|' +
        'harupage_settextleading|harupage_settextmatrix|harupage_settextrenderingmode|harupage_settextrise|harupage_setwidth|harupage_setwordspace|' +
        'harupage_showtext|harupage_showtextnextline|harupage_stroke|harupage_textout|harupage_textrect|hasconstant|hash|hash_algos|hash_copy|' +
        'hash_file|hash_final|hash_hmac|hash_hmac_file|hash_init|hash_update|hash_update_file|hash_update_stream|hasmethod|hasproperty|header|' +
        'header_register_callback|header_remove|headers_list|headers_sent|hebrev|hebrevc|hex2bin|hexdec|highlight_file|highlight_string|' +
        'html_entity_decode|htmlentities|htmlspecialchars|htmlspecialchars_decode|http_build_cookie|http_build_query|http_build_str|http_build_url|' +
        'http_cache_etag|http_cache_last_modified|http_chunked_decode|http_date|http_deflate|http_get|http_get_request_body|' +
        'http_get_request_body_stream|http_get_request_headers|http_head|http_inflate|http_match_etag|http_match_modified|' +
        'http_match_request_header|http_negotiate_charset|http_negotiate_content_type|http_negotiate_language|http_parse_cookie|http_parse_headers|' +
        'http_parse_message|http_parse_params|http_persistent_handles_clean|http_persistent_handles_count|http_persistent_handles_ident|' +
        'http_post_data|http_post_fields|http_put_data|http_put_file|http_put_stream|http_redirect|http_request|http_request_body_encode|' +
        'http_request_method_exists|http_request_method_name|http_request_method_register|http_request_method_unregister|http_response_code|' +
        'http_send_content_disposition|http_send_content_type|http_send_data|http_send_file|http_send_last_modified|http_send_status|' +
        'http_send_stream|http_support|http_throttle|httpdeflatestream|httpdeflatestream_construct|httpdeflatestream_factory|' +
        'httpdeflatestream_finish|httpdeflatestream_flush|httpdeflatestream_update|httpinflatestream|httpinflatestream_construct|' +
        'httpinflatestream_factory|httpinflatestream_finish|httpinflatestream_flush|httpinflatestream_update|httpmessage|httpmessage_addheaders|' +
        'httpmessage_construct|httpmessage_detach|httpmessage_factory|httpmessage_fromenv|httpmessage_fromstring|httpmessage_getbody|' +
        'httpmessage_getheader|httpmessage_getheaders|httpmessage_gethttpversion|httpmessage_getparentmessage|httpmessage_getrequestmethod|' +
        'httpmessage_getrequesturl|httpmessage_getresponsecode|httpmessage_getresponsestatus|httpmessage_gettype|httpmessage_guesscontenttype|' +
        'httpmessage_prepend|httpmessage_reverse|httpmessage_send|httpmessage_setbody|httpmessage_setheaders|httpmessage_sethttpversion|' +
        'httpmessage_setrequestmethod|httpmessage_setrequesturl|httpmessage_setresponsecode|httpmessage_setresponsestatus|httpmessage_settype|' +
        'httpmessage_tomessagetypeobject|httpmessage_tostring|httpquerystring|httpquerystring_construct|httpquerystring_get|httpquerystring_mod|' +
        'httpquerystring_set|httpquerystring_singleton|httpquerystring_toarray|httpquerystring_tostring|httpquerystring_xlate|httprequest|' +
        'httprequest_addcookies|httprequest_addheaders|httprequest_addpostfields|httprequest_addpostfile|httprequest_addputdata|' +
        'httprequest_addquerydata|httprequest_addrawpostdata|httprequest_addssloptions|httprequest_clearhistory|httprequest_construct|' +
        'httprequest_enablecookies|httprequest_getcontenttype|httprequest_getcookies|httprequest_getheaders|httprequest_gethistory|' +
        'httprequest_getmethod|httprequest_getoptions|httprequest_getpostfields|httprequest_getpostfiles|httprequest_getputdata|' +
        'httprequest_getputfile|httprequest_getquerydata|httprequest_getrawpostdata|httprequest_getrawrequestmessage|' +
        'httprequest_getrawresponsemessage|httprequest_getrequestmessage|httprequest_getresponsebody|httprequest_getresponsecode|' +
        'httprequest_getresponsecookies|httprequest_getresponsedata|httprequest_getresponseheader|httprequest_getresponseinfo|' +
        'httprequest_getresponsemessage|httprequest_getresponsestatus|httprequest_getssloptions|httprequest_geturl|httprequest_resetcookies|' +
        'httprequest_send|httprequest_setcontenttype|httprequest_setcookies|httprequest_setheaders|httprequest_setmethod|httprequest_setoptions|' +
        'httprequest_setpostfields|httprequest_setpostfiles|httprequest_setputdata|httprequest_setputfile|httprequest_setquerydata|' +
        'httprequest_setrawpostdata|httprequest_setssloptions|httprequest_seturl|httprequestpool|httprequestpool_attach|httprequestpool_construct|' +
        'httprequestpool_destruct|httprequestpool_detach|httprequestpool_getattachedrequests|httprequestpool_getfinishedrequests|' +
        'httprequestpool_reset|httprequestpool_send|httprequestpool_socketperform|httprequestpool_socketselect|httpresponse|httpresponse_capture|' +
        'httpresponse_getbuffersize|httpresponse_getcache|httpresponse_getcachecontrol|httpresponse_getcontentdisposition|' +
        'httpresponse_getcontenttype|httpresponse_getdata|httpresponse_getetag|httpresponse_getfile|httpresponse_getgzip|httpresponse_getheader|' +
        'httpresponse_getlastmodified|httpresponse_getrequestbody|httpresponse_getrequestbodystream|httpresponse_getrequestheaders|' +
        'httpresponse_getstream|httpresponse_getthrottledelay|httpresponse_guesscontenttype|httpresponse_redirect|httpresponse_send|' +
        'httpresponse_setbuffersize|httpresponse_setcache|httpresponse_setcachecontrol|httpresponse_setcontentdisposition|' +
        'httpresponse_setcontenttype|httpresponse_setdata|httpresponse_setetag|httpresponse_setfile|httpresponse_setgzip|httpresponse_setheader|' +
        'httpresponse_setlastmodified|httpresponse_setstream|httpresponse_setthrottledelay|httpresponse_status|hw_array2objrec|hw_changeobject|' +
        'hw_children|hw_childrenobj|hw_close|hw_connect|hw_connection_info|hw_cp|hw_deleteobject|hw_docbyanchor|hw_docbyanchorobj|' +
        'hw_document_attributes|hw_document_bodytag|hw_document_content|hw_document_setcontent|hw_document_size|hw_dummy|hw_edittext|hw_error|' +
        'hw_errormsg|hw_free_document|hw_getanchors|hw_getanchorsobj|hw_getandlock|hw_getchildcoll|hw_getchildcollobj|hw_getchilddoccoll|' +
        'hw_getchilddoccollobj|hw_getobject|hw_getobjectbyquery|hw_getobjectbyquerycoll|hw_getobjectbyquerycollobj|hw_getobjectbyqueryobj|' +
        'hw_getparents|hw_getparentsobj|hw_getrellink|hw_getremote|hw_getremotechildren|hw_getsrcbydestobj|hw_gettext|hw_getusername|hw_identify|' +
        'hw_incollections|hw_info|hw_inscoll|hw_insdoc|hw_insertanchors|hw_insertdocument|hw_insertobject|hw_mapid|hw_modifyobject|hw_mv|' +
        'hw_new_document|hw_objrec2array|hw_output_document|hw_pconnect|hw_pipedocument|hw_root|hw_setlinkroot|hw_stat|hw_unlock|hw_who|' +
        'hwapi_attribute|hwapi_attribute_key|hwapi_attribute_langdepvalue|hwapi_attribute_value|hwapi_attribute_values|hwapi_checkin|' +
        'hwapi_checkout|hwapi_children|hwapi_content|hwapi_content_mimetype|hwapi_content_read|hwapi_copy|hwapi_dbstat|hwapi_dcstat|' +
        'hwapi_dstanchors|hwapi_dstofsrcanchor|hwapi_error_count|hwapi_error_reason|hwapi_find|hwapi_ftstat|hwapi_hgcsp|hwapi_hwstat|' +
        'hwapi_identify|hwapi_info|hwapi_insert|hwapi_insertanchor|hwapi_insertcollection|hwapi_insertdocument|hwapi_link|hwapi_lock|hwapi_move|' +
        'hwapi_new_content|hwapi_object|hwapi_object_assign|hwapi_object_attreditable|hwapi_object_count|hwapi_object_insert|hwapi_object_new|' +
        'hwapi_object_remove|hwapi_object_title|hwapi_object_value|hwapi_objectbyanchor|hwapi_parents|hwapi_reason_description|hwapi_reason_type|' +
        'hwapi_remove|hwapi_replace|hwapi_setcommittedversion|hwapi_srcanchors|hwapi_srcsofdst|hwapi_unlock|hwapi_user|hwapi_userlist|hypot|' +
        'ibase_add_user|ibase_affected_rows|ibase_backup|ibase_blob_add|ibase_blob_cancel|ibase_blob_close|ibase_blob_create|ibase_blob_echo|' +
        'ibase_blob_get|ibase_blob_import|ibase_blob_info|ibase_blob_open|ibase_close|ibase_commit|ibase_commit_ret|ibase_connect|ibase_db_info|' +
        'ibase_delete_user|ibase_drop_db|ibase_errcode|ibase_errmsg|ibase_execute|ibase_fetch_assoc|ibase_fetch_object|ibase_fetch_row|' +
        'ibase_field_info|ibase_free_event_handler|ibase_free_query|ibase_free_result|ibase_gen_id|ibase_maintain_db|ibase_modify_user|' +
        'ibase_name_result|ibase_num_fields|ibase_num_params|ibase_param_info|ibase_pconnect|ibase_prepare|ibase_query|ibase_restore|' +
        'ibase_rollback|ibase_rollback_ret|ibase_server_info|ibase_service_attach|ibase_service_detach|ibase_set_event_handler|ibase_timefmt|' +
        'ibase_trans|ibase_wait_event|iconv|iconv_get_encoding|iconv_mime_decode|iconv_mime_decode_headers|iconv_mime_encode|iconv_set_encoding|' +
        'iconv_strlen|iconv_strpos|iconv_strrpos|iconv_substr|id3_get_frame_long_name|id3_get_frame_short_name|id3_get_genre_id|id3_get_genre_list|' +
        'id3_get_genre_name|id3_get_tag|id3_get_version|id3_remove_tag|id3_set_tag|id3v2attachedpictureframe|id3v2frame|id3v2tag|idate|' +
        'idn_to_ascii|idn_to_unicode|idn_to_utf8|ifx_affected_rows|ifx_blobinfile_mode|ifx_byteasvarchar|ifx_close|ifx_connect|ifx_copy_blob|' +
        'ifx_create_blob|ifx_create_char|ifx_do|ifx_error|ifx_errormsg|ifx_fetch_row|ifx_fieldproperties|ifx_fieldtypes|ifx_free_blob|' +
        'ifx_free_char|ifx_free_result|ifx_get_blob|ifx_get_char|ifx_getsqlca|ifx_htmltbl_result|ifx_nullformat|ifx_num_fields|ifx_num_rows|' +
        'ifx_pconnect|ifx_prepare|ifx_query|ifx_textasvarchar|ifx_update_blob|ifx_update_char|ifxus_close_slob|ifxus_create_slob|ifxus_free_slob|' +
        'ifxus_open_slob|ifxus_read_slob|ifxus_seek_slob|ifxus_tell_slob|ifxus_write_slob|ignore_user_abort|iis_add_server|iis_get_dir_security|' +
        'iis_get_script_map|iis_get_server_by_comment|iis_get_server_by_path|iis_get_server_rights|iis_get_service_state|iis_remove_server|' +
        'iis_set_app_settings|iis_set_dir_security|iis_set_script_map|iis_set_server_rights|iis_start_server|iis_start_service|iis_stop_server|' +
        'iis_stop_service|image2wbmp|image_type_to_extension|image_type_to_mime_type|imagealphablending|imageantialias|imagearc|imagechar|' +
        'imagecharup|imagecolorallocate|imagecolorallocatealpha|imagecolorat|imagecolorclosest|imagecolorclosestalpha|imagecolorclosesthwb|' +
        'imagecolordeallocate|imagecolorexact|imagecolorexactalpha|imagecolormatch|imagecolorresolve|imagecolorresolvealpha|imagecolorset|' +
        'imagecolorsforindex|imagecolorstotal|imagecolortransparent|imageconvolution|imagecopy|imagecopymerge|imagecopymergegray|' +
        'imagecopyresampled|imagecopyresized|imagecreate|imagecreatefromgd|imagecreatefromgd2|imagecreatefromgd2part|imagecreatefromgif|' +
        'imagecreatefromjpeg|imagecreatefrompng|imagecreatefromstring|imagecreatefromwbmp|imagecreatefromxbm|imagecreatefromxpm|' +
        'imagecreatetruecolor|imagedashedline|imagedestroy|imageellipse|imagefill|imagefilledarc|imagefilledellipse|imagefilledpolygon|' +
        'imagefilledrectangle|imagefilltoborder|imagefilter|imagefontheight|imagefontwidth|imageftbbox|imagefttext|imagegammacorrect|imagegd|' +
        'imagegd2|imagegif|imagegrabscreen|imagegrabwindow|imageinterlace|imageistruecolor|imagejpeg|imagelayereffect|imageline|imageloadfont|' +
        'imagepalettecopy|imagepng|imagepolygon|imagepsbbox|imagepsencodefont|imagepsextendfont|imagepsfreefont|imagepsloadfont|imagepsslantfont|' +
        'imagepstext|imagerectangle|imagerotate|imagesavealpha|imagesetbrush|imagesetpixel|imagesetstyle|imagesetthickness|imagesettile|' +
        'imagestring|imagestringup|imagesx|imagesy|imagetruecolortopalette|imagettfbbox|imagettftext|imagetypes|imagewbmp|imagexbm|imagick|' +
        'imagick_adaptiveblurimage|imagick_adaptiveresizeimage|imagick_adaptivesharpenimage|imagick_adaptivethresholdimage|imagick_addimage|' +
        'imagick_addnoiseimage|imagick_affinetransformimage|imagick_animateimages|imagick_annotateimage|imagick_appendimages|imagick_averageimages|' +
        'imagick_blackthresholdimage|imagick_blurimage|imagick_borderimage|imagick_charcoalimage|imagick_chopimage|imagick_clear|imagick_clipimage|' +
        'imagick_clippathimage|imagick_clone|imagick_clutimage|imagick_coalesceimages|imagick_colorfloodfillimage|imagick_colorizeimage|' +
        'imagick_combineimages|imagick_commentimage|imagick_compareimagechannels|imagick_compareimagelayers|imagick_compareimages|' +
        'imagick_compositeimage|imagick_construct|imagick_contrastimage|imagick_contraststretchimage|imagick_convolveimage|imagick_cropimage|' +
        'imagick_cropthumbnailimage|imagick_current|imagick_cyclecolormapimage|imagick_decipherimage|imagick_deconstructimages|' +
        'imagick_deleteimageartifact|imagick_despeckleimage|imagick_destroy|imagick_displayimage|imagick_displayimages|imagick_distortimage|' +
        'imagick_drawimage|imagick_edgeimage|imagick_embossimage|imagick_encipherimage|imagick_enhanceimage|imagick_equalizeimage|' +
        'imagick_evaluateimage|imagick_extentimage|imagick_flattenimages|imagick_flipimage|imagick_floodfillpaintimage|imagick_flopimage|' +
        'imagick_frameimage|imagick_fximage|imagick_gammaimage|imagick_gaussianblurimage|imagick_getcolorspace|imagick_getcompression|' +
        'imagick_getcompressionquality|imagick_getcopyright|imagick_getfilename|imagick_getfont|imagick_getformat|imagick_getgravity|' +
        'imagick_gethomeurl|imagick_getimage|imagick_getimagealphachannel|imagick_getimageartifact|imagick_getimagebackgroundcolor|' +
        'imagick_getimageblob|imagick_getimageblueprimary|imagick_getimagebordercolor|imagick_getimagechanneldepth|' +
        'imagick_getimagechanneldistortion|imagick_getimagechanneldistortions|imagick_getimagechannelextrema|imagick_getimagechannelmean|' +
        'imagick_getimagechannelrange|imagick_getimagechannelstatistics|imagick_getimageclipmask|imagick_getimagecolormapcolor|' +
        'imagick_getimagecolors|imagick_getimagecolorspace|imagick_getimagecompose|imagick_getimagecompression|imagick_getimagecompressionquality|' +
        'imagick_getimagedelay|imagick_getimagedepth|imagick_getimagedispose|imagick_getimagedistortion|imagick_getimageextrema|' +
        'imagick_getimagefilename|imagick_getimageformat|imagick_getimagegamma|imagick_getimagegeometry|imagick_getimagegravity|' +
        'imagick_getimagegreenprimary|imagick_getimageheight|imagick_getimagehistogram|imagick_getimageindex|imagick_getimageinterlacescheme|' +
        'imagick_getimageinterpolatemethod|imagick_getimageiterations|imagick_getimagelength|imagick_getimagemagicklicense|imagick_getimagematte|' +
        'imagick_getimagemattecolor|imagick_getimageorientation|imagick_getimagepage|imagick_getimagepixelcolor|imagick_getimageprofile|' +
        'imagick_getimageprofiles|imagick_getimageproperties|imagick_getimageproperty|imagick_getimageredprimary|imagick_getimageregion|' +
        'imagick_getimagerenderingintent|imagick_getimageresolution|imagick_getimagesblob|imagick_getimagescene|imagick_getimagesignature|' +
        'imagick_getimagesize|imagick_getimagetickspersecond|imagick_getimagetotalinkdensity|imagick_getimagetype|imagick_getimageunits|' +
        'imagick_getimagevirtualpixelmethod|imagick_getimagewhitepoint|imagick_getimagewidth|imagick_getinterlacescheme|imagick_getiteratorindex|' +
        'imagick_getnumberimages|imagick_getoption|imagick_getpackagename|imagick_getpage|imagick_getpixeliterator|imagick_getpixelregioniterator|' +
        'imagick_getpointsize|imagick_getquantumdepth|imagick_getquantumrange|imagick_getreleasedate|imagick_getresource|imagick_getresourcelimit|' +
        'imagick_getsamplingfactors|imagick_getsize|imagick_getsizeoffset|imagick_getversion|imagick_hasnextimage|imagick_haspreviousimage|' +
        'imagick_identifyimage|imagick_implodeimage|imagick_labelimage|imagick_levelimage|imagick_linearstretchimage|imagick_liquidrescaleimage|' +
        'imagick_magnifyimage|imagick_mapimage|imagick_mattefloodfillimage|imagick_medianfilterimage|imagick_mergeimagelayers|imagick_minifyimage|' +
        'imagick_modulateimage|imagick_montageimage|imagick_morphimages|imagick_mosaicimages|imagick_motionblurimage|imagick_negateimage|' +
        'imagick_newimage|imagick_newpseudoimage|imagick_nextimage|imagick_normalizeimage|imagick_oilpaintimage|imagick_opaquepaintimage|' +
        'imagick_optimizeimagelayers|imagick_orderedposterizeimage|imagick_paintfloodfillimage|imagick_paintopaqueimage|' +
        'imagick_painttransparentimage|imagick_pingimage|imagick_pingimageblob|imagick_pingimagefile|imagick_polaroidimage|imagick_posterizeimage|' +
        'imagick_previewimages|imagick_previousimage|imagick_profileimage|imagick_quantizeimage|imagick_quantizeimages|imagick_queryfontmetrics|' +
        'imagick_queryfonts|imagick_queryformats|imagick_radialblurimage|imagick_raiseimage|imagick_randomthresholdimage|imagick_readimage|' +
        'imagick_readimageblob|imagick_readimagefile|imagick_recolorimage|imagick_reducenoiseimage|imagick_removeimage|imagick_removeimageprofile|' +
        'imagick_render|imagick_resampleimage|imagick_resetimagepage|imagick_resizeimage|imagick_rollimage|imagick_rotateimage|' +
        'imagick_roundcorners|imagick_sampleimage|imagick_scaleimage|imagick_separateimagechannel|imagick_sepiatoneimage|' +
        'imagick_setbackgroundcolor|imagick_setcolorspace|imagick_setcompression|imagick_setcompressionquality|imagick_setfilename|' +
        'imagick_setfirstiterator|imagick_setfont|imagick_setformat|imagick_setgravity|imagick_setimage|imagick_setimagealphachannel|' +
        'imagick_setimageartifact|imagick_setimagebackgroundcolor|imagick_setimagebias|imagick_setimageblueprimary|imagick_setimagebordercolor|' +
        'imagick_setimagechanneldepth|imagick_setimageclipmask|imagick_setimagecolormapcolor|imagick_setimagecolorspace|imagick_setimagecompose|' +
        'imagick_setimagecompression|imagick_setimagecompressionquality|imagick_setimagedelay|imagick_setimagedepth|imagick_setimagedispose|' +
        'imagick_setimageextent|imagick_setimagefilename|imagick_setimageformat|imagick_setimagegamma|imagick_setimagegravity|' +
        'imagick_setimagegreenprimary|imagick_setimageindex|imagick_setimageinterlacescheme|imagick_setimageinterpolatemethod|' +
        'imagick_setimageiterations|imagick_setimagematte|imagick_setimagemattecolor|imagick_setimageopacity|imagick_setimageorientation|' +
        'imagick_setimagepage|imagick_setimageprofile|imagick_setimageproperty|imagick_setimageredprimary|imagick_setimagerenderingintent|' +
        'imagick_setimageresolution|imagick_setimagescene|imagick_setimagetickspersecond|imagick_setimagetype|imagick_setimageunits|' +
        'imagick_setimagevirtualpixelmethod|imagick_setimagewhitepoint|imagick_setinterlacescheme|imagick_setiteratorindex|imagick_setlastiterator|' +
        'imagick_setoption|imagick_setpage|imagick_setpointsize|imagick_setresolution|imagick_setresourcelimit|imagick_setsamplingfactors|' +
        'imagick_setsize|imagick_setsizeoffset|imagick_settype|imagick_shadeimage|imagick_shadowimage|imagick_sharpenimage|imagick_shaveimage|' +
        'imagick_shearimage|imagick_sigmoidalcontrastimage|imagick_sketchimage|imagick_solarizeimage|imagick_spliceimage|imagick_spreadimage|' +
        'imagick_steganoimage|imagick_stereoimage|imagick_stripimage|imagick_swirlimage|imagick_textureimage|imagick_thresholdimage|' +
        'imagick_thumbnailimage|imagick_tintimage|imagick_transformimage|imagick_transparentpaintimage|imagick_transposeimage|' +
        'imagick_transverseimage|imagick_trimimage|imagick_uniqueimagecolors|imagick_unsharpmaskimage|imagick_valid|imagick_vignetteimage|' +
        'imagick_waveimage|imagick_whitethresholdimage|imagick_writeimage|imagick_writeimagefile|imagick_writeimages|imagick_writeimagesfile|' +
        'imagickdraw|imagickdraw_affine|imagickdraw_annotation|imagickdraw_arc|imagickdraw_bezier|imagickdraw_circle|imagickdraw_clear|' +
        'imagickdraw_clone|imagickdraw_color|imagickdraw_comment|imagickdraw_composite|imagickdraw_construct|imagickdraw_destroy|' +
        'imagickdraw_ellipse|imagickdraw_getclippath|imagickdraw_getcliprule|imagickdraw_getclipunits|imagickdraw_getfillcolor|' +
        'imagickdraw_getfillopacity|imagickdraw_getfillrule|imagickdraw_getfont|imagickdraw_getfontfamily|imagickdraw_getfontsize|' +
        'imagickdraw_getfontstyle|imagickdraw_getfontweight|imagickdraw_getgravity|imagickdraw_getstrokeantialias|imagickdraw_getstrokecolor|' +
        'imagickdraw_getstrokedasharray|imagickdraw_getstrokedashoffset|imagickdraw_getstrokelinecap|imagickdraw_getstrokelinejoin|' +
        'imagickdraw_getstrokemiterlimit|imagickdraw_getstrokeopacity|imagickdraw_getstrokewidth|imagickdraw_gettextalignment|' +
        'imagickdraw_gettextantialias|imagickdraw_gettextdecoration|imagickdraw_gettextencoding|imagickdraw_gettextundercolor|' +
        'imagickdraw_getvectorgraphics|imagickdraw_line|imagickdraw_matte|imagickdraw_pathclose|imagickdraw_pathcurvetoabsolute|' +
        'imagickdraw_pathcurvetoquadraticbezierabsolute|imagickdraw_pathcurvetoquadraticbezierrelative|' +
        'imagickdraw_pathcurvetoquadraticbeziersmoothabsolute|imagickdraw_pathcurvetoquadraticbeziersmoothrelative|imagickdraw_pathcurvetorelative|' +
        'imagickdraw_pathcurvetosmoothabsolute|imagickdraw_pathcurvetosmoothrelative|imagickdraw_pathellipticarcabsolute|' +
        'imagickdraw_pathellipticarcrelative|imagickdraw_pathfinish|imagickdraw_pathlinetoabsolute|imagickdraw_pathlinetohorizontalabsolute|' +
        'imagickdraw_pathlinetohorizontalrelative|imagickdraw_pathlinetorelative|imagickdraw_pathlinetoverticalabsolute|' +
        'imagickdraw_pathlinetoverticalrelative|imagickdraw_pathmovetoabsolute|imagickdraw_pathmovetorelative|imagickdraw_pathstart|' +
        'imagickdraw_point|imagickdraw_polygon|imagickdraw_polyline|imagickdraw_pop|imagickdraw_popclippath|imagickdraw_popdefs|' +
        'imagickdraw_poppattern|imagickdraw_push|imagickdraw_pushclippath|imagickdraw_pushdefs|imagickdraw_pushpattern|imagickdraw_rectangle|' +
        'imagickdraw_render|imagickdraw_rotate|imagickdraw_roundrectangle|imagickdraw_scale|imagickdraw_setclippath|imagickdraw_setcliprule|' +
        'imagickdraw_setclipunits|imagickdraw_setfillalpha|imagickdraw_setfillcolor|imagickdraw_setfillopacity|imagickdraw_setfillpatternurl|' +
        'imagickdraw_setfillrule|imagickdraw_setfont|imagickdraw_setfontfamily|imagickdraw_setfontsize|imagickdraw_setfontstretch|' +
        'imagickdraw_setfontstyle|imagickdraw_setfontweight|imagickdraw_setgravity|imagickdraw_setstrokealpha|imagickdraw_setstrokeantialias|' +
        'imagickdraw_setstrokecolor|imagickdraw_setstrokedasharray|imagickdraw_setstrokedashoffset|imagickdraw_setstrokelinecap|' +
        'imagickdraw_setstrokelinejoin|imagickdraw_setstrokemiterlimit|imagickdraw_setstrokeopacity|imagickdraw_setstrokepatternurl|' +
        'imagickdraw_setstrokewidth|imagickdraw_settextalignment|imagickdraw_settextantialias|imagickdraw_settextdecoration|' +
        'imagickdraw_settextencoding|imagickdraw_settextundercolor|imagickdraw_setvectorgraphics|imagickdraw_setviewbox|imagickdraw_skewx|' +
        'imagickdraw_skewy|imagickdraw_translate|imagickpixel|imagickpixel_clear|imagickpixel_construct|imagickpixel_destroy|imagickpixel_getcolor|' +
        'imagickpixel_getcolorasstring|imagickpixel_getcolorcount|imagickpixel_getcolorvalue|imagickpixel_gethsl|imagickpixel_issimilar|' +
        'imagickpixel_setcolor|imagickpixel_setcolorvalue|imagickpixel_sethsl|imagickpixeliterator|imagickpixeliterator_clear|' +
        'imagickpixeliterator_construct|imagickpixeliterator_destroy|imagickpixeliterator_getcurrentiteratorrow|' +
        'imagickpixeliterator_getiteratorrow|imagickpixeliterator_getnextiteratorrow|imagickpixeliterator_getpreviousiteratorrow|' +
        'imagickpixeliterator_newpixeliterator|imagickpixeliterator_newpixelregioniterator|imagickpixeliterator_resetiterator|' +
        'imagickpixeliterator_setiteratorfirstrow|imagickpixeliterator_setiteratorlastrow|imagickpixeliterator_setiteratorrow|' +
        'imagickpixeliterator_synciterator|imap_8bit|imap_alerts|imap_append|imap_base64|imap_binary|imap_body|imap_bodystruct|imap_check|' +
        'imap_clearflag_full|imap_close|imap_create|imap_createmailbox|imap_delete|imap_deletemailbox|imap_errors|imap_expunge|imap_fetch_overview|' +
        'imap_fetchbody|imap_fetchheader|imap_fetchmime|imap_fetchstructure|imap_fetchtext|imap_gc|imap_get_quota|imap_get_quotaroot|imap_getacl|' +
        'imap_getmailboxes|imap_getsubscribed|imap_header|imap_headerinfo|imap_headers|imap_last_error|imap_list|imap_listmailbox|imap_listscan|' +
        'imap_listsubscribed|imap_lsub|imap_mail|imap_mail_compose|imap_mail_copy|imap_mail_move|imap_mailboxmsginfo|imap_mime_header_decode|' +
        'imap_msgno|imap_num_msg|imap_num_recent|imap_open|imap_ping|imap_qprint|imap_rename|imap_renamemailbox|imap_reopen|' +
        'imap_rfc822_parse_adrlist|imap_rfc822_parse_headers|imap_rfc822_write_address|imap_savebody|imap_scan|imap_scanmailbox|imap_search|' +
        'imap_set_quota|imap_setacl|imap_setflag_full|imap_sort|imap_status|imap_subscribe|imap_thread|imap_timeout|imap_uid|imap_undelete|' +
        'imap_unsubscribe|imap_utf7_decode|imap_utf7_encode|imap_utf8|implementsinterface|implode|import_request_variables|in_array|include|' +
        'include_once|inclued_get_data|inet_ntop|inet_pton|infiniteiterator|ingres_autocommit|ingres_autocommit_state|ingres_charset|ingres_close|' +
        'ingres_commit|ingres_connect|ingres_cursor|ingres_errno|ingres_error|ingres_errsqlstate|ingres_escape_string|ingres_execute|' +
        'ingres_fetch_array|ingres_fetch_assoc|ingres_fetch_object|ingres_fetch_proc_return|ingres_fetch_row|ingres_field_length|ingres_field_name|' +
        'ingres_field_nullable|ingres_field_precision|ingres_field_scale|ingres_field_type|ingres_free_result|ingres_next_error|ingres_num_fields|' +
        'ingres_num_rows|ingres_pconnect|ingres_prepare|ingres_query|ingres_result_seek|ingres_rollback|ingres_set_environment|' +
        'ingres_unbuffered_query|ini_alter|ini_get|ini_get_all|ini_restore|ini_set|innamespace|inotify_add_watch|inotify_init|inotify_queue_len|' +
        'inotify_read|inotify_rm_watch|interface_exists|intl_error_name|intl_get_error_code|intl_get_error_message|intl_is_failure|' +
        'intldateformatter|intval|invalidargumentexception|invoke|invokeargs|ip2long|iptcembed|iptcparse|is_a|is_array|is_bool|is_callable|is_dir|' +
        'is_double|is_executable|is_file|is_finite|is_float|is_infinite|is_int|is_integer|is_link|is_long|is_nan|is_null|is_numeric|is_object|' +
        'is_readable|is_real|is_resource|is_scalar|is_soap_fault|is_string|is_subclass_of|is_uploaded_file|is_writable|is_writeable|isabstract|' +
        'iscloneable|isdisabled|isfinal|isinstance|isinstantiable|isinterface|isinternal|isiterateable|isset|issubclassof|isuserdefined|iterator|' +
        'iterator_apply|iterator_count|iterator_to_array|iteratoraggregate|iteratoriterator|java_last_exception_clear|java_last_exception_get|' +
        'jddayofweek|jdmonthname|jdtofrench|jdtogregorian|jdtojewish|jdtojulian|jdtounix|jewishtojd|join|jpeg2wbmp|json_decode|json_encode|' +
        'json_last_error|jsonserializable|judy|judy_type|judy_version|juliantojd|kadm5_chpass_principal|kadm5_create_principal|' +
        'kadm5_delete_principal|kadm5_destroy|kadm5_flush|kadm5_get_policies|kadm5_get_principal|kadm5_get_principals|kadm5_init_with_password|' +
        'kadm5_modify_principal|key|krsort|ksort|lcfirst|lcg_value|lchgrp|lchown|ldap_8859_to_t61|ldap_add|ldap_bind|ldap_close|ldap_compare|' +
        'ldap_connect|ldap_count_entries|ldap_delete|ldap_dn2ufn|ldap_err2str|ldap_errno|ldap_error|ldap_explode_dn|ldap_first_attribute|' +
        'ldap_first_entry|ldap_first_reference|ldap_free_result|ldap_get_attributes|ldap_get_dn|ldap_get_entries|ldap_get_option|ldap_get_values|' +
        'ldap_get_values_len|ldap_list|ldap_mod_add|ldap_mod_del|ldap_mod_replace|ldap_modify|ldap_next_attribute|ldap_next_entry|' +
        'ldap_next_reference|ldap_parse_reference|ldap_parse_result|ldap_read|ldap_rename|ldap_sasl_bind|ldap_search|ldap_set_option|' +
        'ldap_set_rebind_proc|ldap_sort|ldap_start_tls|ldap_t61_to_8859|ldap_unbind|lengthexception|levenshtein|libxml_clear_errors|' +
        'libxml_disable_entity_loader|libxml_get_errors|libxml_get_last_error|libxml_set_streams_context|libxml_use_internal_errors|libxmlerror|' +
        'limititerator|link|linkinfo|list|locale|localeconv|localtime|log|log10|log1p|logicexception|long2ip|lstat|ltrim|lzf_compress|' +
        'lzf_decompress|lzf_optimized_for|m_checkstatus|m_completeauthorizations|m_connect|m_connectionerror|m_deletetrans|m_destroyconn|' +
        'm_destroyengine|m_getcell|m_getcellbynum|m_getcommadelimited|m_getheader|m_initconn|m_initengine|m_iscommadelimited|m_maxconntimeout|' +
        'm_monitor|m_numcolumns|m_numrows|m_parsecommadelimited|m_responsekeys|m_responseparam|m_returnstatus|m_setblocking|m_setdropfile|m_setip|' +
        'm_setssl|m_setssl_cafile|m_setssl_files|m_settimeout|m_sslcert_gen_hash|m_transactionssent|m_transinqueue|m_transkeyval|m_transnew|' +
        'm_transsend|m_uwait|m_validateidentifier|m_verifyconnection|m_verifysslcert|magic_quotes_runtime|mail|' +
        'mailparse_determine_best_xfer_encoding|mailparse_msg_create|mailparse_msg_extract_part|mailparse_msg_extract_part_file|' +
        'mailparse_msg_extract_whole_part_file|mailparse_msg_free|mailparse_msg_get_part|mailparse_msg_get_part_data|mailparse_msg_get_structure|' +
        'mailparse_msg_parse|mailparse_msg_parse_file|mailparse_rfc822_parse_addresses|mailparse_stream_encode|mailparse_uudecode_all|main|max|' +
        'maxdb_affected_rows|maxdb_autocommit|maxdb_bind_param|maxdb_bind_result|maxdb_change_user|maxdb_character_set_name|maxdb_client_encoding|' +
        'maxdb_close|maxdb_close_long_data|maxdb_commit|maxdb_connect|maxdb_connect_errno|maxdb_connect_error|maxdb_data_seek|maxdb_debug|' +
        'maxdb_disable_reads_from_master|maxdb_disable_rpl_parse|maxdb_dump_debug_info|maxdb_embedded_connect|maxdb_enable_reads_from_master|' +
        'maxdb_enable_rpl_parse|maxdb_errno|maxdb_error|maxdb_escape_string|maxdb_execute|maxdb_fetch|maxdb_fetch_array|maxdb_fetch_assoc|' +
        'maxdb_fetch_field|maxdb_fetch_field_direct|maxdb_fetch_fields|maxdb_fetch_lengths|maxdb_fetch_object|maxdb_fetch_row|maxdb_field_count|' +
        'maxdb_field_seek|maxdb_field_tell|maxdb_free_result|maxdb_get_client_info|maxdb_get_client_version|maxdb_get_host_info|maxdb_get_metadata|' +
        'maxdb_get_proto_info|maxdb_get_server_info|maxdb_get_server_version|maxdb_info|maxdb_init|maxdb_insert_id|maxdb_kill|maxdb_master_query|' +
        'maxdb_more_results|maxdb_multi_query|maxdb_next_result|maxdb_num_fields|maxdb_num_rows|maxdb_options|maxdb_param_count|maxdb_ping|' +
        'maxdb_prepare|maxdb_query|maxdb_real_connect|maxdb_real_escape_string|maxdb_real_query|maxdb_report|maxdb_rollback|' +
        'maxdb_rpl_parse_enabled|maxdb_rpl_probe|maxdb_rpl_query_type|maxdb_select_db|maxdb_send_long_data|maxdb_send_query|maxdb_server_end|' +
        'maxdb_server_init|maxdb_set_opt|maxdb_sqlstate|maxdb_ssl_set|maxdb_stat|maxdb_stmt_affected_rows|maxdb_stmt_bind_param|' +
        'maxdb_stmt_bind_result|maxdb_stmt_close|maxdb_stmt_close_long_data|maxdb_stmt_data_seek|maxdb_stmt_errno|maxdb_stmt_error|' +
        'maxdb_stmt_execute|maxdb_stmt_fetch|maxdb_stmt_free_result|maxdb_stmt_init|maxdb_stmt_num_rows|maxdb_stmt_param_count|maxdb_stmt_prepare|' +
        'maxdb_stmt_reset|maxdb_stmt_result_metadata|maxdb_stmt_send_long_data|maxdb_stmt_sqlstate|maxdb_stmt_store_result|maxdb_store_result|' +
        'maxdb_thread_id|maxdb_thread_safe|maxdb_use_result|maxdb_warning_count|mb_check_encoding|mb_convert_case|mb_convert_encoding|' +
        'mb_convert_kana|mb_convert_variables|mb_decode_mimeheader|mb_decode_numericentity|mb_detect_encoding|mb_detect_order|mb_encode_mimeheader|' +
        'mb_encode_numericentity|mb_encoding_aliases|mb_ereg|mb_ereg_match|mb_ereg_replace|mb_ereg_search|mb_ereg_search_getpos|' +
        'mb_ereg_search_getregs|mb_ereg_search_init|mb_ereg_search_pos|mb_ereg_search_regs|mb_ereg_search_setpos|mb_eregi|mb_eregi_replace|' +
        'mb_get_info|mb_http_input|mb_http_output|mb_internal_encoding|mb_language|mb_list_encodings|mb_output_handler|mb_parse_str|' +
        'mb_preferred_mime_name|mb_regex_encoding|mb_regex_set_options|mb_send_mail|mb_split|mb_strcut|mb_strimwidth|mb_stripos|mb_stristr|' +
        'mb_strlen|mb_strpos|mb_strrchr|mb_strrichr|mb_strripos|mb_strrpos|mb_strstr|mb_strtolower|mb_strtoupper|mb_strwidth|' +
        'mb_substitute_character|mb_substr|mb_substr_count|mcrypt_cbc|mcrypt_cfb|mcrypt_create_iv|mcrypt_decrypt|mcrypt_ecb|' +
        'mcrypt_enc_get_algorithms_name|mcrypt_enc_get_block_size|mcrypt_enc_get_iv_size|mcrypt_enc_get_key_size|mcrypt_enc_get_modes_name|' +
        'mcrypt_enc_get_supported_key_sizes|mcrypt_enc_is_block_algorithm|mcrypt_enc_is_block_algorithm_mode|mcrypt_enc_is_block_mode|' +
        'mcrypt_enc_self_test|mcrypt_encrypt|mcrypt_generic|mcrypt_generic_deinit|mcrypt_generic_end|mcrypt_generic_init|mcrypt_get_block_size|' +
        'mcrypt_get_cipher_name|mcrypt_get_iv_size|mcrypt_get_key_size|mcrypt_list_algorithms|mcrypt_list_modes|mcrypt_module_close|' +
        'mcrypt_module_get_algo_block_size|mcrypt_module_get_algo_key_size|mcrypt_module_get_supported_key_sizes|mcrypt_module_is_block_algorithm|' +
        'mcrypt_module_is_block_algorithm_mode|mcrypt_module_is_block_mode|mcrypt_module_open|mcrypt_module_self_test|mcrypt_ofb|md5|md5_file|' +
        'mdecrypt_generic|memcache|memcache_debug|memcached|memory_get_peak_usage|memory_get_usage|messageformatter|metaphone|method_exists|mhash|' +
        'mhash_count|mhash_get_block_size|mhash_get_hash_name|mhash_keygen_s2k|microtime|mime_content_type|min|ming_keypress|' +
        'ming_setcubicthreshold|ming_setscale|ming_setswfcompression|ming_useconstants|ming_useswfversion|mkdir|mktime|money_format|mongo|' +
        'mongobindata|mongocode|mongocollection|mongoconnectionexception|mongocursor|mongocursorexception|mongocursortimeoutexception|mongodate|' +
        'mongodb|mongodbref|mongoexception|mongogridfs|mongogridfscursor|mongogridfsexception|mongogridfsfile|mongoid|mongoint32|mongoint64|' +
        'mongomaxkey|mongominkey|mongoregex|mongotimestamp|move_uploaded_file|mpegfile|mqseries_back|mqseries_begin|mqseries_close|mqseries_cmit|' +
        'mqseries_conn|mqseries_connx|mqseries_disc|mqseries_get|mqseries_inq|mqseries_open|mqseries_put|mqseries_put1|mqseries_set|' +
        'mqseries_strerror|msession_connect|msession_count|msession_create|msession_destroy|msession_disconnect|msession_find|msession_get|' +
        'msession_get_array|msession_get_data|msession_inc|msession_list|msession_listvar|msession_lock|msession_plugin|msession_randstr|' +
        'msession_set|msession_set_array|msession_set_data|msession_timeout|msession_uniq|msession_unlock|msg_get_queue|msg_queue_exists|' +
        'msg_receive|msg_remove_queue|msg_send|msg_set_queue|msg_stat_queue|msql|msql_affected_rows|msql_close|msql_connect|msql_create_db|' +
        'msql_createdb|msql_data_seek|msql_db_query|msql_dbname|msql_drop_db|msql_error|msql_fetch_array|msql_fetch_field|msql_fetch_object|' +
        'msql_fetch_row|msql_field_flags|msql_field_len|msql_field_name|msql_field_seek|msql_field_table|msql_field_type|msql_fieldflags|' +
        'msql_fieldlen|msql_fieldname|msql_fieldtable|msql_fieldtype|msql_free_result|msql_list_dbs|msql_list_fields|msql_list_tables|' +
        'msql_num_fields|msql_num_rows|msql_numfields|msql_numrows|msql_pconnect|msql_query|msql_regcase|msql_result|msql_select_db|msql_tablename|' +
        'mssql_bind|mssql_close|mssql_connect|mssql_data_seek|mssql_execute|mssql_fetch_array|mssql_fetch_assoc|mssql_fetch_batch|' +
        'mssql_fetch_field|mssql_fetch_object|mssql_fetch_row|mssql_field_length|mssql_field_name|mssql_field_seek|mssql_field_type|' +
        'mssql_free_result|mssql_free_statement|mssql_get_last_message|mssql_guid_string|mssql_init|mssql_min_error_severity|' +
        'mssql_min_message_severity|mssql_next_result|mssql_num_fields|mssql_num_rows|mssql_pconnect|mssql_query|mssql_result|mssql_rows_affected|' +
        'mssql_select_db|mt_getrandmax|mt_rand|mt_srand|multipleiterator|mysql_affected_rows|mysql_client_encoding|mysql_close|mysql_connect|' +
        'mysql_create_db|mysql_data_seek|mysql_db_name|mysql_db_query|mysql_drop_db|mysql_errno|mysql_error|mysql_escape_string|mysql_fetch_array|' +
        'mysql_fetch_assoc|mysql_fetch_field|mysql_fetch_lengths|mysql_fetch_object|mysql_fetch_row|mysql_field_flags|mysql_field_len|' +
        'mysql_field_name|mysql_field_seek|mysql_field_table|mysql_field_type|mysql_free_result|mysql_get_client_info|mysql_get_host_info|' +
        'mysql_get_proto_info|mysql_get_server_info|mysql_info|mysql_insert_id|mysql_list_dbs|mysql_list_fields|mysql_list_processes|' +
        'mysql_list_tables|mysql_num_fields|mysql_num_rows|mysql_pconnect|mysql_ping|mysql_query|mysql_real_escape_string|mysql_result|' +
        'mysql_select_db|mysql_set_charset|mysql_stat|mysql_tablename|mysql_thread_id|mysql_unbuffered_query|mysqli|mysqli_affected_rows|' +
        'mysqli_autocommit|mysqli_bind_param|mysqli_bind_result|mysqli_cache_stats|mysqli_change_user|mysqli_character_set_name|' +
        'mysqli_client_encoding|mysqli_close|mysqli_commit|mysqli_connect|mysqli_connect_errno|mysqli_connect_error|mysqli_data_seek|' +
        'mysqli_debug|mysqli_disable_reads_from_master|mysqli_disable_rpl_parse|mysqli_driver|mysqli_dump_debug_info|mysqli_embedded_server_end|' +
        'mysqli_embedded_server_start|mysqli_enable_reads_from_master|mysqli_enable_rpl_parse|mysqli_errno|mysqli_error|mysqli_escape_string|' +
        'mysqli_execute|mysqli_fetch|mysqli_fetch_all|mysqli_fetch_array|mysqli_fetch_assoc|mysqli_fetch_field|mysqli_fetch_field_direct|' +
        'mysqli_fetch_fields|mysqli_fetch_lengths|mysqli_fetch_object|mysqli_fetch_row|mysqli_field_count|mysqli_field_seek|mysqli_field_tell|' +
        'mysqli_free_result|mysqli_get_charset|mysqli_get_client_info|mysqli_get_client_stats|mysqli_get_client_version|mysqli_get_connection_stats|' +
        'mysqli_get_host_info|mysqli_get_metadata|mysqli_get_proto_info|mysqli_get_server_info|mysqli_get_server_version|mysqli_get_warnings|' +
        'mysqli_info|mysqli_init|mysqli_insert_id|mysqli_kill|mysqli_link_construct|mysqli_master_query|mysqli_more_results|mysqli_multi_query|' +
        'mysqli_next_result|mysqli_num_fields|mysqli_num_rows|mysqli_options|mysqli_param_count|mysqli_ping|mysqli_poll|mysqli_prepare|' +
        'mysqli_query|mysqli_real_connect|mysqli_real_escape_string|mysqli_real_query|mysqli_reap_async_query|mysqli_refresh|mysqli_report|' +
        'mysqli_result|mysqli_rollback|mysqli_rpl_parse_enabled|mysqli_rpl_probe|mysqli_rpl_query_type|mysqli_select_db|mysqli_send_long_data|' +
        'mysqli_send_query|mysqli_set_charset|mysqli_set_local_infile_default|mysqli_set_local_infile_handler|mysqli_set_opt|mysqli_slave_query|' +
        'mysqli_sqlstate|mysqli_ssl_set|mysqli_stat|mysqli_stmt|mysqli_stmt_affected_rows|mysqli_stmt_attr_get|mysqli_stmt_attr_set|' +
        'mysqli_stmt_bind_param|mysqli_stmt_bind_result|mysqli_stmt_close|mysqli_stmt_data_seek|mysqli_stmt_errno|mysqli_stmt_error|' +
        'mysqli_stmt_execute|mysqli_stmt_fetch|mysqli_stmt_field_count|mysqli_stmt_free_result|mysqli_stmt_get_result|mysqli_stmt_get_warnings|' +
        'mysqli_stmt_init|mysqli_stmt_insert_id|mysqli_stmt_next_result|mysqli_stmt_num_rows|mysqli_stmt_param_count|mysqli_stmt_prepare|' +
        'mysqli_stmt_reset|mysqli_stmt_result_metadata|mysqli_stmt_send_long_data|mysqli_stmt_sqlstate|mysqli_stmt_store_result|mysqli_store_result|' +
        'mysqli_thread_id|mysqli_thread_safe|mysqli_use_result|mysqli_warning|mysqli_warning_count|mysqlnd_ms_get_stats|' +
        'mysqlnd_ms_query_is_select|mysqlnd_ms_set_user_pick_server|mysqlnd_qc_change_handler|mysqlnd_qc_clear_cache|mysqlnd_qc_get_cache_info|' +
        'mysqlnd_qc_get_core_stats|mysqlnd_qc_get_handler|mysqlnd_qc_get_query_trace_log|mysqlnd_qc_set_user_handlers|natcasesort|natsort|' +
        'ncurses_addch|ncurses_addchnstr|ncurses_addchstr|ncurses_addnstr|ncurses_addstr|ncurses_assume_default_colors|ncurses_attroff|' +
        'ncurses_attron|ncurses_attrset|ncurses_baudrate|ncurses_beep|ncurses_bkgd|ncurses_bkgdset|ncurses_border|ncurses_bottom_panel|' +
        'ncurses_can_change_color|ncurses_cbreak|ncurses_clear|ncurses_clrtobot|ncurses_clrtoeol|ncurses_color_content|ncurses_color_set|' +
        'ncurses_curs_set|ncurses_def_prog_mode|ncurses_def_shell_mode|ncurses_define_key|ncurses_del_panel|ncurses_delay_output|ncurses_delch|' +
        'ncurses_deleteln|ncurses_delwin|ncurses_doupdate|ncurses_echo|ncurses_echochar|ncurses_end|ncurses_erase|ncurses_erasechar|ncurses_filter|' +
        'ncurses_flash|ncurses_flushinp|ncurses_getch|ncurses_getmaxyx|ncurses_getmouse|ncurses_getyx|ncurses_halfdelay|ncurses_has_colors|' +
        'ncurses_has_ic|ncurses_has_il|ncurses_has_key|ncurses_hide_panel|ncurses_hline|ncurses_inch|ncurses_init|ncurses_init_color|' +
        'ncurses_init_pair|ncurses_insch|ncurses_insdelln|ncurses_insertln|ncurses_insstr|ncurses_instr|ncurses_isendwin|ncurses_keyok|' +
        'ncurses_keypad|ncurses_killchar|ncurses_longname|ncurses_meta|ncurses_mouse_trafo|ncurses_mouseinterval|ncurses_mousemask|ncurses_move|' +
        'ncurses_move_panel|ncurses_mvaddch|ncurses_mvaddchnstr|ncurses_mvaddchstr|ncurses_mvaddnstr|ncurses_mvaddstr|ncurses_mvcur|' +
        'ncurses_mvdelch|ncurses_mvgetch|ncurses_mvhline|ncurses_mvinch|ncurses_mvvline|ncurses_mvwaddstr|ncurses_napms|ncurses_new_panel|' +
        'ncurses_newpad|ncurses_newwin|ncurses_nl|ncurses_nocbreak|ncurses_noecho|ncurses_nonl|ncurses_noqiflush|ncurses_noraw|' +
        'ncurses_pair_content|ncurses_panel_above|ncurses_panel_below|ncurses_panel_window|ncurses_pnoutrefresh|ncurses_prefresh|ncurses_putp|' +
        'ncurses_qiflush|ncurses_raw|ncurses_refresh|ncurses_replace_panel|ncurses_reset_prog_mode|ncurses_reset_shell_mode|ncurses_resetty|' +
        'ncurses_savetty|ncurses_scr_dump|ncurses_scr_init|ncurses_scr_restore|ncurses_scr_set|ncurses_scrl|ncurses_show_panel|ncurses_slk_attr|' +
        'ncurses_slk_attroff|ncurses_slk_attron|ncurses_slk_attrset|ncurses_slk_clear|ncurses_slk_color|ncurses_slk_init|ncurses_slk_noutrefresh|' +
        'ncurses_slk_refresh|ncurses_slk_restore|ncurses_slk_set|ncurses_slk_touch|ncurses_standend|ncurses_standout|ncurses_start_color|' +
        'ncurses_termattrs|ncurses_termname|ncurses_timeout|ncurses_top_panel|ncurses_typeahead|ncurses_ungetch|ncurses_ungetmouse|' +
        'ncurses_update_panels|ncurses_use_default_colors|ncurses_use_env|ncurses_use_extended_names|ncurses_vidattr|ncurses_vline|ncurses_waddch|' +
        'ncurses_waddstr|ncurses_wattroff|ncurses_wattron|ncurses_wattrset|ncurses_wborder|ncurses_wclear|ncurses_wcolor_set|ncurses_werase|' +
        'ncurses_wgetch|ncurses_whline|ncurses_wmouse_trafo|ncurses_wmove|ncurses_wnoutrefresh|ncurses_wrefresh|ncurses_wstandend|' +
        'ncurses_wstandout|ncurses_wvline|newinstance|newinstanceargs|newt_bell|newt_button|newt_button_bar|newt_centered_window|newt_checkbox|' +
        'newt_checkbox_get_value|newt_checkbox_set_flags|newt_checkbox_set_value|newt_checkbox_tree|newt_checkbox_tree_add_item|' +
        'newt_checkbox_tree_find_item|newt_checkbox_tree_get_current|newt_checkbox_tree_get_entry_value|newt_checkbox_tree_get_multi_selection|' +
        'newt_checkbox_tree_get_selection|newt_checkbox_tree_multi|newt_checkbox_tree_set_current|newt_checkbox_tree_set_entry|' +
        'newt_checkbox_tree_set_entry_value|newt_checkbox_tree_set_width|newt_clear_key_buffer|newt_cls|newt_compact_button|' +
        'newt_component_add_callback|newt_component_takes_focus|newt_create_grid|newt_cursor_off|newt_cursor_on|newt_delay|newt_draw_form|' +
        'newt_draw_root_text|newt_entry|newt_entry_get_value|newt_entry_set|newt_entry_set_filter|newt_entry_set_flags|newt_finished|newt_form|' +
        'newt_form_add_component|newt_form_add_components|newt_form_add_hot_key|newt_form_destroy|newt_form_get_current|newt_form_run|' +
        'newt_form_set_background|newt_form_set_height|newt_form_set_size|newt_form_set_timer|newt_form_set_width|newt_form_watch_fd|' +
        'newt_get_screen_size|newt_grid_add_components_to_form|newt_grid_basic_window|newt_grid_free|newt_grid_get_size|newt_grid_h_close_stacked|' +
        'newt_grid_h_stacked|newt_grid_place|newt_grid_set_field|newt_grid_simple_window|newt_grid_v_close_stacked|newt_grid_v_stacked|' +
        'newt_grid_wrapped_window|newt_grid_wrapped_window_at|newt_init|newt_label|newt_label_set_text|newt_listbox|newt_listbox_append_entry|' +
        'newt_listbox_clear|newt_listbox_clear_selection|newt_listbox_delete_entry|newt_listbox_get_current|newt_listbox_get_selection|' +
        'newt_listbox_insert_entry|newt_listbox_item_count|newt_listbox_select_item|newt_listbox_set_current|newt_listbox_set_current_by_key|' +
        'newt_listbox_set_data|newt_listbox_set_entry|newt_listbox_set_width|newt_listitem|newt_listitem_get_data|newt_listitem_set|' +
        'newt_open_window|newt_pop_help_line|newt_pop_window|newt_push_help_line|newt_radio_get_current|newt_radiobutton|newt_redraw_help_line|' +
        'newt_reflow_text|newt_refresh|newt_resize_screen|newt_resume|newt_run_form|newt_scale|newt_scale_set|newt_scrollbar_set|' +
        'newt_set_help_callback|newt_set_suspend_callback|newt_suspend|newt_textbox|newt_textbox_get_num_lines|newt_textbox_reflowed|' +
        'newt_textbox_set_height|newt_textbox_set_text|newt_vertical_scrollbar|newt_wait_for_key|newt_win_choice|newt_win_entries|newt_win_menu|' +
        'newt_win_message|newt_win_messagev|newt_win_ternary|next|ngettext|nl2br|nl_langinfo|norewinditerator|normalizer|notes_body|notes_copy_db|' +
        'notes_create_db|notes_create_note|notes_drop_db|notes_find_note|notes_header_info|notes_list_msgs|notes_mark_read|notes_mark_unread|' +
        'notes_nav_create|notes_search|notes_unread|notes_version|nsapi_request_headers|nsapi_response_headers|nsapi_virtual|nthmac|number_format|' +
        'numberformatter|oauth|oauth_get_sbs|oauth_urlencode|oauthexception|oauthprovider|ob_clean|ob_deflatehandler|ob_end_clean|ob_end_flush|' +
        'ob_etaghandler|ob_flush|ob_get_clean|ob_get_contents|ob_get_flush|ob_get_length|ob_get_level|ob_get_status|ob_gzhandler|ob_iconv_handler|' +
        'ob_implicit_flush|ob_inflatehandler|ob_list_handlers|ob_start|ob_tidyhandler|oci_bind_array_by_name|oci_bind_by_name|oci_cancel|' +
        'oci_client_version|oci_close|oci_collection_append|oci_collection_assign|oci_collection_element_assign|oci_collection_element_get|' +
        'oci_collection_free|oci_collection_max|oci_collection_size|oci_collection_trim|oci_commit|oci_connect|oci_define_by_name|oci_error|' +
        'oci_execute|oci_fetch|oci_fetch_all|oci_fetch_array|oci_fetch_assoc|oci_fetch_object|oci_fetch_row|oci_field_is_null|oci_field_name|' +
        'oci_field_precision|oci_field_scale|oci_field_size|oci_field_type|oci_field_type_raw|oci_free_statement|oci_internal_debug|oci_lob_append|' +
        'oci_lob_close|oci_lob_copy|oci_lob_eof|oci_lob_erase|oci_lob_export|oci_lob_flush|oci_lob_free|oci_lob_getbuffering|oci_lob_import|' +
        'oci_lob_is_equal|oci_lob_load|oci_lob_read|oci_lob_rewind|oci_lob_save|oci_lob_savefile|oci_lob_seek|oci_lob_setbuffering|oci_lob_size|' +
        'oci_lob_tell|oci_lob_truncate|oci_lob_write|oci_lob_writetemporary|oci_lob_writetofile|oci_new_collection|oci_new_connect|oci_new_cursor|' +
        'oci_new_descriptor|oci_num_fields|oci_num_rows|oci_parse|oci_password_change|oci_pconnect|oci_result|oci_rollback|oci_server_version|' +
        'oci_set_action|oci_set_client_identifier|oci_set_client_info|oci_set_edition|oci_set_module_name|oci_set_prefetch|oci_statement_type|' +
        'ocibindbyname|ocicancel|ocicloselob|ocicollappend|ocicollassign|ocicollassignelem|ocicollgetelem|ocicollmax|ocicollsize|ocicolltrim|' +
        'ocicolumnisnull|ocicolumnname|ocicolumnprecision|ocicolumnscale|ocicolumnsize|ocicolumntype|ocicolumntyperaw|ocicommit|ocidefinebyname|' +
        'ocierror|ociexecute|ocifetch|ocifetchinto|ocifetchstatement|ocifreecollection|ocifreecursor|ocifreedesc|ocifreestatement|ociinternaldebug|' +
        'ociloadlob|ocilogoff|ocilogon|ocinewcollection|ocinewcursor|ocinewdescriptor|ocinlogon|ocinumcols|ociparse|ociplogon|ociresult|' +
        'ocirollback|ocirowcount|ocisavelob|ocisavelobfile|ociserverversion|ocisetprefetch|ocistatementtype|ociwritelobtofile|ociwritetemporarylob|' +
        'octdec|odbc_autocommit|odbc_binmode|odbc_close|odbc_close_all|odbc_columnprivileges|odbc_columns|odbc_commit|odbc_connect|odbc_cursor|' +
        'odbc_data_source|odbc_do|odbc_error|odbc_errormsg|odbc_exec|odbc_execute|odbc_fetch_array|odbc_fetch_into|odbc_fetch_object|' +
        'odbc_fetch_row|odbc_field_len|odbc_field_name|odbc_field_num|odbc_field_precision|odbc_field_scale|odbc_field_type|odbc_foreignkeys|' +
        'odbc_free_result|odbc_gettypeinfo|odbc_longreadlen|odbc_next_result|odbc_num_fields|odbc_num_rows|odbc_pconnect|odbc_prepare|' +
        'odbc_primarykeys|odbc_procedurecolumns|odbc_procedures|odbc_result|odbc_result_all|odbc_rollback|odbc_setoption|odbc_specialcolumns|' +
        'odbc_statistics|odbc_tableprivileges|odbc_tables|openal_buffer_create|openal_buffer_data|openal_buffer_destroy|openal_buffer_get|' +
        'openal_buffer_loadwav|openal_context_create|openal_context_current|openal_context_destroy|openal_context_process|openal_context_suspend|' +
        'openal_device_close|openal_device_open|openal_listener_get|openal_listener_set|openal_source_create|openal_source_destroy|' +
        'openal_source_get|openal_source_pause|openal_source_play|openal_source_rewind|openal_source_set|openal_source_stop|openal_stream|opendir|' +
        'openlog|openssl_cipher_iv_length|openssl_csr_export|openssl_csr_export_to_file|openssl_csr_get_public_key|openssl_csr_get_subject|' +
        'openssl_csr_new|openssl_csr_sign|openssl_decrypt|openssl_dh_compute_key|openssl_digest|openssl_encrypt|openssl_error_string|' +
        'openssl_free_key|openssl_get_cipher_methods|openssl_get_md_methods|openssl_get_privatekey|openssl_get_publickey|openssl_open|' +
        'openssl_pkcs12_export|openssl_pkcs12_export_to_file|openssl_pkcs12_read|openssl_pkcs7_decrypt|openssl_pkcs7_encrypt|openssl_pkcs7_sign|' +
        'openssl_pkcs7_verify|openssl_pkey_export|openssl_pkey_export_to_file|openssl_pkey_free|openssl_pkey_get_details|openssl_pkey_get_private|' +
        'openssl_pkey_get_public|openssl_pkey_new|openssl_private_decrypt|openssl_private_encrypt|openssl_public_decrypt|openssl_public_encrypt|' +
        'openssl_random_pseudo_bytes|openssl_seal|openssl_sign|openssl_verify|openssl_x509_check_private_key|openssl_x509_checkpurpose|' +
        'openssl_x509_export|openssl_x509_export_to_file|openssl_x509_free|openssl_x509_parse|openssl_x509_read|ord|outeriterator|' +
        'outofboundsexception|outofrangeexception|output_add_rewrite_var|output_reset_rewrite_vars|overflowexception|overload|override_function|' +
        'ovrimos_close|ovrimos_commit|ovrimos_connect|ovrimos_cursor|ovrimos_exec|ovrimos_execute|ovrimos_fetch_into|ovrimos_fetch_row|' +
        'ovrimos_field_len|ovrimos_field_name|ovrimos_field_num|ovrimos_field_type|ovrimos_free_result|ovrimos_longreadlen|ovrimos_num_fields|' +
        'ovrimos_num_rows|ovrimos_prepare|ovrimos_result|ovrimos_result_all|ovrimos_rollback|pack|parentiterator|parse_ini_file|parse_ini_string|' +
        'parse_str|parse_url|parsekit_compile_file|parsekit_compile_string|parsekit_func_arginfo|passthru|pathinfo|pclose|pcntl_alarm|pcntl_exec|' +
        'pcntl_fork|pcntl_getpriority|pcntl_setpriority|pcntl_signal|pcntl_signal_dispatch|pcntl_sigprocmask|pcntl_sigtimedwait|pcntl_sigwaitinfo|' +
        'pcntl_wait|pcntl_waitpid|pcntl_wexitstatus|pcntl_wifexited|pcntl_wifsignaled|pcntl_wifstopped|pcntl_wstopsig|pcntl_wtermsig|' +
        'pdf_activate_item|pdf_add_annotation|pdf_add_bookmark|pdf_add_launchlink|pdf_add_locallink|pdf_add_nameddest|pdf_add_note|pdf_add_outline|' +
        'pdf_add_pdflink|pdf_add_table_cell|pdf_add_textflow|pdf_add_thumbnail|pdf_add_weblink|pdf_arc|pdf_arcn|pdf_attach_file|pdf_begin_document|' +
        'pdf_begin_font|pdf_begin_glyph|pdf_begin_item|pdf_begin_layer|pdf_begin_page|pdf_begin_page_ext|pdf_begin_pattern|pdf_begin_template|' +
        'pdf_begin_template_ext|pdf_circle|pdf_clip|pdf_close|pdf_close_image|pdf_close_pdi|pdf_close_pdi_page|pdf_closepath|' +
        'pdf_closepath_fill_stroke|pdf_closepath_stroke|pdf_concat|pdf_continue_text|pdf_create_3dview|pdf_create_action|pdf_create_annotation|' +
        'pdf_create_bookmark|pdf_create_field|pdf_create_fieldgroup|pdf_create_gstate|pdf_create_pvf|pdf_create_textflow|pdf_curveto|' +
        'pdf_define_layer|pdf_delete|pdf_delete_pvf|pdf_delete_table|pdf_delete_textflow|pdf_encoding_set_char|pdf_end_document|pdf_end_font|' +
        'pdf_end_glyph|pdf_end_item|pdf_end_layer|pdf_end_page|pdf_end_page_ext|pdf_end_pattern|pdf_end_template|pdf_endpath|pdf_fill|' +
        'pdf_fill_imageblock|pdf_fill_pdfblock|pdf_fill_stroke|pdf_fill_textblock|pdf_findfont|pdf_fit_image|pdf_fit_pdi_page|pdf_fit_table|' +
        'pdf_fit_textflow|pdf_fit_textline|pdf_get_apiname|pdf_get_buffer|pdf_get_errmsg|pdf_get_errnum|pdf_get_font|pdf_get_fontname|' +
        'pdf_get_fontsize|pdf_get_image_height|pdf_get_image_width|pdf_get_majorversion|pdf_get_minorversion|pdf_get_parameter|' +
        'pdf_get_pdi_parameter|pdf_get_pdi_value|pdf_get_value|pdf_info_font|pdf_info_matchbox|pdf_info_table|pdf_info_textflow|pdf_info_textline|' +
        'pdf_initgraphics|pdf_lineto|pdf_load_3ddata|pdf_load_font|pdf_load_iccprofile|pdf_load_image|pdf_makespotcolor|pdf_moveto|pdf_new|' +
        'pdf_open_ccitt|pdf_open_file|pdf_open_gif|pdf_open_image|pdf_open_image_file|pdf_open_jpeg|pdf_open_memory_image|pdf_open_pdi|' +
        'pdf_open_pdi_document|pdf_open_pdi_page|pdf_open_tiff|pdf_pcos_get_number|pdf_pcos_get_stream|pdf_pcos_get_string|pdf_place_image|' +
        'pdf_place_pdi_page|pdf_process_pdi|pdf_rect|pdf_restore|pdf_resume_page|pdf_rotate|pdf_save|pdf_scale|pdf_set_border_color|' +
        'pdf_set_border_dash|pdf_set_border_style|pdf_set_char_spacing|pdf_set_duration|pdf_set_gstate|pdf_set_horiz_scaling|pdf_set_info|' +
        'pdf_set_info_author|pdf_set_info_creator|pdf_set_info_keywords|pdf_set_info_subject|pdf_set_info_title|pdf_set_layer_dependency|' +
        'pdf_set_leading|pdf_set_parameter|pdf_set_text_matrix|pdf_set_text_pos|pdf_set_text_rendering|pdf_set_text_rise|pdf_set_value|' +
        'pdf_set_word_spacing|pdf_setcolor|pdf_setdash|pdf_setdashpattern|pdf_setflat|pdf_setfont|pdf_setgray|pdf_setgray_fill|pdf_setgray_stroke|' +
        'pdf_setlinecap|pdf_setlinejoin|pdf_setlinewidth|pdf_setmatrix|pdf_setmiterlimit|pdf_setpolydash|pdf_setrgbcolor|pdf_setrgbcolor_fill|' +
        'pdf_setrgbcolor_stroke|pdf_shading|pdf_shading_pattern|pdf_shfill|pdf_show|pdf_show_boxed|pdf_show_xy|pdf_skew|pdf_stringwidth|pdf_stroke|' +
        'pdf_suspend_page|pdf_translate|pdf_utf16_to_utf8|pdf_utf32_to_utf16|pdf_utf8_to_utf16|pdo|pdo_cubrid_schema|pdo_pgsqllobcreate|' +
        'pdo_pgsqllobopen|pdo_pgsqllobunlink|pdo_sqlitecreateaggregate|pdo_sqlitecreatefunction|pdoexception|pdostatement|pfsockopen|' +
        'pg_affected_rows|pg_cancel_query|pg_client_encoding|pg_close|pg_connect|pg_connection_busy|pg_connection_reset|pg_connection_status|' +
        'pg_convert|pg_copy_from|pg_copy_to|pg_dbname|pg_delete|pg_end_copy|pg_escape_bytea|pg_escape_string|pg_execute|pg_fetch_all|' +
        'pg_fetch_all_columns|pg_fetch_array|pg_fetch_assoc|pg_fetch_object|pg_fetch_result|pg_fetch_row|pg_field_is_null|pg_field_name|' +
        'pg_field_num|pg_field_prtlen|pg_field_size|pg_field_table|pg_field_type|pg_field_type_oid|pg_free_result|pg_get_notify|pg_get_pid|' +
        'pg_get_result|pg_host|pg_insert|pg_last_error|pg_last_notice|pg_last_oid|pg_lo_close|pg_lo_create|pg_lo_export|pg_lo_import|pg_lo_open|' +
        'pg_lo_read|pg_lo_read_all|pg_lo_seek|pg_lo_tell|pg_lo_unlink|pg_lo_write|pg_meta_data|pg_num_fields|pg_num_rows|pg_options|' +
        'pg_parameter_status|pg_pconnect|pg_ping|pg_port|pg_prepare|pg_put_line|pg_query|pg_query_params|pg_result_error|pg_result_error_field|' +
        'pg_result_seek|pg_result_status|pg_select|pg_send_execute|pg_send_prepare|pg_send_query|pg_send_query_params|pg_set_client_encoding|' +
        'pg_set_error_verbosity|pg_trace|pg_transaction_status|pg_tty|pg_unescape_bytea|pg_untrace|pg_update|pg_version|php_check_syntax|' +
        'php_ini_loaded_file|php_ini_scanned_files|php_logo_guid|php_sapi_name|php_strip_whitespace|php_uname|phpcredits|phpinfo|phpversion|pi|' +
        'png2wbmp|popen|pos|posix_access|posix_ctermid|posix_errno|posix_get_last_error|posix_getcwd|posix_getegid|posix_geteuid|posix_getgid|' +
        'posix_getgrgid|posix_getgrnam|posix_getgroups|posix_getlogin|posix_getpgid|posix_getpgrp|posix_getpid|posix_getppid|posix_getpwnam|' +
        'posix_getpwuid|posix_getrlimit|posix_getsid|posix_getuid|posix_initgroups|posix_isatty|posix_kill|posix_mkfifo|posix_mknod|posix_setegid|' +
        'posix_seteuid|posix_setgid|posix_setpgid|posix_setsid|posix_setuid|posix_strerror|posix_times|posix_ttyname|posix_uname|pow|preg_filter|' +
        'preg_grep|preg_last_error|preg_match|preg_match_all|preg_quote|preg_replace|preg_replace_callback|preg_split|prev|print|print_r|' +
        'printer_abort|printer_close|printer_create_brush|printer_create_dc|printer_create_font|printer_create_pen|printer_delete_brush|' +
        'printer_delete_dc|printer_delete_font|printer_delete_pen|printer_draw_bmp|printer_draw_chord|printer_draw_elipse|printer_draw_line|' +
        'printer_draw_pie|printer_draw_rectangle|printer_draw_roundrect|printer_draw_text|printer_end_doc|printer_end_page|printer_get_option|' +
        'printer_list|printer_logical_fontheight|printer_open|printer_select_brush|printer_select_font|printer_select_pen|printer_set_option|' +
        'printer_start_doc|printer_start_page|printer_write|printf|proc_close|proc_get_status|proc_nice|proc_open|proc_terminate|property_exists|' +
        'ps_add_bookmark|ps_add_launchlink|ps_add_locallink|ps_add_note|ps_add_pdflink|ps_add_weblink|ps_arc|ps_arcn|ps_begin_page|' +
        'ps_begin_pattern|ps_begin_template|ps_circle|ps_clip|ps_close|ps_close_image|ps_closepath|ps_closepath_stroke|ps_continue_text|ps_curveto|' +
        'ps_delete|ps_end_page|ps_end_pattern|ps_end_template|ps_fill|ps_fill_stroke|ps_findfont|ps_get_buffer|ps_get_parameter|ps_get_value|' +
        'ps_hyphenate|ps_include_file|ps_lineto|ps_makespotcolor|ps_moveto|ps_new|ps_open_file|ps_open_image|ps_open_image_file|' +
        'ps_open_memory_image|ps_place_image|ps_rect|ps_restore|ps_rotate|ps_save|ps_scale|ps_set_border_color|ps_set_border_dash|' +
        'ps_set_border_style|ps_set_info|ps_set_parameter|ps_set_text_pos|ps_set_value|ps_setcolor|ps_setdash|ps_setflat|ps_setfont|ps_setgray|' +
        'ps_setlinecap|ps_setlinejoin|ps_setlinewidth|ps_setmiterlimit|ps_setoverprintmode|ps_setpolydash|ps_shading|ps_shading_pattern|ps_shfill|' +
        'ps_show|ps_show2|ps_show_boxed|ps_show_xy|ps_show_xy2|ps_string_geometry|ps_stringwidth|ps_stroke|ps_symbol|ps_symbol_name|' +
        'ps_symbol_width|ps_translate|pspell_add_to_personal|pspell_add_to_session|pspell_check|pspell_clear_session|pspell_config_create|' +
        'pspell_config_data_dir|pspell_config_dict_dir|pspell_config_ignore|pspell_config_mode|pspell_config_personal|pspell_config_repl|' +
        'pspell_config_runtogether|pspell_config_save_repl|pspell_new|pspell_new_config|pspell_new_personal|pspell_save_wordlist|' +
        'pspell_store_replacement|pspell_suggest|putenv|px_close|px_create_fp|px_date2string|px_delete|px_delete_record|px_get_field|px_get_info|' +
        'px_get_parameter|px_get_record|px_get_schema|px_get_value|px_insert_record|px_new|px_numfields|px_numrecords|px_open_fp|px_put_record|' +
        'px_retrieve_record|px_set_blob_file|px_set_parameter|px_set_tablename|px_set_targetencoding|px_set_value|px_timestamp2string|' +
        'px_update_record|qdom_error|qdom_tree|quoted_printable_decode|quoted_printable_encode|quotemeta|rad2deg|radius_acct_open|' +
        'radius_add_server|radius_auth_open|radius_close|radius_config|radius_create_request|radius_cvt_addr|radius_cvt_int|radius_cvt_string|' +
        'radius_demangle|radius_demangle_mppe_key|radius_get_attr|radius_get_vendor_attr|radius_put_addr|radius_put_attr|radius_put_int|' +
        'radius_put_string|radius_put_vendor_addr|radius_put_vendor_attr|radius_put_vendor_int|radius_put_vendor_string|' +
        'radius_request_authenticator|radius_send_request|radius_server_secret|radius_strerror|rand|range|rangeexception|rar_wrapper_cache_stats|' +
        'rararchive|rarentry|rarexception|rawurldecode|rawurlencode|read_exif_data|readdir|readfile|readgzfile|readline|readline_add_history|' +
        'readline_callback_handler_install|readline_callback_handler_remove|readline_callback_read_char|readline_clear_history|' +
        'readline_completion_function|readline_info|readline_list_history|readline_on_new_line|readline_read_history|readline_redisplay|' +
        'readline_write_history|readlink|realpath|realpath_cache_get|realpath_cache_size|recode|recode_file|recode_string|recursivearrayiterator|' +
        'recursivecachingiterator|recursivecallbackfilteriterator|recursivedirectoryiterator|recursivefilteriterator|recursiveiterator|' +
        'recursiveiteratoriterator|recursiveregexiterator|recursivetreeiterator|reflection|reflectionclass|reflectionexception|reflectionextension|' +
        'reflectionfunction|reflectionfunctionabstract|reflectionmethod|reflectionobject|reflectionparameter|reflectionproperty|reflector|' +
        'regexiterator|register_shutdown_function|register_tick_function|rename|rename_function|require|require_once|reset|resetValue|' +
        'resourcebundle|restore_error_handler|restore_exception_handler|restore_include_path|return|rewind|rewinddir|rmdir|round|rpm_close|' +
        'rpm_get_tag|rpm_is_valid|rpm_open|rpm_version|rrd_create|rrd_error|rrd_fetch|rrd_first|rrd_graph|rrd_info|rrd_last|rrd_lastupdate|' +
        'rrd_restore|rrd_tune|rrd_update|rrd_xport|rrdcreator|rrdgraph|rrdupdater|rsort|rtrim|runkit_class_adopt|runkit_class_emancipate|' +
        'runkit_constant_add|runkit_constant_redefine|runkit_constant_remove|runkit_function_add|runkit_function_copy|runkit_function_redefine|' +
        'runkit_function_remove|runkit_function_rename|runkit_import|runkit_lint|runkit_lint_file|runkit_method_add|runkit_method_copy|' +
        'runkit_method_redefine|runkit_method_remove|runkit_method_rename|runkit_return_value_used|runkit_sandbox_output_handler|' +
        'runkit_superglobals|runtimeexception|samconnection_commit|samconnection_connect|samconnection_constructor|samconnection_disconnect|' +
        'samconnection_errno|samconnection_error|samconnection_isconnected|samconnection_peek|samconnection_peekall|samconnection_receive|' +
        'samconnection_remove|samconnection_rollback|samconnection_send|samconnection_setDebug|samconnection_subscribe|samconnection_unsubscribe|' +
        'sammessage_body|sammessage_constructor|sammessage_header|sca_createdataobject|sca_getservice|sca_localproxy_createdataobject|' +
        'sca_soapproxy_createdataobject|scandir|sdo_das_changesummary_beginlogging|sdo_das_changesummary_endlogging|' +
        'sdo_das_changesummary_getchangeddataobjects|sdo_das_changesummary_getchangetype|sdo_das_changesummary_getoldcontainer|' +
        'sdo_das_changesummary_getoldvalues|sdo_das_changesummary_islogging|sdo_das_datafactory_addpropertytotype|sdo_das_datafactory_addtype|' +
        'sdo_das_datafactory_getdatafactory|sdo_das_dataobject_getchangesummary|sdo_das_relational_applychanges|sdo_das_relational_construct|' +
        'sdo_das_relational_createrootdataobject|sdo_das_relational_executepreparedquery|sdo_das_relational_executequery|' +
        'sdo_das_setting_getlistindex|sdo_das_setting_getpropertyindex|sdo_das_setting_getpropertyname|sdo_das_setting_getvalue|' +
        'sdo_das_setting_isset|sdo_das_xml_addtypes|sdo_das_xml_create|sdo_das_xml_createdataobject|sdo_das_xml_createdocument|' +
        'sdo_das_xml_document_getrootdataobject|sdo_das_xml_document_getrootelementname|sdo_das_xml_document_getrootelementuri|' +
        'sdo_das_xml_document_setencoding|sdo_das_xml_document_setxmldeclaration|sdo_das_xml_document_setxmlversion|sdo_das_xml_loadfile|' +
        'sdo_das_xml_loadstring|sdo_das_xml_savefile|sdo_das_xml_savestring|sdo_datafactory_create|sdo_dataobject_clear|' +
        'sdo_dataobject_createdataobject|sdo_dataobject_getcontainer|sdo_dataobject_getsequence|sdo_dataobject_gettypename|' +
        'sdo_dataobject_gettypenamespaceuri|sdo_exception_getcause|sdo_list_insert|sdo_model_property_getcontainingtype|' +
        'sdo_model_property_getdefault|sdo_model_property_getname|sdo_model_property_gettype|sdo_model_property_iscontainment|' +
        'sdo_model_property_ismany|sdo_model_reflectiondataobject_construct|sdo_model_reflectiondataobject_export|' +
        'sdo_model_reflectiondataobject_getcontainmentproperty|sdo_model_reflectiondataobject_getinstanceproperties|' +
        'sdo_model_reflectiondataobject_gettype|sdo_model_type_getbasetype|sdo_model_type_getname|sdo_model_type_getnamespaceuri|' +
        'sdo_model_type_getproperties|sdo_model_type_getproperty|sdo_model_type_isabstracttype|sdo_model_type_isdatatype|sdo_model_type_isinstance|' +
        'sdo_model_type_isopentype|sdo_model_type_issequencedtype|sdo_sequence_getproperty|sdo_sequence_insert|sdo_sequence_move|seekableiterator|' +
        'sem_acquire|sem_get|sem_release|sem_remove|serializable|serialize|session_cache_expire|session_cache_limiter|session_commit|' +
        'session_decode|session_destroy|session_encode|session_get_cookie_params|session_id|session_is_registered|session_module_name|session_name|' +
        'session_pgsql_add_error|session_pgsql_get_error|session_pgsql_get_field|session_pgsql_reset|session_pgsql_set_field|session_pgsql_status|' +
        'session_regenerate_id|session_register|session_save_path|session_set_cookie_params|session_set_save_handler|session_start|' +
        'session_unregister|session_unset|session_write_close|setCounterClass|set_error_handler|set_exception_handler|set_file_buffer|' +
        'set_include_path|set_magic_quotes_runtime|set_socket_blocking|set_time_limit|setcookie|setlocale|setproctitle|setrawcookie|' +
        'setstaticpropertyvalue|setthreadtitle|settype|sha1|sha1_file|shell_exec|shm_attach|shm_detach|shm_get_var|shm_has_var|shm_put_var|' +
        'shm_remove|shm_remove_var|shmop_close|shmop_delete|shmop_open|shmop_read|shmop_size|shmop_write|show_source|shuffle|signeurlpaiement|' +
        'similar_text|simplexml_import_dom|simplexml_load_file|simplexml_load_string|simplexmlelement|simplexmliterator|sin|sinh|sizeof|sleep|snmp|' +
        'snmp2_get|snmp2_getnext|snmp2_real_walk|snmp2_set|snmp2_walk|snmp3_get|snmp3_getnext|snmp3_real_walk|snmp3_set|snmp3_walk|' +
        'snmp_get_quick_print|snmp_get_valueretrieval|snmp_read_mib|snmp_set_enum_print|snmp_set_oid_numeric_print|snmp_set_oid_output_format|' +
        'snmp_set_quick_print|snmp_set_valueretrieval|snmpget|snmpgetnext|snmprealwalk|snmpset|snmpwalk|snmpwalkoid|soapclient|soapfault|' +
        'soapheader|soapparam|soapserver|soapvar|socket_accept|socket_bind|socket_clear_error|socket_close|socket_connect|socket_create|' +
        'socket_create_listen|socket_create_pair|socket_get_option|socket_get_status|socket_getpeername|socket_getsockname|socket_last_error|' +
        'socket_listen|socket_read|socket_recv|socket_recvfrom|socket_select|socket_send|socket_sendto|socket_set_block|socket_set_blocking|' +
        'socket_set_nonblock|socket_set_option|socket_set_timeout|socket_shutdown|socket_strerror|socket_write|solr_get_version|solrclient|' +
        'solrclientexception|solrdocument|solrdocumentfield|solrexception|solrgenericresponse|solrillegalargumentexception|' +
        'solrillegaloperationexception|solrinputdocument|solrmodifiableparams|solrobject|solrparams|solrpingresponse|solrquery|solrqueryresponse|' +
        'solrresponse|solrupdateresponse|solrutils|sort|soundex|sphinxclient|spl_autoload|spl_autoload_call|spl_autoload_extensions|' +
        'spl_autoload_functions|spl_autoload_register|spl_autoload_unregister|spl_classes|spl_object_hash|splbool|spldoublylinkedlist|splenum|' +
        'splfileinfo|splfileobject|splfixedarray|splfloat|splheap|splint|split|spliti|splmaxheap|splminheap|splobjectstorage|splobserver|' +
        'splpriorityqueue|splqueue|splstack|splstring|splsubject|spltempfileobject|spoofchecker|sprintf|sql_regcase|sqlite3|sqlite3result|' +
        'sqlite3stmt|sqlite_array_query|sqlite_busy_timeout|sqlite_changes|sqlite_close|sqlite_column|sqlite_create_aggregate|' +
        'sqlite_create_function|sqlite_current|sqlite_error_string|sqlite_escape_string|sqlite_exec|sqlite_factory|sqlite_fetch_all|' +
        'sqlite_fetch_array|sqlite_fetch_column_types|sqlite_fetch_object|sqlite_fetch_single|sqlite_fetch_string|sqlite_field_name|' +
        'sqlite_has_more|sqlite_has_prev|sqlite_key|sqlite_last_error|sqlite_last_insert_rowid|sqlite_libencoding|sqlite_libversion|sqlite_next|' +
        'sqlite_num_fields|sqlite_num_rows|sqlite_open|sqlite_popen|sqlite_prev|sqlite_query|sqlite_rewind|sqlite_seek|sqlite_single_query|' +
        'sqlite_udf_decode_binary|sqlite_udf_encode_binary|sqlite_unbuffered_query|sqlite_valid|sqrt|srand|sscanf|ssdeep_fuzzy_compare|' +
        'ssdeep_fuzzy_hash|ssdeep_fuzzy_hash_filename|ssh2_auth_hostbased_file|ssh2_auth_none|ssh2_auth_password|ssh2_auth_pubkey_file|' +
        'ssh2_connect|ssh2_exec|ssh2_fetch_stream|ssh2_fingerprint|ssh2_methods_negotiated|ssh2_publickey_add|ssh2_publickey_init|' +
        'ssh2_publickey_list|ssh2_publickey_remove|ssh2_scp_recv|ssh2_scp_send|ssh2_sftp|ssh2_sftp_lstat|ssh2_sftp_mkdir|ssh2_sftp_readlink|' +
        'ssh2_sftp_realpath|ssh2_sftp_rename|ssh2_sftp_rmdir|ssh2_sftp_stat|ssh2_sftp_symlink|ssh2_sftp_unlink|ssh2_shell|ssh2_tunnel|stat|' +
        'stats_absolute_deviation|stats_cdf_beta|stats_cdf_binomial|stats_cdf_cauchy|stats_cdf_chisquare|stats_cdf_exponential|stats_cdf_f|' +
        'stats_cdf_gamma|stats_cdf_laplace|stats_cdf_logistic|stats_cdf_negative_binomial|stats_cdf_noncentral_chisquare|stats_cdf_noncentral_f|' +
        'stats_cdf_poisson|stats_cdf_t|stats_cdf_uniform|stats_cdf_weibull|stats_covariance|stats_den_uniform|stats_dens_beta|stats_dens_cauchy|' +
        'stats_dens_chisquare|stats_dens_exponential|stats_dens_f|stats_dens_gamma|stats_dens_laplace|stats_dens_logistic|' +
        'stats_dens_negative_binomial|stats_dens_normal|stats_dens_pmf_binomial|stats_dens_pmf_hypergeometric|stats_dens_pmf_poisson|stats_dens_t|' +
        'stats_dens_weibull|stats_harmonic_mean|stats_kurtosis|stats_rand_gen_beta|stats_rand_gen_chisquare|stats_rand_gen_exponential|' +
        'stats_rand_gen_f|stats_rand_gen_funiform|stats_rand_gen_gamma|stats_rand_gen_ibinomial|stats_rand_gen_ibinomial_negative|' +
        'stats_rand_gen_int|stats_rand_gen_ipoisson|stats_rand_gen_iuniform|stats_rand_gen_noncenral_chisquare|stats_rand_gen_noncentral_f|' +
        'stats_rand_gen_noncentral_t|stats_rand_gen_normal|stats_rand_gen_t|stats_rand_get_seeds|stats_rand_phrase_to_seeds|stats_rand_ranf|' +
        'stats_rand_setall|stats_skew|stats_standard_deviation|stats_stat_binomial_coef|stats_stat_correlation|stats_stat_gennch|' +
        'stats_stat_independent_t|stats_stat_innerproduct|stats_stat_noncentral_t|stats_stat_paired_t|stats_stat_percentile|stats_stat_powersum|' +
        'stats_variance|stomp|stomp_connect_error|stomp_version|stompexception|stompframe|str_getcsv|str_ireplace|str_pad|str_repeat|str_replace|' +
        'str_rot13|str_shuffle|str_split|str_word_count|strcasecmp|strchr|strcmp|strcoll|strcspn|stream_bucket_append|stream_bucket_make_writeable|' +
        'stream_bucket_new|stream_bucket_prepend|stream_context_create|stream_context_get_default|stream_context_get_options|' +
        'stream_context_get_params|stream_context_set_default|stream_context_set_option|stream_context_set_params|stream_copy_to_stream|' +
        'stream_encoding|stream_filter_append|stream_filter_prepend|stream_filter_register|stream_filter_remove|stream_get_contents|' +
        'stream_get_filters|stream_get_line|stream_get_meta_data|stream_get_transports|stream_get_wrappers|stream_is_local|' +
        'stream_notification_callback|stream_register_wrapper|stream_resolve_include_path|stream_select|stream_set_blocking|stream_set_read_buffer|' +
        'stream_set_timeout|stream_set_write_buffer|stream_socket_accept|stream_socket_client|stream_socket_enable_crypto|stream_socket_get_name|' +
        'stream_socket_pair|stream_socket_recvfrom|stream_socket_sendto|stream_socket_server|stream_socket_shutdown|stream_supports_lock|' +
        'stream_wrapper_register|stream_wrapper_restore|stream_wrapper_unregister|streamwrapper|strftime|strip_tags|stripcslashes|stripos|' +
        'stripslashes|stristr|strlen|strnatcasecmp|strnatcmp|strncasecmp|strncmp|strpbrk|strpos|strptime|strrchr|strrev|strripos|strrpos|strspn|' +
        'strstr|strtok|strtolower|strtotime|strtoupper|strtr|strval|substr|substr_compare|substr_count|substr_replace|svm|svmmodel|svn_add|' +
        'svn_auth_get_parameter|svn_auth_set_parameter|svn_blame|svn_cat|svn_checkout|svn_cleanup|svn_client_version|svn_commit|svn_delete|' +
        'svn_diff|svn_export|svn_fs_abort_txn|svn_fs_apply_text|svn_fs_begin_txn2|svn_fs_change_node_prop|svn_fs_check_path|' +
        'svn_fs_contents_changed|svn_fs_copy|svn_fs_delete|svn_fs_dir_entries|svn_fs_file_contents|svn_fs_file_length|svn_fs_is_dir|svn_fs_is_file|' +
        'svn_fs_make_dir|svn_fs_make_file|svn_fs_node_created_rev|svn_fs_node_prop|svn_fs_props_changed|svn_fs_revision_prop|svn_fs_revision_root|' +
        'svn_fs_txn_root|svn_fs_youngest_rev|svn_import|svn_log|svn_ls|svn_mkdir|svn_repos_create|svn_repos_fs|svn_repos_fs_begin_txn_for_commit|' +
        'svn_repos_fs_commit_txn|svn_repos_hotcopy|svn_repos_open|svn_repos_recover|svn_revert|svn_status|svn_update|swf_actiongeturl|' +
        'swf_actiongotoframe|swf_actiongotolabel|swf_actionnextframe|swf_actionplay|swf_actionprevframe|swf_actionsettarget|swf_actionstop|' +
        'swf_actiontogglequality|swf_actionwaitforframe|swf_addbuttonrecord|swf_addcolor|swf_closefile|swf_definebitmap|swf_definefont|' +
        'swf_defineline|swf_definepoly|swf_definerect|swf_definetext|swf_endbutton|swf_enddoaction|swf_endshape|swf_endsymbol|swf_fontsize|' +
        'swf_fontslant|swf_fonttracking|swf_getbitmapinfo|swf_getfontinfo|swf_getframe|swf_labelframe|swf_lookat|swf_modifyobject|swf_mulcolor|' +
        'swf_nextid|swf_oncondition|swf_openfile|swf_ortho|swf_ortho2|swf_perspective|swf_placeobject|swf_polarview|swf_popmatrix|swf_posround|' +
        'swf_pushmatrix|swf_removeobject|swf_rotate|swf_scale|swf_setfont|swf_setframe|swf_shapearc|swf_shapecurveto|swf_shapecurveto3|' +
        'swf_shapefillbitmapclip|swf_shapefillbitmaptile|swf_shapefilloff|swf_shapefillsolid|swf_shapelinesolid|swf_shapelineto|swf_shapemoveto|' +
        'swf_showframe|swf_startbutton|swf_startdoaction|swf_startshape|swf_startsymbol|swf_textwidth|swf_translate|swf_viewport|swfaction|' +
        'swfbitmap|swfbutton|swfdisplayitem|swffill|swffont|swffontchar|swfgradient|swfmorph|swfmovie|swfprebuiltclip|swfshape|swfsound|' +
        'swfsoundinstance|swfsprite|swftext|swftextfield|swfvideostream|swish_construct|swish_getmetalist|swish_getpropertylist|swish_prepare|' +
        'swish_query|swishresult_getmetalist|swishresult_stem|swishresults_getparsedwords|swishresults_getremovedstopwords|swishresults_nextresult|' +
        'swishresults_seekresult|swishsearch_execute|swishsearch_resetlimit|swishsearch_setlimit|swishsearch_setphrasedelimiter|' +
        'swishsearch_setsort|swishsearch_setstructure|sybase_affected_rows|sybase_close|sybase_connect|sybase_data_seek|' +
        'sybase_deadlock_retry_count|sybase_fetch_array|sybase_fetch_assoc|sybase_fetch_field|sybase_fetch_object|sybase_fetch_row|' +
        'sybase_field_seek|sybase_free_result|sybase_get_last_message|sybase_min_client_severity|sybase_min_error_severity|' +
        'sybase_min_message_severity|sybase_min_server_severity|sybase_num_fields|sybase_num_rows|sybase_pconnect|sybase_query|sybase_result|' +
        'sybase_select_db|sybase_set_message_handler|sybase_unbuffered_query|symlink|sys_get_temp_dir|sys_getloadavg|syslog|system|tag|tan|tanh|' +
        'tcpwrap_check|tempnam|textdomain|tidy|tidy_access_count|tidy_config_count|tidy_diagnose|tidy_error_count|tidy_get_error_buffer|' +
        'tidy_get_output|tidy_load_config|tidy_reset_config|tidy_save_config|tidy_set_encoding|tidy_setopt|tidy_warning_count|tidynode|time|' +
        'time_nanosleep|time_sleep_until|timezone_abbreviations_list|timezone_identifiers_list|timezone_location_get|timezone_name_from_abbr|' +
        'timezone_name_get|timezone_offset_get|timezone_open|timezone_transitions_get|timezone_version_get|tmpfile|token_get_all|token_name|' +
        'tokyotyrant|tokyotyrantquery|tokyotyranttable|tostring|tostring|touch|trait_exists|transliterator|traversable|trigger_error|trim|uasort|ucfirst|' +
        'ucwords|udm_add_search_limit|udm_alloc_agent|udm_alloc_agent_array|udm_api_version|udm_cat_list|udm_cat_path|udm_check_charset|' +
        'udm_check_stored|udm_clear_search_limits|udm_close_stored|udm_crc32|udm_errno|udm_error|udm_find|udm_free_agent|udm_free_ispell_data|' +
        'udm_free_res|udm_get_doc_count|udm_get_res_field|udm_get_res_param|udm_hash32|udm_load_ispell_data|udm_open_stored|udm_set_agent_param|' +
        'uksort|umask|underflowexception|unexpectedvalueexception|uniqid|unixtojd|unlink|unpack|unregister_tick_function|unserialize|unset|' +
        'urldecode|urlencode|use_soap_error_handler|user_error|usleep|usort|utf8_decode|utf8_encode|v8js|v8jsexception|var_dump|var_export|variant|' +
        'variant_abs|variant_add|variant_and|variant_cast|variant_cat|variant_cmp|variant_date_from_timestamp|variant_date_to_timestamp|' +
        'variant_div|variant_eqv|variant_fix|variant_get_type|variant_idiv|variant_imp|variant_int|variant_mod|variant_mul|variant_neg|variant_not|' +
        'variant_or|variant_pow|variant_round|variant_set|variant_set_type|variant_sub|variant_xor|version_compare|vfprintf|virtual|' +
        'vpopmail_add_alias_domain|vpopmail_add_alias_domain_ex|vpopmail_add_domain|vpopmail_add_domain_ex|vpopmail_add_user|vpopmail_alias_add|' +
        'vpopmail_alias_del|vpopmail_alias_del_domain|vpopmail_alias_get|vpopmail_alias_get_all|vpopmail_auth_user|vpopmail_del_domain|' +
        'vpopmail_del_domain_ex|vpopmail_del_user|vpopmail_error|vpopmail_passwd|vpopmail_set_user_quota|vprintf|vsprintf|w32api_deftype|' +
        'w32api_init_dtype|w32api_invoke_function|w32api_register_function|w32api_set_call_method|wddx_add_vars|wddx_deserialize|wddx_packet_end|' +
        'wddx_packet_start|wddx_serialize_value|wddx_serialize_vars|win32_continue_service|win32_create_service|win32_delete_service|' +
        'win32_get_last_control_message|win32_pause_service|win32_ps_list_procs|win32_ps_stat_mem|win32_ps_stat_proc|win32_query_service_status|' +
        'win32_set_service_status|win32_start_service|win32_start_service_ctrl_dispatcher|win32_stop_service|wincache_fcache_fileinfo|' +
        'wincache_fcache_meminfo|wincache_lock|wincache_ocache_fileinfo|wincache_ocache_meminfo|wincache_refresh_if_changed|' +
        'wincache_rplist_fileinfo|wincache_rplist_meminfo|wincache_scache_info|wincache_scache_meminfo|wincache_ucache_add|wincache_ucache_cas|' +
        'wincache_ucache_clear|wincache_ucache_dec|wincache_ucache_delete|wincache_ucache_exists|wincache_ucache_get|wincache_ucache_inc|' +
        'wincache_ucache_info|wincache_ucache_meminfo|wincache_ucache_set|wincache_unlock|wordwrap|xattr_get|xattr_list|xattr_remove|xattr_set|' +
        'xattr_supported|xdiff_file_bdiff|xdiff_file_bdiff_size|xdiff_file_bpatch|xdiff_file_diff|xdiff_file_diff_binary|xdiff_file_merge3|' +
        'xdiff_file_patch|xdiff_file_patch_binary|xdiff_file_rabdiff|xdiff_string_bdiff|xdiff_string_bdiff_size|xdiff_string_bpatch|' +
        'xdiff_string_diff|xdiff_string_diff_binary|xdiff_string_merge3|xdiff_string_patch|xdiff_string_patch_binary|xdiff_string_rabdiff|' +
        'xhprof_disable|xhprof_enable|xhprof_sample_disable|xhprof_sample_enable|xml_error_string|xml_get_current_byte_index|' +
        'xml_get_current_column_number|xml_get_current_line_number|xml_get_error_code|xml_parse|xml_parse_into_struct|xml_parser_create|' +
        'xml_parser_create_ns|xml_parser_free|xml_parser_get_option|xml_parser_set_option|xml_set_character_data_handler|xml_set_default_handler|' +
        'xml_set_element_handler|xml_set_end_namespace_decl_handler|xml_set_external_entity_ref_handler|xml_set_notation_decl_handler|' +
        'xml_set_object|xml_set_processing_instruction_handler|xml_set_start_namespace_decl_handler|xml_set_unparsed_entity_decl_handler|xmlreader|' +
        'xmlrpc_decode|xmlrpc_decode_request|xmlrpc_encode|xmlrpc_encode_request|xmlrpc_get_type|xmlrpc_is_fault|xmlrpc_parse_method_descriptions|' +
        'xmlrpc_server_add_introspection_data|xmlrpc_server_call_method|xmlrpc_server_create|xmlrpc_server_destroy|' +
        'xmlrpc_server_register_introspection_callback|xmlrpc_server_register_method|xmlrpc_set_type|xmlwriter_end_attribute|xmlwriter_end_cdata|' +
        'xmlwriter_end_comment|xmlwriter_end_document|xmlwriter_end_dtd|xmlwriter_end_dtd_attlist|xmlwriter_end_dtd_element|' +
        'xmlwriter_end_dtd_entity|xmlwriter_end_element|xmlwriter_end_pi|xmlwriter_flush|xmlwriter_full_end_element|xmlwriter_open_memory|' +
        'xmlwriter_open_uri|xmlwriter_output_memory|xmlwriter_set_indent|xmlwriter_set_indent_string|xmlwriter_start_attribute|' +
        'xmlwriter_start_attribute_ns|xmlwriter_start_cdata|xmlwriter_start_comment|xmlwriter_start_document|xmlwriter_start_dtd|' +
        'xmlwriter_start_dtd_attlist|xmlwriter_start_dtd_element|xmlwriter_start_dtd_entity|xmlwriter_start_element|xmlwriter_start_element_ns|' +
        'xmlwriter_start_pi|xmlwriter_text|xmlwriter_write_attribute|xmlwriter_write_attribute_ns|xmlwriter_write_cdata|xmlwriter_write_comment|' +
        'xmlwriter_write_dtd|xmlwriter_write_dtd_attlist|xmlwriter_write_dtd_element|xmlwriter_write_dtd_entity|xmlwriter_write_element|' +
        'xmlwriter_write_element_ns|xmlwriter_write_pi|xmlwriter_write_raw|xpath_eval|xpath_eval_expression|xpath_new_context|xpath_register_ns|' +
        'xpath_register_ns_auto|xptr_eval|xptr_new_context|xslt_backend_info|xslt_backend_name|xslt_backend_version|xslt_create|xslt_errno|' +
        'xslt_error|xslt_free|xslt_getopt|xslt_process|xslt_set_base|xslt_set_encoding|xslt_set_error_handler|xslt_set_log|xslt_set_object|' +
        'xslt_set_sax_handler|xslt_set_sax_handlers|xslt_set_scheme_handler|xslt_set_scheme_handlers|xslt_setopt|xsltprocessor|yaml_emit|' +
        'yaml_emit_file|yaml_parse|yaml_parse_file|yaml_parse_url|yaz_addinfo|yaz_ccl_conf|yaz_ccl_parse|yaz_close|yaz_connect|yaz_database|' +
        'yaz_element|yaz_errno|yaz_error|yaz_es|yaz_es_result|yaz_get_option|yaz_hits|yaz_itemorder|yaz_present|yaz_range|yaz_record|yaz_scan|' +
        'yaz_scan_result|yaz_schema|yaz_search|yaz_set_option|yaz_sort|yaz_syntax|yaz_wait|yp_all|yp_cat|yp_err_string|yp_errno|yp_first|' +
        'yp_get_default_domain|yp_master|yp_match|yp_next|yp_order|zend_logo_guid|zend_thread_id|zend_version|zip_close|zip_entry_close|' +
        'zip_entry_compressedsize|zip_entry_compressionmethod|zip_entry_filesize|zip_entry_name|zip_entry_open|zip_entry_read|zip_open|zip_read|' +
        'ziparchive|ziparchive_addemptydir|ziparchive_addfile|ziparchive_addfromstring|ziparchive_close|ziparchive_deleteindex|' +
        'ziparchive_deletename|ziparchive_extractto|ziparchive_getarchivecomment|ziparchive_getcommentindex|ziparchive_getcommentname|' +
        'ziparchive_getfromindex|ziparchive_getfromname|ziparchive_getnameindex|ziparchive_getstatusstring|ziparchive_getstream|' +
        'ziparchive_locatename|ziparchive_open|ziparchive_renameindex|ziparchive_renamename|ziparchive_setCommentName|ziparchive_setarchivecomment|' +
        'ziparchive_setcommentindex|ziparchive_statindex|ziparchive_statname|ziparchive_unchangeall|ziparchive_unchangearchive|' +
        'ziparchive_unchangeindex|ziparchive_unchangename|zlib_get_coding_type').split('|')
    );
    var keywords = lang.arrayToMap(
        ('abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|do|else|elseif|enddeclare|endfor|endforeach|endif|' +
        'endswitch|endwhile|extends|final|for|foreach|function|global|goto|if|implements|interface|instanceof|namespace|new|or|private|protected|' +
        'public|static|switch|throw|trait|try|use|var|while|xor').split('|')
    );
    var languageConstructs = lang.arrayToMap(
        ('die|echo|empty|exit|eval|include|include_once|isset|list|require|require_once|return|print|unset').split('|')
    );

    var builtinConstants = lang.arrayToMap(
        ('true|TRUE|false|FALSE|null|NULL|__CLASS__|__DIR__|__FILE__|__LINE__|__METHOD__|__FUNCTION__|__NAMESPACE__').split('|')
    );

    var builtinVariables = lang.arrayToMap(
        ('$GLOBALS|$_SERVER|$_GET|$_POST|$_FILES|$_REQUEST|$_SESSION|$_ENV|$_COOKIE|$php_errormsg|$HTTP_RAW_POST_DATA|' +
        '$http_response_header|$argc|$argv').split('|')
    );
    var builtinFunctionsDeprecated = lang.arrayToMap(
        ('key_exists|cairo_matrix_create_scale|cairo_matrix_create_translate|call_user_method|call_user_method_array|com_addref|com_get|' +
        'com_invoke|com_isenum|com_load|com_release|com_set|connection_timeout|cubrid_load_from_glo|cubrid_new_glo|cubrid_save_to_glo|' +
        'cubrid_send_glo|define_syslog_variables|dl|ereg|ereg_replace|eregi|eregi_replace|hw_documentattributes|hw_documentbodytag|' +
        'hw_documentsize|hw_outputdocument|imagedashedline|maxdb_bind_param|maxdb_bind_result|maxdb_client_encoding|maxdb_close_long_data|' +
        'maxdb_execute|maxdb_fetch|maxdb_get_metadata|maxdb_param_count|maxdb_send_long_data|mcrypt_ecb|mcrypt_generic_end|mime_content_type|' +
        'mysql_createdb|mysql_dbname|mysql_db_query|mysql_drop_db|mysql_dropdb|mysql_escape_string|mysql_fieldflags|mysql_fieldflags|' +
        'mysql_fieldname|mysql_fieldtable|mysql_fieldtype|mysql_freeresult|mysql_listdbs|mysql_list_fields|mysql_listfields|mysql_list_tables|' +
        'mysql_listtables|mysql_numfields|mysql_numrows|mysql_selectdb|mysql_tablename|mysqli_bind_param|mysqli_bind_result|' +
        'mysqli_disable_reads_from_master|mysqli_disable_rpl_parse|mysqli_enable_reads_from_master|mysqli_enable_rpl_parse|mysqli_execute|' +
        'mysqli_fetch|mysqli_get_metadata|mysqli_master_query|mysqli_param_count|mysqli_rpl_parse_enabled|mysqli_rpl_probe|mysqli_rpl_query_type|' +
        'mysqli_send_long_data|mysqli_send_query|mysqli_slave_query|ocibindbyname|ocicancel|ocicloselob|ocicollappend|ocicollassign|' +
        'ocicollassignelem|ocicollgetelem|ocicollmax|ocicollsize|ocicolltrim|ocicolumnisnull|ocicolumnname|ocicolumnprecision|ocicolumnscale|' +
        'ocicolumnsize|ocicolumntype|ocicolumntyperaw|ocicommit|ocidefinebyname|ocierror|ociexecute|ocifetch|ocifetchinto|ocifetchstatement|' +
        'ocifreecollection|ocifreecursor|ocifreedesc|ocifreestatement|ociinternaldebug|ociloadlob|ocilogoff|ocilogon|ocinewcollection|' +
        'ocinewcursor|ocinewdescriptor|ocinlogon|ocinumcols|ociparse|ociplogon|ociresult|ocirollback|ocirowcount|ocisavelob|ocisavelobfile|' +
        'ociserverversion|ocisetprefetch|ocistatementtype|ociwritelobtofile|ociwritetemporarylob|PDF_add_annotation|PDF_add_bookmark|' +
        'PDF_add_launchlink|PDF_add_locallink|PDF_add_note|PDF_add_outline|PDF_add_pdflink|PDF_add_weblink|PDF_attach_file|PDF_begin_page|' +
        'PDF_begin_template|PDF_close_pdi|PDF_close|PDF_findfont|PDF_get_font|PDF_get_fontname|PDF_get_fontsize|PDF_get_image_height|' +
        'PDF_get_image_width|PDF_get_majorversion|PDF_get_minorversion|PDF_get_pdi_parameter|PDF_get_pdi_value|PDF_open_ccitt|PDF_open_file|' +
        'PDF_open_gif|PDF_open_image_file|PDF_open_image|PDF_open_jpeg|PDF_open_pdi|PDF_open_tiff|PDF_place_image|PDF_place_pdi_page|' +
        'PDF_set_border_color|PDF_set_border_dash|PDF_set_border_style|PDF_set_char_spacing|PDF_set_duration|PDF_set_horiz_scaling|' +
        'PDF_set_info_author|PDF_set_info_creator|PDF_set_info_keywords|PDF_set_info_subject|PDF_set_info_title|PDF_set_leading|' +
        'PDF_set_text_matrix|PDF_set_text_rendering|PDF_set_text_rise|PDF_set_word_spacing|PDF_setgray_fill|PDF_setgray_stroke|PDF_setgray|' +
        'PDF_setpolydash|PDF_setrgbcolor_fill|PDF_setrgbcolor_stroke|PDF_setrgbcolor|PDF_show_boxed|php_check_syntax|px_set_tablename|' +
        'px_set_targetencoding|runkit_sandbox_output_handler|session_is_registered|session_register|session_unregister' +
        'set_magic_quotes_runtime|magic_quotes_runtime|set_socket_blocking|socket_set_blocking|set_socket_timeout|socket_set_timeout|split|spliti|' +
        'sql_regcase').split('|')
    );

    var keywordsDeprecated = lang.arrayToMap(
        ('cfunction|old_function').split('|')
    );

    var futureReserved = lang.arrayToMap([]);

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : /(?:#|\/\/)(?:[^?]|\?[^>])*/
            },
            docComment.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string.regexp",
                regex : "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/][gimy]*\\s*(?=[).,;]|$)"
            }, {
                token : "string", // " string start
                regex : '"',
                next : "qqstring"
            }, {
                token : "string", // ' string start
                regex : "'",
                next : "qstring"
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language", // constants
                regex : "\\b(?:DEFAULT_INCLUDE_PATH|E_(?:ALL|CO(?:MPILE_(?:ERROR|WARNING)|RE_(?:ERROR|WARNING))|" +
                        "ERROR|NOTICE|PARSE|STRICT|USER_(?:ERROR|NOTICE|WARNING)|WARNING)|P(?:EAR_(?:EXTENSION_DIR|INSTALL_DIR)|" +
                        "HP_(?:BINDIR|CONFIG_FILE_(?:PATH|SCAN_DIR)|DATADIR|E(?:OL|XTENSION_DIR)|INT_(?:MAX|SIZE)|" +
                        "L(?:IBDIR|OCALSTATEDIR)|O(?:S|UTPUT_HANDLER_(?:CONT|END|START))|PREFIX|S(?:API|HLIB_SUFFIX|YSCONFDIR)|" +
                        "VERSION))|__COMPILER_HALT_OFFSET__)\\b"
            }, {
                token : ["keyword", "text", "support.class"],
                regex : "\\b(new)(\\s+)(\\w+)"
            }, {
                token : ["support.class", "keyword.operator"],
                regex : "\\b(\\w+)(::)"
            }, {
                token : "constant.language", // constants
                regex : "\\b(?:A(?:B(?:DAY_(?:1|2|3|4|5|6|7)|MON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9))|LT_DIGITS|M_STR|" +
                        "SSERT_(?:ACTIVE|BAIL|CALLBACK|QUIET_EVAL|WARNING))|C(?:ASE_(?:LOWER|UPPER)|HAR_MAX|" +
                        "O(?:DESET|NNECTION_(?:ABORTED|NORMAL|TIMEOUT)|UNT_(?:NORMAL|RECURSIVE))|" +
                        "R(?:EDITS_(?:ALL|DOCS|FULLPAGE|G(?:ENERAL|ROUP)|MODULES|QA|SAPI)|NCYSTR|" +
                        "YPT_(?:BLOWFISH|EXT_DES|MD5|S(?:ALT_LENGTH|TD_DES)))|URRENCY_SYMBOL)|D(?:AY_(?:1|2|3|4|5|6|7)|" +
                        "ECIMAL_POINT|IRECTORY_SEPARATOR|_(?:FMT|T_FMT))|E(?:NT_(?:COMPAT|NOQUOTES|QUOTES)|RA(?:_(?:D_(?:FMT|T_FMT)|" +
                        "T_FMT|YEAR)|)|XTR_(?:IF_EXISTS|OVERWRITE|PREFIX_(?:ALL|I(?:F_EXISTS|NVALID)|SAME)|SKIP))|FRAC_DIGITS|GROUPING|" +
                        "HTML_(?:ENTITIES|SPECIALCHARS)|IN(?:FO_(?:ALL|C(?:ONFIGURATION|REDITS)|ENVIRONMENT|GENERAL|LICENSE|MODULES|VARIABLES)|" +
                        "I_(?:ALL|PERDIR|SYSTEM|USER)|T_(?:CURR_SYMBOL|FRAC_DIGITS))|L(?:C_(?:ALL|C(?:OLLATE|TYPE)|M(?:ESSAGES|ONETARY)|NUMERIC|TIME)|" +
                        "O(?:CK_(?:EX|NB|SH|UN)|G_(?:A(?:LERT|UTH(?:PRIV|))|C(?:ONS|R(?:IT|ON))|D(?:AEMON|EBUG)|E(?:MERG|RR)|INFO|KERN|" +
                        "L(?:OCAL(?:0|1|2|3|4|5|6|7)|PR)|MAIL|N(?:DELAY|EWS|O(?:TICE|WAIT))|ODELAY|P(?:ERROR|ID)|SYSLOG|U(?:SER|UCP)|WARNING)))|" +
                        "M(?:ON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9|DECIMAL_POINT|GROUPING|THOUSANDS_SEP)|_(?:1_PI|2_(?:PI|SQRTPI)|E|L(?:N(?:10|2)|" +
                        "OG(?:10E|2E))|PI(?:_(?:2|4)|)|SQRT(?:1_2|2)))|N(?:EGATIVE_SIGN|O(?:EXPR|STR)|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|" +
                        "P(?:ATH(?:INFO_(?:BASENAME|DIRNAME|EXTENSION)|_SEPARATOR)|M_STR|OSITIVE_SIGN|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|" +
                        "RADIXCHAR|S(?:EEK_(?:CUR|END|SET)|ORT_(?:ASC|DESC|NUMERIC|REGULAR|STRING)|TR_PAD_(?:BOTH|LEFT|RIGHT))|" +
                        "T(?:HOUS(?:ANDS_SEP|EP)|_FMT(?:_AMPM|))|YES(?:EXPR|STR)|STD(?:IN|OUT|ERR))\\b"
            }, {
                token : function(value) {
                    if (keywords.hasOwnProperty(value))
                        return "keyword";
                    else if (builtinConstants.hasOwnProperty(value))
                        return "constant.language";
                    else if (builtinVariables.hasOwnProperty(value))
                        return "variable.language";
                    else if (futureReserved.hasOwnProperty(value))
                        return "invalid.illegal";
                    else if (builtinFunctions.hasOwnProperty(value))
                        return "support.function";
                    else if (value == "debugger")
                        return "invalid.deprecated";
                    else
                        if(value.match(/^(\$[a-zA-Z_\x7f-\uffff][a-zA-Z0-9_\x7f-\uffff]*|self|parent)$/))
                            return "variable";
                        return "identifier";
                },
                regex : /[a-zA-Z_$\x7f-\uffff][a-zA-Z0-9_\x7f-\uffff]*/
            }, {
                onMatch : function(value, currentSate, state) {
                    value = value.substr(3);
                    if (value[0] == "'" || value[0] == '"')
                        value = value.slice(1, -1);
                    state.unshift(this.next, value);
                    return "markup.list";
                },
                regex : /<<<(?:\w+|'\w+'|"\w+")$/,
                next: "heredoc"
            }, {
                token : "keyword.operator",
                regex : "::|!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|!=|!==|<=|>=|=>|<<=|>>=|>>>=|<>|<|>|=|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "heredoc" : [
            {
                onMatch : function(value, currentSate, stack) {
                    if (stack[1] != value)
                        return "string";
                    stack.shift();
                    stack.shift();
                    return "markup.list";
                },
                regex : "^\\w+(?=;?$)",
                next: "start"
            }, {
                token: "string",
                regex : ".*"
            }
        ],
        "comment" : [
            {
                token : "comment",
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : '\\\\(?:[nrtvef\\\\"$]|[0-7]{1,3}|x[0-9A-Fa-f]{1,2})'
            }, {
                token : "variable",
                regex : /\$[\w]+(?:\[[\w\]+]|[=\-]>\w+)?/
            }, {
                token : "variable",
                regex : /\$\{[^"\}]+\}?/           // this is wrong but ok for now
            },
            {token : "string", regex : '"', next : "start"},
            {defaultToken : "string"}
        ],
        "qstring" : [
            {token : "constant.language.escape", regex : /\\['\\]/},
            {token : "string", regex : "'", next : "start"},
            {defaultToken : "string"}
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
};

oop.inherits(PhpLangHighlightRules, TextHighlightRules);


var PhpHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var startRules = [
        {
            token : "support.php_tag", // php open tag
            regex : "<\\?(?:php|=)?",
            push  : "php-start"
        }
    ];

    var endRules = [
        {
            token : "support.php_tag", // php close tag
            regex : "\\?>",
            next  : "pop"
        }
    ];

    for (var key in this.$rules)
        this.$rules[key].unshift.apply(this.$rules[key], startRules);

    this.embedRules(PhpLangHighlightRules, "php-", endRules, ["start"]);

    this.normalizeRules();
};

oop.inherits(PhpHighlightRules, HtmlHighlightRules);

exports.PhpHighlightRules = PhpHighlightRules;
exports.PhpLangHighlightRules = PhpLangHighlightRules;
});

ace.define("ace/mode/ruby_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var constantOtherSymbol = exports.constantOtherSymbol = {
    token : "constant.other.symbol.ruby", // symbol
    regex : "[:](?:[A-Za-z_]|[@$](?=[a-zA-Z0-9_]))[a-zA-Z0-9_]*[!=?]?"
};

var qString = exports.qString = {
    token : "string", // single line
    regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
};

var qqString = exports.qqString = {
    token : "string", // single line
    regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
};

var tString = exports.tString = {
    token : "string", // backtick string
    regex : "[`](?:(?:\\\\.)|(?:[^'\\\\]))*?[`]"
};

var constantNumericHex = exports.constantNumericHex = {
    token : "constant.numeric", // hex
    regex : "0[xX][0-9a-fA-F](?:[0-9a-fA-F]|_(?=[0-9a-fA-F]))*\\b"
};

var constantNumericFloat = exports.constantNumericFloat = {
    token : "constant.numeric", // float
    regex : "[+-]?\\d(?:\\d|_(?=\\d))*(?:(?:\\.\\d(?:\\d|_(?=\\d))*)?(?:[eE][+-]?\\d+)?)?\\b"
};

var instanceVariable = exports.instanceVariable = {
    token : "variable.instance", // instance variable
    regex : "@{1,2}[a-zA-Z_\\d]+"
};

var RubyHighlightRules = function() {

    var builtinFunctions = (
        "abort|Array|assert|assert_equal|assert_not_equal|assert_same|assert_not_same|" +
        "assert_nil|assert_not_nil|assert_match|assert_no_match|assert_in_delta|assert_throws|" +
        "assert_raise|assert_nothing_raised|assert_instance_of|assert_kind_of|assert_respond_to|" +
        "assert_operator|assert_send|assert_difference|assert_no_difference|assert_recognizes|" +
        "assert_generates|assert_response|assert_redirected_to|assert_template|assert_select|" +
        "assert_select_email|assert_select_rjs|assert_select_encoded|css_select|at_exit|" +
        "attr|attr_writer|attr_reader|attr_accessor|attr_accessible|autoload|binding|block_given?|callcc|" +
        "caller|catch|chomp|chomp!|chop|chop!|defined?|delete_via_redirect|eval|exec|exit|" +
        "exit!|fail|Float|flunk|follow_redirect!|fork|form_for|form_tag|format|gets|global_variables|gsub|" +
        "gsub!|get_via_redirect|host!|https?|https!|include|Integer|lambda|link_to|" +
        "link_to_unless_current|link_to_function|link_to_remote|load|local_variables|loop|open|open_session|" +
        "p|print|printf|proc|putc|puts|post_via_redirect|put_via_redirect|raise|rand|" +
        "raw|readline|readlines|redirect?|request_via_redirect|require|scan|select|" +
        "set_trace_func|sleep|split|sprintf|srand|String|stylesheet_link_tag|syscall|system|sub|sub!|test|" +
        "throw|trace_var|trap|untrace_var|atan2|cos|exp|frexp|ldexp|log|log10|sin|sqrt|tan|" +
        "render|javascript_include_tag|csrf_meta_tag|label_tag|text_field_tag|submit_tag|check_box_tag|" +
        "content_tag|radio_button_tag|text_area_tag|password_field_tag|hidden_field_tag|" +
        "fields_for|select_tag|options_for_select|options_from_collection_for_select|collection_select|" +
        "time_zone_select|select_date|select_time|select_datetime|date_select|time_select|datetime_select|" +
        "select_year|select_month|select_day|select_hour|select_minute|select_second|file_field_tag|" +
        "file_field|respond_to|skip_before_filter|around_filter|after_filter|verify|" +
        "protect_from_forgery|rescue_from|helper_method|redirect_to|before_filter|" +
        "send_data|send_file|validates_presence_of|validates_uniqueness_of|validates_length_of|" +
        "validates_format_of|validates_acceptance_of|validates_associated|validates_exclusion_of|" +
        "validates_inclusion_of|validates_numericality_of|validates_with|validates_each|" +
        "authenticate_or_request_with_http_basic|authenticate_or_request_with_http_digest|" +
        "filter_parameter_logging|match|get|post|resources|redirect|scope|assert_routing|" +
        "translate|localize|extract_locale_from_tld|caches_page|expire_page|caches_action|expire_action|" +
        "cache|expire_fragment|expire_cache_for|observe|cache_sweeper|" +
        "has_many|has_one|belongs_to|has_and_belongs_to_many"
    );

    var keywords = (
        "alias|and|BEGIN|begin|break|case|class|def|defined|do|else|elsif|END|end|ensure|" +
        "__FILE__|finally|for|gem|if|in|__LINE__|module|next|not|or|private|protected|public|" +
        "redo|rescue|retry|return|super|then|undef|unless|until|when|while|yield"
    );

    var buildinConstants = (
        "true|TRUE|false|FALSE|nil|NIL|ARGF|ARGV|DATA|ENV|RUBY_PLATFORM|RUBY_RELEASE_DATE|" +
        "RUBY_VERSION|STDERR|STDIN|STDOUT|TOPLEVEL_BINDING"
    );

    var builtinVariables = (
        "$DEBUG|$defout|$FILENAME|$LOAD_PATH|$SAFE|$stdin|$stdout|$stderr|$VERBOSE|" +
        "$!|root_url|flash|session|cookies|params|request|response|logger|self"
    );

    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword": keywords,
        "constant.language": buildinConstants,
        "variable.language": builtinVariables,
        "support.function": builtinFunctions,
        "invalid.deprecated": "debugger" // TODO is this a remnant from js mode?
    }, "identifier");

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "#.*$"
            }, {
                token : "comment", // multi line comment
                regex : "^=begin(?:$|\\s.*$)",
                next : "comment"
            }, {
                token : "string.regexp",
                regex : "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"
            },

            [{
                regex: "[{}]", onMatch: function(val, state, stack) {
                    this.next = val == "{" ? this.nextState : "";
                    if (val == "{" && stack.length) {
                        stack.unshift("start", state);
                        return "paren.lparen";
                    }
                    if (val == "}" && stack.length) {
                        stack.shift();
                        this.next = stack.shift();
                        if (this.next.indexOf("string") != -1)
                            return "paren.end";
                    }
                    return val == "{" ? "paren.lparen" : "paren.rparen";
                },
                nextState: "start"
            }, {
                token : "string.start",
                regex : /"/,
                push  : [{
                    token : "constant.language.escape",
                    regex : /\\(?:[nsrtvfbae'"\\]|c.|C-.|M-.(?:\\C-.)?|[0-7]{3}|x[\da-fA-F]{2}|u[\da-fA-F]{4})/
                }, {
                    token : "paren.start",
                    regex : /#{/,
                    push  : "start"
                }, {
                    token : "string.end",
                    regex : /"/,
                    next  : "pop"
                }, {
                    defaultToken: "string"
                }]
            }, {
                token : "string.start",
                regex : /`/,
                push  : [{
                    token : "constant.language.escape",
                    regex : /\\(?:[nsrtvfbae'"\\]|c.|C-.|M-.(?:\\C-.)?|[0-7]{3}|x[\da-fA-F]{2}|u[\da-fA-F]{4})/
                }, {
                    token : "paren.start",
                    regex : /#{/,
                    push  : "start"
                }, {
                    token : "string.end",
                    regex : /`/,
                    next  : "pop"
                }, {
                    defaultToken: "string"
                }]
            }, {
                token : "string.start",
                regex : /'/,
                push  : [{
                    token : "constant.language.escape",
                    regex : /\\['\\]/
                },  {
                    token : "string.end",
                    regex : /'/,
                    next  : "pop"
                }, {
                    defaultToken: "string"
                }]
            }],

            {
                token : "text", // namespaces aren't symbols
                regex : "::"
            }, {
                token : "variable.instance", // instance variable
                regex : "@{1,2}[a-zA-Z_\\d]+"
            }, {
                token : "support.class", // class name
                regex : "[A-Z][a-zA-Z_\\d]+"
            },

            constantOtherSymbol,
            constantNumericHex,
            constantNumericFloat,

            {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "punctuation.separator.key-value",
                regex : "=>"
            }, {
                stateName: "heredoc",
                onMatch : function(value, currentState, stack) {
                    var next = value[2] == '-' ? "indentedHeredoc" : "heredoc";
                    var tokens = value.split(this.splitRegex);
                    stack.push(next, tokens[3]);
                    return [
                        {type:"constant", value: tokens[1]},
                        {type:"string", value: tokens[2]},
                        {type:"support.class", value: tokens[3]},
                        {type:"string", value: tokens[4]}
                    ];
                },
                regex : "(<<-?)(['\"`]?)([\\w]+)(['\"`]?)",
                rules: {
                    heredoc: [{
                        onMatch:  function(value, currentState, stack) {
                            if (value === stack[1]) {
                                stack.shift();
                                stack.shift();
                                this.next = stack[0] || "start";
                                return "support.class";
                            }
                            this.next = "";
                            return "string";
                        },
                        regex: ".*$",
                        next: "start"
                    }],
                    indentedHeredoc: [{
                        token: "string",
                        regex: "^ +"
                    }, {
                        onMatch:  function(value, currentState, stack) {
                            if (value === stack[1]) {
                                stack.shift();
                                stack.shift();
                                this.next = stack[0] || "start";
                                return "support.class";
                            }
                            this.next = "";
                            return "string";
                        },
                        regex: ".*$",
                        next: "start"
                    }]
                }
            }, {
                regex : "$",
                token : "empty",
                next : function(currentState, stack) {
                    if (stack[0] === "heredoc" || stack[0] === "indentedHeredoc")
                        return stack[0];
                    return currentState;
                }
            }, {
               token : "string.character",
               regex : "\\B\\?."
            }, {
                token : "keyword.operator",
                regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : "^=end(?:$|\\s.*$)",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ]
    };

    this.normalizeRules();
};

oop.inherits(RubyHighlightRules, TextHighlightRules);

exports.RubyHighlightRules = RubyHighlightRules;
});

ace.define("ace/mode/autohotkey_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var AutoHotKeyHighlightRules = function() {
    var autoItKeywords = 'And|ByRef|Case|Const|ContinueCase|ContinueLoop|Default|Dim|Do|Else|ElseIf|EndFunc|EndIf|EndSelect|EndSwitch|EndWith|Enum|Exit|ExitLoop|False|For|Func|Global|If|In|Local|Next|Not|Or|ReDim|Return|Select|Step|Switch|Then|To|True|Until|WEnd|While|With|' +       
        'Abs|ACos|AdlibDisable|AdlibEnable|Asc|AscW|ASin|Assign|ATan|AutoItSetOption|AutoItWinGetTitle|AutoItWinSetTitle|Beep|Binary|BinaryLen|BinaryMid|BinaryToString|BitAND|BitNOT|BitOR|BitRotate|BitShift|BitXOR|BlockInput|Break|Call|CDTray|Ceiling|Chr|ChrW|ClipGet|ClipPut|ConsoleRead|ConsoleWrite|ConsoleWriteError|ControlClick|ControlCommand|ControlDisable|ControlEnable|ControlFocus|ControlGetFocus|ControlGetHandle|ControlGetPos|ControlGetText|ControlHide|ControlListView|ControlMove|ControlSend|ControlSetText|ControlShow|ControlTreeView|Cos|Dec|DirCopy|DirCreate|DirGetSize|DirMove|DirRemove|DllCall|DllCallbackFree|DllCallbackGetPtr|DllCallbackRegister|DllClose|DllOpen|DllStructCreate|DllStructGetData|DllStructGetPtr|DllStructGetSize|DllStructSetData|DriveGetDrive|DriveGetFileSystem|DriveGetLabel|DriveGetSerial|DriveGetType|DriveMapAdd|DriveMapDel|DriveMapGet|DriveSetLabel|DriveSpaceFree|DriveSpaceTotal|DriveStatus|EnvGet|EnvSet|EnvUpdate|Eval|Execute|Exp|FileChangeDir|FileClose|FileCopy|FileCreateNTFSLink|FileCreateShortcut|FileDelete|FileExists|FileFindFirstFile|FileFindNextFile|FileGetAttrib|FileGetLongName|FileGetShortcut|FileGetShortName|FileGetSize|FileGetTime|FileGetVersion|FileInstall|FileMove|FileOpen|FileOpenDialog|FileRead|FileReadLine|FileRecycle|FileRecycleEmpty|FileSaveDialog|FileSelectFolder|FileSetAttrib|FileSetTime|FileWrite|FileWriteLine|Floor|FtpSetProxy|GUICreate|GUICtrlCreateAvi|GUICtrlCreateButton|GUICtrlCreateCheckbox|GUICtrlCreateCombo|GUICtrlCreateContextMenu|GUICtrlCreateDate|GUICtrlCreateDummy|GUICtrlCreateEdit|GUICtrlCreateGraphic|GUICtrlCreateGroup|GUICtrlCreateIcon|GUICtrlCreateInput|GUICtrlCreateLabel|GUICtrlCreateList|GUICtrlCreateListView|GUICtrlCreateListViewItem|GUICtrlCreateMenu|GUICtrlCreateMenuItem|GUICtrlCreateMonthCal|GUICtrlCreateObj|GUICtrlCreatePic|GUICtrlCreateProgress|GUICtrlCreateRadio|GUICtrlCreateSlider|GUICtrlCreateTab|GUICtrlCreateTabItem|GUICtrlCreateTreeView|GUICtrlCreateTreeViewItem|GUICtrlCreateUpdown|GUICtrlDelete|GUICtrlGetHandle|GUICtrlGetState|GUICtrlRead|GUICtrlRecvMsg|GUICtrlRegisterListViewSort|GUICtrlSendMsg|GUICtrlSendToDummy|GUICtrlSetBkColor|GUICtrlSetColor|GUICtrlSetCursor|GUICtrlSetData|GUICtrlSetFont|GUICtrlSetDefColor|GUICtrlSetDefBkColor|GUICtrlSetGraphic|GUICtrlSetImage|GUICtrlSetLimit|GUICtrlSetOnEvent|GUICtrlSetPos|GUICtrlSetResizing|GUICtrlSetState|GUICtrlSetStyle|GUICtrlSetTip|GUIDelete|GUIGetCursorInfo|GUIGetMsg|GUIGetStyle|GUIRegisterMsg|GUISetAccelerators()|GUISetBkColor|GUISetCoord|GUISetCursor|GUISetFont|GUISetHelp|GUISetIcon|GUISetOnEvent|GUISetState|GUISetStyle|GUIStartGroup|GUISwitch|Hex|HotKeySet|HttpSetProxy|HWnd|InetGet|InetGetSize|IniDelete|IniRead|IniReadSection|IniReadSectionNames|IniRenameSection|IniWrite|IniWriteSection|InputBox|Int|IsAdmin|IsArray|IsBinary|IsBool|IsDeclared|IsDllStruct|IsFloat|IsHWnd|IsInt|IsKeyword|IsNumber|IsObj|IsPtr|IsString|Log|MemGetStats|Mod|MouseClick|MouseClickDrag|MouseDown|MouseGetCursor|MouseGetPos|MouseMove|MouseUp|MouseWheel|MsgBox|Number|ObjCreate|ObjEvent|ObjGet|ObjName|Opt|Ping|PixelChecksum|PixelGetColor|PixelSearch|PluginClose|PluginOpen|ProcessClose|ProcessExists|ProcessGetStats|ProcessList|ProcessSetPriority|ProcessWait|ProcessWaitClose|ProgressOff|ProgressOn|ProgressSet|Ptr|Random|RegDelete|RegEnumKey|RegEnumVal|RegRead|RegWrite|Round|Run|RunAs|RunAsWait|RunWait|Send|SendKeepActive|SetError|SetExtended|ShellExecute|ShellExecuteWait|Shutdown|Sin|Sleep|SoundPlay|SoundSetWaveVolume|SplashImageOn|SplashOff|SplashTextOn|Sqrt|SRandom|StatusbarGetText|StderrRead|StdinWrite|StdioClose|StdoutRead|String|StringAddCR|StringCompare|StringFormat|StringInStr|StringIsAlNum|StringIsAlpha|StringIsASCII|StringIsDigit|StringIsFloat|StringIsInt|StringIsLower|StringIsSpace|StringIsUpper|StringIsXDigit|StringLeft|StringLen|StringLower|StringMid|StringRegExp|StringRegExpReplace|StringReplace|StringRight|StringSplit|StringStripCR|StringStripWS|StringToBinary|StringTrimLeft|StringTrimRight|StringUpper|Tan|TCPAccept|TCPCloseSocket|TCPConnect|TCPListen|TCPNameToIP|TCPRecv|TCPSend|TCPShutdown|TCPStartup|TimerDiff|TimerInit|ToolTip|TrayCreateItem|TrayCreateMenu|TrayGetMsg|TrayItemDelete|TrayItemGetHandle|TrayItemGetState|TrayItemGetText|TrayItemSetOnEvent|TrayItemSetState|TrayItemSetText|TraySetClick|TraySetIcon|TraySetOnEvent|TraySetPauseIcon|TraySetState|TraySetToolTip|TrayTip|UBound|UDPBind|UDPCloseSocket|UDPOpen|UDPRecv|UDPSend|UDPShutdown|UDPStartup|VarGetType|WinActivate|WinActive|WinClose|WinExists|WinFlash|WinGetCaretPos|WinGetClassList|WinGetClientSize|WinGetHandle|WinGetPos|WinGetProcess|WinGetState|WinGetText|WinGetTitle|WinKill|WinList|WinMenuSelectItem|WinMinimizeAll|WinMinimizeAllUndo|WinMove|WinSetOnTop|WinSetState|WinSetTitle|WinSetTrans|WinWait|WinWaitActive|WinWaitClose|WinWaitNotActive|' +
        'ArrayAdd|ArrayBinarySearch|ArrayConcatenate|ArrayDelete|ArrayDisplay|ArrayFindAll|ArrayInsert|ArrayMax|ArrayMaxIndex|ArrayMin|ArrayMinIndex|ArrayPop|ArrayPush|ArrayReverse|ArraySearch|ArraySort|ArraySwap|ArrayToClip|ArrayToString|ArrayTrim|ChooseColor|ChooseFont|ClipBoard_ChangeChain|ClipBoard_Close|ClipBoard_CountFormats|ClipBoard_Empty|ClipBoard_EnumFormats|ClipBoard_FormatStr|ClipBoard_GetData|ClipBoard_GetDataEx|ClipBoard_GetFormatName|ClipBoard_GetOpenWindow|ClipBoard_GetOwner|ClipBoard_GetPriorityFormat|ClipBoard_GetSequenceNumber|ClipBoard_GetViewer|ClipBoard_IsFormatAvailable|ClipBoard_Open|ClipBoard_RegisterFormat|ClipBoard_SetData|ClipBoard_SetDataEx|ClipBoard_SetViewer|ClipPutFile|ColorConvertHSLtoRGB|ColorConvertRGBtoHSL|ColorGetBlue|ColorGetGreen|ColorGetRed|Date_Time_CompareFileTime|Date_Time_DOSDateTimeToArray|Date_Time_DOSDateTimeToFileTime|Date_Time_DOSDateTimeToStr|Date_Time_DOSDateToArray|Date_Time_DOSDateToStr|Date_Time_DOSTimeToArray|Date_Time_DOSTimeToStr|Date_Time_EncodeFileTime|Date_Time_EncodeSystemTime|Date_Time_FileTimeToArray|Date_Time_FileTimeToDOSDateTime|Date_Time_FileTimeToLocalFileTime|Date_Time_FileTimeToStr|Date_Time_FileTimeToSystemTime|Date_Time_GetFileTime|Date_Time_GetLocalTime|Date_Time_GetSystemTime|Date_Time_GetSystemTimeAdjustment|Date_Time_GetSystemTimeAsFileTime|Date_Time_GetSystemTimes|Date_Time_GetTickCount|Date_Time_GetTimeZoneInformation|Date_Time_LocalFileTimeToFileTime|Date_Time_SetFileTime|Date_Time_SetLocalTime|Date_Time_SetSystemTime|Date_Time_SetSystemTimeAdjustment|Date_Time_SetTimeZoneInformation|Date_Time_SystemTimeToArray|Date_Time_SystemTimeToDateStr|Date_Time_SystemTimeToDateTimeStr|Date_Time_SystemTimeToFileTime|Date_Time_SystemTimeToTimeStr|Date_Time_SystemTimeToTzSpecificLocalTime|Date_Time_TzSpecificLocalTimeToSystemTime|DateAdd|DateDayOfWeek|DateDaysInMonth|DateDiff|DateIsLeapYear|DateIsValid|DateTimeFormat|DateTimeSplit|DateToDayOfWeek|DateToDayOfWeekISO|DateToDayValue|DateToMonth|DayValueToDate|DebugBugReportEnv|DebugOut|DebugSetup|Degree|EventLog__Backup|EventLog__Clear|EventLog__Close|EventLog__Count|EventLog__DeregisterSource|EventLog__Full|EventLog__Notify|EventLog__Oldest|EventLog__Open|EventLog__OpenBackup|EventLog__Read|EventLog__RegisterSource|EventLog__Report|FileCountLines|FileCreate|FileListToArray|FilePrint|FileReadToArray|FileWriteFromArray|FileWriteLog|FileWriteToLine|GDIPlus_ArrowCapCreate|GDIPlus_ArrowCapDispose|GDIPlus_ArrowCapGetFillState|GDIPlus_ArrowCapGetHeight|GDIPlus_ArrowCapGetMiddleInset|GDIPlus_ArrowCapGetWidth|GDIPlus_ArrowCapSetFillState|GDIPlus_ArrowCapSetHeight|GDIPlus_ArrowCapSetMiddleInset|GDIPlus_ArrowCapSetWidth|GDIPlus_BitmapCloneArea|GDIPlus_BitmapCreateFromFile|GDIPlus_BitmapCreateFromGraphics|GDIPlus_BitmapCreateFromHBITMAP|GDIPlus_BitmapCreateHBITMAPFromBitmap|GDIPlus_BitmapDispose|GDIPlus_BitmapLockBits|GDIPlus_BitmapUnlockBits|GDIPlus_BrushClone|GDIPlus_BrushCreateSolid|GDIPlus_BrushDispose|GDIPlus_BrushGetType|GDIPlus_CustomLineCapDispose|GDIPlus_Decoders|GDIPlus_DecodersGetCount|GDIPlus_DecodersGetSize|GDIPlus_Encoders|GDIPlus_EncodersGetCLSID|GDIPlus_EncodersGetCount|GDIPlus_EncodersGetParamList|GDIPlus_EncodersGetParamListSize|GDIPlus_EncodersGetSize|GDIPlus_FontCreate|GDIPlus_FontDispose|GDIPlus_FontFamilyCreate|GDIPlus_FontFamilyDispose|GDIPlus_GraphicsClear|GDIPlus_GraphicsCreateFromHDC|GDIPlus_GraphicsCreateFromHWND|GDIPlus_GraphicsDispose|GDIPlus_GraphicsDrawArc|GDIPlus_GraphicsDrawBezier|GDIPlus_GraphicsDrawClosedCurve|GDIPlus_GraphicsDrawCurve|GDIPlus_GraphicsDrawEllipse|GDIPlus_GraphicsDrawImage|GDIPlus_GraphicsDrawImageRect|GDIPlus_GraphicsDrawImageRectRect|GDIPlus_GraphicsDrawLine|GDIPlus_GraphicsDrawPie|GDIPlus_GraphicsDrawPolygon|GDIPlus_GraphicsDrawRect|GDIPlus_GraphicsDrawString|GDIPlus_GraphicsDrawStringEx|GDIPlus_GraphicsFillClosedCurve|GDIPlus_GraphicsFillEllipse|GDIPlus_GraphicsFillPie|GDIPlus_GraphicsFillRect|GDIPlus_GraphicsGetDC|GDIPlus_GraphicsGetSmoothingMode|GDIPlus_GraphicsMeasureString|GDIPlus_GraphicsReleaseDC|GDIPlus_GraphicsSetSmoothingMode|GDIPlus_GraphicsSetTransform|GDIPlus_ImageDispose|GDIPlus_ImageGetGraphicsContext|GDIPlus_ImageGetHeight|GDIPlus_ImageGetWidth|GDIPlus_ImageLoadFromFile|GDIPlus_ImageSaveToFile|GDIPlus_ImageSaveToFileEx|GDIPlus_MatrixCreate|GDIPlus_MatrixDispose|GDIPlus_MatrixRotate|GDIPlus_ParamAdd|GDIPlus_ParamInit|GDIPlus_PenCreate|GDIPlus_PenDispose|GDIPlus_PenGetAlignment|GDIPlus_PenGetColor|GDIPlus_PenGetCustomEndCap|GDIPlus_PenGetDashCap|GDIPlus_PenGetDashStyle|GDIPlus_PenGetEndCap|GDIPlus_PenGetWidth|GDIPlus_PenSetAlignment|GDIPlus_PenSetColor|GDIPlus_PenSetCustomEndCap|GDIPlus_PenSetDashCap|GDIPlus_PenSetDashStyle|GDIPlus_PenSetEndCap|GDIPlus_PenSetWidth|GDIPlus_RectFCreate|GDIPlus_Shutdown|GDIPlus_Startup|GDIPlus_StringFormatCreate|GDIPlus_StringFormatDispose|GetIP|GUICtrlAVI_Close|GUICtrlAVI_Create|GUICtrlAVI_Destroy|GUICtrlAVI_Open|GUICtrlAVI_OpenEx|GUICtrlAVI_Play|GUICtrlAVI_Seek|GUICtrlAVI_Show|GUICtrlAVI_Stop|GUICtrlButton_Click|GUICtrlButton_Create|GUICtrlButton_Destroy|GUICtrlButton_Enable|GUICtrlButton_GetCheck|GUICtrlButton_GetFocus|GUICtrlButton_GetIdealSize|GUICtrlButton_GetImage|GUICtrlButton_GetImageList|GUICtrlButton_GetState|GUICtrlButton_GetText|GUICtrlButton_GetTextMargin|GUICtrlButton_SetCheck|GUICtrlButton_SetFocus|GUICtrlButton_SetImage|GUICtrlButton_SetImageList|GUICtrlButton_SetSize|GUICtrlButton_SetState|GUICtrlButton_SetStyle|GUICtrlButton_SetText|GUICtrlButton_SetTextMargin|GUICtrlButton_Show|GUICtrlComboBox_AddDir|GUICtrlComboBox_AddString|GUICtrlComboBox_AutoComplete|GUICtrlComboBox_BeginUpdate|GUICtrlComboBox_Create|GUICtrlComboBox_DeleteString|GUICtrlComboBox_Destroy|GUICtrlComboBox_EndUpdate|GUICtrlComboBox_FindString|GUICtrlComboBox_FindStringExact|GUICtrlComboBox_GetComboBoxInfo|GUICtrlComboBox_GetCount|GUICtrlComboBox_GetCurSel|GUICtrlComboBox_GetDroppedControlRect|GUICtrlComboBox_GetDroppedControlRectEx|GUICtrlComboBox_GetDroppedState|GUICtrlComboBox_GetDroppedWidth|GUICtrlComboBox_GetEditSel|GUICtrlComboBox_GetEditText|GUICtrlComboBox_GetExtendedUI|GUICtrlComboBox_GetHorizontalExtent|GUICtrlComboBox_GetItemHeight|GUICtrlComboBox_GetLBText|GUICtrlComboBox_GetLBTextLen|GUICtrlComboBox_GetList|GUICtrlComboBox_GetListArray|GUICtrlComboBox_GetLocale|GUICtrlComboBox_GetLocaleCountry|GUICtrlComboBox_GetLocaleLang|GUICtrlComboBox_GetLocalePrimLang|GUICtrlComboBox_GetLocaleSubLang|GUICtrlComboBox_GetMinVisible|GUICtrlComboBox_GetTopIndex|GUICtrlComboBox_InitStorage|GUICtrlComboBox_InsertString|GUICtrlComboBox_LimitText|GUICtrlComboBox_ReplaceEditSel|GUICtrlComboBox_ResetContent|GUICtrlComboBox_SelectString|GUICtrlComboBox_SetCurSel|GUICtrlComboBox_SetDroppedWidth|GUICtrlComboBox_SetEditSel|GUICtrlComboBox_SetEditText|GUICtrlComboBox_SetExtendedUI|GUICtrlComboBox_SetHorizontalExtent|GUICtrlComboBox_SetItemHeight|GUICtrlComboBox_SetMinVisible|GUICtrlComboBox_SetTopIndex|GUICtrlComboBox_ShowDropDown|GUICtrlComboBoxEx_AddDir|GUICtrlComboBoxEx_AddString|GUICtrlComboBoxEx_BeginUpdate|GUICtrlComboBoxEx_Create|GUICtrlComboBoxEx_CreateSolidBitMap|GUICtrlComboBoxEx_DeleteString|GUICtrlComboBoxEx_Destroy|GUICtrlComboBoxEx_EndUpdate|GUICtrlComboBoxEx_FindStringExact|GUICtrlComboBoxEx_GetComboBoxInfo|GUICtrlComboBoxEx_GetComboControl|GUICtrlComboBoxEx_GetCount|GUICtrlComboBoxEx_GetCurSel|GUICtrlComboBoxEx_GetDroppedControlRect|GUICtrlComboBoxEx_GetDroppedControlRectEx|GUICtrlComboBoxEx_GetDroppedState|GUICtrlComboBoxEx_GetDroppedWidth|GUICtrlComboBoxEx_GetEditControl|GUICtrlComboBoxEx_GetEditSel|GUICtrlComboBoxEx_GetEditText|GUICtrlComboBoxEx_GetExtendedStyle|GUICtrlComboBoxEx_GetExtendedUI|GUICtrlComboBoxEx_GetImageList|GUICtrlComboBoxEx_GetItem|GUICtrlComboBoxEx_GetItemEx|GUICtrlComboBoxEx_GetItemHeight|GUICtrlComboBoxEx_GetItemImage|GUICtrlComboBoxEx_GetItemIndent|GUICtrlComboBoxEx_GetItemOverlayImage|GUICtrlComboBoxEx_GetItemParam|GUICtrlComboBoxEx_GetItemSelectedImage|GUICtrlComboBoxEx_GetItemText|GUICtrlComboBoxEx_GetItemTextLen|GUICtrlComboBoxEx_GetList|GUICtrlComboBoxEx_GetListArray|GUICtrlComboBoxEx_GetLocale|GUICtrlComboBoxEx_GetLocaleCountry|GUICtrlComboBoxEx_GetLocaleLang|GUICtrlComboBoxEx_GetLocalePrimLang|GUICtrlComboBoxEx_GetLocaleSubLang|GUICtrlComboBoxEx_GetMinVisible|GUICtrlComboBoxEx_GetTopIndex|GUICtrlComboBoxEx_InitStorage|GUICtrlComboBoxEx_InsertString|GUICtrlComboBoxEx_LimitText|GUICtrlComboBoxEx_ReplaceEditSel|GUICtrlComboBoxEx_ResetContent|GUICtrlComboBoxEx_SetCurSel|GUICtrlComboBoxEx_SetDroppedWidth|GUICtrlComboBoxEx_SetEditSel|GUICtrlComboBoxEx_SetEditText|GUICtrlComboBoxEx_SetExtendedStyle|GUICtrlComboBoxEx_SetExtendedUI|GUICtrlComboBoxEx_SetImageList|GUICtrlComboBoxEx_SetItem|GUICtrlComboBoxEx_SetItemEx|GUICtrlComboBoxEx_SetItemHeight|GUICtrlComboBoxEx_SetItemImage|GUICtrlComboBoxEx_SetItemIndent|GUICtrlComboBoxEx_SetItemOverlayImage|GUICtrlComboBoxEx_SetItemParam|GUICtrlComboBoxEx_SetItemSelectedImage|GUICtrlComboBoxEx_SetMinVisible|GUICtrlComboBoxEx_SetTopIndex|GUICtrlComboBoxEx_ShowDropDown|GUICtrlDTP_Create|GUICtrlDTP_Destroy|GUICtrlDTP_GetMCColor|GUICtrlDTP_GetMCFont|GUICtrlDTP_GetMonthCal|GUICtrlDTP_GetRange|GUICtrlDTP_GetRangeEx|GUICtrlDTP_GetSystemTime|GUICtrlDTP_GetSystemTimeEx|GUICtrlDTP_SetFormat|GUICtrlDTP_SetMCColor|GUICtrlDTP_SetMCFont|GUICtrlDTP_SetRange|GUICtrlDTP_SetRangeEx|GUICtrlDTP_SetSystemTime|GUICtrlDTP_SetSystemTimeEx|GUICtrlEdit_AppendText|GUICtrlEdit_BeginUpdate|GUICtrlEdit_CanUndo|GUICtrlEdit_CharFromPos|GUICtrlEdit_Create|GUICtrlEdit_Destroy|GUICtrlEdit_EmptyUndoBuffer|GUICtrlEdit_EndUpdate|GUICtrlEdit_Find|GUICtrlEdit_FmtLines|GUICtrlEdit_GetFirstVisibleLine|GUICtrlEdit_GetLimitText|GUICtrlEdit_GetLine|GUICtrlEdit_GetLineCount|GUICtrlEdit_GetMargins|GUICtrlEdit_GetModify|GUICtrlEdit_GetPasswordChar|GUICtrlEdit_GetRECT|GUICtrlEdit_GetRECTEx|GUICtrlEdit_GetSel|GUICtrlEdit_GetText|GUICtrlEdit_GetTextLen|GUICtrlEdit_HideBalloonTip|GUICtrlEdit_InsertText|GUICtrlEdit_LineFromChar|GUICtrlEdit_LineIndex|GUICtrlEdit_LineLength|GUICtrlEdit_LineScroll|GUICtrlEdit_PosFromChar|GUICtrlEdit_ReplaceSel|GUICtrlEdit_Scroll|GUICtrlEdit_SetLimitText|GUICtrlEdit_SetMargins|GUICtrlEdit_SetModify|GUICtrlEdit_SetPasswordChar|GUICtrlEdit_SetReadOnly|GUICtrlEdit_SetRECT|GUICtrlEdit_SetRECTEx|GUICtrlEdit_SetRECTNP|GUICtrlEdit_SetRectNPEx|GUICtrlEdit_SetSel|GUICtrlEdit_SetTabStops|GUICtrlEdit_SetText|GUICtrlEdit_ShowBalloonTip|GUICtrlEdit_Undo|GUICtrlHeader_AddItem|GUICtrlHeader_ClearFilter|GUICtrlHeader_ClearFilterAll|GUICtrlHeader_Create|GUICtrlHeader_CreateDragImage|GUICtrlHeader_DeleteItem|GUICtrlHeader_Destroy|GUICtrlHeader_EditFilter|GUICtrlHeader_GetBitmapMargin|GUICtrlHeader_GetImageList|GUICtrlHeader_GetItem|GUICtrlHeader_GetItemAlign|GUICtrlHeader_GetItemBitmap|GUICtrlHeader_GetItemCount|GUICtrlHeader_GetItemDisplay|GUICtrlHeader_GetItemFlags|GUICtrlHeader_GetItemFormat|GUICtrlHeader_GetItemImage|GUICtrlHeader_GetItemOrder|GUICtrlHeader_GetItemParam|GUICtrlHeader_GetItemRect|GUICtrlHeader_GetItemRectEx|GUICtrlHeader_GetItemText|GUICtrlHeader_GetItemWidth|GUICtrlHeader_GetOrderArray|GUICtrlHeader_GetUnicodeFormat|GUICtrlHeader_HitTest|GUICtrlHeader_InsertItem|GUICtrlHeader_Layout|GUICtrlHeader_OrderToIndex|GUICtrlHeader_SetBitmapMargin|GUICtrlHeader_SetFilterChangeTimeout|GUICtrlHeader_SetHotDivider|GUICtrlHeader_SetImageList|GUICtrlHeader_SetItem|GUICtrlHeader_SetItemAlign|GUICtrlHeader_SetItemBitmap|GUICtrlHeader_SetItemDisplay|GUICtrlHeader_SetItemFlags|GUICtrlHeader_SetItemFormat|GUICtrlHeader_SetItemImage|GUICtrlHeader_SetItemOrder|GUICtrlHeader_SetItemParam|GUICtrlHeader_SetItemText|GUICtrlHeader_SetItemWidth|GUICtrlHeader_SetOrderArray|GUICtrlHeader_SetUnicodeFormat|GUICtrlIpAddress_ClearAddress|GUICtrlIpAddress_Create|GUICtrlIpAddress_Destroy|GUICtrlIpAddress_Get|GUICtrlIpAddress_GetArray|GUICtrlIpAddress_GetEx|GUICtrlIpAddress_IsBlank|GUICtrlIpAddress_Set|GUICtrlIpAddress_SetArray|GUICtrlIpAddress_SetEx|GUICtrlIpAddress_SetFocus|GUICtrlIpAddress_SetFont|GUICtrlIpAddress_SetRange|GUICtrlIpAddress_ShowHide|GUICtrlListBox_AddFile|GUICtrlListBox_AddString|GUICtrlListBox_BeginUpdate|GUICtrlListBox_Create|GUICtrlListBox_DeleteString|GUICtrlListBox_Destroy|GUICtrlListBox_Dir|GUICtrlListBox_EndUpdate|GUICtrlListBox_FindInText|GUICtrlListBox_FindString|GUICtrlListBox_GetAnchorIndex|GUICtrlListBox_GetCaretIndex|GUICtrlListBox_GetCount|GUICtrlListBox_GetCurSel|GUICtrlListBox_GetHorizontalExtent|GUICtrlListBox_GetItemData|GUICtrlListBox_GetItemHeight|GUICtrlListBox_GetItemRect|GUICtrlListBox_GetItemRectEx|GUICtrlListBox_GetListBoxInfo|GUICtrlListBox_GetLocale|GUICtrlListBox_GetLocaleCountry|GUICtrlListBox_GetLocaleLang|GUICtrlListBox_GetLocalePrimLang|GUICtrlListBox_GetLocaleSubLang|GUICtrlListBox_GetSel|GUICtrlListBox_GetSelCount|GUICtrlListBox_GetSelItems|GUICtrlListBox_GetSelItemsText|GUICtrlListBox_GetText|GUICtrlListBox_GetTextLen|GUICtrlListBox_GetTopIndex|GUICtrlListBox_InitStorage|GUICtrlListBox_InsertString|GUICtrlListBox_ItemFromPoint|GUICtrlListBox_ReplaceString|GUICtrlListBox_ResetContent|GUICtrlListBox_SelectString|GUICtrlListBox_SelItemRange|GUICtrlListBox_SelItemRangeEx|GUICtrlListBox_SetAnchorIndex|GUICtrlListBox_SetCaretIndex|GUICtrlListBox_SetColumnWidth|GUICtrlListBox_SetCurSel|GUICtrlListBox_SetHorizontalExtent|GUICtrlListBox_SetItemData|GUICtrlListBox_SetItemHeight|GUICtrlListBox_SetLocale|GUICtrlListBox_SetSel|GUICtrlListBox_SetTabStops|GUICtrlListBox_SetTopIndex|GUICtrlListBox_Sort|GUICtrlListBox_SwapString|GUICtrlListBox_UpdateHScroll|GUICtrlListView_AddArray|GUICtrlListView_AddColumn|GUICtrlListView_AddItem|GUICtrlListView_AddSubItem|GUICtrlListView_ApproximateViewHeight|GUICtrlListView_ApproximateViewRect|GUICtrlListView_ApproximateViewWidth|GUICtrlListView_Arrange|GUICtrlListView_BeginUpdate|GUICtrlListView_CancelEditLabel|GUICtrlListView_ClickItem|GUICtrlListView_CopyItems|GUICtrlListView_Create|GUICtrlListView_CreateDragImage|GUICtrlListView_CreateSolidBitMap|GUICtrlListView_DeleteAllItems|GUICtrlListView_DeleteColumn|GUICtrlListView_DeleteItem|GUICtrlListView_DeleteItemsSelected|GUICtrlListView_Destroy|GUICtrlListView_DrawDragImage|GUICtrlListView_EditLabel|GUICtrlListView_EnableGroupView|GUICtrlListView_EndUpdate|GUICtrlListView_EnsureVisible|GUICtrlListView_FindInText|GUICtrlListView_FindItem|GUICtrlListView_FindNearest|GUICtrlListView_FindParam|GUICtrlListView_FindText|GUICtrlListView_GetBkColor|GUICtrlListView_GetBkImage|GUICtrlListView_GetCallbackMask|GUICtrlListView_GetColumn|GUICtrlListView_GetColumnCount|GUICtrlListView_GetColumnOrder|GUICtrlListView_GetColumnOrderArray|GUICtrlListView_GetColumnWidth|GUICtrlListView_GetCounterPage|GUICtrlListView_GetEditControl|GUICtrlListView_GetExtendedListViewStyle|GUICtrlListView_GetGroupInfo|GUICtrlListView_GetGroupViewEnabled|GUICtrlListView_GetHeader|GUICtrlListView_GetHotCursor|GUICtrlListView_GetHotItem|GUICtrlListView_GetHoverTime|GUICtrlListView_GetImageList|GUICtrlListView_GetISearchString|GUICtrlListView_GetItem|GUICtrlListView_GetItemChecked|GUICtrlListView_GetItemCount|GUICtrlListView_GetItemCut|GUICtrlListView_GetItemDropHilited|GUICtrlListView_GetItemEx|GUICtrlListView_GetItemFocused|GUICtrlListView_GetItemGroupID|GUICtrlListView_GetItemImage|GUICtrlListView_GetItemIndent|GUICtrlListView_GetItemParam|GUICtrlListView_GetItemPosition|GUICtrlListView_GetItemPositionX|GUICtrlListView_GetItemPositionY|GUICtrlListView_GetItemRect|GUICtrlListView_GetItemRectEx|GUICtrlListView_GetItemSelected|GUICtrlListView_GetItemSpacing|GUICtrlListView_GetItemSpacingX|GUICtrlListView_GetItemSpacingY|GUICtrlListView_GetItemState|GUICtrlListView_GetItemStateImage|GUICtrlListView_GetItemText|GUICtrlListView_GetItemTextArray|GUICtrlListView_GetItemTextString|GUICtrlListView_GetNextItem|GUICtrlListView_GetNumberOfWorkAreas|GUICtrlListView_GetOrigin|GUICtrlListView_GetOriginX|GUICtrlListView_GetOriginY|GUICtrlListView_GetOutlineColor|GUICtrlListView_GetSelectedColumn|GUICtrlListView_GetSelectedCount|GUICtrlListView_GetSelectedIndices|GUICtrlListView_GetSelectionMark|GUICtrlListView_GetStringWidth|GUICtrlListView_GetSubItemRect|GUICtrlListView_GetTextBkColor|GUICtrlListView_GetTextColor|GUICtrlListView_GetToolTips|GUICtrlListView_GetTopIndex|GUICtrlListView_GetUnicodeFormat|GUICtrlListView_GetView|GUICtrlListView_GetViewDetails|GUICtrlListView_GetViewLarge|GUICtrlListView_GetViewList|GUICtrlListView_GetViewRect|GUICtrlListView_GetViewSmall|GUICtrlListView_GetViewTile|GUICtrlListView_HideColumn|GUICtrlListView_HitTest|GUICtrlListView_InsertColumn|GUICtrlListView_InsertGroup|GUICtrlListView_InsertItem|GUICtrlListView_JustifyColumn|GUICtrlListView_MapIDToIndex|GUICtrlListView_MapIndexToID|GUICtrlListView_RedrawItems|GUICtrlListView_RegisterSortCallBack|GUICtrlListView_RemoveAllGroups|GUICtrlListView_RemoveGroup|GUICtrlListView_Scroll|GUICtrlListView_SetBkColor|GUICtrlListView_SetBkImage|GUICtrlListView_SetCallBackMask|GUICtrlListView_SetColumn|GUICtrlListView_SetColumnOrder|GUICtrlListView_SetColumnOrderArray|GUICtrlListView_SetColumnWidth|GUICtrlListView_SetExtendedListViewStyle|GUICtrlListView_SetGroupInfo|GUICtrlListView_SetHotItem|GUICtrlListView_SetHoverTime|GUICtrlListView_SetIconSpacing|GUICtrlListView_SetImageList|GUICtrlListView_SetItem|GUICtrlListView_SetItemChecked|GUICtrlListView_SetItemCount|GUICtrlListView_SetItemCut|GUICtrlListView_SetItemDropHilited|GUICtrlListView_SetItemEx|GUICtrlListView_SetItemFocused|GUICtrlListView_SetItemGroupID|GUICtrlListView_SetItemImage|GUICtrlListView_SetItemIndent|GUICtrlListView_SetItemParam|GUICtrlListView_SetItemPosition|GUICtrlListView_SetItemPosition32|GUICtrlListView_SetItemSelected|GUICtrlListView_SetItemState|GUICtrlListView_SetItemStateImage|GUICtrlListView_SetItemText|GUICtrlListView_SetOutlineColor|GUICtrlListView_SetSelectedColumn|GUICtrlListView_SetSelectionMark|GUICtrlListView_SetTextBkColor|GUICtrlListView_SetTextColor|GUICtrlListView_SetToolTips|GUICtrlListView_SetUnicodeFormat|GUICtrlListView_SetView|GUICtrlListView_SetWorkAreas|GUICtrlListView_SimpleSort|GUICtrlListView_SortItems|GUICtrlListView_SubItemHitTest|GUICtrlListView_UnRegisterSortCallBack|GUICtrlMenu_AddMenuItem|GUICtrlMenu_AppendMenu|GUICtrlMenu_CheckMenuItem|GUICtrlMenu_CheckRadioItem|GUICtrlMenu_CreateMenu|GUICtrlMenu_CreatePopup|GUICtrlMenu_DeleteMenu|GUICtrlMenu_DestroyMenu|GUICtrlMenu_DrawMenuBar|GUICtrlMenu_EnableMenuItem|GUICtrlMenu_FindItem|GUICtrlMenu_FindParent|GUICtrlMenu_GetItemBmp|GUICtrlMenu_GetItemBmpChecked|GUICtrlMenu_GetItemBmpUnchecked|GUICtrlMenu_GetItemChecked|GUICtrlMenu_GetItemCount|GUICtrlMenu_GetItemData|GUICtrlMenu_GetItemDefault|GUICtrlMenu_GetItemDisabled|GUICtrlMenu_GetItemEnabled|GUICtrlMenu_GetItemGrayed|GUICtrlMenu_GetItemHighlighted|GUICtrlMenu_GetItemID|GUICtrlMenu_GetItemInfo|GUICtrlMenu_GetItemRect|GUICtrlMenu_GetItemRectEx|GUICtrlMenu_GetItemState|GUICtrlMenu_GetItemStateEx|GUICtrlMenu_GetItemSubMenu|GUICtrlMenu_GetItemText|GUICtrlMenu_GetItemType|GUICtrlMenu_GetMenu|GUICtrlMenu_GetMenuBackground|GUICtrlMenu_GetMenuBarInfo|GUICtrlMenu_GetMenuContextHelpID|GUICtrlMenu_GetMenuData|GUICtrlMenu_GetMenuDefaultItem|GUICtrlMenu_GetMenuHeight|GUICtrlMenu_GetMenuInfo|GUICtrlMenu_GetMenuStyle|GUICtrlMenu_GetSystemMenu|GUICtrlMenu_InsertMenuItem|GUICtrlMenu_InsertMenuItemEx|GUICtrlMenu_IsMenu|GUICtrlMenu_LoadMenu|GUICtrlMenu_MapAccelerator|GUICtrlMenu_MenuItemFromPoint|GUICtrlMenu_RemoveMenu|GUICtrlMenu_SetItemBitmaps|GUICtrlMenu_SetItemBmp|GUICtrlMenu_SetItemBmpChecked|GUICtrlMenu_SetItemBmpUnchecked|GUICtrlMenu_SetItemChecked|GUICtrlMenu_SetItemData|GUICtrlMenu_SetItemDefault|GUICtrlMenu_SetItemDisabled|GUICtrlMenu_SetItemEnabled|GUICtrlMenu_SetItemGrayed|GUICtrlMenu_SetItemHighlighted|GUICtrlMenu_SetItemID|GUICtrlMenu_SetItemInfo|GUICtrlMenu_SetItemState|GUICtrlMenu_SetItemSubMenu|GUICtrlMenu_SetItemText|GUICtrlMenu_SetItemType|GUICtrlMenu_SetMenu|GUICtrlMenu_SetMenuBackground|GUICtrlMenu_SetMenuContextHelpID|GUICtrlMenu_SetMenuData|GUICtrlMenu_SetMenuDefaultItem|GUICtrlMenu_SetMenuHeight|GUICtrlMenu_SetMenuInfo|GUICtrlMenu_SetMenuStyle|GUICtrlMenu_TrackPopupMenu|GUICtrlMonthCal_Create|GUICtrlMonthCal_Destroy|GUICtrlMonthCal_GetColor|GUICtrlMonthCal_GetColorArray|GUICtrlMonthCal_GetCurSel|GUICtrlMonthCal_GetCurSelStr|GUICtrlMonthCal_GetFirstDOW|GUICtrlMonthCal_GetFirstDOWStr|GUICtrlMonthCal_GetMaxSelCount|GUICtrlMonthCal_GetMaxTodayWidth|GUICtrlMonthCal_GetMinReqHeight|GUICtrlMonthCal_GetMinReqRect|GUICtrlMonthCal_GetMinReqRectArray|GUICtrlMonthCal_GetMinReqWidth|GUICtrlMonthCal_GetMonthDelta|GUICtrlMonthCal_GetMonthRange|GUICtrlMonthCal_GetMonthRangeMax|GUICtrlMonthCal_GetMonthRangeMaxStr|GUICtrlMonthCal_GetMonthRangeMin|GUICtrlMonthCal_GetMonthRangeMinStr|GUICtrlMonthCal_GetMonthRangeSpan|GUICtrlMonthCal_GetRange|GUICtrlMonthCal_GetRangeMax|GUICtrlMonthCal_GetRangeMaxStr|GUICtrlMonthCal_GetRangeMin|GUICtrlMonthCal_GetRangeMinStr|GUICtrlMonthCal_GetSelRange|GUICtrlMonthCal_GetSelRangeMax|GUICtrlMonthCal_GetSelRangeMaxStr|GUICtrlMonthCal_GetSelRangeMin|GUICtrlMonthCal_GetSelRangeMinStr|GUICtrlMonthCal_GetToday|GUICtrlMonthCal_GetTodayStr|GUICtrlMonthCal_GetUnicodeFormat|GUICtrlMonthCal_HitTest|GUICtrlMonthCal_SetColor|GUICtrlMonthCal_SetCurSel|GUICtrlMonthCal_SetDayState|GUICtrlMonthCal_SetFirstDOW|GUICtrlMonthCal_SetMaxSelCount|GUICtrlMonthCal_SetMonthDelta|GUICtrlMonthCal_SetRange|GUICtrlMonthCal_SetSelRange|GUICtrlMonthCal_SetToday|GUICtrlMonthCal_SetUnicodeFormat|GUICtrlRebar_AddBand|GUICtrlRebar_AddToolBarBand|GUICtrlRebar_BeginDrag|GUICtrlRebar_Create|GUICtrlRebar_DeleteBand|GUICtrlRebar_Destroy|GUICtrlRebar_DragMove|GUICtrlRebar_EndDrag|GUICtrlRebar_GetBandBackColor|GUICtrlRebar_GetBandBorders|GUICtrlRebar_GetBandBordersEx|GUICtrlRebar_GetBandChildHandle|GUICtrlRebar_GetBandChildSize|GUICtrlRebar_GetBandCount|GUICtrlRebar_GetBandForeColor|GUICtrlRebar_GetBandHeaderSize|GUICtrlRebar_GetBandID|GUICtrlRebar_GetBandIdealSize|GUICtrlRebar_GetBandLength|GUICtrlRebar_GetBandLParam|GUICtrlRebar_GetBandMargins|GUICtrlRebar_GetBandMarginsEx|GUICtrlRebar_GetBandRect|GUICtrlRebar_GetBandRectEx|GUICtrlRebar_GetBandStyle|GUICtrlRebar_GetBandStyleBreak|GUICtrlRebar_GetBandStyleChildEdge|GUICtrlRebar_GetBandStyleFixedBMP|GUICtrlRebar_GetBandStyleFixedSize|GUICtrlRebar_GetBandStyleGripperAlways|GUICtrlRebar_GetBandStyleHidden|GUICtrlRebar_GetBandStyleHideTitle|GUICtrlRebar_GetBandStyleNoGripper|GUICtrlRebar_GetBandStyleTopAlign|GUICtrlRebar_GetBandStyleUseChevron|GUICtrlRebar_GetBandStyleVariableHeight|GUICtrlRebar_GetBandText|GUICtrlRebar_GetBarHeight|GUICtrlRebar_GetBKColor|GUICtrlRebar_GetColorScheme|GUICtrlRebar_GetRowCount|GUICtrlRebar_GetRowHeight|GUICtrlRebar_GetTextColor|GUICtrlRebar_GetToolTips|GUICtrlRebar_GetUnicodeFormat|GUICtrlRebar_HitTest|GUICtrlRebar_IDToIndex|GUICtrlRebar_MaximizeBand|GUICtrlRebar_MinimizeBand|GUICtrlRebar_MoveBand|GUICtrlRebar_SetBandBackColor|GUICtrlRebar_SetBandForeColor|GUICtrlRebar_SetBandHeaderSize|GUICtrlRebar_SetBandID|GUICtrlRebar_SetBandIdealSize|GUICtrlRebar_SetBandLength|GUICtrlRebar_SetBandLParam|GUICtrlRebar_SetBandStyle|GUICtrlRebar_SetBandStyleBreak|GUICtrlRebar_SetBandStyleChildEdge|GUICtrlRebar_SetBandStyleFixedBMP|GUICtrlRebar_SetBandStyleFixedSize|GUICtrlRebar_SetBandStyleGripperAlways|GUICtrlRebar_SetBandStyleHidden|GUICtrlRebar_SetBandStyleHideTitle|GUICtrlRebar_SetBandStyleNoGripper|GUICtrlRebar_SetBandStyleTopAlign|GUICtrlRebar_SetBandStyleUseChevron|GUICtrlRebar_SetBandStyleVariableHeight|GUICtrlRebar_SetBandText|GUICtrlRebar_SetBKColor|GUICtrlRebar_SetColorScheme|GUICtrlRebar_SetTextColor|GUICtrlRebar_SetToolTips|GUICtrlRebar_SetUnicodeFormat|GUICtrlRebar_ShowBand|GUICtrlSlider_ClearSel|GUICtrlSlider_ClearTics|GUICtrlSlider_Create|GUICtrlSlider_Destroy|GUICtrlSlider_GetBuddy|GUICtrlSlider_GetChannelRect|GUICtrlSlider_GetLineSize|GUICtrlSlider_GetNumTics|GUICtrlSlider_GetPageSize|GUICtrlSlider_GetPos|GUICtrlSlider_GetPTics|GUICtrlSlider_GetRange|GUICtrlSlider_GetRangeMax|GUICtrlSlider_GetRangeMin|GUICtrlSlider_GetSel|GUICtrlSlider_GetSelEnd|GUICtrlSlider_GetSelStart|GUICtrlSlider_GetThumbLength|GUICtrlSlider_GetThumbRect|GUICtrlSlider_GetThumbRectEx|GUICtrlSlider_GetTic|GUICtrlSlider_GetTicPos|GUICtrlSlider_GetToolTips|GUICtrlSlider_GetUnicodeFormat|GUICtrlSlider_SetBuddy|GUICtrlSlider_SetLineSize|GUICtrlSlider_SetPageSize|GUICtrlSlider_SetPos|GUICtrlSlider_SetRange|GUICtrlSlider_SetRangeMax|GUICtrlSlider_SetRangeMin|GUICtrlSlider_SetSel|GUICtrlSlider_SetSelEnd|GUICtrlSlider_SetSelStart|GUICtrlSlider_SetThumbLength|GUICtrlSlider_SetTic|GUICtrlSlider_SetTicFreq|GUICtrlSlider_SetTipSide|GUICtrlSlider_SetToolTips|GUICtrlSlider_SetUnicodeFormat|GUICtrlStatusBar_Create|GUICtrlStatusBar_Destroy|GUICtrlStatusBar_EmbedControl|GUICtrlStatusBar_GetBorders|GUICtrlStatusBar_GetBordersHorz|GUICtrlStatusBar_GetBordersRect|GUICtrlStatusBar_GetBordersVert|GUICtrlStatusBar_GetCount|GUICtrlStatusBar_GetHeight|GUICtrlStatusBar_GetIcon|GUICtrlStatusBar_GetParts|GUICtrlStatusBar_GetRect|GUICtrlStatusBar_GetRectEx|GUICtrlStatusBar_GetText|GUICtrlStatusBar_GetTextFlags|GUICtrlStatusBar_GetTextLength|GUICtrlStatusBar_GetTextLengthEx|GUICtrlStatusBar_GetTipText|GUICtrlStatusBar_GetUnicodeFormat|GUICtrlStatusBar_GetWidth|GUICtrlStatusBar_IsSimple|GUICtrlStatusBar_Resize|GUICtrlStatusBar_SetBkColor|GUICtrlStatusBar_SetIcon|GUICtrlStatusBar_SetMinHeight|GUICtrlStatusBar_SetParts|GUICtrlStatusBar_SetSimple|GUICtrlStatusBar_SetText|GUICtrlStatusBar_SetTipText|GUICtrlStatusBar_SetUnicodeFormat|GUICtrlStatusBar_ShowHide|GUICtrlTab_Create|GUICtrlTab_DeleteAllItems|GUICtrlTab_DeleteItem|GUICtrlTab_DeselectAll|GUICtrlTab_Destroy|GUICtrlTab_FindTab|GUICtrlTab_GetCurFocus|GUICtrlTab_GetCurSel|GUICtrlTab_GetDisplayRect|GUICtrlTab_GetDisplayRectEx|GUICtrlTab_GetExtendedStyle|GUICtrlTab_GetImageList|GUICtrlTab_GetItem|GUICtrlTab_GetItemCount|GUICtrlTab_GetItemImage|GUICtrlTab_GetItemParam|GUICtrlTab_GetItemRect|GUICtrlTab_GetItemRectEx|GUICtrlTab_GetItemState|GUICtrlTab_GetItemText|GUICtrlTab_GetRowCount|GUICtrlTab_GetToolTips|GUICtrlTab_GetUnicodeFormat|GUICtrlTab_HighlightItem|GUICtrlTab_HitTest|GUICtrlTab_InsertItem|GUICtrlTab_RemoveImage|GUICtrlTab_SetCurFocus|GUICtrlTab_SetCurSel|GUICtrlTab_SetExtendedStyle|GUICtrlTab_SetImageList|GUICtrlTab_SetItem|GUICtrlTab_SetItemImage|GUICtrlTab_SetItemParam|GUICtrlTab_SetItemSize|GUICtrlTab_SetItemState|GUICtrlTab_SetItemText|GUICtrlTab_SetMinTabWidth|GUICtrlTab_SetPadding|GUICtrlTab_SetToolTips|GUICtrlTab_SetUnicodeFormat|GUICtrlToolbar_AddBitmap|GUICtrlToolbar_AddButton|GUICtrlToolbar_AddButtonSep|GUICtrlToolbar_AddString|GUICtrlToolbar_ButtonCount|GUICtrlToolbar_CheckButton|GUICtrlToolbar_ClickAccel|GUICtrlToolbar_ClickButton|GUICtrlToolbar_ClickIndex|GUICtrlToolbar_CommandToIndex|GUICtrlToolbar_Create|GUICtrlToolbar_Customize|GUICtrlToolbar_DeleteButton|GUICtrlToolbar_Destroy|GUICtrlToolbar_EnableButton|GUICtrlToolbar_FindToolbar|GUICtrlToolbar_GetAnchorHighlight|GUICtrlToolbar_GetBitmapFlags|GUICtrlToolbar_GetButtonBitmap|GUICtrlToolbar_GetButtonInfo|GUICtrlToolbar_GetButtonInfoEx|GUICtrlToolbar_GetButtonParam|GUICtrlToolbar_GetButtonRect|GUICtrlToolbar_GetButtonRectEx|GUICtrlToolbar_GetButtonSize|GUICtrlToolbar_GetButtonState|GUICtrlToolbar_GetButtonStyle|GUICtrlToolbar_GetButtonText|GUICtrlToolbar_GetColorScheme|GUICtrlToolbar_GetDisabledImageList|GUICtrlToolbar_GetExtendedStyle|GUICtrlToolbar_GetHotImageList|GUICtrlToolbar_GetHotItem|GUICtrlToolbar_GetImageList|GUICtrlToolbar_GetInsertMark|GUICtrlToolbar_GetInsertMarkColor|GUICtrlToolbar_GetMaxSize|GUICtrlToolbar_GetMetrics|GUICtrlToolbar_GetPadding|GUICtrlToolbar_GetRows|GUICtrlToolbar_GetString|GUICtrlToolbar_GetStyle|GUICtrlToolbar_GetStyleAltDrag|GUICtrlToolbar_GetStyleCustomErase|GUICtrlToolbar_GetStyleFlat|GUICtrlToolbar_GetStyleList|GUICtrlToolbar_GetStyleRegisterDrop|GUICtrlToolbar_GetStyleToolTips|GUICtrlToolbar_GetStyleTransparent|GUICtrlToolbar_GetStyleWrapable|GUICtrlToolbar_GetTextRows|GUICtrlToolbar_GetToolTips|GUICtrlToolbar_GetUnicodeFormat|GUICtrlToolbar_HideButton|GUICtrlToolbar_HighlightButton|GUICtrlToolbar_HitTest|GUICtrlToolbar_IndexToCommand|GUICtrlToolbar_InsertButton|GUICtrlToolbar_InsertMarkHitTest|GUICtrlToolbar_IsButtonChecked|GUICtrlToolbar_IsButtonEnabled|GUICtrlToolbar_IsButtonHidden|GUICtrlToolbar_IsButtonHighlighted|GUICtrlToolbar_IsButtonIndeterminate|GUICtrlToolbar_IsButtonPressed|GUICtrlToolbar_LoadBitmap|GUICtrlToolbar_LoadImages|GUICtrlToolbar_MapAccelerator|GUICtrlToolbar_MoveButton|GUICtrlToolbar_PressButton|GUICtrlToolbar_SetAnchorHighlight|GUICtrlToolbar_SetBitmapSize|GUICtrlToolbar_SetButtonBitMap|GUICtrlToolbar_SetButtonInfo|GUICtrlToolbar_SetButtonInfoEx|GUICtrlToolbar_SetButtonParam|GUICtrlToolbar_SetButtonSize|GUICtrlToolbar_SetButtonState|GUICtrlToolbar_SetButtonStyle|GUICtrlToolbar_SetButtonText|GUICtrlToolbar_SetButtonWidth|GUICtrlToolbar_SetCmdID|GUICtrlToolbar_SetColorScheme|GUICtrlToolbar_SetDisabledImageList|GUICtrlToolbar_SetDrawTextFlags|GUICtrlToolbar_SetExtendedStyle|GUICtrlToolbar_SetHotImageList|GUICtrlToolbar_SetHotItem|GUICtrlToolbar_SetImageList|GUICtrlToolbar_SetIndent|GUICtrlToolbar_SetIndeterminate|GUICtrlToolbar_SetInsertMark|GUICtrlToolbar_SetInsertMarkColor|GUICtrlToolbar_SetMaxTextRows|GUICtrlToolbar_SetMetrics|GUICtrlToolbar_SetPadding|GUICtrlToolbar_SetParent|GUICtrlToolbar_SetRows|GUICtrlToolbar_SetStyle|GUICtrlToolbar_SetStyleAltDrag|GUICtrlToolbar_SetStyleCustomErase|GUICtrlToolbar_SetStyleFlat|GUICtrlToolbar_SetStyleList|GUICtrlToolbar_SetStyleRegisterDrop|GUICtrlToolbar_SetStyleToolTips|GUICtrlToolbar_SetStyleTransparent|GUICtrlToolbar_SetStyleWrapable|GUICtrlToolbar_SetToolTips|GUICtrlToolbar_SetUnicodeFormat|GUICtrlToolbar_SetWindowTheme|GUICtrlTreeView_Add|GUICtrlTreeView_AddChild|GUICtrlTreeView_AddChildFirst|GUICtrlTreeView_AddFirst|GUICtrlTreeView_BeginUpdate|GUICtrlTreeView_ClickItem|GUICtrlTreeView_Create|GUICtrlTreeView_CreateDragImage|GUICtrlTreeView_CreateSolidBitMap|GUICtrlTreeView_Delete|GUICtrlTreeView_DeleteAll|GUICtrlTreeView_DeleteChildren|GUICtrlTreeView_Destroy|GUICtrlTreeView_DisplayRect|GUICtrlTreeView_DisplayRectEx|GUICtrlTreeView_EditText|GUICtrlTreeView_EndEdit|GUICtrlTreeView_EndUpdate|GUICtrlTreeView_EnsureVisible|GUICtrlTreeView_Expand|GUICtrlTreeView_ExpandedOnce|GUICtrlTreeView_FindItem|GUICtrlTreeView_FindItemEx|GUICtrlTreeView_GetBkColor|GUICtrlTreeView_GetBold|GUICtrlTreeView_GetChecked|GUICtrlTreeView_GetChildCount|GUICtrlTreeView_GetChildren|GUICtrlTreeView_GetCount|GUICtrlTreeView_GetCut|GUICtrlTreeView_GetDropTarget|GUICtrlTreeView_GetEditControl|GUICtrlTreeView_GetExpanded|GUICtrlTreeView_GetFirstChild|GUICtrlTreeView_GetFirstItem|GUICtrlTreeView_GetFirstVisible|GUICtrlTreeView_GetFocused|GUICtrlTreeView_GetHeight|GUICtrlTreeView_GetImageIndex|GUICtrlTreeView_GetImageListIconHandle|GUICtrlTreeView_GetIndent|GUICtrlTreeView_GetInsertMarkColor|GUICtrlTreeView_GetISearchString|GUICtrlTreeView_GetItemByIndex|GUICtrlTreeView_GetItemHandle|GUICtrlTreeView_GetItemParam|GUICtrlTreeView_GetLastChild|GUICtrlTreeView_GetLineColor|GUICtrlTreeView_GetNext|GUICtrlTreeView_GetNextChild|GUICtrlTreeView_GetNextSibling|GUICtrlTreeView_GetNextVisible|GUICtrlTreeView_GetNormalImageList|GUICtrlTreeView_GetParentHandle|GUICtrlTreeView_GetParentParam|GUICtrlTreeView_GetPrev|GUICtrlTreeView_GetPrevChild|GUICtrlTreeView_GetPrevSibling|GUICtrlTreeView_GetPrevVisible|GUICtrlTreeView_GetScrollTime|GUICtrlTreeView_GetSelected|GUICtrlTreeView_GetSelectedImageIndex|GUICtrlTreeView_GetSelection|GUICtrlTreeView_GetSiblingCount|GUICtrlTreeView_GetState|GUICtrlTreeView_GetStateImageIndex|GUICtrlTreeView_GetStateImageList|GUICtrlTreeView_GetText|GUICtrlTreeView_GetTextColor|GUICtrlTreeView_GetToolTips|GUICtrlTreeView_GetTree|GUICtrlTreeView_GetUnicodeFormat|GUICtrlTreeView_GetVisible|GUICtrlTreeView_GetVisibleCount|GUICtrlTreeView_HitTest|GUICtrlTreeView_HitTestEx|GUICtrlTreeView_HitTestItem|GUICtrlTreeView_Index|GUICtrlTreeView_InsertItem|GUICtrlTreeView_IsFirstItem|GUICtrlTreeView_IsParent|GUICtrlTreeView_Level|GUICtrlTreeView_SelectItem|GUICtrlTreeView_SelectItemByIndex|GUICtrlTreeView_SetBkColor|GUICtrlTreeView_SetBold|GUICtrlTreeView_SetChecked|GUICtrlTreeView_SetCheckedByIndex|GUICtrlTreeView_SetChildren|GUICtrlTreeView_SetCut|GUICtrlTreeView_SetDropTarget|GUICtrlTreeView_SetFocused|GUICtrlTreeView_SetHeight|GUICtrlTreeView_SetIcon|GUICtrlTreeView_SetImageIndex|GUICtrlTreeView_SetIndent|GUICtrlTreeView_SetInsertMark|GUICtrlTreeView_SetInsertMarkColor|GUICtrlTreeView_SetItemHeight|GUICtrlTreeView_SetItemParam|GUICtrlTreeView_SetLineColor|GUICtrlTreeView_SetNormalImageList|GUICtrlTreeView_SetScrollTime|GUICtrlTreeView_SetSelected|GUICtrlTreeView_SetSelectedImageIndex|GUICtrlTreeView_SetState|GUICtrlTreeView_SetStateImageIndex|GUICtrlTreeView_SetStateImageList|GUICtrlTreeView_SetText|GUICtrlTreeView_SetTextColor|GUICtrlTreeView_SetToolTips|GUICtrlTreeView_SetUnicodeFormat|GUICtrlTreeView_Sort|GUIImageList_Add|GUIImageList_AddBitmap|GUIImageList_AddIcon|GUIImageList_AddMasked|GUIImageList_BeginDrag|GUIImageList_Copy|GUIImageList_Create|GUIImageList_Destroy|GUIImageList_DestroyIcon|GUIImageList_DragEnter|GUIImageList_DragLeave|GUIImageList_DragMove|GUIImageList_Draw|GUIImageList_DrawEx|GUIImageList_Duplicate|GUIImageList_EndDrag|GUIImageList_GetBkColor|GUIImageList_GetIcon|GUIImageList_GetIconHeight|GUIImageList_GetIconSize|GUIImageList_GetIconSizeEx|GUIImageList_GetIconWidth|GUIImageList_GetImageCount|GUIImageList_GetImageInfoEx|GUIImageList_Remove|GUIImageList_ReplaceIcon|GUIImageList_SetBkColor|GUIImageList_SetIconSize|GUIImageList_SetImageCount|GUIImageList_Swap|GUIScrollBars_EnableScrollBar|GUIScrollBars_GetScrollBarInfoEx|GUIScrollBars_GetScrollBarRect|GUIScrollBars_GetScrollBarRGState|GUIScrollBars_GetScrollBarXYLineButton|GUIScrollBars_GetScrollBarXYThumbBottom|GUIScrollBars_GetScrollBarXYThumbTop|GUIScrollBars_GetScrollInfo|GUIScrollBars_GetScrollInfoEx|GUIScrollBars_GetScrollInfoMax|GUIScrollBars_GetScrollInfoMin|GUIScrollBars_GetScrollInfoPage|GUIScrollBars_GetScrollInfoPos|GUIScrollBars_GetScrollInfoTrackPos|GUIScrollBars_GetScrollPos|GUIScrollBars_GetScrollRange|GUIScrollBars_Init|GUIScrollBars_ScrollWindow|GUIScrollBars_SetScrollInfo|GUIScrollBars_SetScrollInfoMax|GUIScrollBars_SetScrollInfoMin|GUIScrollBars_SetScrollInfoPage|GUIScrollBars_SetScrollInfoPos|GUIScrollBars_SetScrollRange|GUIScrollBars_ShowScrollBar|GUIToolTip_Activate|GUIToolTip_AddTool|GUIToolTip_AdjustRect|GUIToolTip_BitsToTTF|GUIToolTip_Create|GUIToolTip_DelTool|GUIToolTip_Destroy|GUIToolTip_EnumTools|GUIToolTip_GetBubbleHeight|GUIToolTip_GetBubbleSize|GUIToolTip_GetBubbleWidth|GUIToolTip_GetCurrentTool|GUIToolTip_GetDelayTime|GUIToolTip_GetMargin|GUIToolTip_GetMarginEx|GUIToolTip_GetMaxTipWidth|GUIToolTip_GetText|GUIToolTip_GetTipBkColor|GUIToolTip_GetTipTextColor|GUIToolTip_GetTitleBitMap|GUIToolTip_GetTitleText|GUIToolTip_GetToolCount|GUIToolTip_GetToolInfo|GUIToolTip_HitTest|GUIToolTip_NewToolRect|GUIToolTip_Pop|GUIToolTip_PopUp|GUIToolTip_SetDelayTime|GUIToolTip_SetMargin|GUIToolTip_SetMaxTipWidth|GUIToolTip_SetTipBkColor|GUIToolTip_SetTipTextColor|GUIToolTip_SetTitle|GUIToolTip_SetToolInfo|GUIToolTip_SetWindowTheme|GUIToolTip_ToolExists|GUIToolTip_ToolToArray|GUIToolTip_TrackActivate|GUIToolTip_TrackPosition|GUIToolTip_TTFToBits|GUIToolTip_Update|GUIToolTip_UpdateTipText|HexToString|IE_Example|IE_Introduction|IE_VersionInfo|IEAction|IEAttach|IEBodyReadHTML|IEBodyReadText|IEBodyWriteHTML|IECreate|IECreateEmbedded|IEDocGetObj|IEDocInsertHTML|IEDocInsertText|IEDocReadHTML|IEDocWriteHTML|IEErrorHandlerDeRegister|IEErrorHandlerRegister|IEErrorNotify|IEFormElementCheckBoxSelect|IEFormElementGetCollection|IEFormElementGetObjByName|IEFormElementGetValue|IEFormElementOptionSelect|IEFormElementRadioSelect|IEFormElementSetValue|IEFormGetCollection|IEFormGetObjByName|IEFormImageClick|IEFormReset|IEFormSubmit|IEFrameGetCollection|IEFrameGetObjByName|IEGetObjById|IEGetObjByName|IEHeadInsertEventScript|IEImgClick|IEImgGetCollection|IEIsFrameSet|IELinkClickByIndex|IELinkClickByText|IELinkGetCollection|IELoadWait|IELoadWaitTimeout|IENavigate|IEPropertyGet|IEPropertySet|IEQuit|IETableGetCollection|IETableWriteToArray|IETagNameAllGetCollection|IETagNameGetCollection|Iif|INetExplorerCapable|INetGetSource|INetMail|INetSmtpMail|IsPressed|MathCheckDiv|Max|MemGlobalAlloc|MemGlobalFree|MemGlobalLock|MemGlobalSize|MemGlobalUnlock|MemMoveMemory|MemMsgBox|MemShowError|MemVirtualAlloc|MemVirtualAllocEx|MemVirtualFree|MemVirtualFreeEx|Min|MouseTrap|NamedPipes_CallNamedPipe|NamedPipes_ConnectNamedPipe|NamedPipes_CreateNamedPipe|NamedPipes_CreatePipe|NamedPipes_DisconnectNamedPipe|NamedPipes_GetNamedPipeHandleState|NamedPipes_GetNamedPipeInfo|NamedPipes_PeekNamedPipe|NamedPipes_SetNamedPipeHandleState|NamedPipes_TransactNamedPipe|NamedPipes_WaitNamedPipe|Net_Share_ConnectionEnum|Net_Share_FileClose|Net_Share_FileEnum|Net_Share_FileGetInfo|Net_Share_PermStr|Net_Share_ResourceStr|Net_Share_SessionDel|Net_Share_SessionEnum|Net_Share_SessionGetInfo|Net_Share_ShareAdd|Net_Share_ShareCheck|Net_Share_ShareDel|Net_Share_ShareEnum|Net_Share_ShareGetInfo|Net_Share_ShareSetInfo|Net_Share_StatisticsGetSvr|Net_Share_StatisticsGetWrk|Now|NowCalc|NowCalcDate|NowDate|NowTime|PathFull|PathMake|PathSplit|ProcessGetName|ProcessGetPriority|Radian|ReplaceStringInFile|RunDOS|ScreenCapture_Capture|ScreenCapture_CaptureWnd|ScreenCapture_SaveImage|ScreenCapture_SetBMPFormat|ScreenCapture_SetJPGQuality|ScreenCapture_SetTIFColorDepth|ScreenCapture_SetTIFCompression|Security__AdjustTokenPrivileges|Security__GetAccountSid|Security__GetLengthSid|Security__GetTokenInformation|Security__ImpersonateSelf|Security__IsValidSid|Security__LookupAccountName|Security__LookupAccountSid|Security__LookupPrivilegeValue|Security__OpenProcessToken|Security__OpenThreadToken|Security__OpenThreadTokenEx|Security__SetPrivilege|Security__SidToStringSid|Security__SidTypeStr|Security__StringSidToSid|SendMessage|SendMessageA|SetDate|SetTime|Singleton|SoundClose|SoundLength|SoundOpen|SoundPause|SoundPlay|SoundPos|SoundResume|SoundSeek|SoundStatus|SoundStop|SQLite_Changes|SQLite_Close|SQLite_Display2DResult|SQLite_Encode|SQLite_ErrCode|SQLite_ErrMsg|SQLite_Escape|SQLite_Exec|SQLite_FetchData|SQLite_FetchNames|SQLite_GetTable|SQLite_GetTable2d|SQLite_LastInsertRowID|SQLite_LibVersion|SQLite_Open|SQLite_Query|SQLite_QueryFinalize|SQLite_QueryReset|SQLite_QuerySingleRow|SQLite_SaveMode|SQLite_SetTimeout|SQLite_Shutdown|SQLite_SQLiteExe|SQLite_Startup|SQLite_TotalChanges|StringAddComma|StringBetween|StringEncrypt|StringInsert|StringProper|StringRepeat|StringReverse|StringSplit|StringToHex|TCPIpToName|TempFile|TicksToTime|Timer_Diff|Timer_GetTimerID|Timer_Init|Timer_KillAllTimers|Timer_KillTimer|Timer_SetTimer|TimeToTicks|VersionCompare|viClose|viExecCommand|viFindGpib|viGpibBusReset|viGTL|viOpen|viSetAttribute|viSetTimeout|WeekNumberISO|WinAPI_AttachConsole|WinAPI_AttachThreadInput|WinAPI_Beep|WinAPI_BitBlt|WinAPI_CallNextHookEx|WinAPI_Check|WinAPI_ClientToScreen|WinAPI_CloseHandle|WinAPI_CommDlgExtendedError|WinAPI_CopyIcon|WinAPI_CreateBitmap|WinAPI_CreateCompatibleBitmap|WinAPI_CreateCompatibleDC|WinAPI_CreateEvent|WinAPI_CreateFile|WinAPI_CreateFont|WinAPI_CreateFontIndirect|WinAPI_CreateProcess|WinAPI_CreateSolidBitmap|WinAPI_CreateSolidBrush|WinAPI_CreateWindowEx|WinAPI_DefWindowProc|WinAPI_DeleteDC|WinAPI_DeleteObject|WinAPI_DestroyIcon|WinAPI_DestroyWindow|WinAPI_DrawEdge|WinAPI_DrawFrameControl|WinAPI_DrawIcon|WinAPI_DrawIconEx|WinAPI_DrawText|WinAPI_EnableWindow|WinAPI_EnumDisplayDevices|WinAPI_EnumWindows|WinAPI_EnumWindowsPopup|WinAPI_EnumWindowsTop|WinAPI_ExpandEnvironmentStrings|WinAPI_ExtractIconEx|WinAPI_FatalAppExit|WinAPI_FillRect|WinAPI_FindExecutable|WinAPI_FindWindow|WinAPI_FlashWindow|WinAPI_FlashWindowEx|WinAPI_FloatToInt|WinAPI_FlushFileBuffers|WinAPI_FormatMessage|WinAPI_FrameRect|WinAPI_FreeLibrary|WinAPI_GetAncestor|WinAPI_GetAsyncKeyState|WinAPI_GetClassName|WinAPI_GetClientHeight|WinAPI_GetClientRect|WinAPI_GetClientWidth|WinAPI_GetCurrentProcess|WinAPI_GetCurrentProcessID|WinAPI_GetCurrentThread|WinAPI_GetCurrentThreadId|WinAPI_GetCursorInfo|WinAPI_GetDC|WinAPI_GetDesktopWindow|WinAPI_GetDeviceCaps|WinAPI_GetDIBits|WinAPI_GetDlgCtrlID|WinAPI_GetDlgItem|WinAPI_GetFileSizeEx|WinAPI_GetFocus|WinAPI_GetForegroundWindow|WinAPI_GetIconInfo|WinAPI_GetLastError|WinAPI_GetLastErrorMessage|WinAPI_GetModuleHandle|WinAPI_GetMousePos|WinAPI_GetMousePosX|WinAPI_GetMousePosY|WinAPI_GetObject|WinAPI_GetOpenFileName|WinAPI_GetOverlappedResult|WinAPI_GetParent|WinAPI_GetProcessAffinityMask|WinAPI_GetSaveFileName|WinAPI_GetStdHandle|WinAPI_GetStockObject|WinAPI_GetSysColor|WinAPI_GetSysColorBrush|WinAPI_GetSystemMetrics|WinAPI_GetTextExtentPoint32|WinAPI_GetWindow|WinAPI_GetWindowDC|WinAPI_GetWindowHeight|WinAPI_GetWindowLong|WinAPI_GetWindowRect|WinAPI_GetWindowText|WinAPI_GetWindowThreadProcessId|WinAPI_GetWindowWidth|WinAPI_GetXYFromPoint|WinAPI_GlobalMemStatus|WinAPI_GUIDFromString|WinAPI_GUIDFromStringEx|WinAPI_HiWord|WinAPI_InProcess|WinAPI_IntToFloat|WinAPI_InvalidateRect|WinAPI_IsClassName|WinAPI_IsWindow|WinAPI_IsWindowVisible|WinAPI_LoadBitmap|WinAPI_LoadImage|WinAPI_LoadLibrary|WinAPI_LoadLibraryEx|WinAPI_LoadShell32Icon|WinAPI_LoadString|WinAPI_LocalFree|WinAPI_LoWord|WinAPI_MakeDWord|WinAPI_MAKELANGID|WinAPI_MAKELCID|WinAPI_MakeLong|WinAPI_MessageBeep|WinAPI_Mouse_Event|WinAPI_MoveWindow|WinAPI_MsgBox|WinAPI_MulDiv|WinAPI_MultiByteToWideChar|WinAPI_MultiByteToWideCharEx|WinAPI_OpenProcess|WinAPI_PointFromRect|WinAPI_PostMessage|WinAPI_PrimaryLangId|WinAPI_PtInRect|WinAPI_ReadFile|WinAPI_ReadProcessMemory|WinAPI_RectIsEmpty|WinAPI_RedrawWindow|WinAPI_RegisterWindowMessage|WinAPI_ReleaseCapture|WinAPI_ReleaseDC|WinAPI_ScreenToClient|WinAPI_SelectObject|WinAPI_SetBkColor|WinAPI_SetCapture|WinAPI_SetCursor|WinAPI_SetDefaultPrinter|WinAPI_SetDIBits|WinAPI_SetEvent|WinAPI_SetFocus|WinAPI_SetFont|WinAPI_SetHandleInformation|WinAPI_SetLastError|WinAPI_SetParent|WinAPI_SetProcessAffinityMask|WinAPI_SetSysColors|WinAPI_SetTextColor|WinAPI_SetWindowLong|WinAPI_SetWindowPos|WinAPI_SetWindowsHookEx|WinAPI_SetWindowText|WinAPI_ShowCursor|WinAPI_ShowError|WinAPI_ShowMsg|WinAPI_ShowWindow|WinAPI_StringFromGUID|WinAPI_SubLangId|WinAPI_SystemParametersInfo|WinAPI_TwipsPerPixelX|WinAPI_TwipsPerPixelY|WinAPI_UnhookWindowsHookEx|WinAPI_UpdateLayeredWindow|WinAPI_UpdateWindow|WinAPI_ValidateClassName|WinAPI_WaitForInputIdle|WinAPI_WaitForMultipleObjects|WinAPI_WaitForSingleObject|WinAPI_WideCharToMultiByte|WinAPI_WindowFromPoint|WinAPI_WriteConsole|WinAPI_WriteFile|WinAPI_WriteProcessMemory|WinNet_AddConnection|WinNet_AddConnection2|WinNet_AddConnection3|WinNet_CancelConnection|WinNet_CancelConnection2|WinNet_CloseEnum|WinNet_ConnectionDialog|WinNet_ConnectionDialog1|WinNet_DisconnectDialog|WinNet_DisconnectDialog1|WinNet_EnumResource|WinNet_GetConnection|WinNet_GetConnectionPerformance|WinNet_GetLastError|WinNet_GetNetworkInformation|WinNet_GetProviderName|WinNet_GetResourceInformation|WinNet_GetResourceParent|WinNet_GetUniversalName|WinNet_GetUser|WinNet_OpenEnum|WinNet_RestoreConnection|WinNet_UseConnection|Word_VersionInfo|WordAttach|WordCreate|WordDocAdd|WordDocAddLink|WordDocAddPicture|WordDocClose|WordDocFindReplace|WordDocGetCollection|WordDocLinkGetCollection|WordDocOpen|WordDocPrint|WordDocPropertyGet|WordDocPropertySet|WordDocSave|WordDocSaveAs|WordErrorHandlerDeRegister|WordErrorHandlerRegister|WordErrorNotify|WordMacroRun|WordPropertyGet|WordPropertySet|WordQuit|' +
        'ce|comments-end|comments-start|cs|include|include-once|NoTrayIcon|RequireAdmin|' +
        'AutoIt3Wrapper_Au3Check_Parameters|AutoIt3Wrapper_Au3Check_Stop_OnWarning|AutoIt3Wrapper_Change2CUI|AutoIt3Wrapper_Compression|AutoIt3Wrapper_cvsWrapper_Parameters|AutoIt3Wrapper_Icon|AutoIt3Wrapper_Outfile|AutoIt3Wrapper_Outfile_Type|AutoIt3Wrapper_Plugin_Funcs|AutoIt3Wrapper_Res_Comment|AutoIt3Wrapper_Res_Description|AutoIt3Wrapper_Res_Field|AutoIt3Wrapper_Res_File_Add|AutoIt3Wrapper_Res_Fileversion|AutoIt3Wrapper_Res_FileVersion_AutoIncrement|AutoIt3Wrapper_Res_Icon_Add|AutoIt3Wrapper_Res_Language|AutoIt3Wrapper_Res_LegalCopyright|AutoIt3Wrapper_res_requestedExecutionLevel|AutoIt3Wrapper_Res_SaveSource|AutoIt3Wrapper_Run_After|AutoIt3Wrapper_Run_Au3check|AutoIt3Wrapper_Run_Before|AutoIt3Wrapper_Run_cvsWrapper|AutoIt3Wrapper_Run_Debug_Mode|AutoIt3Wrapper_Run_Obfuscator|AutoIt3Wrapper_Run_Tidy|AutoIt3Wrapper_Tidy_Stop_OnError|AutoIt3Wrapper_UseAnsi|AutoIt3Wrapper_UseUpx|AutoIt3Wrapper_UseX64|AutoIt3Wrapper_Version|EndRegion|forceref|Obfuscator_Ignore_Funcs|Obfuscator_Ignore_Variables|Obfuscator_Parameters|Region|Tidy_Parameters';
    var atKeywords = 'AppDataCommonDir|AppDataDir|AutoItExe|AutoItPID|AutoItUnicode|AutoItVersion|AutoItX64|COM_EventObj|CommonFilesDir|Compiled|ComputerName|ComSpec|CR|CRLF|DesktopCommonDir|DesktopDepth|DesktopDir|DesktopHeight|DesktopRefresh|DesktopWidth|DocumentsCommonDir|error|exitCode|exitMethod|extended|FavoritesCommonDir|FavoritesDir|GUI_CtrlHandle|GUI_CtrlId|GUI_DragFile|GUI_DragId|GUI_DropId|GUI_WinHandle|HomeDrive|HomePath|HomeShare|HotKeyPressed|HOUR|InetGetActive|InetGetBytesRead|IPAddress1|IPAddress2|IPAddress3|IPAddress4|KBLayout|LF|LogonDNSDomain|LogonDomain|LogonServer|MDAY|MIN|MON|MyDocumentsDir|NumParams|OSBuild|OSLang|OSServicePack|OSTYPE|OSVersion|ProcessorArch|ProgramFilesDir|ProgramsCommonDir|ProgramsDir|ScriptDir|ScriptFullPath|ScriptLineNumber|ScriptName|SEC|StartMenuCommonDir|StartMenuDir|StartupCommonDir|StartupDir|SW_DISABLE|SW_ENABLE|SW_HIDE|SW_LOCK|SW_MAXIMIZE|SW_MINIMIZE|SW_RESTORE|SW_SHOW|SW_SHOWDEFAULT|SW_SHOWMAXIMIZED|SW_SHOWMINIMIZED|SW_SHOWMINNOACTIVE|SW_SHOWNA|SW_SHOWNOACTIVATE|SW_SHOWNORMAL|SW_UNLOCK|SystemDir|TAB|TempDir|TRAY_ID|TrayIconFlashing|TrayIconVisible|UserName|UserProfileDir|WDAY|WindowsDir|WorkingDir|YDAY|YEAR';
    
    this.$rules = { start: 
       [ { token: 'comment.line.ahk', regex: '(?:^| );.*$' },
         { token: 'comment.block.ahk',
           regex: '/\\*', push: 
            [ { token: 'comment.block.ahk', regex: '\\*/', next: 'pop' },
              { defaultToken: 'comment.block.ahk' } ] },
         { token: 'doc.comment.ahk',
           regex: '#cs', push: 
            [ { token: 'doc.comment.ahk', regex: '#ce', next: 'pop' },
              { defaultToken: 'doc.comment.ahk' } ] },
         { token: 'keyword.command.ahk',
           regex: '(?:\\b|^)(?:allowsamelinecomments|clipboardtimeout|commentflag|errorstdout|escapechar|hotkeyinterval|hotkeymodifiertimeout|hotstring|include|includeagain|installkeybdhook|installmousehook|keyhistory|ltrim|maxhotkeysperinterval|maxmem|maxthreads|maxthreadsbuffer|maxthreadsperhotkey|noenv|notrayicon|persistent|singleinstance|usehook|winactivateforce|autotrim|blockinput|click|clipwait|continue|control|controlclick|controlfocus|controlget|controlgetfocus|controlgetpos|controlgettext|controlmove|controlsend|controlsendraw|controlsettext|coordmode|critical|detecthiddentext|detecthiddenwindows|drive|driveget|drivespacefree|edit|endrepeat|envadd|envdiv|envget|envmult|envset|envsub|envupdate|exit|exitapp|fileappend|filecopy|filecopydir|filecreatedir|filecreateshortcut|filedelete|filegetattrib|filegetshortcut|filegetsize|filegettime|filegetversion|fileinstall|filemove|filemovedir|fileread|filereadline|filerecycle|filerecycleempty|fileremovedir|fileselectfile|fileselectfolder|filesetattrib|filesettime|formattime|getkeystate|gosub|goto|groupactivate|groupadd|groupclose|groupdeactivate|gui|guicontrol|guicontrolget|hideautoitwin|hotkey|ifequal|ifexist|ifgreater|ifgreaterorequal|ifinstring|ifless|iflessorequal|ifmsgbox|ifnotequal|ifnotexist|ifnotinstring|ifwinactive|ifwinexist|ifwinnotactive|ifwinnotexist|imagesearch|inidelete|iniread|iniwrite|input|inputbox|keyhistory|keywait|listhotkeys|listlines|listvars|menu|mouseclick|mouseclickdrag|mousegetpos|mousemove|msgbox|onexit|outputdebug|pause|pixelgetcolor|pixelsearch|postmessage|process|progress|random|regdelete|regread|regwrite|reload|repeat|run|runas|runwait|send|sendevent|sendinput|sendmode|sendplay|sendmessage|sendraw|setbatchlines|setcapslockstate|setcontroldelay|setdefaultmousespeed|setenv|setformat|setkeydelay|setmousedelay|setnumlockstate|setscrolllockstate|setstorecapslockmode|settimer|settitlematchmode|setwindelay|setworkingdir|shutdown|sleep|sort|soundbeep|soundget|soundgetwavevolume|soundplay|soundset|soundsetwavevolume|splashimage|splashtextoff|splashtexton|splitpath|statusbargettext|statusbarwait|stringcasesense|stringgetpos|stringleft|stringlen|stringlower|stringmid|stringreplace|stringright|stringsplit|stringtrimleft|stringtrimright|stringupper|suspend|sysget|thread|tooltip|transform|traytip|urldownloadtofile|while|winactivate|winactivatebottom|winclose|winget|wingetactivestats|wingetactivetitle|wingetclass|wingetpos|wingettext|wingettitle|winhide|winkill|winmaximize|winmenuselectitem|winminimize|winminimizeall|winminimizeallundo|winmove|winrestore|winset|winsettitle|winshow|winwait|winwaitactive|winwaitclose|winwaitnotactive)\\b',
           caseInsensitive: true },
         { token: 'keyword.control.ahk',
           regex: '(?:\\b|^)(?:if|else|return|loop|break|for|while|global|local|byref)\\b',
           caseInsensitive: true },
         { token: 'support.function.ahk',
           regex: '(?:\\b|^)(?:abs|acos|asc|asin|atan|ceil|chr|cos|dllcall|exp|fileexist|floor|getkeystate|il_add|il_create|il_destroy|instr|substr|isfunc|islabel|ln|log|lv_add|lv_delete|lv_deletecol|lv_getcount|lv_getnext|lv_gettext|lv_insert|lv_insertcol|lv_modify|lv_modifycol|lv_setimagelist|mod|onmessage|numget|numput|registercallback|regexmatch|regexreplace|round|sin|tan|sqrt|strlen|sb_seticon|sb_setparts|sb_settext|tv_add|tv_delete|tv_getchild|tv_getcount|tv_getnext|tv_get|tv_getparent|tv_getprev|tv_getselection|tv_gettext|tv_modify|varsetcapacity|winactive|winexist)\\b',
           caseInsensitive: true },
         { token: 'variable.predefined.ahk',
           regex: '(?:\\b|^)(?:a_ahkpath|a_ahkversion|a_appdata|a_appdatacommon|a_autotrim|a_batchlines|a_caretx|a_carety|a_computername|a_controldelay|a_cursor|a_dd|a_ddd|a_dddd|a_defaultmousespeed|a_desktop|a_desktopcommon|a_detecthiddentext|a_detecthiddenwindows|a_endchar|a_eventinfo|a_exitreason|a_formatfloat|a_formatinteger|a_gui|a_guievent|a_guicontrol|a_guicontrolevent|a_guiheight|a_guiwidth|a_guix|a_guiy|a_hour|a_iconfile|a_iconhidden|a_iconnumber|a_icontip|a_index|a_ipaddress1|a_ipaddress2|a_ipaddress3|a_ipaddress4|a_isadmin|a_iscompiled|a_iscritical|a_ispaused|a_issuspended|a_keydelay|a_language|a_lasterror|a_linefile|a_linenumber|a_loopfield|a_loopfileattrib|a_loopfiledir|a_loopfileext|a_loopfilefullpath|a_loopfilelongpath|a_loopfilename|a_loopfileshortname|a_loopfileshortpath|a_loopfilesize|a_loopfilesizekb|a_loopfilesizemb|a_loopfiletimeaccessed|a_loopfiletimecreated|a_loopfiletimemodified|a_loopreadline|a_loopregkey|a_loopregname|a_loopregsubkey|a_loopregtimemodified|a_loopregtype|a_mday|a_min|a_mm|a_mmm|a_mmmm|a_mon|a_mousedelay|a_msec|a_mydocuments|a_now|a_nowutc|a_numbatchlines|a_ostype|a_osversion|a_priorhotkey|programfiles|a_programfiles|a_programs|a_programscommon|a_screenheight|a_screenwidth|a_scriptdir|a_scriptfullpath|a_scriptname|a_sec|a_space|a_startmenu|a_startmenucommon|a_startup|a_startupcommon|a_stringcasesense|a_tab|a_temp|a_thisfunc|a_thishotkey|a_thislabel|a_thismenu|a_thismenuitem|a_thismenuitempos|a_tickcount|a_timeidle|a_timeidlephysical|a_timesincepriorhotkey|a_timesincethishotkey|a_titlematchmode|a_titlematchmodespeed|a_username|a_wday|a_windelay|a_windir|a_workingdir|a_yday|a_year|a_yweek|a_yyyy|clipboard|clipboardall|comspec|errorlevel)\\b',
           caseInsensitive: true },
         { token: 'support.constant.ahk',
           regex: '(?:\\b|^)(?:shift|lshift|rshift|alt|lalt|ralt|control|lcontrol|rcontrol|ctrl|lctrl|rctrl|lwin|rwin|appskey|altdown|altup|shiftdown|shiftup|ctrldown|ctrlup|lwindown|lwinup|rwindown|rwinup|lbutton|rbutton|mbutton|wheelup|wheelleft|wheelright|wheeldown|xbutton1|xbutton2|joy1|joy2|joy3|joy4|joy5|joy6|joy7|joy8|joy9|joy10|joy11|joy12|joy13|joy14|joy15|joy16|joy17|joy18|joy19|joy20|joy21|joy22|joy23|joy24|joy25|joy26|joy27|joy28|joy29|joy30|joy31|joy32|joyx|joyy|joyz|joyr|joyu|joyv|joypov|joyname|joybuttons|joyaxes|joyinfo|space|tab|enter|escape|esc|backspace|bs|delete|del|insert|ins|pgup|pgdn|home|end|up|down|left|right|printscreen|ctrlbreak|pause|scrolllock|capslock|numlock|numpad0|numpad1|numpad2|numpad3|numpad4|numpad5|numpad6|numpad7|numpad8|numpad9|numpadmult|numpadadd|numpadsub|numpaddiv|numpaddot|numpaddel|numpadins|numpadclear|numpadup|numpaddown|numpadleft|numpadright|numpadhome|numpadend|numpadpgup|numpadpgdn|numpadenter|f1|f2|f3|f4|f5|f6|f7|f8|f9|f10|f11|f12|f13|f14|f15|f16|f17|f18|f19|f20|f21|f22|f23|f24|browser_back|browser_forward|browser_refresh|browser_stop|browser_search|browser_favorites|browser_home|volume_mute|volume_down|volume_up|media_next|media_prev|media_stop|media_play_pause|launch_mail|launch_media|launch_app1|launch_app2)\\b',
           caseInsensitive: true },
         { token: 'variable.parameter',
           regex: '(?:\\b|^)(?:pixel|mouse|screen|relative|rgb|ltrim|rtrim|join|low|belownormal|normal|abovenormal|high|realtime|ahk_id|ahk_pid|ahk_class|ahk_group|between|contains|in|is|integer|float|integerfast|floatfast|number|digit|xdigit|alpha|upper|lower|alnum|time|date|not|or|and|alwaysontop|topmost|top|bottom|transparent|transcolor|redraw|region|id|idlast|processname|minmax|controllist|count|list|capacity|statuscd|eject|lock|unlock|label|filesystem|label|setlabel|serial|type|status|static|seconds|minutes|hours|days|read|parse|logoff|close|error|single|tray|add|rename|check|uncheck|togglecheck|enable|disable|toggleenable|default|nodefault|standard|nostandard|color|delete|deleteall|icon|noicon|tip|click|show|mainwindow|nomainwindow|useerrorlevel|text|picture|pic|groupbox|button|checkbox|radio|dropdownlist|ddl|combobox|listbox|listview|datetime|monthcal|updown|slider|tab|tab2|statusbar|treeview|iconsmall|tile|report|sortdesc|nosort|nosorthdr|grid|hdr|autosize|range|xm|ym|ys|xs|xp|yp|font|resize|owner|submit|nohide|minimize|maximize|restore|noactivate|na|cancel|destroy|center|margin|maxsize|minsize|owndialogs|guiescape|guiclose|guisize|guicontextmenu|guidropfiles|tabstop|section|altsubmit|wrap|hscroll|vscroll|border|top|bottom|buttons|expand|first|imagelist|lines|wantctrla|wantf2|vis|visfirst|number|uppercase|lowercase|limit|password|multi|wantreturn|group|background|bold|italic|strike|underline|norm|backgroundtrans|theme|caption|delimiter|minimizebox|maximizebox|sysmenu|toolwindow|flash|style|exstyle|check3|checked|checkedgray|readonly|password|hidden|left|right|center|notab|section|move|focus|hide|choose|choosestring|text|pos|enabled|disabled|visible|lastfound|lastfoundexist|alttab|shiftalttab|alttabmenu|alttabandmenu|alttabmenudismiss|notimers|interrupt|priority|waitclose|blind|raw|unicode|deref|pow|bitnot|bitand|bitor|bitxor|bitshiftleft|bitshiftright|yes|no|ok|cancel|abort|retry|ignore|tryagain|on|off|all|hkey_local_machine|hkey_users|hkey_current_user|hkey_classes_root|hkey_current_config|hklm|hku|hkcu|hkcr|hkcc|reg_sz|reg_expand_sz|reg_multi_sz|reg_dword|reg_qword|reg_binary|reg_link|reg_resource_list|reg_full_resource_descriptor|reg_resource_requirements_list|reg_dword_big_endian)\\b',
           caseInsensitive: true },
         { keywordMap: {"constant.language": autoItKeywords}, regex: '\\w+\\b'},
         { keywordMap: {"variable.function": atKeywords}, regex: '@\\w+\\b'},
         { token : "constant.numeric", regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},
         { token: 'keyword.operator.ahk',
           regex: '=|==|<>|:=|<|>|\\*|\\/|\\+|:|\\?|\\-' },
         { token: 'punctuation.ahk',
           regex: '#|`|::|,|\\{|\\}|\\(|\\)|\\%' },
         { token: 
            [ 'punctuation.quote.double',
              'string.quoted.ahk',
              'punctuation.quote.double' ],
           regex: '(")((?:[^"]|"")*)(")' },
         { token: [ 'label.ahk', 'punctuation.definition.label.ahk' ],
           regex: '^([^: ]+)(:)(?!:)' } ] };
    
    this.normalizeRules();
};

AutoHotKeyHighlightRules.metaData = { name: 'AutoHotKey',
      scopeName: 'source.ahk',
      fileTypes: [ 'ahk' ],
      foldingStartMarker: '^\\s*/\\*|^(?![^{]*?;|[^{]*?/\\*(?!.*?\\*/.*?\\{)).*?\\{\\s*($|;|/\\*(?!.*?\\*/.*\\S))',
      foldingStopMarker: '^\\s*\\*/|^\\s*\\}' };


oop.inherits(AutoHotKeyHighlightRules, TextHighlightRules);

exports.AutoHotKeyHighlightRules = AutoHotKeyHighlightRules;
});

ace.define("ace/mode/python_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var PythonHighlightRules = function() {

    var keywords = (
        "and|as|assert|break|class|continue|def|del|elif|else|except|exec|" +
        "finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|" +
        "raise|return|try|while|with|yield|async|await"
    );

    var builtinConstants = (
        "True|False|None|NotImplemented|Ellipsis|__debug__"
    );

    var builtinFunctions = (
        "abs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|" +
        "eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|" +
        "binfile|iter|property|tuple|bool|filter|len|range|type|bytearray|" +
        "float|list|raw_input|unichr|callable|format|locals|reduce|unicode|" +
        "chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|" +
        "cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|" +
        "__import__|complex|hash|min|set|apply|delattr|help|next|setattr|" +
        "buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern"
    );
    var keywordMapper = this.createKeywordMapper({
        "invalid.deprecated": "debugger",
        "support.function": builtinFunctions,
        "constant.language": builtinConstants,
        "keyword": keywords
    }, "identifier");

    var strPre = "(?:r|u|ur|R|U|UR|Ur|uR)?";

    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
    var octInteger = "(?:0[oO]?[0-7]+)";
    var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
    var binInteger = "(?:0[bB][01]+)";
    var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";

    var exponent = "(?:[eE][+-]?\\d+)";
    var fraction = "(?:\\.\\d+)";
    var intPart = "(?:\\d+)";
    var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
    var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
    var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

    var stringEscape =  "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "#.*$"
        }, {
            token : "string",           // multi line """ string start
            regex : strPre + '"{3}',
            next : "qqstring3"
        }, {
            token : "string",           // " string
            regex : strPre + '"(?=.)',
            next : "qqstring"
        }, {
            token : "string",           // multi line ''' string start
            regex : strPre + "'{3}",
            next : "qstring3"
        }, {
            token : "string",           // ' string
            regex : strPre + "'(?=.)",
            next : "qstring"
        }, {
            token : "constant.numeric", // imaginary
            regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
        }, {
            token : "constant.numeric", // float
            regex : floatNumber
        }, {
            token : "constant.numeric", // long integer
            regex : integer + "[lL]\\b"
        }, {
            token : "constant.numeric", // integer
            regex : integer + "\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
            token : "paren.lparen",
            regex : "[\\[\\(\\{]"
        }, {
            token : "paren.rparen",
            regex : "[\\]\\)\\}]"
        }, {
            token : "text",
            regex : "\\s+"
        } ],
        "qqstring3" : [ {
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string", // multi line """ string end
            regex : '"{3}',
            next : "start"
        }, {
            defaultToken : "string"
        } ],
        "qstring3" : [ {
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",  // multi line ''' string end
            regex : "'{3}",
            next : "start"
        }, {
            defaultToken : "string"
        } ],
        "qqstring" : [{
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qqstring"
        }, {
            token : "string",
            regex : '"|$',
            next  : "start"
        }, {
            defaultToken: "string"
        }],
        "qstring" : [{
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qstring"
        }, {
            token : "string",
            regex : "'|$",
            next  : "start"
        }, {
            defaultToken: "string"
        }]
    };
};

oop.inherits(PythonHighlightRules, TextHighlightRules);

exports.PythonHighlightRules = PythonHighlightRules;
});

ace.define("ace/mode/c_cpp_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var cFunctions = exports.cFunctions = "\\b(?:hypot(?:f|l)?|s(?:scanf|ystem|nprintf|ca(?:nf|lb(?:n(?:f|l)?|ln(?:f|l)?))|i(?:n(?:h(?:f|l)?|f|l)?|gn(?:al|bit))|tr(?:s(?:tr|pn)|nc(?:py|at|mp)|c(?:spn|hr|oll|py|at|mp)|to(?:imax|d|u(?:l(?:l)?|max)|k|f|l(?:d|l)?)|error|pbrk|ftime|len|rchr|xfrm)|printf|et(?:jmp|vbuf|locale|buf)|qrt(?:f|l)?|w(?:scanf|printf)|rand)|n(?:e(?:arbyint(?:f|l)?|xt(?:toward(?:f|l)?|after(?:f|l)?))|an(?:f|l)?)|c(?:s(?:in(?:h(?:f|l)?|f|l)?|qrt(?:f|l)?)|cos(?:h(?:f)?|f|l)?|imag(?:f|l)?|t(?:ime|an(?:h(?:f|l)?|f|l)?)|o(?:s(?:h(?:f|l)?|f|l)?|nj(?:f|l)?|pysign(?:f|l)?)|p(?:ow(?:f|l)?|roj(?:f|l)?)|e(?:il(?:f|l)?|xp(?:f|l)?)|l(?:o(?:ck|g(?:f|l)?)|earerr)|a(?:sin(?:h(?:f|l)?|f|l)?|cos(?:h(?:f|l)?|f|l)?|tan(?:h(?:f|l)?|f|l)?|lloc|rg(?:f|l)?|bs(?:f|l)?)|real(?:f|l)?|brt(?:f|l)?)|t(?:ime|o(?:upper|lower)|an(?:h(?:f|l)?|f|l)?|runc(?:f|l)?|gamma(?:f|l)?|mp(?:nam|file))|i(?:s(?:space|n(?:ormal|an)|cntrl|inf|digit|u(?:nordered|pper)|p(?:unct|rint)|finite|w(?:space|c(?:ntrl|type)|digit|upper|p(?:unct|rint)|lower|al(?:num|pha)|graph|xdigit|blank)|l(?:ower|ess(?:equal|greater)?)|al(?:num|pha)|gr(?:eater(?:equal)?|aph)|xdigit|blank)|logb(?:f|l)?|max(?:div|abs))|di(?:v|fftime)|_Exit|unget(?:c|wc)|p(?:ow(?:f|l)?|ut(?:s|c(?:har)?|wc(?:har)?)|error|rintf)|e(?:rf(?:c(?:f|l)?|f|l)?|x(?:it|p(?:2(?:f|l)?|f|l|m1(?:f|l)?)?))|v(?:s(?:scanf|nprintf|canf|printf|w(?:scanf|printf))|printf|f(?:scanf|printf|w(?:scanf|printf))|w(?:scanf|printf)|a_(?:start|copy|end|arg))|qsort|f(?:s(?:canf|e(?:tpos|ek))|close|tell|open|dim(?:f|l)?|p(?:classify|ut(?:s|c|w(?:s|c))|rintf)|e(?:holdexcept|set(?:e(?:nv|xceptflag)|round)|clearexcept|testexcept|of|updateenv|r(?:aiseexcept|ror)|get(?:e(?:nv|xceptflag)|round))|flush|w(?:scanf|ide|printf|rite)|loor(?:f|l)?|abs(?:f|l)?|get(?:s|c|pos|w(?:s|c))|re(?:open|e|ad|xp(?:f|l)?)|m(?:in(?:f|l)?|od(?:f|l)?|a(?:f|l|x(?:f|l)?)?))|l(?:d(?:iv|exp(?:f|l)?)|o(?:ngjmp|cal(?:time|econv)|g(?:1(?:p(?:f|l)?|0(?:f|l)?)|2(?:f|l)?|f|l|b(?:f|l)?)?)|abs|l(?:div|abs|r(?:int(?:f|l)?|ound(?:f|l)?))|r(?:int(?:f|l)?|ound(?:f|l)?)|gamma(?:f|l)?)|w(?:scanf|c(?:s(?:s(?:tr|pn)|nc(?:py|at|mp)|c(?:spn|hr|oll|py|at|mp)|to(?:imax|d|u(?:l(?:l)?|max)|k|f|l(?:d|l)?|mbs)|pbrk|ftime|len|r(?:chr|tombs)|xfrm)|to(?:b|mb)|rtomb)|printf|mem(?:set|c(?:hr|py|mp)|move))|a(?:s(?:sert|ctime|in(?:h(?:f|l)?|f|l)?)|cos(?:h(?:f|l)?|f|l)?|t(?:o(?:i|f|l(?:l)?)|exit|an(?:h(?:f|l)?|2(?:f|l)?|f|l)?)|b(?:s|ort))|g(?:et(?:s|c(?:har)?|env|wc(?:har)?)|mtime)|r(?:int(?:f|l)?|ound(?:f|l)?|e(?:name|alloc|wind|m(?:ove|quo(?:f|l)?|ainder(?:f|l)?))|a(?:nd|ise))|b(?:search|towc)|m(?:odf(?:f|l)?|em(?:set|c(?:hr|py|mp)|move)|ktime|alloc|b(?:s(?:init|towcs|rtowcs)|towc|len|r(?:towc|len))))\\b";

var c_cppHighlightRules = function() {

    var keywordControls = (
        "break|case|continue|default|do|else|for|goto|if|_Pragma|" +
        "return|switch|while|catch|operator|try|throw|using"
    );
    
    var storageType = (
        "asm|__asm__|auto|bool|_Bool|char|_Complex|double|enum|float|" +
        "_Imaginary|int|long|short|signed|struct|typedef|union|unsigned|void|" +
        "class|wchar_t|template|char16_t|char32_t"
    );

    var storageModifiers = (
        "const|extern|register|restrict|static|volatile|inline|private|" +
        "protected|public|friend|explicit|virtual|export|mutable|typename|" +
        "constexpr|new|delete|alignas|alignof|decltype|noexcept|thread_local"
    );

    var keywordOperators = (
        "and|and_eq|bitand|bitor|compl|not|not_eq|or|or_eq|typeid|xor|xor_eq" +
        "const_cast|dynamic_cast|reinterpret_cast|static_cast|sizeof|namespace"
    );

    var builtinConstants = (
        "NULL|true|false|TRUE|FALSE|nullptr"
    );

    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword.control" : keywordControls,
        "storage.type" : storageType,
        "storage.modifier" : storageModifiers,
        "keyword.operator" : keywordOperators,
        "variable.language": "this",
        "constant.language": builtinConstants
    }, "identifier");

    var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*\\b";
    var escapeRe = /\\(?:['"?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}U[a-fA-F\d]{8}|.)/.source;
    var formatRe = "%"
          + /(\d+\$)?/.source // field (argument #)
          + /[#0\- +']*/.source // flags
          + /[,;:_]?/.source // separator character (AltiVec)
          + /((-?\d+)|\*(-?\d+\$)?)?/.source // minimum field width
          + /(\.((-?\d+)|\*(-?\d+\$)?)?)?/.source // precision
          + /(hh|h|ll|l|j|t|z|q|L|vh|vl|v|hv|hl)?/.source // length modifier
          + /(\[[^"\]]+\]|[diouxXDOUeEfFgGaACcSspn%])/.source; // conversion type

    this.$rules = { 
        "start" : [
            {
                token : "comment",
                regex : "//$",
                next : "start"
            }, {
                token : "comment",
                regex : "//",
                next : "singleLineComment"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string", // character
                regex : "'(?:" + escapeRe + "|.)?'"
            }, {
                token : "string.start",
                regex : '"', 
                stateName: "qqstring",
                next: [
                    { token: "string", regex: /\\\s*$/, next: "qqstring" },
                    { token: "constant.language.escape", regex: escapeRe },
                    { token: "constant.language.escape", regex: formatRe },
                    { token: "string.end", regex: '"|$', next: "start" },
                    { defaultToken: "string"}
                ]
            }, {
                token : "string.start",
                regex : 'R"\\(', 
                stateName: "rawString",
                next: [
                    { token: "string.end", regex: '\\)"', next: "start" },
                    { defaultToken: "string"}
                ]
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "keyword", // pre-compiler directives
                regex : "#\\s*(?:include|import|pragma|line|define|undef)\\b",
                next  : "directive"
            }, {
                token : "keyword", // special case pre-compiler directive
                regex : "#\\s*(?:endif|if|ifdef|else|elif|ifndef)\\b"
            }, {
                token : "support.function.C99.c",
                regex : cFunctions
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*"
            }, {
                token : "keyword.operator",
                regex : /--|\+\+|<<=|>>=|>>>=|<>|&&|\|\||\?:|[*%\/+\-&\^|~!<>=]=?/
            }, {
              token : "punctuation.operator",
              regex : "\\?|\\:|\\,|\\;|\\."
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ],
        "singleLineComment" : [
            {
                token : "comment",
                regex : /\\$/,
                next : "singleLineComment"
            }, {
                token : "comment",
                regex : /$/,
                next : "start"
            }, {
                defaultToken: "comment"
            }
        ],
        "directive" : [
            {
                token : "constant.other.multiline",
                regex : /\\/
            },
            {
                token : "constant.other.multiline",
                regex : /.*\\/
            },
            {
                token : "constant.other",
                regex : "\\s*<.+?>",
                next : "start"
            },
            {
                token : "constant.other", // single line
                regex : '\\s*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
                next : "start"
            }, 
            {
                token : "constant.other", // single line
                regex : "\\s*['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
                next : "start"
            },
            {
                token : "constant.other",
                regex : /[^\\\/]+/,
                next : "start"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
    this.normalizeRules();
};

oop.inherits(c_cppHighlightRules, TextHighlightRules);

exports.c_cppHighlightRules = c_cppHighlightRules;
});

ace.define("ace/mode/csharp_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var CSharpHighlightRules = function() {
    var keywordMapper = this.createKeywordMapper({
        "variable.language": "this",
        "keyword": "abstract|event|new|struct|as|explicit|null|switch|base|extern|object|this|bool|false|operator|throw|break|finally|out|true|byte|fixed|override|try|case|float|params|typeof|catch|for|private|uint|char|foreach|protected|ulong|checked|goto|public|unchecked|class|if|readonly|unsafe|const|implicit|ref|ushort|continue|in|return|using|decimal|int|sbyte|virtual|default|interface|sealed|volatile|delegate|internal|partial|short|void|do|is|sizeof|while|double|lock|stackalloc|else|long|static|enum|namespace|string|var|dynamic",
        "constant.language": "null|true|false"
    }, "identifier");

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "\\/\\/.*$"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string", // character
                regex : /'(?:.|\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n]))?'/
            }, {
                token : "string", start : '"', end : '"|$', next: [
                    {token: "constant.language.escape", regex: /\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n])/},
                    {token: "invalid", regex: /\\./}
                ]
            }, {
                token : "string", start : '@"', end : '"', next:[
                    {token: "constant.language.escape", regex: '""'}
                ]
            }, {
                token : "string", start : /\$"/, end : '"|$', next: [
                    {token: "constant.language.escape", regex: /\\(:?$)|{{/},
                    {token: "constant.language.escape", regex: /\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n])/},
                    {token: "invalid", regex: /\\./}
                ]
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "keyword",
                regex : "^\\s*#(if|else|elif|endif|define|undef|warning|error|line|region|endregion|pragma)"
            }, {
                token : "punctuation.operator",
                regex : "\\?|\\:|\\,|\\;|\\."
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
    this.normalizeRules();
};

oop.inherits(CSharpHighlightRules, TextHighlightRules);

exports.CSharpHighlightRules = CSharpHighlightRules;
});

ace.define("ace/mode/json_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var JsonHighlightRules = function() {
    this.$rules = {
        "start" : [
            {
                token : "variable", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
            }, {
                token : "string", // single line
                regex : '"',
                next  : "string"
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language.boolean",
                regex : "(?:true|false)\\b"
            }, {
                token : "text", // single quoted strings are not allowed
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "comment", // comments are not allowed, but who cares?
                regex : "\\/\\/.*$"
            }, {
                token : "comment.start", // comments are not allowed, but who cares?
                regex : "\\/\\*",
                next  : "comment"
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "string" : [
            {
                token : "constant.language.escape",
                regex : /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
            }, {
                token : "string",
                regex : '"|$',
                next  : "start"
            }, {
                defaultToken : "string"
            }
        ],
        "comment" : [
            {
                token : "comment.end", // comments are not allowed, but who cares?
                regex : "\\*\\/",
                next  : "start"
            }, {
                defaultToken: "comment"
            }
        ]
    };
    
};

oop.inherits(JsonHighlightRules, TextHighlightRules);

exports.JsonHighlightRules = JsonHighlightRules;
});

ace.define("ace/mode/sql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var SqlHighlightRules = function() {

    var keywords = (
        "select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|" +
        "when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|" +
        "foreign|not|references|default|null|inner|cross|natural|database|drop|grant"
    );

    var builtinConstants = (
        "true|false"
    );

    var builtinFunctions = (
        "avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|" + 
        "coalesce|ifnull|isnull|nvl"
    );

    var dataTypes = (
        "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|" +
        "money|real|number|integer"
    );

    var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants,
        "storage.type": dataTypes
    }, "identifier", true);

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "--.*$"
        },  {
            token : "comment",
            start : "/\\*",
            end : "\\*/"
        }, {
            token : "string",           // " string
            regex : '".*?"'
        }, {
            token : "string",           // ' string
            regex : "'.*?'"
        }, {
            token : "string",           // ` string (apache drill)
            regex : "`.*?`"
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
            token : "paren.lparen",
            regex : "[\\(]"
        }, {
            token : "paren.rparen",
            regex : "[\\)]"
        }, {
            token : "text",
            regex : "\\s+"
        } ]
    };
    this.normalizeRules();
};

oop.inherits(SqlHighlightRules, TextHighlightRules);

exports.SqlHighlightRules = SqlHighlightRules;
});

ace.define("ace/mode/dml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules","ace/mode/tex_highlight_rules","ace/mode/html_highlight_rules","ace/mode/javascript_highlight_rules","ace/mode/html_highlight_rules","ace/mode/css_highlight_rules","ace/mode/java_highlight_rules","ace/mode/php_highlight_rules","ace/mode/ruby_highlight_rules","ace/mode/autohotkey_highlight_rules","ace/mode/python_highlight_rules","ace/mode/c_cpp_highlight_rules","ace/mode/csharp_highlight_rules","ace/mode/json_highlight_rules","ace/mode/sql_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var TexHighlightRules = require("./tex_highlight_rules").TexHighlightRules;
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var languages = [
    ["js", "js-", JavaScriptHighlightRules],
    ["html", "html-", require("./html_highlight_rules").HtmlHighlightRules],
    ["css", "css-", require("./css_highlight_rules").CssHighlightRules],
    ["java", "java-", require("./java_highlight_rules").JavaHighlightRules],
    ["php", "php-", require("./php_highlight_rules").PhpHighlightRules],
    ["ruby", "ruby-", require("./ruby_highlight_rules").RubyHighlightRules],
    ["ahk", "ahk-", require("./autohotkey_highlight_rules").AutoHotKeyHighlightRules],
    ["python", "python-", require("./python_highlight_rules").PythonHighlightRules],
    ["c\\+\\+", "cpp-", require("./c_cpp_highlight_rules").c_cppHighlightRules],
    ["c#", "cSharp-", require("./csharp_highlight_rules").CSharpHighlightRules],
    ["json", "json-", require("./json_highlight_rules").JsonHighlightRules],
    ["sql", "sql-", require("./sql_highlight_rules").SqlHighlightRules],
];

try{
    if(Typo && !dictionary)
        var dictionary = new Typo("en_US", false, false, { dictionaryPath: dictionaryPath||"/Libraries/Typo/dictionaries" });
}catch(e){};
var spellCheck = function(token, word, state, smth, input){
    if(window.selectedText && window.selectedText.line==input && window.selectedText.word==word) return token;
    
    if(!dictionary || window.spellCheckDisabled) return token;
    var spelledCorrectly = dictionary.check(word) || word.match(/\d|^[a-zA-Z]-[^\s]*|^[A-Z]+$/);
    return spelledCorrectly?token:token+".misspelled";
};
    
var dmlHighlightRules = function(normalize) {
    var tagRegex = "[_:a-zA-Z\xc0-\uffff][-_:.a-zA-Z0-9\xc0-\uffff]*";

    this.$rules = {
        start : [
            {include: "characterEscape"},
            {
                token : "string.link",
                regex : "(?:\\[(.*?)\\]\\[(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]\\.[^\\s]{2,})\\])|(?:\\[(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]\\.[^\\s]{2,})\\]\\[(.*?)\\])"
            },
            {include : "dmlTag"},
            {
                token : "constant.language.escape",
                regex : "`$"
            },
            {
                token : "support.type.header.opening",
                regex : "\\`?#+",
                next : [
                    {
                        token : "endline",
                        regex : "$",
                        next : "start"
                    },
                    {defaultToken: "support.type.header"}
                ]
            },{
                token : "variable.bullet.opening",
                regex : "\\*\\*+",
                next : [
                    {
                        token : "endline",
                        regex : "$",
                        next : "start"
                    },
                    {defaultToken: "variable.bullet"}
                ]
            },{
                token : "string",
                regex : "\\*[^* ]",
                next : [
                    {include: "characterEscape"},
                    {token : "string", regex: "\\*", next: "start"},
                    {defaultToken: "string.bold"}
                ]
            },{
                token : "string",
                regex : "(?:^| )~",
                next : [
                    {include: "characterEscape"},
                    {token : "string", regex: "~", next: "start"},
                    {defaultToken: "string.strikeThrough"}
                ]
            },{
                token : "string",
                regex : "\\|",
                next : [
                    {include: "characterEscape"},
                    {token : "string", regex: "\\|", next: "start"},
                    {defaultToken: "string.italic"}
                ]
            },{
                token : "string",
                regex : "_",
                next : [
                    {include: "characterEscape"},
                    {token : "string", regex: "_", next: "start"},
                    {defaultToken: "string.underline"}
                ]
            },{
                token : "string",
                regex : "(?:https:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/watch\\?.*v=|youtu\\.be\\/|youtube.com\\/embed\\/)([^&\\r\\n ]+)[^\\r\\n ]*"
            },{
                token : "string",
                regex : "^>.+$"
            },{
                token : "support.type.header",
                regex : "----"
            },{
                token : "comment",
                regex : "\\[\\[",
                next : [
                    {
                        token : "comment",
                        regex : "$",
                        next : "start"
                    },
                    {defaultToken: "comment"}
                ]
            }, 
            {include : "spellCheck"}
        ],
        
        characterEscape : [{token : "constant.language.escape", regex: "\\\\."}],
        
        spellCheck : [{
            token : spellCheck.bind(null, "text"),
            regex : "(?:\\w|[-'])+",
        }],
        attributeSpellCheck : [{
            token : spellCheck.bind(null, "string.attribute-value.dml"),
            regex : "(?:\\w|[-'])+"
        }],


        dmlTag : [{
            token : ["meta.tag.punctuation.dmlTag-open.dml", "meta.tag.punctuation.end-dmlTag-open.dml", "meta.tag.dmlTag-name.dml"],
            regex : "(?:(\\[)|(\\[/))((?:" + tagRegex + ":)?" + tagRegex + ")",
            next: [
				{include: "dmlTag_attributes"},
				{
					token : "meta.tag.punctuation.dmlTag-close.dml", 
					regex : "/?\\]", 
					next : "start"
				}
			]
        }],
		
        dmlTag_attributes : [
            {
                include : "dmlTag_whitespace"
            }, {
                token : "entity.other.attribute-name.dml",
                regex : "[-_a-zA-Z0-9:.]+"
            }, {
                token : "keyword.operator.attribute-equals.dml",
                regex : "=",
				push : [{
					include: "tag_whitespace"
				},
                {include: "characterEscape"},
                {
					token : spellCheck.bind(null, "string.unquoted.attribute-value.dml"),
					regex : "[^\\]'\"\\s\\\\]+"
				}, {
					token : "empty",
					regex : "",
					next : "pop"
				}]
            }, 
			{include: "dmlTag_attribute_value"} 
        ],

        dmlTag_whitespace : [
            {token : "text.dmlTag-whitespace.dml", regex : "\\s+"}
        ],
        
        dmlTag_attribute_value: [
            {
                token : "string.attribute-value.dml",
                regex : "'",
                push : [
                    {token : "constant.language.escape", regex: "\\\\."},
                    {token : "string.attribute-value.dml", regex: "'", next: "pop"},
                    {defaultToken : "string.attribute-value.dml"}
                ]
            }, {
                token : "string.attribute-value.dml",
                regex : '"',
                push : [
                    {token : "constant.language.escape", regex: "\\\\."},
                    {token : "string.attribute-value.dml", regex: '"', next: "pop"},
                    {include : "attributeSpellCheck"},
                    {defaultToken : "string.attribute-value.dml"}
                ]
			}
        ],
    };

    this.embedBBRules(HtmlHighlightRules, "html-", "html");
	this.embedBBRules(JavaScriptHighlightRules, "node-", "node");
    this.embedBBRules(TexHighlightRules, "tex-", "latex");
    this.embedBBRules(TextHighlightRules, "yt-", "yt");
    this.embedBBRules(TextHighlightRules, "img-", "img");
	this.embedBBRules(TextHighlightRules, "l-", "l");
	this.embedBBRules(TextHighlightRules, "li-", "literal");
    this.embedLanguages(languages);
    if (this.constructor === dmlHighlightRules)
        this.normalizeRules();
};


(function() {
    this.embedTagRules = function(HighlightRules, prefix, tag){
        this.$rules.tag.unshift({
            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(<)(" + tag + "(?=\\s|>|$))",
            next: [
                {include : "attributes"},
                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : prefix + "start"}
            ]
        });

        this.$rules[tag + "-end"] = [
            {include : "attributes"},
            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>",  next: "start",
                onMatch : function(value, currentState, stack) {
                    stack.splice(0);
                    return this.token;
            }}
        ];

        this.embedRules(HighlightRules, prefix, [{
            token: ["meta.tag.punctuation.end-tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(</)(" + tag + "(?=\\s|>|$))",
            next: tag + "-end"
        }, {
            token: "string.cdata.xml",
            regex : "<\\!\\[CDATA\\["
        }, {
            token: "string.cdata.xml",
            regex : "\\]\\]>"
        }]);
    };
    this.embedBBRules = function(HighlightRules, prefix, tag){
        this.$rules.dmlTag.unshift({
            token : ["meta.tag.punctuation.dmlTag-open.dml", "meta.tag." + tag + ".dmlTag-name.dml"],
            regex : "(\\[)(" + tag + "(?=\\s|\\]|$))",
            next: [
                {include : "dmlTag_attributes"},
                {token : "meta.tag.punctuation.dmlTag-close.dml", regex : "/?\\]", next : prefix + "start"}
            ]
        });

        this.$rules[tag + "-end"] = [
            {include : "attributes"},
            {token : "meta.tag.punctuation.dmlTag-close.dml", regex : "/?\\]",  next: "start",
                onMatch : function(value, currentState, stack) {
                    stack.splice(0);
                    return this.token;
            }}
        ];

        this.embedRules(HighlightRules, prefix, [{
            token: ["meta.tag.punctuation.end-dmlTag-open.dml", "meta.tag." + tag + ".dmlTag-name.dml"],
            regex : "(\\[/)(" + tag + "(?=\\s|\\]|$))",
            next: tag + "-end"
        }]);
    };
    this.embedLanguages = function(map){
		var tags = ["code", "c"];
		var attr = "language";
		var defaultLanguage = "text-";
		map.unshift(["text", "text-", TextHighlightRules]);
		var language = defaultLanguage;
		var closeMode = 0;
		for(var j=0; j<tags.length; j++){
		    var tag = tags[j];
	    	var langs = [{include: "dmlTag_whitespace"},
				{
					token : "keyword.operator.attribute-equals.dml",
					regex : "=",
				}];
		    for(var i=0; i<map.length; i++){
    			var m = map[i];
    		    (function(m, j){
        			var f = function(value, currentState, stack){
        				language = m[1];
        				closeMode = j;
        				return this.token;
        			};
        			langs.push({
        				token : "string.unquoted.attribute-value.dml",
        				regex : m[0]+"(?=\\s|\\]|$)",
        				next : "pop",
        				onMatch : f
        			});
        			langs.push({
        				token : "string.attribute-value.dml",
        				regex : "(?=\"|')"+m[0]+"(?=\"|')",
        				next : "pop",
        				onMatch : f
        			});
    		    })(m, j);
    		}
    		langs.push({
    			token : "string.attribute-value.dml",
    			next : "pop",
    			regex : "[^\\]\\s]*",
    		});
    		var t = this;
    		(function(j, tag){
                t.$rules.dmlTag.unshift({
                    token : ["meta.tag.punctuation.dmlTag-open.dml", "meta.tag." + tag + ".dmlTag-name.dml"],
                    regex : "(\\[)(" + tag + "(?=\\s|\\]|$))",
                    next: [
        				{
        					token : "entity.other.attribute-name.dml",
        					regex : attr,
        					push : langs
        				},
        				{include : "dmlTag_attributes"},
        				{
        				    token : "meta.tag.punctuation.dmlTag-close.dml", 
        				    regex : "/?\\]", 
        				    next : function(){
        				        var lang = language;
        				        language = defaultLanguage;
        				        return j+"-"+lang+"start";
        				    },
        				}
        			]
                });
    		})(j, tag);
		}
		

		this.$rules["codeTag-end"] = [
			{include : "dmlTag_attributes"},
			{token : "meta.tag.punctuation.dmlTag-close.dml", regex : "/?\\]",  next: "start",
				onMatch : function(value, currentState, stack) {
					stack.splice(0);
					return this.token;
			}}
		];
		for(var i=0; i<map.length; i++){
			var m = map[i];
			
			
	        var rules = [];
			for(var j=0; j<tags.length; j++){
		        var tag = tags[j];
		        
		        var t = this;
	            this.embedRules(m[2], j+"-"+m[1], [{
    				token : ["meta.tag.punctuation.end-dmlTag-open.dml", "meta.tag." + tag + ".dmlTag-name.dml"],
    				regex : "(\\[/)(" + tag + "(?=\\s|\\]|$))",
    				next: "codeTag-end"
    			}]);
			}
		}
		this.$rules.start.push({
	       token : "string",
	       regex : "```\\s*\w*",
	       next: "3-"+defaultLanguage+"start"
	    });
		for(var i=0; i<map.length; i++){
		    var m = map[i];
		    this.$rules.start.unshift({
		       token : "string",
		       regex : "```\\s*"+m[0]+"(?=\\s|\\]|$)",
		       next: "3-"+m[1]+"start"
		    });
		    this.embedRules(m[2], "3-"+m[1], [{
				token : "string",
				regex : "```",
				next: "start"
			}]);
		}
		this.$rules.start.push({
	       token : "string",
	       regex : "`",
	       next: "4-"+defaultLanguage+"start"
	    });
		for(var i=0; i<map.length; i++){
		    var m = map[i];
		    this.$rules.start.unshift({
		       token : "string",
		       regex : "`\\s*"+m[0]+"(?=\\s|\\]|$)",
		       next: "4-"+m[1]+"start"
		    });
		    this.embedRules(m[2], "4-"+m[1], [{
				token : "string",
				regex : "`",
				next: "start"
			}]);
		}
    };
}).call(TextHighlightRules.prototype);

oop.inherits(dmlHighlightRules, TextHighlightRules);

exports.dmlHighlightRules = dmlHighlightRules;
});

ace.define("ace/mode/dml_behaviour",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var Behaviour = require("./behaviour").Behaviour;
var TokenIterator = require("../token_iterator").TokenIterator;
var lang = require("../lib/lang");

function is(token, type) {
    return token.type.lastIndexOf(type + ".dml") > -1;
}

var dmlBehaviour = function () {

    this.add("string_dquotes", "insertion", function (state, action, editor, session, text) {
        if (text == '"' || text == "'") {
            var quote = text;
            var selected = session.doc.getTextRange(editor.getSelectionRange());
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                return {
                    text: quote + selected + quote,
                    selection: false
                };
            }

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (rightChar == quote && (is(token, "attribute-value") || is(token, "string"))) {
                return {
                    text: "",
                    selection: [1, 1]
                };
            }

            if (!token)
                token = iterator.stepBackward();

            if (!token)
                return;

            while (is(token, "dmlTag-whitespace") || is(token, "whitespace")) {
                token = iterator.stepBackward();
            }
            var rightSpace = !rightChar || rightChar.match(/\s/);
            if (is(token, "attribute-equals") && (rightSpace || rightChar == ']') || (is(token, "decl-attribute-equals") && (rightSpace || rightChar == '?'))) {
                return {
                    text: quote + quote,
                    selection: [1, 1]
                };
            }
        }
    });

    this.add("string_dquotes", "deletion", function(state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
        if (text == ']') {
            var position = editor.getSelectionRange().start;
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken() || iterator.stepBackward();
            if (!token || !(is(token, "dmlTag-name") || is(token, "dmlTag-whitespace") || is(token, "attribute-name") || is(token, "attribute-equals") || is(token, "attribute-value")))
                return;
            if (is(token, "reference.attribute-value"))
                return;
            if (is(token, "attribute-value")) {
                var firstChar = token.value.charAt(0);
                if (firstChar == '"' || firstChar == "'") {
                    var lastChar = token.value.charAt(token.value.length - 1);
                    var tokenEnd = iterator.getCurrentTokenColumn() + token.value.length;
                    if (tokenEnd > position.column || tokenEnd == position.column && firstChar != lastChar)
                        return;
                }
            }
            while (!is(token, "dmlTag-name")) {
                token = iterator.stepBackward();
                if (token.value == "[") {
                    token = iterator.stepForward();
                    break;
                }
            }

            var tokenRow = iterator.getCurrentTokenRow();
            var tokenColumn = iterator.getCurrentTokenColumn();
            if (is(iterator.stepBackward(), "end-dmlTag-open"))
                return;

            var element = token.value;
            if (tokenRow == position.row)
                element = element.substring(0, position.column - tokenColumn);

            if (this.voidElements.hasOwnProperty(element.toLowerCase()))
                 return;

            return {
               text: "]" + "[/" + element + "]",
               selection: [1, 1]
            };
        }
    });

    this.add("autoindent", "insertion", function (state, action, editor, session, text) {
        if (text == "\n") {
            var cursor = editor.getCursorPosition();
            var line = session.getLine(cursor.row);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (token && token.type.indexOf("dmlTag-close") !== -1) {
                if (token.value == "/]")
                    return;
                while (token && token.type.indexOf("dmlTag-name") === -1) {
                    token = iterator.stepBackward();
                }

                if (!token) {
                    return;
                }

                var dmlTag = token.value;
                var row = iterator.getCurrentTokenRow();
                token = iterator.stepBackward();
                if (!token || token.type.indexOf("end-dmlTag") !== -1) {
                    return;
                }

                if (this.voidElements && !this.voidElements[dmlTag]) {
                    var nextToken = session.getTokenAt(cursor.row, cursor.column+1);
                    var line = session.getLine(row);
                    var nextIndent = this.$getIndent(line);
                    var indent = nextIndent + session.getTabString();

                    if (nextToken && nextToken.value === "[/") {
                        return {
                            text: "\n" + indent + "\n" + nextIndent,
                            selection: [1, indent.length, 1, indent.length]
                        };
                    } else {
                        return {
                            text: "\n" + indent
                        };
                    }
                }
            }
        }
    });

};

oop.inherits(dmlBehaviour, Behaviour);

exports.dmlBehaviour = dmlBehaviour;
});

ace.define("ace/mode/dml_folding",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/range","ace/mode/folding/fold_mode","ace/mode/folding/mixed","ace/token_iterator","ace/mode/folding/html","ace/mode/folding/xml","ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var Range = require("../range").Range;
var BaseFoldMode = require("./folding/fold_mode").FoldMode;
var MixedFoldMode = require("./folding/mixed").FoldMode;
var TokenIterator = require("../token_iterator").TokenIterator;
var HtmlFoldMode = require("./folding/html").FoldMode;


var XmlFoldMode = require("./folding/xml").FoldMode;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var PuredmlFoldMode = function(voidElements, optionalEndTags){
    BaseFoldMode.call(this);
	this.voidElements = voidElements || {};
    this.optionalEndTags = oop.mixin({}, this.voidElements);
    if (optionalEndTags)
        oop.mixin(this.optionalEndTags, optionalEndTags);
};
oop.inherits(PuredmlFoldMode, BaseFoldMode);

var htmlVoidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "menuitem", "param", "source", "track", "wbr"];
var htmlOptionalEndTags = ["li", "dt", "dd", "p", "rt", "rp", "optgroup", "option", "colgroup", "td", "th"];

var FoldMode = exports.FoldMode = function(voidElements, optionalEndTags) {
	MixedFoldMode.call(this, new PuredmlFoldMode(voidElements, optionalEndTags), {
		"html-js-": new CStyleFoldMode(),
        "html-css-": new CStyleFoldMode(),
		"html-": new HtmlFoldMode(htmlVoidElements, htmlOptionalEndTags),
		"node-": new CStyleFoldMode(),
	});
    
};
oop.inherits(FoldMode, MixedFoldMode);

var Tag = function() {
    this.tagName = "";
    this.closing = false;
    this.selfClosing = false;
    this.start = {row: 0, column: 0};
    this.end = {row: 0, column: 0};
};

function is(token, type) {
    return token.type.lastIndexOf(type + ".dml") > -1;
}

(function() {

    this.getFoldWidget = function(session, foldStyle, row) {
        var tag = this._getFirstTagInLine(session, row);

        if (!tag)
            return this.getCommentFoldWidget(session, row);

        if (tag.closing || (!tag.tagName && tag.selfClosing))
            return foldStyle == "markbeginend" ? "end" : "";

        if (!tag.tagName || tag.selfClosing || this.voidElements.hasOwnProperty(tag.tagName.toLowerCase()))
            return "";

        if (this._findEndTagInLine(session, row, tag.tagName, tag.end.column))
            return "";

        return "start";
    };
    
    this.getCommentFoldWidget = function(session, row) {
        if (/comment/.test(session.getState(row)) && /<!-/.test(session.getLine(row)))
            return "start";
        return "";
    };
    this._getFirstTagInLine = function(session, row) {
        var tokens = session.getTokens(row);
        var tag = new Tag();

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (is(token, "dmlTag-open")) {
                tag.end.column = tag.start.column + token.value.length;
                tag.closing = is(token, "end-dmlTag-open");
                token = tokens[++i];
                if (!token)
                    return null;
                tag.tagName = token.value;
                tag.end.column += token.value.length;
                for (i++; i < tokens.length; i++) {
                    token = tokens[i];
                    tag.end.column += token.value.length;
                    if (is(token, "dmlTag-close")) {
                        tag.selfClosing = token.value == '/]';
                        break;
                    }
                }
                return tag;
            } else if (is(token, "dmlTag-close")) {
                tag.selfClosing = token.value == '/]';
                return tag;
            }
            tag.start.column += token.value.length;
        }

        return null;
    };

    this._findEndTagInLine = function(session, row, tagName, startColumn) {
        var tokens = session.getTokens(row);
        var column = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            column += token.value.length;
            if (column < startColumn)
                continue;
            if (is(token, "end-dmlTag-open")) {
                token = tokens[i + 1];
                if (token && token.value == tagName)
                    return true;
            }
        }
        return false;
    };
    this._readTagForward = function(iterator) {
        var token = iterator.getCurrentToken();
        if (!token)
            return null;

        var tag = new Tag();
        do {
            if (is(token, "dmlTag-open")) {
                tag.closing = is(token, "end-dmlTag-open");
                tag.start.row = iterator.getCurrentTokenRow();
                tag.start.column = iterator.getCurrentTokenColumn();
            } else if (is(token, "dmlTag-name")) {
                tag.tagName = token.value;
            } else if (is(token, "dmlTag-close")) {
                tag.selfClosing = token.value == "/]";
                tag.end.row = iterator.getCurrentTokenRow();
                tag.end.column = iterator.getCurrentTokenColumn() + token.value.length;
                iterator.stepForward();
                return tag;
            }
        } while(token = iterator.stepForward());

        return null;
    };
    
    this._readTagBackward = function(iterator) {
        var token = iterator.getCurrentToken();
        if (!token)
            return null;

        var tag = new Tag();
        do {
            if (is(token, "dmlTag-open")) {
                tag.closing = is(token, "end-dmlTag-open");
                tag.start.row = iterator.getCurrentTokenRow();
                tag.start.column = iterator.getCurrentTokenColumn();
                iterator.stepBackward();
                return tag;
            } else if (is(token, "dmlTag-name")) {
                tag.tagName = token.value;
            } else if (is(token, "dmlTag-close")) {
                tag.selfClosing = token.value == "/]";
                tag.end.row = iterator.getCurrentTokenRow();
                tag.end.column = iterator.getCurrentTokenColumn() + token.value.length;
            }
        } while(token = iterator.stepBackward());

        return null;
    };
    
    this._pop = function(stack, tag) {
        while (stack.length) {
            
            var top = stack[stack.length-1];
            if (!tag || top.tagName == tag.tagName) {
                return stack.pop();
            }
            else if (this.optionalEndTags.hasOwnProperty(top.tagName)) {
                stack.pop();
                continue;
            } else {
                return null;
            }
        }
    };
    
    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var firstTag = this._getFirstTagInLine(session, row);
        
        if (!firstTag) {
            return this.getCommentFoldWidget(session, row)
                && session.getCommentFoldRange(row, session.getLine(row).length);
        }
        
        var isBackward = firstTag.closing || firstTag.selfClosing;
        var stack = [];
        var tag;
        
        if (!isBackward) {
            var iterator = new TokenIterator(session, row, firstTag.start.column);
            var start = {
                row: row,
                column: firstTag.start.column + firstTag.tagName.length + 2
            };
            if (firstTag.start.row == firstTag.end.row)
                start.column = firstTag.end.column;
            while (tag = this._readTagForward(iterator)) {
                if (tag.selfClosing) {
                    if (!stack.length) {
                        tag.start.column += tag.tagName.length + 2;
                        tag.end.column -= 2;
                        return Range.fromPoints(tag.start, tag.end);
                    } else
                        continue;
                }
                
                if (tag.closing) {
                    this._pop(stack, tag);
                    if (stack.length == 0)
                        return Range.fromPoints(start, tag.start);
                }
                else {
                    stack.push(tag);
                }
            }
        }
        else {
            var iterator = new TokenIterator(session, row, firstTag.end.column);
            var end = {
                row: row,
                column: firstTag.start.column
            };
            
            while (tag = this._readTagBackward(iterator)) {
                if (tag.selfClosing) {
                    if (!stack.length) {
                        tag.start.column += tag.tagName.length + 2;
                        tag.end.column -= 2;
                        return Range.fromPoints(tag.start, tag.end);
                    } else
                        continue;
                }
                
                if (!tag.closing) {
                    this._pop(stack, tag);
                    if (stack.length == 0) {
                        tag.start.column += tag.tagName.length + 2;
                        if (tag.start.row == tag.end.row && tag.start.column < tag.end.column)
                            tag.start.column = tag.end.column;
                        return Range.fromPoints(tag.start, end);
                    }
                }
                else {
                    stack.push(tag);
                }
            }
        }
        
    };

}).call(PuredmlFoldMode.prototype);

});

ace.define("ace/mode/dml",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text","ace/mode/html","ace/mode/javascript","ace/mode/css","ace/mode/dml_highlight_rules","ace/mode/dml_behaviour","ace/mode/dml_folding","ace/worker/worker_client"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextMode = require("./text").Mode;
var HtmlMode = require("./html").Mode;
var JavaScriptMode = require("./javascript").Mode;
var CssMode = require("./css").Mode;

var dmlHighlightRules = require("./dml_highlight_rules").dmlHighlightRules;
var dmlBehaviour = require("./dml_behaviour").dmlBehaviour;
var dmlFoldMode = require("./dml_folding").FoldMode;

var WorkerClient = require("../worker/worker_client").WorkerClient;
var voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "menuitem", "param", "source", "track", "wbr"];
var optionalEndTags = ["li", "dt", "dd", "p", "rt", "rp", "optgroup", "option", "colgroup", "td", "th"];

var Mode = function(options) {
	this.fragmentContext = options && options.fragmentContext;
	this.HighlightRules = dmlHighlightRules;
	this.$behaviour = new dmlBehaviour();
	this.foldingRules = new dmlFoldMode(this.voidElements, lang.arrayToMap(optionalEndTags));
   
	this.createModeDelegates({
        "html-": HtmlMode,
		"node-": JavaScriptMode,
	});
};

oop.inherits(Mode, TextMode);

(function() {
	this.voidElements = lang.arrayToMap(voidElements);
	this.lineCommentStart = "[[";
    
    this.$id = "ace/mode/dml";
}).call(Mode.prototype);

exports.Mode = Mode;
});
