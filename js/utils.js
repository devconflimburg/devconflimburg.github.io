sessionStorage["hosted-signin"] = "true";

convertMarkdownToHtml = function(markdown){
    try{
        var converter = new showdown.Converter();
        var html = converter.makeHtml(markdown);
        html = html.replaceAll('<img','<img style="width:100%;"');
        return html;
    } catch(ex) {
        console.error(ex);
        return markdown;
    }
}

document.addEventListener('alpine:init', async () => {
    setTimeout(function(){
        Draftsman.contains_teleports = false;
        Draftsman.disable_cache_for_page();
    },1);
});

$vui.config = {
    namespace: 'ui'
}
$vui.config.importMap = {
    "*": '/components/${path}${component}.html'
}

var toBase64 = file => new Promise((resolve, reject) => {

    var reader = new FileReader();
            reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {

                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = 544,// TODO : pull max size from a site config
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL(file.type);
                resolve(dataUrl);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
        reader.onerror = reject;


//    const reader = new FileReader();
//    reader.readAsDataURL(file);
//    reader.onload = () => resolve(reader.result);
//    reader.onerror = reject;
});

var file_queue = []
const Experimental = {
    get_queue: function(){
        let retval = file_queue.map(x => x.name);
        return retval;
    },
    upload: async function(event, folder="", public=false){
        await Object.values(event.target.files).forEach(async file => {
            let command = {
                content: file,
                public: public,
                name: folder + file.name.replaceAll(" ","_")
            }
            file_queue.push(command);
        });
        setTimeout(Experimental.process_next_item,3000);
    },
    process_next_item: async function(){
        clearTimeout(auto_continue);
        if (file_queue.length != 0){
            let command = file_queue.pop();
            command.content = await toBase64(command.content);
            setTimeout(function(){
                send_mutation("upload-file",command);
            },500);
            auto_continue = setTimeout(Experimental.process_next_item,3000);
        } else {
            Draftsman.empty_track_and_trace_log();
        }
    }
}

var auto_continue = null;