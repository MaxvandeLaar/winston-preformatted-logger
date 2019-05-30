/*
 * Copyright (c) 2018.
 * Author: Max van de Laar
 */

const fs = require('fs-extra');
const winston = require('winston');
const {createLogger, format, transports } = winston;
const moment = require('moment');
require('winston-daily-rotate-file');
const ANSI_RESET = "\u001B[0m";
const ANSI_WHITE = "\u001B[30m";
const ANSI_RED = "\u001B[31m";
const ANSI_GREEN = "\u001B[32m";
const ANSI_YELLOW = "\u001B[33m";
const ANSI_BLUE = "\u001B[34m";
const ANSI_PURPLE = "\u001B[35m";
const ANSI_CYAN = "\u001B[36m";
const ANSI_GRAY = "\u001B[37m";

class Logger {
    formatLogLine(info, logOptions, applyColors = false){
        const tmpFrom = info.from || logOptions.from;
        const from = tmpFrom ? `[${tmpFrom}]` : '';

        const tmpLabel = info.label || logOptions.label;
        const label = tmpLabel ? `${tmpLabel} - ` : '';
        const message = info.message ? info.message : '';
        const optionsMeta = Object.assign({}, logOptions.meta);
        const tmpMeta = info.meta ? Object.assign(optionsMeta, info.meta): logOptions.meta;
        const meta = tmpMeta && Object.keys(tmpMeta).length ? `\n${JSON.stringify(tmpMeta, null, '\t')}` : '';
        const dateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        const level = info.level.toUpperCase();
        if (applyColors){
            return `${this.colors[level] || ANSI_RESET}${dateTime} [${level}]${from}: ${label}${message}${meta}${ANSI_RESET}`;
        }
        return `${dateTime} [${level}]${from}: ${label}${message}${meta}`;
    }

    /**
     * @constructor
     * @param [module] {{}} Add the current module to determine the root info
     * @param [settings] {{}} Destination of the generated log files.
     * @param [settings.logFolder=./logs] {string} Destination of the generated log files.
     * @param [settings.logLevel=info] {string} The log level.
     * @param [settings.logFilename=%DATE%] {string} The log file's name.
     * @param [settings.logFileDatePattern=YYYY-DD-MM] {string} The date pattern inside the log file's name.
     * @param [settings.colors] {{}} Colors of the log levels (Uppercase).
     * @param [logOptions] {{}} Sets the 'from' options in the log line.
     * @param [logOptions.from] {string} Sets the 'from' options in the log line.
     * @param [logOptions.label] {string} Sets the 'label' options in the log line.
     * @param [logOptions.meta] {{}} Include default metadata to the log line.
     */
    constructor(module, settings = {}, logOptions = {}){
        let filename = '';
        if (module){
            require('pkginfo')(module);
            filename = `.${module.exports.name}` || '';
        }
        this.logFolder = settings.logFolder || './logs';
        this.logLevel = settings.logLevel || 'info';
        this.logFilename = settings.logFilename ?  `.${settings.logFilename}`:filename;
        this.logFileDatePattern = settings.logFileDatePattern || 'YYYY-DD-MM';
        this.logLevel = this.logLevel.toLowerCase();
        logOptions.meta = logOptions.meta || {};

        fs.ensureDirSync(this.logFolder);

        this.colors = Object.assign({
            INFO: ANSI_RESET,
            DEBUG: ANSI_GRAY,
            WARN: ANSI_YELLOW,
            ERROR: ANSI_RED
        }, settings.colors);

        this.humanFormat = format.printf((info) => {
            return this.formatLogLine(info, logOptions);
        });

        this.humanFormatColorized = format.printf((info) => {
            return this.formatLogLine(info, logOptions, true);
        });

        this.dailyRotateTransport = new transports.DailyRotateFile({
            filename: `${this.logFolder}/%DATE%${this.logFilename}.log`,
            datePattern: this.logFileDatePattern,
            prepend: true,
            level: this.logLevel,
            json: false,
            format: this.humanFormat,
            handleExceptions: true,
            tailable: true,
            stderrLevels: ['error'],
            maxDays: 90,
            localTime: true,
            zippedArchive: true
        });

        this.MainConsoleTransport = new transports.Console({
            level: this.logLevel,
            json: false,
            format: this.humanFormatColorized,
            handleExceptions: true,
            stderrLevels: ['error']
        });

        const logger = this.logger = createLogger({
            level: this.logLevel,
            transports: [
                this.dailyRotateTransport,
                this.MainConsoleTransport
            ],
            exitOnError: false
        });

        this.logger.stack = function(error, args = null){
            let message = error.message || error;
            message = error.stack || message;
            if (args){
                logger.error(message, args);
            } else {
                logger.error(message);
            }
        };

        this.logger.stream = {
            write: function (message) {
                message = message.slice(0, -1); //remove linebreak from morgan logger
                logger.debug(message, {from: 'morgan'});
            }
        };
    }
}

module.exports = Logger;
