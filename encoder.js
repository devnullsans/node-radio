import { spawn } from 'child_process';
import { join } from 'path';
import { PassThrough } from 'stream';


const passthrough = new PassThrough();

let totalBytes = 0;
const startTime = Date.now();
console.log(startTime);
passthrough.on('data', chunk => {
	passthrough.pause();
	setTimeout(() => passthrough.resume(), 1e3);
	totalBytes += chunk.byteLength;
	console.log(chunk.byteLength, totalBytes, Date.now() - startTime);
});
passthrough.once('end', () => {
	console.log(Date());
});


const ffmpeg = spawn('./ffmpeg/ffmpeg', ['-loglevel', 'quiet', '-vn', '-i', join(process.cwd(), 'tracks', 'ex.mp3'), '-f', 'aac', '-c:a', 'aac', '-b:a', '64k', '-ar', '44100', '-ac', 2, '-bufsize', '64k', 'pipe:1']);
ffmpeg.stdout.pipe(passthrough);



/*
var http = require('http')
		, fs = require('fs') 
		var child_process = require("child_process")

		http.createServer(function (req, res) {
		console.log("Request:", dump_req(req) , "\n")

		// path of the 
		var path = 'test-mp4.mp4'  //test-mp4-long.mp4
		, stat = fs.statSync(path)
		, total = stat.size


		var range = req.headers.range
		, parts = range.replace(/bytes=/, "").split("-")
		, partialstart = parts[0]
		, partialend = parts[1]
		, start = parseInt(partialstart, 10)
		, end = partialend ? parseInt(partialend, 10) : total-1
		, chunksize = (end-start)+1


		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize +  "\n")


		var ffmpeg = child_process.spawn("ffmpeg",[
						"-i", path,             // path
						"-b:v" , "64k",         // bitrate to 64k
						"-bufsize", "64k", 
						"-"                     // Output to STDOUT
				]);

				var ffmpeg = child_process.spawn(argv.ffmpeg, [
					'-i', argv.file,
					'-f', 's16le', // PCM 16bits, little-endian
					'-ar', '44100', // Sampling rate
					'-ac', 2, // Stereo
					'pipe:1' // Output on stdout
				]);

		//set header
		res.writeHead(206
		, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
		, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
		, 'Content-Type': 'video/mp4'
		})

		stdout[ params[1] ] = ffmpeg.stdout

		// Pipe the video output to the client response
		ffmpeg.stdout.pipe(res);

		console.log("Response", dump_res(res), "\n")
		}).listen(1337)
		*/