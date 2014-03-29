# introduction
I think it would be neat to have a simple filesystem for the browser.

## Requirements
* [nodejs](http://nodejs.org)
* [bower](http://bower.io)
* [gulp](http://gulpjs.com)

## Usage
```js
var fs = new FilerFs({
    persistent: false,
    size: 1024 * 1024
});
fs.
save('panel.html',
    '<div class="panel panel-default">\n' +
    ' <div class="panel-heading">\n' +
    '   <h3 class="panel-title">Panel title</h3>\n' +
    ' </div>\n' +
    ' <div class="panel-body">Panel content</div>\n' +
    '</div>'
).then(function() {
    return fs.load('panel.html');
}).then(function(element) {
    document.body.appendChild(element);
}).then(function() {
    return fs.ls('.');
}).then(function(filelist) {
    var list = document.createElement('ol'),
        item, file;
    for (var i = 0; i < fileList.length; i++) {
        item = document.createElement('ol');
        file = fileList[i];
        item.textContent = file.name;
        list.appendChild(item);
    }
    document.body.appendChild(list);
});
```


## Install

``` bash
$ git clone https://github.com/FireNeslo/bro-fs.git
$ cd bro-fs
$ npm install
$ bower install
$ gulp
$ gulp watch &
$ cd app
$ python -m SimpleHTTPServer
```