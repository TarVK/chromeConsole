# Chrome Console
ChromeConsole is an open-source embeddable console, written in JavaScript. It attempts to match most of the features provided by Chrome's JavaScript console and is easy to embed into any web page or browser application like NW.js and Electron.
For a working demo and details please visit the [project's website](https://tarvk.github.io/chromeConsole/About.html)

I want to slightly justify my messy code, by explaining that this was supposed to be a very basic console initially. But once I started working on it, I slowly made it mirror chrome's console behaviours more and more. Therefore there was little initial planning, and the code is quite sloppy. I might make a second version at some point, which will have more proper maintainable code. I however have many other projects that i want to get to first. 

![JavaScript Console](./docs/readme/JavaScriptConsole.png)

The console itself doesn't provide language evaluation, but merely provides the user interface. By allowing developers to provide their own language evaluation we extend the number of potential uses of the library. For example, the library can can be used to make REPLs for other languages, here, Ruby:

![Ruby Console](./docs/readme/RubyConsole.png)

Or used to build handy utilities, like this utility which searches a URL for a given regex:

![RegEx Text Parser](./docs/readme/RegexConsole.png)

## Todo:
* Wrap object overflow properly.
* Make a fix for Edge (\<details\> not implemented).
* Major browser support (e.g. Edge).
* Make it so parameters of functions are shown
* fix console.time()/console.timeEnd() not working properly in jsConsole without a specified label
