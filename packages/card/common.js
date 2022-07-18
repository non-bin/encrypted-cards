const LOG_CATEGORIES = ['fatal', 'error', 'warn', 'info'];

exports.REGEX_ID       = /^[a-zA-Z0-9-]+$/;
exports.REGEX_SECRET   = /^[a-zA-Z0-9+/]+={0,2}$/;
exports.REGEX_ENC_CARD = /^[a-zA-Z0-9+/]+={0,2}$/;

exports.HTTP_STATUS = {
	OK:          200,
	BAD_REQUEST: 400,
	CONFLICT:    409,
	INTERNAL_SERVER_ERROR: 500
};

exports.exists = function(id) {
	// TODO: placeholder
	return false;
};

exports.create = function(id, secret, body) {
	// TODO: placeholder
	return true;
};

// TODO: repeated in api code
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
exports.generateRandomString = function(len) {
	let result = '';
	let buf = new Uint8Array(len);
	window.crypto.getRandomValues(buf);
	buf.forEach(x => result += chars.charAt(x % chars.length));
	return result;
};

exports.log = function(level, ...args) {
	if (!LOG_CATEGORIES.includes(level)) return;

	const ConsoleReset = '\x1b[0m';
	const ConsoleBlink = '\x1b[5m';
	const ConsoleFgRed = '\x1b[31m';
	const ConsoleFgGreen = '\x1b[32m';

	switch (level) {
	case 'fatal':
		console.error(ConsoleFgRed + ConsoleBlink + '[FATAL] ' + ConsoleReset + ConsoleFgRed, ...args, ConsoleReset);
		break;

	case 'error':
		console.error(ConsoleFgRed + '[ERROR] ', ...args, ConsoleReset);
		break;

	case 'info':
	default:
		console.log('[INFO] ', ...args, ConsoleReset);
		break;
	}

	return;
};
