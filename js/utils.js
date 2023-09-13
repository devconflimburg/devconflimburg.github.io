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