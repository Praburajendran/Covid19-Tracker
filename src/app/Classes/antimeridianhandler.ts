export class Antimeridianhandler {

	/**
	 * Normalize a bounding box.
	 * @param {LngLatBounds} lngLatBounds
	 * @return {LngLatBounds}
	 */
	normalizeBoundingBox(lngLatBounds, tt) {
		var south = lngLatBounds.getSouth(),
			west = lngLatBounds.getWest(),
			north = lngLatBounds.getNorth(),
			east = west + this._difference(lngLatBounds.getEast(), west);

		return new tt.LngLatBounds([
			[ west, south ],
			[ east, north ]
		]);
	};

	/**
	 * Difference (angular) between two angles.
	 * @param {number} a
	 * @param {number} b
	 * @return {number}
	 */
	_difference(a, b) {
		return 180 - Math.abs(Math.abs(a - b) - 180);
	};
}
