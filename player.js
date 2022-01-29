// example code from other implementations, to be reproduced acording to required specification
export const startPlaying = () => {

	this._currentSong = this._songs.length
		? this.removeFromQueue({ fromTop: true })
		: this._currentSong;
	const bitRate = 256000;//this._getBitRate(this._currentSong);

	const songReadable = Fs.createReadStream(this._currentSong);

	const throttleTransformable = new Throttle(bitRate / 8);
	throttleTransformable.on('data', (chunk) => this._broadcastToEverySink(chunk));
	throttleTransformable.on('end', () => this._playLoop());

	this.stream.emit('play', this._currentSong);
	songReadable.pipe(throttleTransformable);
};