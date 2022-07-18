import * as EnCa from './common.js';

var response = {
	statusCode: EnCa.HTTP_STATUS.OK,
	headers: {},
	body: {
		success: true
	}
};

// eslint-disable-next-line no-unused-vars
const main = function(req) {
	response.headers['Content-Type'] = 'application/json; charset=utf-8';

	let newCard = {
		id: req['id'],
		body: req['cardData']
	};

	if (!newCard.id.match(EnCa.REGEX_ID)) {
		response.statusCode = EnCa.HTTP_STATUS.BAD_REQUEST;
		response.body = {
			success: false,
			error: 'Invalid id'
		};
		EnCa.log('error', 'Invalid id:', newCard.id);
		return response;
	}

	if (EnCa.card.exists(newCard.id)) {
		response.statusCode = EnCa.HTTP_STATUS.CONFLICT;
		response.body = {
			success: false,
			error: 'Card already exists'
		};
		EnCa.log('error', 'Card already exists:', newCard.id);
		return response;
	}

	if (!newCard.body.match(EnCa.REGEX_ENC_CARD)) {
		response.statusCode = EnCa.HTTP_STATUS.BAD_REQUEST;
		response.body = {
			success: false,
			error: 'Invalid card data'
		};
		EnCa.log('error', 'Invalid card data:', newCard.body);
		return response;
	}

	newCard.secret = EnCa.generateSecret();

	if (!EnCa.create(newCard.id, newCard.secret, newCard.body)) {
		response.statusCode = EnCa.HTTP_STATUS.INTERNAL_SERVER_ERROR;
		response.body = {
			success: false,
			error: 'Failed to create card'
		};
		EnCa.log('fatal', 'Failed to create card:', JSON.stringify(newCard, null, 2));
		return response;
	}

	EnCa.log('info', 'Created card:', JSON.stringify(newCard, null, 2));

	response.body = {
		success: true,
		body: newCard
	};

	return response;
};
