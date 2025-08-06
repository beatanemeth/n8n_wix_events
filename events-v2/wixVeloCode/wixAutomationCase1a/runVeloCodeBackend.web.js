/**
 * Backend '.web.js' files contain functions that run on the server side and can be called from page code.
 * Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend
 */
import { Permissions, webMethod } from 'wix-web-module';
import { contacts } from 'wix-crm.v2';
import { elevate } from 'wix-auth';

/**
 * https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/get-contact
 */

export const findWaitlistContactById = webMethod(
	Permissions.Anyone,

	async (id) => {
		try {
			console.log('🛠️ [findWaitlistContactById]: User ID: ', id);
			const elevatedGetContact = elevate(contacts.getContact);
			const contact = await elevatedGetContact(id);

			console.log(
				'🛠️ [findWaitlistContactById]: Successfully retrieved contact:',
				contact.primaryInfo.email
			);

			return contact;
		} catch (error) {
			console.error(
				`❌ [findWaitlistContactById]: Could not get contact by ID (${id}):`,
				error
			);
			throw error;
		}
	}
);
