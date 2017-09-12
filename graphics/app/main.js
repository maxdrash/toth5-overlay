(function () {
	'use strict';

	nodecg.Replicant('mainShowing', {defaultValue: true}).on('change', newVal => {
		if (newVal) {
			TweenLite.to(document.body, 0.6, {
				opacity: 1,
				ease: Power1.easeInOut
			});
		} else {
			TweenLite.to(document.body, 0.6, {
				opacity: 0,
				ease: Power1.easeInOut
			});
		}
	});

	nodecg.Replicant('showHashtag').on('change', newVal => {
		const sponsors = document.getElementById('sponsors');
		if (sponsors && sponsors.showing) {
			// Do nothing if the sponsors graphic is showing.
			return;
		}

		const hashtag = document.getElementById('hashtag');
		if (newVal) {
			TweenLite.to(hashtag, 0.6, {
				opacity: 0.5,
				ease: Power1.easeInOut
			});
		} else {
			TweenLite.to(hashtag, 0.6, {
				opacity: 0,
				ease: Power1.easeInOut
			});
		}
	});

	nodecg.listenFor('donation', data => {
		const event = new CustomEvent('donation', {detail: data});
		window.dispatchEvent(event);
	});

	// Used by the tier1, tier2, and tier3 notifications.
	window.notificationTl = new TimelineLite({autoRemoveChildren: true});
})();
