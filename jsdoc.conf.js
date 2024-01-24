'use strict';

module.exports = {
    plugins: ['plugins/markdown'],
    recurseDepth: 10,
    source: {
        include: ['src'],
        exclude: [ /* array of paths to exclude */ ],
        includePattern: ".+\\.js(doc|x)?$",
        excludePattern: "(^|\\/|\\\\)_"
    },
    opts: {
        encoding: "utf8",               // same as -e utf8
        destination: "./out/",          // same as -d ./out/
        recurse: true                  // same as -r
    }
};