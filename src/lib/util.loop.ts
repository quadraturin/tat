export function loopify(uri:string, cb:CallableFunction) {

    var context = new (window.AudioContext)(),
        request = new XMLHttpRequest();

    request.responseType = "arraybuffer";
    request.open("GET", uri, true);

    // XHR failed
    request.onerror = function() {
    cb(new Error("Couldn't load audio from " + uri));
    };

    // XHR complete
    request.onload = function() {
    context.decodeAudioData(request.response,success,function(err){
        // Audio was bad
        cb(new Error("Couldn't decode audio from " + uri));
    });
    };

    request.send();

    function success(buffer:AudioBuffer) {

    var source:AudioBufferSourceNode|null;

    function play() {

        // Stop if it's already playing
        stop();

        // Create a new source (can't replay an existing source)
        source = context.createBufferSource();
        source.connect(context.destination);

        // Set the buffer
        source.buffer = buffer;
        source.loop = true;

        // Play it
        source.start(0);

    }

    function stop() {

        // Stop and clear if it's playing
        if (source) {
        source.stop();
        source = null;
        }

    }

    cb(null,{
        play: play,
        stop: stop
    });

    }

}


