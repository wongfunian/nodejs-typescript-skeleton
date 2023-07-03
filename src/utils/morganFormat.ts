import { FormatFn } from 'morgan';
import colors from 'colors';
import dayjs from 'dayjs';

// Define a custom format function with colors
const format: FormatFn = (tokens, req, res): string => {
    const method = tokens.method(req, res);
    let status = tokens.status(req, res);
    let responseTime = tokens['response-time'](req, res);
    let methodColor;

    // Use colors to format the output
    switch (method) {
        case 'GET':
            methodColor = method.green;
            break;
        case 'POST':
            methodColor = method.blue;
            break;
        case 'PUT':
            methodColor = method.yellow;
            break;
        case 'DELETE':
            methodColor = method.red;
            break;
        default:
            methodColor = method;
    }

    if (!status) {
        status = '500';
    }

    if (Number(status) >= 500) {
        status = colors.red(status);
    } else if (Number(status) >= 400) {
        status = colors.yellow(status);
    } else if (Number(status) >= 300) {
        status = colors.cyan(status);
    } else {
        status = status.green;
    }

    if (!responseTime) {
        responseTime = 'Unknown';
    }

    if (responseTime === 'Unknown' || Number(responseTime) > 5000) {
        responseTime = colors.red(responseTime);
    }
    if (Number(responseTime) > 2000 && Number(responseTime) <= 5000) {
        responseTime = colors.yellow(responseTime);
    }
    if (Number(responseTime) <= 2000) {
        responseTime = colors.green(responseTime);
    }

    return ['[' + dayjs().format('DD MMM YYYY, hh:mm:ss a') + ']', methodColor, tokens.url(req, res), status, '-', responseTime, 'ms'].join(' ');
};

export default format;
