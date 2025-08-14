/**
 * This array represents the expected response structure from 'await guests.queryGuests(options).find()'.
 * All data within this array is mock data for illustrative purposes.
 * For official API documentation, refer to: https://dev.wix.com/docs/velo/apis/wix-events-v2/guests/query-guests
 */
[
	{
		message: '✅ Found 2 new guests.',
		guests: [
			// Guest registered via the Wix Event Registration Form.
			{
				eventId: 'fc745887-b95c-886v-a809-2569978fa8eb',
				rsvpId: 'abcd1234-efgh-5678-ijkl-90mnopotuvwx',
				tickets: [],
				contactId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
				guestDetails: {
					email: 'merry.w@thimbletree.net',
					firstName: 'Merry',
					lastName: 'Wagtail',
					formResponse: {
						inputValues: [
							{
								inputName: 'firstName', // First Name (required)
								value: 'Merry',
								values: [],
							},
							{
								inputName: 'lastName', // Last Name (required)
								value: 'Wagtail',
								values: [],
							},
							{
								inputName: 'email', // Email (required)
								value: 'merry.w@thimbletree.net',
								values: [],
							},
							{
								inputName: 'phone', // Phone (required)
								value: '+36301234567',
								values: [],
							},
							{
								inputName: 'address', // Address (required)
								value: '',
								values: ['1118, Budapest Teddy Street 18/a'],
							},
							{
								inputName: 'custom', // Have you already attended any of our previous events? (required)
								value: '',
								values: ['No'],
							},
							{
								inputName: 'custom-047574d4407de082', // Please indicate which participation fee we could expect from you. (required)
								value: '',
								values: ['3rd category'],
							},
							{
								inputName: 'custom-04a087594988838c', // How did you hear about the program? (optional)
								value: '',
								values: [''],
							},
							{
								inputName: 'custom-04a087594989938c', // Consent to photos and videos being used in promotion. (required)
								value: '',
								values: ['No'],
							},
							{
								inputName: 'custom-12ec7e905da0c3b0', // Consent to Data Protection Notice. (required)
								value: '',
								values: ['Yes'],
							},
						],
					},
					checkedIn: false,
					phone: '+36301234567',
				},
				attendanceStatus: 'ATTENDING',
				attendanceStatusUpdatedDate: '2025-07-07T08:34:30.991Z',
				guestType: 'RSVP',
				totalGuests: 1,
				revision: '2',
				_id: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
				_createdDate: '2025-07-07T08:34:31.169Z',
				_updatedDate: '2025-07-07T08:34:32.080Z',
			},
			// Guest registered via the Wix Event Waitlist Form.
			{
				eventId: 'fc745887-b95c-886v-a809-2569978fa8eb',
				rsvpId: '5a4b3c2d-1e0f-9876-5432-10fedcba9876',
				tickets: [],
				contactId: '0fedcba9-8765-4321-fedc-ba9876543210',
				guestDetails: {
					email: 'rosie.crumb@teacakevillage.com',
					firstName: 'Rosie',
					lastName: 'Crumbbutton',
					formResponse: {
						inputValues: [
							{
								inputName: 'firstName', // First Name (required)
								value: 'Rosie',
								values: [],
							},
							{
								inputName: 'lastName', // Last Name (required)
								value: 'Crumbbutton',
								values: [],
							},
							{
								inputName: 'email', // Email (required)
								value: 'rosie.crumb@teacakevillage.com',
								values: [],
							},
						],
					},
					checkedIn: false,
				},
				attendanceStatus: 'IN_WAITLIST',
				attendanceStatusUpdatedDate: '2025-07-07T10:17:37.126Z',
				guestType: 'RSVP',
				totalGuests: 1,
				revision: '2',
				_id: 'qrst7890-uvwx-1234-yzab-cdefg5678901',
				_createdDate: '2025-07-07T10:17:37.553Z',
				_updatedDate: '2025-07-07T10:17:38.595Z',
			},
		],
	},
];
