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

    /**
     * @constructor
     * @param [opts.logFolder=./logs] {string} Destination of the generated log files.
     * @param [opts.logLevel=info] {string} The log level.
     * @param [opts.logFilename=%DATE%] {string} The log file's name.
     * @param [opts.logFileDatePattern=YYYY-DD-MM] {string} The date pattern inside the log file's name.
     * @param [opts.colors] {{}} Colors of the log levels (Uppercase).
     */
    constructor(opts = {}){
        this.logFolder = opts.logFolder || './logs';
        this.logLevel = opts.logLevel || 'info';
        this.logFilename = opts.logFilename ?  `.${opts.logFilename}`:'';
        this.logFileDatePattern = opts.logFileDatePattern || 'YYYY-DD-MM';

        fs.ensureDirSync(this.logFolder);

        this.colors = Object.assign({
            INFO: ANSI_RESET,
            DEBUG: ANSI_GRAY,
            WARN: ANSI_YELLOW,
            ERROR: ANSI_RED
        }, opts.colors);

        this.humanFormat = format.printf((info) => {
            let from = info.from ? `[${info.from}]` : '';
            let label = info.label ? `${info.label} - ` : '';
            let message = info.message ? info.message : '';
            let meta = info.meta && Object.keys(info.meta).length ? `\n${JSON.stringify(info.meta, null, '\t')}` : '';
            let dateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            let level = info.level.toUpperCase();

            return `${dateTime} [${level}]${from}: ${label}${message}${meta}`;
        });

        this.humanFormatColorized = format.printf((info) => {
            let from = info.from ? `[${info.from}]` : '';
            let label = info.label ? `${info.label} - ` : '';
            let message = info.message ? info.message : '';
            let meta = info.meta && Object.keys(info.meta).length ? `\n${JSON.stringify(info.meta, null, '\t')}` : '';
            let dateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            let level = info.level.toUpperCase();

            return `${this.colors[level] || ANSI_RESET}${dateTime} [${level}]${from}: ${label}${message}${meta}${ANSI_RESET}`;
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