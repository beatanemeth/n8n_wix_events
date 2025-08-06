/**
 * Within Wix there is an automation with the Run Velo Code action, and this code is placed there.
 * This code checks if a contact has a phone number, and if not, sends them an email.
 * If the contact has a phone number, it inserts their details into a CMS collection.
 * https://support.wix.com/en/article/wix-automations-using-custom-code-in-an-automation
 */
import wixData from 'wix-data';
import { triggeredEmails } from 'wix-crm';
import { findWaitlistContactById } from 'backend/runVeloCodeBackend.web';

/**
 * Autocomplete function declaration, do not delete
 * @param {import('./__schema__.js').Payload} options
 */

/**
 * https://dev.wix.com/docs/velo/events-service-plugins/automations/service-plugins/automations-actions/invoke
 */
export const invoke = async ({ payload }) => {
	try {
		// Log the received payload for debugging purposes.
		console.log('🔁 [Automation]: Payload:', payload);

		// Validate if 'contactId' is present in the payload.
		if (!payload.contactId) {
			console.error(
				'❌ [Automation]: Missing contactId in payload. Cannot process contact.'
			);
			return {};
		}

		// Attempt to find the contact using the contactId from the payload.
		const contactData = await findWaitlistContactById(payload.contactId);

		if (!contactData) {
			console.log('🔁 [Automation]: Contact not found');
			return;
		}

		console.log(
			'🔁 [Automation]: Contact data successfully retrieved: ',
			contactData
		);

		// Extract the primary phone number from the contact data.
		const phone = contactData.primaryInfo?.phone;
		// Check if the phone number exists and is a non-empty string after trimming whitespace.
		const hasPhone = typeof phone === 'string' && phone.trim() !== '';

		console.log(
			'🔁 [Automation]: Contact has phone: ',
			hasPhone ? phone : 'No phone for the contact.'
		);

		const options = {
			variables: {
				subscriberName: payload.guest_firstName,
			},
		};

		// If the contact does not have a phone number, proceed to send an email.
		if (!hasPhone) {
			console.log('🔁 [Automation]: Contact has no phone. Emailing contact.');
			/**
			 * Create a Triggered Email in Wix
			 * 1. Go to Wix Dashboard > Developer Tools > Triggered Emails.
			 * 2. Create a New Triggered Email: https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/triggered-emails/set-up-a-triggered-email
			 */

			/**
			 * Send a triggered email to a contact
			 * https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/triggered-emails/sending-a-triggered-email-to-contacts
			 */
			await triggeredEmails.emailContact(
				'waitlist_phone_number',
				payload.contactId,
				options
			);
		} else {
			console.log('🔁 [Automation]: Contact has phone. No email sent.');

			/**
			 * Create a CMS Collection
			 * 1. Go to Wix Dashboard > Website Content > CMS.
			 * 2. Create a new collection, e.g. ContactsWithPhone.
			 * 3. Set the collection to allow "Anyone" to add data.
			 * 4. Add fields:
			 *  - Add the following fields:
			 *  - contactId (Text)
			 *  - email (Text)
			 *  - phone (Text)
			 *  - timestamp (Date and Time)
			 *  - Optionally: firstName (Text), lastName (Text)
			 * 5. Make sure permissions allow "Anyone" to add data via backend code.
			 */

			// Build the data object to insert phone.
			const contactWithPhone = {
				contactId: payload.contactId,
				email: payload.guest_email,
				phone: phone.trim(),
				firstName: payload.guest_firstName,
				lastName: payload.guest_lastName,
				timestamp: new Date(),
			};

			try {
				/**
				 * Add contact with phone to the CMS collection.				 *
				 * https://dev.wix.com/docs/velo/apis/wix-data/insert
				 */
				await wixData.insert('ContactsWithPhone', contactWithPhone);
				console.log(
					'🔁 [Automation]: Contact with phone inserted into CMS:',
					contactWithPhone
				);
			} catch (error) {
				console.error(
					'❌ [Automation]: Failed to insert contact into CMS:',
					error
				);
			}
		}
	} catch (error) {
		console.error('❌ [Automation]: Could not get contact details:', error);
	}

	return {}; // The function must return an empty object, do not delete
};
