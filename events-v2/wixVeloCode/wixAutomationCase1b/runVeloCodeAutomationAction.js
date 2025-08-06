import {
	findContactById,
	findLabel,
	labelWaitlistContact,
} from 'backend/waitlistContactNeedsPhone.web';

/**
 * Autocomplete function declaration, do not delete
 * @param {import('./__schema__.js').Payload} options
 */
export const invoke = async ({ payload }) => {
	// Define the label to be added to contacts without a phone number.
	const addLabeToContact = 'Needs Phone';

	try {
		// Log the received payload for debugging purposes.
		console.log('🔁 [Automation]:Automation Payload:', payload);

		// Validate if 'contactId' and 'email' are present in the payload.
		if (!payload.contact.contactId || !payload.guest_email) {
			console.error(
				'❌ [Automation]: Missing contactId or email in payload. Cannot process contact.'
			);
			return {};
		}

		// Attempt to find the contact using the contactId from the payload.
		const contactData = await findContactById(payload.contact.contactId);

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

		// If the contact does not have a phone number, proceed to assign the label.
		if (!hasPhone) {
			// Attempt to find or create the specified label.
			const labelResult = await findLabel(addLabeToContact);

			console.log(
				`🔁 [Automation]: Label key for (${addLabeToContact}) :`,
				labelResult
			);

			// If the label key cannot be found or created, log an error and exit.
			if (!labelResult || !labelResult.label || !labelResult.label.key) {
				console.error(
					`❌ [Automation]: Could not find or create label key for "${addLabeToContact}".`
				);
				return {};
			}

			// Extract the actual label key
			const labelKeys = [labelResult.label.key];
			console.log(
				`🔁 [Automation]: Label key for ("${addLabeToContact}"):`,
				labelKeys
			);

			// Assign the label to the contact.
			await labelWaitlistContact(payload.contactId, labelKeys);

			console.log(
				`🔁 [Automation]: Label '(${addLabeToContact})' assigned due to missing phone, to contact with email: (${payload.guest_email})`
			);
		} else {
			console.log('🔁 [Automation]: Contact has phone, label not assigned.');
		}
	} catch (error) {
		console.error('❌ [Automation]: Could not get contact details:', error);
	}
	return {}; // The function must return an empty object, do not delete
};
