export async function readAudioFile() {/*
    try {
        selected = await open({
            multiple: false,
            title: "open file",
            filters: [{
                extensions: ['wav', 'm4a', 'mp3', 'ogg', 'flac'],
                name: "*"
            }]
        });

        console.log(selected);

        if (selected === null) {
            // user cancelled the selection
            return;
        }
        else if (Array.isArray(selected)) {
            // user selected multiple files
        }

        else {
            // user selected a single file
        }

        loadingAudio = true;

        content = await readBinaryFile(selected as string);

        let filename: string = selected as string;
        let format: string;
        format = ((filename.split('.')).pop() as string).toLowerCase();
        const file = new File([content], "audio." + format, { type: format });
        const audioURL = URL.createObjectURL(file);
        const sound = new Howl({
            src: [audioURL],
            format: [format],
            loop: true
        });

        createMapSound(sound);

        loadingAudio = false;
    }
    catch (err) {
        console.error(err);
    }*/
}