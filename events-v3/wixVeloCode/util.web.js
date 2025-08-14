import { elevate } from 'wix-auth';
import { secrets } from 'wix-secrets-backend-v2';
import jwt from 'jsonwebtoken';

/**
 * Secrets are stored in Wix Secrets Manager.
 * https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/secrets-manager/about-the-secrets-manager
 * Make sure to replace the secret manager tokens below with your actual secret manager tokens.
 * These tokens are used to retrieve the JWT secret key for verifying JWTs.
 * The JWT secret key must match the one used to sign the JWT on the n8n side.
 */
export const JWT_SECRET_FIND_EVENT_GUESTS =
	'your_find_event_guests_n8n_wix_secret_manager_token';
export const JWT_SECRET_FIND_EVENT_GUEST_PHONE =
	'your_find_event_guest_phone_n8n_wix_secret_manager_token';
export const JWT_SECRET_UPDATE_CONTACT_PHONE =
	'your_update_contact_phone_n8n_wix_secret_manager_token';

/**
 * Validates the Authorization header and extracts the raw JWT (without "Bearer ").
 */
export function validateAuthorizationHeader(request, endpointName) {
	// Extract the 'Authorization' header from the incoming request
	const tokenHeader = request.headers['authorization'];

	// Check if the header is missing entirely
	if (!tokenHeader) {
		console.error(`❌ [${endpointName}]: Missing Authorization header.`);
		throw new Error('Missing token.');
	}

	// Ensure the header follows the expected "Bearer <token>" format
	if (!tokenHeader.startsWith('Bearer ')) {
		console.error(
			`❌ [${endpointName}]: Invalid Authorization header format (must start with "Bearer"). Received: `,
			tokenHeader
		);
		throw new Error('Invalid token format.');
	}

	// Remove the "Bearer " prefix and trim any extra spaces
	const actualToken = tokenHeader.replace('Bearer ', '').trim();
	// Check that the token is not an empty string after extraction
	if (!actualToken) {
		console.error(
			`❌ [${endpointName}]: Authorization token is empty after "Bearer".`
		);
		throw new Error('Authorization token is empty.');
	}

	console.log(
		`🌐 [${endpointName}]: Authorization token extracted successfully.`
	);
	return actualToken;
}

/**
 * Fetch the JWT secret from Wix Secrets Manager and verify the token.
 */
export async function decodeJwtToken(
	actualToken,
	secretManagerToken,
	endpointName
) {
	if (!actualToken) {
		console.error(`❌ [${endpointName}]: Missing token.`);
		return null;
	}

	try {
		/**
		 * Retrieve the expected secret key from Wix Secrets Manager
		 * https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value
		 */
		const elevatedGetSecretValue = elevate(secrets.getSecretValue);
		const JWT_SECRET_OBJECT = await elevatedGetSecretValue(secretManagerToken);
		// NOTE: Secrets are stored as a JSON object, so we access the 'value' property.
		const JWT_SECRET = JWT_SECRET_OBJECT.value;

		// Check if the secret was retrieved successfully.
		if (!JWT_SECRET) {
			console.error(`❌ [${endpointName}]: JWT secret not found.`);
			return null;
		}

		/**
		 * Verify the JWT
		 * The secret used here MUST be the same secret used to sign the JWT on the n8n side.
		 */
		const decoded = jwt.verify(actualToken, JWT_SECRET);
		/**
		 * Optional: You can add further checks on the decoded payload if needed.
		 * For example, if you expect a specific 'sub' (subject) or 'aud' (audience) claim.
		 */
		if (decoded.sub !== 'n8n') {
			console.error(`❌ [${endpointName}]: Invalid JWT subject.`);
			return null;
		}

		return decoded;
	} catch (error) {
		console.error(`❌ [${endpointName}]: JWT verification failed: `, error);
		return null;
	}
}
