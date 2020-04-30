export class Foldable {
	
	position = null;
	elem = null;
	foldButton = this._createFoldButton();
	overflowTimeout = undefined;
	isFolded = false;

	constructor(private selector, private positionval){
		this.position = positionval;
		this.elem = selector;
	}
	
	public addFoldable(){	
		this._addFoldButton();
		this._bindEvents();
	}
	
	public _createFoldButton() {
		var foldButton = document.createElement('button');
		foldButton.setAttribute('class', 'tt-foldable__button -' + this.position);
		foldButton.setAttribute('style', 'margin-top: 5px;');
		return foldButton;
	}

	public _addFoldButton() {
		this.elem.classList.add('tt-foldable');
		this.elem.appendChild(this.foldButton);
	};

	public _bindEvents() {
		this.foldButton.addEventListener('click', this._toggleFold.bind(this));
	};

	public _toggleFold() {
		this.elem.classList.toggle('-folded');

		if (!this.isFolded) {
			this.elem.classList.add('-open');
		}

		window.clearTimeout(this.overflowTimeout);

		if (this.isFolded) {
			this.overflowTimeout = window.setTimeout(function() {
				this.elem.classList.remove('-open');
			}.bind(this), 200);
		}

		this.isFolded = !this.isFolded;
	};
}
