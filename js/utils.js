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