/*
 * grunt-gobin
 * https://github.com/AislerHQ/grunt-gobin
 *
 * Copyright (c) 2015 Patrick Franken
 * Licensed under the MIT license.
 */

'use strict';

function toHex(content) {
  var result = [];
  for (var i = 0, length = content.length; i < length; i++) {
    result.push('0x' + content[i].toString(16) + ', ');
  }
  return result.join('');
}

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('gobin', 'Converts any file into Google Go valid source code', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      package: 'main'
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var content = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        return ' "' + filepath + '": func()[]byte{return []byte{' + toHex(grunt.file.read(filepath,  {"encoding": null})) + "}}";
      }).join(',\n');
      
      content += ',\n';
      var src = 'package ' + options.package + "\n\n" +
        'var _bindata = map[string]func()[]byte{' + "\n" +
        content +
        '}' + "\n" +
        'func Asset(name string) []byte {' + "\n" +
        ' if f, ok := _bindata[name]; ok {' + "\n" +
        ' return f()' + "\n" +
        ' }' + "\n" +
        ' return nil' + "\n" +
        '}';
      
      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
