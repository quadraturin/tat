export async function readImageFile() { /*
    try {
        selected = await open({
            multiple: false,
            title: "open file",
            filters: [{
                extensions: ['png', 'gif', 'jpg', 'jpeg', 'webp'],
                name: "*"
            }]
        });

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

        loadingImage = true;

        content = await readBinaryFile(selected as string);
        const bmp = await createImageBitmap(new Blob([content]));
        const { width, height } = bmp;
        bmp.close(); // free memory

        const mapImageURL = URL.createObjectURL(new Blob([content.buffer], { type: 'image/png' }));

        loadImageToMap(mapImageURL, width, height);

        loadingImage = false;
    }
    catch (err) {
        console.error(err);
    }*/
}