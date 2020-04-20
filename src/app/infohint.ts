export class Infohint {

	type = null;
	position = null;
	duration = null;
	elem = this._createElement();
	timeout = null;

	constructor(private typeval, private positionval, private durationval){
		this.type = typeval;
		this.position = positionval;
		this.duration = durationval;
	}
	
	public addTo(container) {
		container.appendChild(this.elem);
		return this;
	};

	public isHidden () {
		return this.elem.classList.contains('-hidden');
	};

	public hide() {
		this.elem.classList.add('-hidden');
	};

	public show() {
		this.elem.classList.remove('-hidden');
	};

	public setErrorMessage(error) {
		this.elem.innerText = error.message || error.data.error.description;
		this._createMessage();
	};

	public setMessage(message) {
		this.elem.innerText = message;
		this._createMessage();
	};

	public _createElement() {
		var elem = document.createElement('div');
		elem.setAttribute('class', this._getClassList());

		return elem;
	};

	public _createMessage() {
		this.show();

		if (!this.duration) {
			return;
		}

		if (this.timeout) {
			window.clearTimeout(this.timeout);
		}

		if (this.duration) {
			this.timeout = window.setTimeout(this.hide.bind(this), this.duration);
		}
	};

	public _getClassList () {
		var classes = [
			'tt-info-hint',
			'-hidden',
			'-' + this.position,
			'-' + this.type
		];

		return classes.join(' ');
	};
}
