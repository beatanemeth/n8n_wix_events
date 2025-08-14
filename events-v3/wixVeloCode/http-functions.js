import { ok, badRequest } from 'wix-http-functions';
import {
	findEventGuests,
	findEventGuestPhone as findPhone,
	updateContactPhone,
} from 'backend/eventGuestService.web';
import {
	validateAuthorizationHeader,
	decodeJwtToken,
	JWT_SECRET_FIND_EVENT_GUESTS,
	JWT_SECRET_FIND_EVENT_GUEST_PHONE,
	JWT_SECRET_UPDATE_CONTACT_PHONE,
} from 'backend/util.web';

const ENDPOINT_FIND_EVENT_GUESTS = 'post_findEventGuests';
const ENDPOINT_FIND_EVENT_GUEST_PHONE = 'post_findEventGuestPhone';
const ENDPOINT_UPDATE_CONTACT_PHONE = 'post_updateContactPhone';

/**
 * HTTP Function: post_findEventGuests
 * Endpoint: https://www.yourdomain.com/_functions/findEventGuests
 *
 * This function processes POST requests to fetch event guest details.
 * It supports filtering guests by a timestamp and requires a JWT for authorization.
 *
 * @accepts POST with JSON body:
 * - `eventId`: (string) The ID of the event.
 * - `lastCheckedTimestamp`: (string, optional) An ISO 8601 formatted date-time string (2025-07-07T07:04:16.398-04:00), representing the time guests were last checked, including milliseconds and timezone offset.
 * @requires Authorization header: `Bearer YOUR_JWT_TOKEN`
 * @returns {object} Guest data (array of guest objects) if successful, or an error object.
 */
export async function post_findEventGuests(request) {
	const response = { headers: { 'Content-Type': 'application/json' } };
	/**
	 * Define options for fetching guest details, specifying the fields to retrieve.
	 * 'GUEST_DETAILS' is an example; adjust based on actual Wix Events API fields.
	 * https://dev.wix.com/docs/velo/apis/wix-events-v2/guests/query-guests
	 */
	const options = { fields: ['GUEST_DETAILS'] };

	try {
		const body = await request.body.json();
		const eventId = body.eventId;
		const lastCheckedTimestamp = body.lastCheckedTimestamp;

		const actualToken = validateAuthorizationHeader(
			request,
			ENDPOINT_FIND_EVENT_GUESTS
		);
		const decodedJwt = await decodeJwtToken(
			actualToken,
			JWT_SECRET_FIND_EVENT_GUESTS,
			ENDPOINT_FIND_EVENT_GUESTS
		);

		if (!decodedJwt) {
			console.error(
				`❌ [${ENDPOINT_FIND_EVENT_GUESTS}]: Invalid or missing JWT.`
			);
			response.body = { error: 'Unauthorized: Invalid token.' };
			return badRequest(response);
		}

		if (typeof eventId !== 'string' || eventId.trim() === '') {
			console.error(
				`❌ [${ENDPOINT_FIND_EVENT_GUESTS}]: Event ID invalid. Received:`,
				eventId
			);
			response.body = { error: 'eventId must be a string.' };
			return badRequest(response);
		}

		console.log(
			`🌐 [${ENDPOINT_FIND_EVENT_GUESTS}]: Validated eventId: ${eventId}.`
		);

		const guestsResult = await findEventGuests(
			lastCheckedTimestamp,
			eventId,
			options
		);

		console.log(
			`🌐 [${ENDPOINT_FIND_EVENT_GUESTS}]: Received guests: `,
			guestsResult?.guests?.length ?? 0
		);

		response.body = guestsResult; // { message, guests }
		return ok(response);
	} catch (error) {
		console.error(
			`❌ [${ENDPOINT_FIND_EVENT_GUESTS}]: Unexpected error caught: `,
			error
		);
		response.body = { error: error?.message || String(error) };
		return badRequest(response);
	}
}

/**
 * HTTP Function: post_findEventGuestPhone
 * Endpoint: https://www.yourdomain.com/_functions/findEventGuestPhone
 *
 * This function processes POST requests to fetch event guest phone.
 *
 * @accepts POST with JSON body:
 * - `userId`: (string) The ID of the user.
 * @requires Authorization header: `Bearer YOUR_JWT_TOKEN`
 * @returns {object} Guest data (phone) if successful, or an error object.
 */
export async function post_findEventGuestPhone(request) {
	const response = { headers: { 'Content-Type': 'application/json' } };

	try {
		const body = await request.body.json();
		const userId = body.userId;

		const actualToken = validateAuthorizationHeader(
			request,
			ENDPOINT_FIND_EVENT_GUEST_PHONE
		);
		const decodedJwt = await decodeJwtToken(
			actualToken,
			JWT_SECRET_FIND_EVENT_GUEST_PHONE,
			ENDPOINT_FIND_EVENT_GUEST_PHONE
		);

		if (!decodedJwt) {
			console.error(
				`❌ [${ENDPOINT_FIND_EVENT_GUEST_PHONE}]: Invalid or missing JWT.`
			);
			response.body = { error: 'Unauthorized: Invalid token.' };
			return badRequest(response);
		}

		if (typeof userId !== 'string' || userId.trim() === '') {
			console.error(
				`❌ [${ENDPOINT_FIND_EVENT_GUEST_PHONE}]: User ID invalid. Received: `,
				userId
			);
			response.body = { error: 'userId must be a string.' };
			return badRequest(response);
		}

		console.log(
			`🌐 [${ENDPOINT_FIND_EVENT_GUEST_PHONE}]: Validated userId: ${userId}.`
		);
		const phoneResult = await findPhone(userId);

		response.body = phoneResult; // { message, phone }
		return ok(response);
	} catch (error) {
		console.error(
			`❌ [${ENDPOINT_FIND_EVENT_GUEST_PHONE}]: Unexpected error caught: `,
			error
		);
		response.body = { error: error?.message || String(error) };
		return badRequest(response);
	}
}

/**
 * HTTP Function: post_updateContactPhone
 * Endpoint: https://www.yourdomain.com/_functions/updateContactPhone
 *
 * Accepts a POST request to update multiple Wix contact phone numbers.
 *
 * @accepts POST with JSON body:
 * - `contactsToUpdate`: array of contact objects containing:
 *      email (string) and phone { countryCode, number }
 * @requires Authorization header: `Bearer YOUR_JWT_TOKEN`
 * @returns {object} Update results for each contact
 */
export async function post_updateContactPhone(request) {
	const response = { headers: { 'Content-Type': 'application/json' } };

	try {
		const body = await request.body.json();
		const contactsToUpdate = body.contactsToUpdate;

		if (!Array.isArray(contactsToUpdate) || contactsToUpdate.length === 0) {
			throw new Error('contactsToUpdate must be a non-empty array.');
		}

		const actualToken = validateAuthorizationHeader(
			request,
			ENDPOINT_UPDATE_CONTACT_PHONE
		);
		const decodedJwt = await decodeJwtToken(
			actualToken,
			JWT_SECRET_UPDATE_CONTACT_PHONE,
			ENDPOINT_UPDATE_CONTACT_PHONE
		);

		if (!decodedJwt) {
			console.error(
				`❌ [${ENDPOINT_UPDATE_CONTACT_PHONE}]: Invalid or missing JWT.`
			);
			response.body = { error: 'Unauthorized: Invalid token.' };
			return badRequest(response);
		}

		// Call updateContactPhone for each contact, collect results
		const results = await Promise.all(
			contactsToUpdate.map((contact) =>
				updateContactPhone(contact.email, contact.phone)
			)
		);

		console.log(
			`🌐 [${ENDPOINT_UPDATE_CONTACT_PHONE}]: Updated contact phone numbers for: `,
			contactsToUpdate.map((c) => c.email)
		);

		response.body = { results }; // Return all per-contact results
		return ok(response);
	} catch (error) {
		console.error(
			`❌ [${ENDPOINT_UPDATE_CONTACT_PHONE}]: Unexpected error caught: `,
			error
		);
		response.body = { error: error?.message || String(error) };
		return badRequest(response);
	}
}
