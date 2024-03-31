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


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

var file_queue = []
const Experimental = {
    get_queue: function(){
        let retval = file_queue.map(x => x.name);
        console.log(retval);
        return retval;
    },
    upload: async function(event, folder="", public=false){
        console.log(event);
        await Object.values(event.target.files).forEach(async file => {
            let content = await toBase64(file);
            let command = {
                content: content,
                public: public,
                name: folder + file.name
            }
            file_queue.push(command);
        });
        setTimeout(Experimental.process_next_item,3000);
    },
    process_next_item: function(){
        console.log(file_queue.map(x => x.name));
        if (file_queue.length != 0){
            let command = file_queue.pop();
            setTimeout(function(){
                send_mutation("upload-file",command);
            },500);
        } else {
            Draftsman.empty_track_and_trace_log();
        }
    }
}