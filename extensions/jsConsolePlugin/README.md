Goto your webpage and type 'javascript:' in the addressbar
Then copy and paste the lines of code provided below
Finally hit enter, and click somewhere in the webpage, your console should now appear.

```js
window.script = document.createElement("script"); 
script.setAttribute("src", "https://cdn.rawgit.com/TarVK/chromeConsole/master/extensions/jsConsolePlugin/jsConsolePlugin.js"); 
document.head.appendChild(script);
```
