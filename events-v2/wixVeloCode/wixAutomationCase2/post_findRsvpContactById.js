/**
 * The secret is stored in Wix Secrets Manager.
 * https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/secrets-manager/about-the-secrets-manager
 * Make sure to replace the secret manager token below with your actual secret manager token.
 */
const AUTOMATION_FIND_EVENT_GUEST =
	'your_automation_find_event_guest_secret_manager_token';

/**
 * https://dev.wix.com/docs/velo/articles/getting-started/expose-an-api
 *
 * HTTP Function: post_findRsvpContactById
 * Endpoint: https://www.yourdomain.com/_functions/findRsvpContactById
 *
 * Accepts: POST with JSON { userId, secretKey }
 * Returns: a message and phone number if exists
 */
export async function post_findRsvpContactById(request) {
	// Initialize the response object with standard JSON headers.
	const response = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		/**
		 * https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value
		 */
		const elevatedGetSecretValue = elevate(secrets.getSecretValue);

		// Retrieve the expected secret key from Wix Secrets Manager
		// NOTE: Secrets are stored as a JSON object, so we access the 'value' property.
		const EXPECTED_SECRET_KEY = (
			await elevatedGetSecretValue('AUTOMATION_FIND_EVENT_GUEST')
		).value;

		// Check if the secret was retrieved successfully.
		if (!EXPECTED_SECRET_KEY) {
			console.error(
				'❌ [post_findRsvpContactById]: Expected secret key "AUTOMATION_FIND_EVENT_GUEST" not found in Secrets Manager.'
			);
			response.body = {
				error: 'Server configuration error: Secret key missing.',
			};
			return badRequest(response);
		}

		console.log(
			'🌐 [post_findRsvpContactById]: Secret key successfully retrieved from Secrets Manager.'
		);

		const body = await request.body.json();
		const secretKey = body.data.secretKey;
		const userId = body.data.userId;

		console.log('🌐 [post_findRsvpContactById]: User Id received: ', userId);

		console.log(
			'🌐 [post_findRsvpContactById]🐞[DEBUG]: --- Secret Key Comparison Details ---'
		);
		console.log(
			'🌐 [post_findRsvpContactById]🐞[DEBUG]: Incoming secretKey:',
			secretKey,
			'| Type:',
			typeof secretKey
		);
		console.log(
			'🌐 [post_findRsvpContactById]🐞[DEBUG]: EXPECTED_SECRET_KEY:',
			EXPECTED_SECRET_KEY,
			'| Type:',
			typeof EXPECTED_SECRET_KEY
		);
		console.log(
			'🌐 [post_findRsvpContactById]🐞[DEBUG]: Incoming === Expected:',
			secretKey === EXPECTED_SECRET_KEY
		);
		console.log(
			'🌐 [post_findRsvpContactById]🐞[DEBUG]: --- End Comparison Details ---'
		);

		// Input validation for secretKey
		if (typeof secretKey !== 'string' || secretKey !== EXPECTED_SECRET_KEY) {
			console.error(
				'❌ [post_findRsvpContactById]: Secret key invalid. Received:',
				secretKey
			);
			response.body = {
				error: 'Unauthorized: Invalid or missing secretKey.',
			};
			return badRequest(response);
		}

		console.log('🌐 [post_findRsvpContactById]: Secret key validation passed.');

		// Input validation for userId
		if (typeof userId !== 'string' || userId.trim() === '') {
			console.error(
				'❌ [post_findRsvpContactById]: User ID invalid. Received:',
				userId
			);
			response.body = {
				error: "'userId' must be a non-empty string ID.",
			};
			return badRequest(response);
		}

		console.log('🌐 [post_findRsvpContactById]: User ID validation passed.');

		const elevatedGetContact = elevate(contacts.getContact);
		const contact = await elevatedGetContact(userId);

		if (!contact) {
			response.body = { error: 'Contact not found.' };
			return badRequest(response);
		}

		// Check for phone
		const phone = contact.primaryInfo?.phone || '';
		const hasPhone = typeof phone === 'string' && phone.trim() !== '';

		response.body = {
			message: hasPhone
				? '✅ Phone number found for the contact.'
				: '⛔ No phone number found for the contact.',
			phone: hasPhone ? phone : '',
		};

		return ok(response);
	} catch (error) {
		console.error(
			'❌ [post_findRsvpContactById]: Unexpected error in post_findRsvpContactById:',
			error
		);
		response.body = { error: error?.message || String(error) };
		return badRequest(response);
	}
}
