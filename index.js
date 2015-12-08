// @todo add unique
import $ from 'jquery';

class ImageShow {

	constructor(link) {

	}

	// Public methods

	destroy() {
		this.$link.off('.' + ImageShow.MODULE_NAME);
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
