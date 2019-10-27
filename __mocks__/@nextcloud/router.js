export function linkTo(app, file) {
	return [
		'linkTo',
		app,
		file
	].join('###')
}

export function imagePath(app, file) {
	return [
		'imagePath',
		app,
		file
	].join('###')
}
