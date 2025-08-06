/**
 * Backend '.web.js' files contain functions that run on the server side and can be called from page code.
 * Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend
 */
import { Permissions, webMethod } from 'wix-web-module';
import { contacts, labels } from 'wix-crm.v2';
import { elevate } from 'wix-auth';

/**
 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/get-contact
 */
export const findContactById = webMethod(
	Permissions.Anyone,

	async (id) => {
		try {
			console.log('🛠️ [findContactById]: User ID: ', id);
			const elevatedGetContact = elevate(contacts.getContact);
			const contact = await elevatedGetContact(id);

			return contact;
		} catch (error) {
			console.error(
				`❌ [findContactById]: Error getting contact by ID (${id}):`,
				error
			);
			throw error;
		}
	}
);

/**
 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/labels/find-or-create-label
 */
export const findLabel = webMethod(Permissions.Anyone, async (displayName) => {
	try {
		console.log('🛠️ [findLabelg: Label to add: ', displayName);
		const elevatedCreateLabel = elevate(labels.findOrCreateLabel);
		const label = await elevatedCreateLabel(displayName);

		console.log(
			'🛠️ [findLabel]: Successfully retrieved or created a label:',
			label
		);

		return label;
	} catch (error) {
		console.error('❌ [findLabel]: Could not find or create label: ', error);
		throw error;
	}
});

/**
 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/label-contact
 */
export const labelWaitlistContact = webMethod(
	Permissions.Anyone,

	async (contactId, labelKeys) => {
		try {
			console.log(
				`🛠️ [labelWaitlistContact]: User, with ID ${contactId} will get a lable ${labelKeys}`
			);
			// Ensure labelKeys is always an array
			const labels = Array.isArray(labelKeys) ? labelKeys : [labelKeys];
			const elevatedLabelContact = elevate(contacts.labelContact);
			const labeledContact = await elevatedLabelContact(contactId, labels);

			console.log(
				'🛠️ [labelWaitlistContact]: Successfully added label(s) to contact!'
			);

			return labeledContact;
		} catch (error) {
			console.error(
				`❌ [labelWaitlistContact]: Error labeling contact with ID (${contactId}):`,
				error
			);
			throw error;
		}
	}
);
