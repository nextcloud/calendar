import { createAppConfig } from '@nextcloud/vite-config'
import path from 'path'

export default createAppConfig(
	{
		'main': path.join(__dirname, 'src', 'main.js'),
		'reference': path.join(__dirname, 'src', 'reference.js'),
		'appointments-booking': path.join(__dirname, 'src', 'appointments/main-booking.js'),
		'appointments-confirmation': path.join(__dirname, 'src', 'appointments/main-confirmation.js'),
		'appointments-conflict': path.join(__dirname, 'src', 'appointments/main-conflict.js'),
		'appointments-overview': path.join(__dirname, 'src', 'appointments/main-overview.js'),
	},
	{
		inlineCss: false,
		thirdPartyLicense: false,
		extractLicenseInformation: true,
	},
)

