// @todo add unique
// @todo validate this.images data maybe?
import $ from 'jquery';
import Animating from 'devhki/util-animating';

let initCount = 0;

class ImageShow {

	constructor(settingsElement) {
		let $settingsElement = $(settingsElement);

		this.unique = ImageShow.MODULE_NAME + 'c' + initCount;
		this.linkClass = $settingsElement.data().imageShowLinkClass || ImageShow.MODULE_NAME + '__link';
		this.images = $settingsElement.data().imageShow;
		this.$overlay = null;

		if ( !(this.images instanceof Array) || !this.images.length ) {
			console.warn('ImageShow: data-image-show=<json> not set, dying silently...');
			return false;
		}

		console.log($settingsElement.data().imageShow);
		console.log(this.linkClass);

		this._init();

		initCount++;
	}

	// Public methods

	show(ref) {
		let image = this._findImage(ref);

		if ( !image.urls || !image.urls.view ) {
			console.warn('ImageShow: Image "' + image.ref + '" is missing view url (image.urls.view), not gonna do anything...');
			return false;
		}

		this._showOverlay();
		this._loadImage(image.urls.view).then( () => {
			this._showImage(image);
		}, (reason) => {
			console.warn('ImageShow:', reason);
		});
	}

	hide() {
		this._hideOverlay();
	}

	// Private methods

	_init() {
		let self = this;
		let $links = $('.' + this.linkClass);
		if ( !$links.length ) {
			console.warn('ImageShow: no links found, dying silently...');
			return false;
		}

		$links.on('click.' + this.unique, function () {
			let $link = $(this);
			let ref = $link.data().imageShowRef;

			if ( !ref ) {
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
		if ( this.$overlay ) {
			return false; // Overlay already exists
		}

		this.$overlay = $('<div/>');
		this.$overlay
			.addClass('overlay')
			.css('opacity', 0)
			.appendTo('body');

		this.$overlay.one('click.' + this.unique, () => {
			this.hide();
		});

		Animating.transition(this.$overlay, {}, {
			opacity : 1
		});

	}

	_hideOverlay() {
		if ( !this.$overlay ) {
			return false;
		}

		this.$overlay.off('.' + this.unique);

		Animating.transition(this.$overlay, {}, {
			opacity : 0
		}).then(() => {
			this.$overlay.remove();
			this.$overlay = null;
		});

	}

	_showImage(image) {
		console.log('image loaded', image);
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
