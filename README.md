NPM Updater
===========
This Node shell script uses the NPM API to find outdated modules and update them.
It will skip the global installation of NPM itself, leaving that for manual update through the package management system used to originally install NPM.

Usage
-----
```
Usage: npmUpdate [options]

  Options:

    -h, --help                                output usage information
    -V, --version                             output the version number
    -m, --module <modulename,modulename,...>  update specified module/s
    -l, --local                               update local repository (default: false)
    -v, --verbose                             show update messages (default: false)
```