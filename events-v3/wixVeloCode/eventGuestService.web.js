import { elevate } from 'wix-auth';
import { guests } from 'wix-events.v2';
import { contacts } from 'wix-crm.v2';

const SERVICE_FIND_EVENT_GUESTS = 'findEventGuests';
const SERVICE_FIND_EVENT_GUEST_PHONE = 'findEventGuestPhone';
const SERVICE_UPDATE_CONTACT_PHONE = 'updateContactPhone';

export async function findEventGuests(lastCheckTimestamp, eventId, options) {
	if (!eventId) throw new Error('Missing eventId');

	try {
		console.log(
			`⚙️ [${SERVICE_FIND_EVENT_GUESTS}]: Querying guests for eventId: `,
			eventId
		);

		/**
		 * https://dev.wix.com/docs/velo/apis/wix-events-v2/guests/query-guests
		 */
		const elevatedQueryGuests = elevate(guests.queryGuests);
		let query = elevatedQueryGuests(options).eq('eventId', eventId);

		if (lastCheckTimestamp) {
			const normalizedTimestamp = new Date(lastCheckTimestamp).toISOString(); // UTC format
			query = query.gt('attendanceStatusUpdatedDate', normalizedTimestamp); // 'gt' means "greater than"
			query = query.ascending('attendanceStatusUpdatedDate');
		}

		const results = await query.find();
		const newGuests = results.items || [];

		return {
			message:
				newGuests.length > 0
					? `✅ Found ${newGuests.length} new guests.`
					: '⛔ No new guest found.',
			guests: newGuests.length > 0 ? newGuests : [],
		};
	} catch (error) {
		console.error(
			`❌ [${SERVICE_FIND_EVENT_GUESTS}]: Error querying guests from Wix Events:`,
			error
		);
		throw new Error(
			'Failed to retrieve guests from Wix Events: ' +
				(error?.message || String(error))
		);
	}
}

export async function findEventGuestPhone(userId) {
	if (!userId) throw new Error('Missing userId');

	try {
		console.log(
			`⚙️ [${SERVICE_FIND_EVENT_GUEST_PHONE}]: Querying contact for userId:`,
			userId
		);

		/**
		 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/get-contact
		 */
		const elevatedGetContact = elevate(contacts.getContact);
		const contact = await elevatedGetContact(userId);

		if (!contact) {
			throw new Error('Contact not found.');
		}

		const phone = contact.primaryInfo?.phone || '';
		const hasPhone = typeof phone === 'string' && phone.trim() !== '';

		return {
			message: hasPhone
				? '✅ Phone number found for the contact.'
				: '⛔ No phone number found for the contact.',
			phone: hasPhone ? phone : '',
		};
	} catch (error) {
		console.error(
			`❌ [${SERVICE_FIND_EVENT_GUEST_PHONE}]: Error retrieving contact:`,
			error
		);
		throw new Error(
			'Failed to retrieve contact: ' + (error?.message || String(error))
		);
	}
}

export async function updateContactPhone(contactEmail, contactPhone) {
	if (
		!contactEmail ||
		typeof contactEmail !== 'string' ||
		contactEmail.trim() === ''
	) {
		throw new Error('Invalid contactEmail provided.');
	}

	/**
	 * https://dev.wix.com/docs/velo/apis/wix-crm-backend/contacts/query-contacts
	 */
	const elevatedQueryContacts = elevate(contacts.queryContacts);
	const queryResults = await elevatedQueryContacts()
		.eq('primaryInfo.email', contactEmail)
		.find();

	const contactsWithEmail = queryResults.items || [];

	// Ensure exactly one matching contact
	if (contactsWithEmail.length === 1) {
		console.log(`⚙️ [${SERVICE_UPDATE_CONTACT_PHONE}]: Found 1 contact`);
	} else if (contactsWithEmail.length > 1) {
		console.log(
			`⚙️ [${SERVICE_UPDATE_CONTACT_PHONE}]: Found more than 1 contact`
		);
		throw new Error('Found more than one contact with the same email address.');
	} else {
		console.log(`⚙️ [${SERVICE_UPDATE_CONTACT_PHONE}]: No contacts found`);
		throw new Error('No contact found for the provided email address.');
	}

	const contact = contactsWithEmail[0];
	const contactId = contact._id;
	const revision = contact.revision;

	try {
		const phoneToAdd = {
			phones: {
				items: [
					{
						countryCode: 'HU',
						phone: contactPhone,
						primary: true,
					},
				],
			},
		};

		/**
		 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/update-contact
		 */
		const elevatedUpdateContact = elevate(contacts.updateContact);
		const updatedContact = await elevatedUpdateContact(
			contactId,
			phoneToAdd,
			revision
		);

		console.log(
			`⚙️ [${SERVICE_UPDATE_CONTACT_PHONE}]: Updated contact:`,
			updatedContact
		);

		return {
			message: `✅ Phone number updated successfully for ${contactEmail}.`,
		};
	} catch (error) {
		console.error(
			`❌ [${SERVICE_UPDATE_CONTACT_PHONE}]: Error updating contact phone:`,
			error
		);
		throw new Error(
			'Failed to update contact phone: ' + (error?.message || String(error))
		);
	}
}
