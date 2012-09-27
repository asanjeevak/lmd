/**
 * LMD
 *
 * @author  Mikhail Davydov
 * @licence MIT
 */

var lmdPackage = require(__dirname + '/lmd_builder.js'),
    fs = require('fs');

/**
 *
 *
 * @type {String[]}
 */
var availableModes = ['main', 'watch'];

/**
 * Simple argv parser
 *
 * @see https://gist.github.com/1497865
 *
 * @param {String} a an argv string
 *
 * @returns {Object}
 */
var parseArgv = function (a,b,c,d) {
    c={};for(a=a.split(/\s*\B[-]+([\w-]+)[\s=]*/),d=1;b=a[d++];c[b]=a[d++]||!0);return c
};

/**
 * Formats lmd config
 *
 * @param  {String|Object} data
 *
 * @return {Object}
 */
var parseData = function (data) {
    var config;

    // case data is argv string
    if (typeof data === "string") {
        // try to parse new version
        config = parseArgv(data);

        // its new config argv string
        if (Object.keys(config).length) {
            // translate short params to long one
            config.mode = config.mode || config.m;
            config.output = config.output || config.o;
            config.log = config.log || config.l;
            config.config = config.config || config.c;
            config['no-warn'] = config['no-warn'] || config['no-w'];
        } else {
            // an old argv format, split argv and parse manually
            data = data.split(' ');

            // without mode
            if (availableModes.indexOf(data[2]) === -1) {
                config = {
                    mode: 'main',
                    config: data[2],
                    output: data[3]
                };
            } else { // with mode
                config = {
                    mode: data[2],
                    config: data[3],
                    output: data[4]
                };
            }
        }

    // case data is config object
    } else if (typeof config === "object") {
        // use as is
        config = data;

    // case else
    } else {
        // wut?
        throw new Error('Bad config data');
    }

    config.mode = config.mode || 'main';
    config['no-warn'] = config['no-warn'] || false;
    config.log = config.log || false;
    return config;
};

var config = parseData(process.argv.join(' '));

switch (config.mode) {
    case 'main':
        var buildResult = new lmdPackage(config.config, {
            noWarn: config['no-warn']
        });
        if (!config.config) {
            buildResult.log.pipe(process.stdout);
            break;
        }
        if (config.output) {
            var fileStream = fs.createWriteStream(config.output, {
                flags: "w",
                encoding: "utf8",
                mode: 0666
            });

            buildResult.pipe(fileStream);
            if (config.log) {
                buildResult.log.pipe(process.stdout);
            }
        } else {
            buildResult.pipe(process.stdout);
        }
        break;
    case 'watch':
        var watcher = new lmdPackage.watch(config.config, config.output, {
            noWarn: config['no-warn']
        });
        if (!config.config || !config.output) {
            watcher.log.pipe(process.stdout);
            break;
        }

        if (config.log) {
            watcher.log.pipe(process.stdout);
        }
        break;
}