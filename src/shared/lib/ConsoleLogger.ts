import { Environment } from '../configs/Environment';
import { noop } from './noop';

export class ConsoleLogger {
    public static log = this._create('log');
    public static error = this._create('error');
    public static info = this._create('info');
    public static warn = this._create('warn');
    public static table = this._create('table');

    private static _create(type: 'log' | 'error' | 'warn' | 'info' | 'table') {
        if (Environment.isConsoleLoggingEnabled) {
            if (type === 'table') {
                // eslint-disable-next-line no-console
                return console.table;
            }

            // eslint-disable-next-line no-console
            return console[type].bind(null, '[ConsoleLogger]: ');
        }

        return noop;
    }
}
