// @todo add unique
// @todo validate this.images data maybe?
import $ from 'jquery';
import ANIM from 'devhki/util-animating';
import MUSTACHE from 'mustache';

let initCount = 0;

class ImageShow {

	constructor(settingsElement) {
		let $settingsElement = $(settingsElement);

		this.unique = ImageShow.MODULE_NAME + 'c' + initCount;
		this.linkClass = $settingsElement.data().imageShowLinkClass || ImageShow.MODULE_NAME + '__link';
		this.overlayClass = $settingsElement.data().imageShowOverlayClass || ImageShow.MODULE_NAME + '__overlay';
		this.$overlay = null;
		this.liveImages = [];
		this.imageTemplateClass = $settingsElement.data().imageTemplateClass || ImageShow.MODULE_NAME + '__image-template';

		this.images = $settingsElement.data().imageShow;
		if (!(this.images instanceof Array) || !this.images.length) {
			console.warn('ImageShow: data-image-show=<json> not set, dying silently...');
			return false;
		}

		let $imageTemplate = $('script[type="text/x-template"].' + this.imageTemplateClass).first();
		if (!$imageTemplate.length) {
			console.warn('ImageShow: Mustache image-template needed, dying silently...');
			return false;
		}
		this.imageTemplate = $imageTemplate.html();



		console.log($settingsElement.data().imageShow);
		console.log(this.linkClass);

		this._init();

		initCount++;
	}

	// Public methods

	show(ref) {
		let image = this._findImage(ref);

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
	}

	hide() {
		this._hideImages();
		this._hideOverlay();
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
		let rendered = MUSTACHE.to_html( this.imageTemplate, {image:[image]} );
		let $image = $(rendered);

		this.liveImages.push($image);

		$image
			.css('opacity', 0)
			.appendTo('body');

		$image.find('.' + ImageShow.MODULE_NAME + '__close').one('click.' + this.unique, () => {
			this.hide();
			return false;
		});

		ANIM.transition($image, {}, {
			opacity: 1
		}).then(() => {
			$image.css('opacity', '');
		});
	}

	_hideImages() {
		this.liveImages.map(($image) => {
			$image.remove();
		});
	}

	_loadImage(url) {
		return new Promise((resolve, reject) => {
			let loader = new Image();
			loader.onload = () => {
				resolve(loader);
			}
			loader.onerror = () => {
				reject('Couldn\'t load the image');
			}
			loader.src = url;
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
