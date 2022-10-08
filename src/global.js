window.t= function translate(app, text, vars, count, options) {
  return text;
};
window.OC={
//webroots:"/",
isUserAdmin: function isUserAdmin() {return false},
L10N: {
	translate: t,
  translatePlural: t,
},
config: {
	modRewriteWorking: false,
  version: '24.0.4.1',
},
coreApps: ['calendar'],
registerXHRForErrorProcessing : function xhrerror ( xhr ) {
	const loadCallback = () => {
		if (xhr.readyState !== 4) {
			return
		}

		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
			return
		}

		// fire jquery global ajax error handler
		console.log('ajaxError')
		console.log(xhr)
	}

	const errorCallback = () => {
		// fire jquery global ajax error handler
		console.log('ajaxError')
		console.log(xhr)
	}

	if (xhr.addEventListener) {
		xhr.addEventListener('load', loadCallback)
		xhr.addEventListener('error', errorCallback)
	}

},
}
