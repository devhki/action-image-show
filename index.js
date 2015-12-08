// @todo add unique
// @todo validate this.images data maybe?
import $ from 'jquery';
import ANIM from 'devhki/util-animating';
import MUSTACHE from 'mustache';

let initCount = 0;

class ImageShow {

	constructor(settingsElement) {
		let $settingsElement = $(settingsElement);

		this.showing = false;
		this.descriptionShowing = true;
		this.unique = ImageShow.MODULE_NAME + 'c' + initCount;
		this.linkClass = $settingsElement.data().imageShowLinkClass || ImageShow.MODULE_NAME + '__link';
		this.overlayClass = $settingsElement.data().imageShowOverlayClass || 'overlay';
		this.descriptionShowingClass = $settingsElement.data().imageShowDescriptionShowingClass || 'description-visible';
		this.$overlay = null;
		this.currentImage = null;
		this.liveImages = [];
		this.imageTemplateClass = $settingsElement.data().imageTemplateClass || ImageShow.MODULE_NAME + '__image-template';
		this.loadAnimationTemplateClass = $settingsElement.data().loadAnimationTemplate || ImageShow.MODULE_NAME + '__load-animation-template';

		this.images = $settingsElement.data().imageShow;
		if (!(this.images instanceof Array) || !this.images.length) {
			console.warn('ImageShow: data-image-show=<json> not set, dying silently...');
			return false;
		}

		// Template for image
		let $imageTemplate = $('script[type="text/x-template"].' + this.imageTemplateClass).first();
		if (!$imageTemplate.length) {
			console.warn('ImageShow: Mustache image-template needed, dying silently...');
			return false;
		}
		this.imageTemplate = $imageTemplate.html();


		// Template for load animation
		let $loadAnimationTemplate = $('script[type="text/x-template"].' + this.loadAnimationTemplateClass).first();
		if (!$loadAnimationTemplate.length) {
			this.loadAnimationTemplate = '';
		} else {
			this.loadAnimationTemplate = $loadAnimationTemplate.html();
		}

		this._init();

		initCount++;
	}

	// Public methods

	show(ref) {
		let image = this._findImage(ref);
		this.showing = true;

		if (!image.urls || !image.urls.view) {
			console.warn('ImageShow: Image "' + image.ref + '" is missing view url (image.urls.view), not gonna do anything...');
			return false;
		}

		this._showOverlay();
		this._loadImage(image.urls.view).then(() => {
			this._showImage(image);
		}, (reason) => {
			console.warn('ImageShow:', reason);
		});

		this.liveImages.map(($image) => {
			$image.find('.' + ImageShow.MODULE_NAME + '__load-animation-container').html( this.loadAnimationTemplate );
		});

	}

	hide() {
		this.showing = false;
		this._hideImages();
		this._hideOverlay();
	}

	next() {
		if ( !this.currentImage ) {
			return false;
		}

		this.show( this._findNextImage().ref );
	}

	previous() {
		if ( !this.currentImage ) {
			return false;
		}

		this.show( this._findPreviousImage().ref );
	}

	// Private methods

	_init() {
		let self = this;
		let $links = $('.' + this.linkClass);
		if (!$links.length) {
			console.warn('ImageShow: no links found, dying silently...');
			return false;
		}

		$links.on('click.' + this.unique, function() {
			let $link = $(this);
			let ref = $link.data().imageShowRef;

			if (!ref) {
				return false;
			}

			self.descriptionShowing = true;
			self.show(ref);

			return false;
		});

	}

	_findImage(ref) {
		return this.images.filter((item) => {
			if (item.ref == ref) {
				return true;
			}
			return false;
		})[0];
	}

	_findNextImage() {
		let last = null;
		let target = null;

		if ( !this.currentImage ) {
			return false;
		}

		for ( let i = 0; i < this.images.length; i++ ) {
			if (last && last.ref == this.currentImage.ref) {
				return this.images[i];
			}
			last = this.images[i];
		}

		return this.images[0];
	}

	_findPreviousImage() {
		let last = null;

		if ( !this.currentImage ) {
			return false;
		}

		for ( let i = 0; i < this.images.length; i++ ) {
			if ( last && this.images[i].ref == this.currentImage.ref ) {
				return last;
			}
			last = this.images[i];
		}

		return this.images[this.images.length - 1];
	}


	_showOverlay() {
		if (this.$overlay) {
			return false; // Overlay already exists
		}

		this.$overlay = $('<div/>');
		this.$overlay
			.addClass(this.overlayClass)
			.css('opacity', 0)
			.appendTo('body');

		this.$overlay.one('click.' + this.unique, () => {
			this.hide();
		});

		ANIM.transition(this.$overlay, {}, {
			opacity: 1
		});

	}

	_hideOverlay() {
		if (!this.$overlay) {
			return false;
		}

		ANIM.transition(this.$overlay, {}, {
			opacity: 0
		}).then(() => {
			this.$overlay.remove();
			this.$overlay = null;
		});

	}

	_showImage(image) {
		if ( !this.showing ) {
			return false;
		}

		let rendered = MUSTACHE.to_html( this.imageTemplate, {image:[image]} );
		let $image = $(rendered);
		let animate = !this.liveImages.length;
		let clicked = false;

		this._hideImages();

		this.currentImage = image;
		this.liveImages.push($image);

		$image.appendTo('body');

		$image.find('.' + ImageShow.MODULE_NAME + '__close').on('click.' + this.unique, () => {
			clicked = true;
			this.hide();
			return false;
		});

		$image.find('.' + ImageShow.MODULE_NAME + '__previous').on('click.' + this.unique, () => {
			if ( clicked ) {
				return false;
			}
			clicked = true;
			this.previous();
			return false;
		});

		$image.find('.' + ImageShow.MODULE_NAME + '__next').on('click.' + this.unique, () => {
			if ( clicked ) {
				return false;
			}
			clicked = true;
			this.next();
			return false;
		});

		$image.find('.' + ImageShow.MODULE_NAME + '__toggle-description').on('click.' + this.unique, () => {
			this.descriptionShowing = !this.descriptionShowing;
			this._updateDescriptionVisibility();
			return false;
		});

		if ( animate ) {
			ANIM.transition($image, {
				opacity : 0
			}, {
				opacity: 1
			}).then(() => {
				$image.css('opacity', '');
				this._updateDescriptionVisibility();
			});
		} else {
			this._updateDescriptionVisibility();
		}
	}

	_hideImages() {
		this.liveImages.map(($image) => {
			$image.remove();
		});
		while(this.liveImages.length) {
			this.liveImages.pop();
		}
		this.liveImages = [];
		this.currentImage = null;
	}

	_loadImage(url) {
		return new Promise((resolve, reject) => {
			let loader = new Image();
			loader.onload = () => {
				setTimeout(() => {
					resolve(loader);
				}, Math.random() * 1000 + 1000)
			}
			loader.onerror = () => {
				reject('Couldn\'t load the image');
			}
			loader.src = url;
		});
	}

	_updateDescriptionVisibility() {
		this.liveImages.map(($image) => {
			if (this.descriptionShowing) {
				$image.addClass(this.descriptionShowingClass);
			} else {
				$image.removeClass(this.descriptionShowingClass);
			}
		});
	}

}

ImageShow.MODULE_NAME = 'a-image-show';

export default ImageShow;

export function autoInit() {
	let instances = [];

	$('.' + ImageShow.MODULE_NAME).each((i, item) => {
		instances.push(new ImageShow(item));
	});

	return instances;
};
