// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var units = require('../utils/constants').physicalUnits;

/**
 * @class pHYs
 * @module PNG
 * @submodule PNGChunks
 */
module.exports = {

	/**
	 * Gets the sequence
	 *
	 * @method getSequence
	 * @return {int}
	 */
	getSequence: function () {
		return 140;
	},


	/**
	 * Gets the horizontal number of pixel per unit
	 *
	 * @method getXPixelPerUnit
	 * @return {int}
	 */
	getXPixelPerUnit: function () {
		return this._xPPU || 1;
	},

	/**
	 * Sets the horizontal number of pixel per unit
	 *
	 * @method setXPixelPerUnit
	 * @param {int} ppu Pixel per unit
	 */
	setXPixelPerUnit: function (ppu) {
		this._xPPU = ppu;
	},


	/**
	 * Gets the vertical number of pixel per unit
	 *
	 * @method getYPixelPerUnit
	 * @return {int}
	 */
	getYPixelPerUnit: function () {
		return this._yPPU || 1;
	},

	/**
	 * Sets the vertical number of pixel per unit
	 *
	 * @method setYPixelPerUnit
	 * @param {int} ppu Pixel per unit
	 */
	setYPixelPerUnit: function (ppu) {
		this._yPPU = ppu;
	},


	/**
	 * Gets the unit identifier
	 *
	 * @method getUnit
	 * @return {int}
	 */
	getUnit: function () {
		return this._unit || 0;
	},

	/**
	 * Sets the unit identifier
	 *
	 * @method setUnit
	 * @param {int} unit Unit identifier
	 */
	setUnit: function (unit) {
		if ([units.UNKNOWN, units.METER].indexOf(unit) === -1) {
			throw new Error('Unit identifier ' + unit + ' is not valid.');
		}
		this._unit = unit;
	},


	/**
	 * Is unit unknown?
	 *
	 * @method isUnitUnknown
	 * @return {boolean}
	 */
	isUnitUnknown: function () {
		return (this._unit === units.UNKNOWN);
	},

	/**
	 * Is unit in meter?
	 *
	 * @method isUnitInMeter
	 * @return {boolean}
	 */
	isUnitInMeter: function () {
		return (this._unit === units.METER);
	},


	/**
	 * Parsing of chunk data
	 *
	 * Phase 1
	 *
	 * @method parse
	 * @param {BufferedStream} stream Data stream
	 * @param {int} length Length of chunk data
	 * @param {boolean} strict Should parsing be strict?
	 * @param {object} options Decoding options
	 */
	parse: function (stream, length, strict, options) {

		// Validation
		if (strict && (this.getFirstChunk(this.getType(), false) !== null)) {
			throw new Error('Only one ' + this.getType() + ' is allowed in the data.');
		}

		if ((strict && (length !== 9)) || (length < 9)) {
			throw new Error('The length of chunk ' + this.getType() + ' should be 9, but got ' + length + '.');
		}

		this.setXPixelPerUnit(stream.readUInt32BE());
		this.setYPixelPerUnit(stream.readUInt32BE());
		this.setUnit(stream.readUInt8());
	},

	/**
	 * Gathers chunk-data from decoded chunks
	 *
	 * Phase 5
	 *
	 * @static
	 * @method decodeData
	 * @param {object} data Data-object that will be used to export values
	 * @param {boolean} strict Should parsing be strict?
	 * @param {object} options Decoding options
	 */
	decodeData: function (data, strict, options) {

		var chunks = this.getChunksByType(this.getType());

		if (!chunks) {
			return ;
		}

		if (strict && (chunks.length !== 1)) {
			throw new Error('Not more than one chunk allowed for ' + this.getType() + '.');
		}

		data.physicalSize = {
			xPixelPerUnit: chunks[0].getXPixelPerUnit(),
			yPixelPerUnit: chunks[0].getYPixelPerUnit(),
			unit: chunks[0].getUnit()
		};
	},


	/**
	 * Returns a list of chunks to be added to the data-stream
	 *
	 * Phase 1
	 *
	 * @static
	 * @method encodeData
	 * @param {Buffer} image Image data
	 * @param {object} options Encoding options
	 * @return {Chunk[]} List of chunks to encode
	 */
	encodeData: function (image, options) {

		if (options.physicalSize) {

			var chunk = this.createChunk(this.getType(), this.getChunks());

			if (options.physicalSize.xPixelPerUnit !== undefined) {
				chunk.setXPixelPerUnit(options.physicalSize.xPixelPerUnit);
			}
			if (options.physicalSize.yPixelPerUnit !== undefined) {
				chunk.setYPixelPerUnit(options.physicalSize.yPixelPerUnit);
			}
			if (options.physicalSize.unit !== undefined) {
				chunk.setUnit(options.physicalSize.unit);
			}

			return [chunk];
		} else {
			return [];
		}
	},

	/**
	 * Composing of chunk data
	 *
	 * Phase 4
	 *
	 * @method compose
	 * @param {BufferedStream} stream Data stream
	 * @param {object} options Encoding options
	 */
	compose: function (stream, options) {
		stream.writeUInt32BE(this.getXPixelPerUnit());
		stream.writeUInt32BE(this.getYPixelPerUnit());
		stream.writeUInt8(this.getUnit());
	}
};
