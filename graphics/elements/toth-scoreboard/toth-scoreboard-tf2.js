(function () {
	'use strict';

	const scoreboardShowing = nodecg.Replicant('scoreboardShowing');
	const scoreboardVerticalOffset = nodecg.Replicant('scoreboardVerticalOffset');
	const scores = nodecg.Replicant('scores');

	/**
	 * @customElement
	 * @polymer
	 */
	class TothScoreboardTF2 extends Polymer.Element {
		static get is() {
			return 'toth-scoreboard-tf2';
		}

		static get properties() {
			return {
				importPath: String, // https://github.com/Polymer/polymer-linter/issues/71
				redScore: {
					type: Number,
					value: 0,
					observer: 'redScoreChanged'
				},
				bluScore: {
					type: Number,
					value: 0,
					observer: 'bluScoreChanged'
				},
				redTag: {
					type: String,
					value: 'RED',
					observer: 'redTagChanged'
				},
				bluTag: {
					type: String,
					value: 'BLU',
					observer: 'bluTagChanged'
				},
				muted: {
					type: Boolean,
					reflectToAttribute: true
				},
				_initialized: {
					type: Boolean,
					value: false
				},
				_showing: {
					type: Boolean,
					value: false
				}
			};
		}

		redScoreChanged(newVal) {
			this.changeScore(this.shadowRoot.querySelector('div[team="red"] .score'), newVal);
		}

		bluScoreChanged(newVal) {
			this.changeScore(this.shadowRoot.querySelector('div[team="blu"] .score'), newVal);
		}

		redTagChanged(newVal) {
			this.changeTag(this.shadowRoot.querySelector('div[team="red"] .tag'), newVal);
		}

		bluTagChanged(newVal) {
			this.changeTag(this.shadowRoot.querySelector('div[team="blu"] .tag'), newVal);
		}

		ready() {
			super.ready();
			TweenLite.set(this.$.logo, {
				scale: '0',
				y: '21px',
				x: '-50%'
			});

			Polymer.RenderStatus.beforeNextRender(this, () => {
				scores.on('change', newVal => {
					this.redScore = newVal.red.score;
					this.bluScore = newVal.blu.score;
					this.redTag = newVal.red.tag;
					this.bluTag = newVal.blu.tag;
				});

				scoreboardShowing.on('change', newVal => {
					if (newVal) {
						this.show();
					} else {
						this.hide();
					}
				});

				scoreboardVerticalOffset.on('change', newVal => {
					this.style.top = `${newVal}px`;
				});
			});
		}

		show() {
			if (this._showing) {
				return;
			}

			this._showing = true;

			const lines = Array.from(this.shadowRoot.querySelectorAll('.line'));
			const tagWrappers = Array.from(this.shadowRoot.querySelectorAll('.tagWrapper'));
			const scores = Array.from(this.shadowRoot.querySelectorAll('.score'));
			const logo = this.$.logo;
			const tl = new TimelineLite();

			if (!this.muted) {
				nodecg.playSound('scoreboard_in');
			}

			tl.set(logo, {
				scale: '0',
				y: '21px'
			});
			tl.add('start');
			tl.to(logo, 0.6, {
				scale: '1',
				ease: Back.easeOut
			}, 'start');
			tl.to(lines, 0.8, {
				width: '100%',
				ease: Power3.easeInOut,
				callbackScope: this,
				onUpdate() {
					const currLineWidth = lines[0].offsetWidth;

					if (!this.tagsShowing && currLineWidth >= tagWrappers[0].offsetWidth) {
						this.tagsShowing = true;
						TweenLite.to(tagWrappers, 0.5, {
							y: '0%',
							visibility: 'visible',
							ease: Power3.easeOut
						});
						TweenLite.to(logo, 0.5, {
							y: '0%',
							ease: Power3.easeOut
						});
					}

					if (!this.scoresShowing && currLineWidth >= tagWrappers[0].offsetWidth + scores[0].offsetWidth) {
						this.scoresShowing = true;
						TweenLite.to(scores, 0.5, {
							y: '0%',
							ease: Power3.easeOut
						});
					}
				}
			}, 'start');
		}

		hide() {
			if (!this._showing) {
				return;
			}

			this._showing = false;

			const wrappers = Array.from(this.shadowRoot.querySelectorAll('.wrapper'));
			const tagWrappers = Array.from(this.shadowRoot.querySelectorAll('.tagWrapper'));
			const scores = Array.from(this.shadowRoot.querySelectorAll('.score'));
			const lines = Array.from(this.shadowRoot.querySelectorAll('.line'));
			const logo = this.$.logo;
			const tl = new TimelineLite();

			if (!this.muted) {
				nodecg.playSound('scoreboard_out');
			}

			tl.add('start');
			tl.to(wrappers[0], 0.5, {
				x: '100%',
				ease: Power3.easeIn
			}, 'start');
			tl.to(wrappers[1], 0.5, {
				x: '-100%',
				ease: Power3.easeIn
			}, 'start');
			tl.to(logo, 0.5, {
				scale: '0',
				ease: Back.easeIn
			}, 'start+=0.2');
			tl.set(tagWrappers, {clearProps: 'transform'});
			tl.set([wrappers, logo, scores, lines], {
				clearProps: 'all',
				callbackScope: this,
				onComplete() {
					this.scoresShowing = false;
					this.tagsShowing = false;
					TweenLite.set(tagWrappers, {visibility: 'hidden'});
				}
			});
			tl.set(this.$.logo, {
				scale: '0',
				y: '21px',
				x: '-50%'
			});
		}

		changeTag(tagEl, newValue) {
			tagEl.innerText = newValue;

			const bluTag = this.shadowRoot.querySelector('div[team="blu"] .tag');
			const redTag = this.shadowRoot.querySelector('div[team="red"] .tag');

			// Reset width of tag wrappers. We'll set it after the tags themselves are sorted
			const bluTagWrapper = bluTag.parentNode;
			const redTagWrapper = redTag.parentNode;
			bluTagWrapper.style.width = '';
			redTagWrapper.style.width = '';

			// If tag is wider than 200px, scale it down
			const maxWidth = 200;
			TweenLite.set(bluTag, {scaleX: 1});
			TweenLite.set(redTag, {scaleX: 1});

			Polymer.RenderStatus.beforeNextRender(this, () => {
				if (bluTag.scrollWidth > bluTag.offsetWidth) {
					TweenLite.set(bluTag, {scaleX: bluTag.offsetWidth / bluTag.scrollWidth});
				}

				if (redTag.scrollWidth > redTag.offsetWidth) {
					TweenLite.set(redTag, {scaleX: redTag.offsetWidth / redTag.scrollWidth});
				}

				// Make both tag wrappers the same width
				let width = Math.max(bluTag.offsetWidth, redTag.offsetWidth);
				if (width > maxWidth) {
					width = maxWidth;
				}
				bluTagWrapper.style.width = `${width}px`;
				redTagWrapper.style.width = `${width}px`;
			});
		}

		changeScore(scoreEl, newValue) {
			scoreEl.innerHTML = newValue;
		}
	}

	customElements.define(TothScoreboardTF2.is, TothScoreboardTF2);
})();
