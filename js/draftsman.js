var auto_reload = false;
var scheduled_reload = null;
var stored_mutation = {};
var reload_hooks = [];
var redirect_hooks = {};
var script_hooks = {};
var subscription_reconnect_backoff = 0;
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};
async function cached_call(query,variables={},key="DUMMY",post_query_control=null,anonymous=false,force=false){
    var cache_key = JSON.stringify({query: query,variables: variables});
    // Don't cache filter queries because risk of stale data
    if(query.indexOf("filter(") == -1) {
        var cached_response = cacheJS.get(cache_key);
    } else {
        var cached_response = null;
    }
    if (force == false && cached_response && Draftsman.fetch_query_parameter("force-reload") != "true"){
        console.log("Cache hit");
        if (post_query_control){
            post_query_control(cached_response);
        }
        return cached_response;
    } else if (Draftsman.fetch_query_parameter("force-reload") == "true"){
        console.log("Refresh cache");
        cacheJS.removeByKey(cache_key);
        var url = new URL(window.location);
        url.searchParams.delete('force-reload');
        history.replaceState({}, null, url);
    } else {
        console.log("Cache miss");
    }
    var data = await appsync_call_promise(query,variables,anonymous);
    if (post_query_control){
        post_query_control(data);
    }
    if (data){
        cacheJS.set(cache_key,data, 3600, {key:key, space:"draftsman"});
    }
    return data;
}
function appsync_call_promise(query,variables,anonymous) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('POST', api_url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (anonymous) {
            xhr.setRequestHeader('x-api-key', api_key);
        } else {
            xhr.setRequestHeader('Authorization', localStorage["token"]);
        }
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4 && xhr.status == 401){
                sessionStorage["prevLoc"] = location;
                location = "/auth/signin";
            }
        }
        xhr.onload = function () {
            console.log(xhr.response);
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response.data);
                if (xhr.response.errors && xhr.response.errors.length != 0){
                    Draftsman.display_error("API Error:\n" + JSON.stringify(xhr.response,null,2));
                }
            } else {
                Draftsman.display_error(JSON.stringify(xhr.response.errors,null,2));
                reject(xhr.response.errors);
            }
        };
        xhr.onerror = function () {
            console.log(xhr.statusText);
            Draftsman.display_error(xhr.statusText);
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(JSON.stringify({
            query: query,
            variables: variables
        }));
    });
}
function appsync_call(query,callback,variables={},anonymous=false){
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('POST', api_url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (anonymous){
        xhr.setRequestHeader('x-api-key', api_key);
    } else {
        xhr.setRequestHeader('Authorization', localStorage["token"]);
    }
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4 && xhr.status == 401){
            sessionStorage["prevLoc"] = location;
            location = "/auth/signin";
        }
    }
    xhr.onload = function () {
        callback(xhr.response.data,xhr.response.errors);
    };
    console.log("Send request",JSON.stringify({
        query: query,
        variables: variables
    },indent=4));
    xhr.send(JSON.stringify({
        query: query,
        variables: variables
    }));
}
const urlParams = new URLSearchParams(window.location.search);
var memory = {};
var show_errors = true;
const Draftsman = {
    create_notification: function(title,text,link,style,linkText){
        return {
            title: title ? title : "",
            text: text ? text : "",
            link: link ? link : "",
            linkText: linkText ? linkText : "open",
            style: style ? style : "info"
        };
    },
    navigate: function(url){
        localStorage.setItem("referer_" + url.replace("/?","?"),location);
        location = url;
    },
    next_navigation: function(url){
        var key = 'referer_' + location.pathname + location.search;
        key = key.replace("/?","?");
        localStorage.setItem(key,url);
    },
    navigate_referer: function(url){
        var key = 'referer_' + location.pathname + location.search;
        key = key.replace("/?","?");
        if (localStorage.getItem(key) != null) {
          let target = localStorage.getItem(key);
          localStorage.removeItem(key);
          setTimeout(function(){
            location = target;
          },1000);
        } else {
            location = url;
        }
    },
    notify_parent: function(){
        let url = location.href;
        let message = { height: document.body.scrollHeight, width: document.body.scrollWidth, url: url };
	    window.top.postMessage(message, "*");
    },
    get_stored_mutation: function(){
        console.log();
        if (stored_mutation == {}){
            return JSON.parse(localStorage.getItem(location));
        } else {
            return stored_mutation;
        }
    },
    set_stored_mutation: function(mutation){
        stored_mutation = Object.assign({},mutation);
    },
    clear_mutation: function(key){
        stored_mutation[key] = {};
    },
    close_modals: function(){
        var modals = document.getElementsByClassName("modal");
        for (i = 0; i < modals.length; i++){
              try{
                var myModal = bootstrap.Modal.getInstance(modals[i]);
                myModal.hide();
              } catch (exception){
                console.log(exception);
              }
        }
    },
    scroll_modals: function(){
        var modals = document.getElementsByClassName("modal");
        for (i = 0; i < modals.length; i++){
              try{
                var myModal = bootstrap.Modal.getInstance(modals[i]);
                myModal.scrollTop();
              } catch (exception){
                console.log(exception);
              }
        }
    },
    set_reload: function(toggle){
        auto_reload = toggle;
    },
    register_reload_hook: function(notification){
        var key = notification.identifier + notification.type + notification.message;
        reload_hooks.push(key);
    },
    scheduled_reload: function(){
        scheduled_reload = setTimeout(Draftsman.reload,3000);
    },
    reload: function(force=false){
        localStorage.removeItem('data_'+location);
        localStorage.removeItem('transient_'+location);
        localStorage.removeItem('mutation_'+location);
        console.log(force);
        if (force){
            var url = new URL(window.location);
            url.searchParams.append('force-reload',true);
            window.location = url;
        }else{
            window.dispatchEvent(new CustomEvent('reload',{}));
            clearTimeout(scheduled_reload);
        }
    },
    cleanEmpty: function(obj) {
      if (Array.isArray(obj)) {
        return obj
            .map(v => (v && typeof v === 'object') ? Draftsman.cleanEmpty(v) : v)
            .filter(v => !(v == null));
      } else {
        return Object.entries(obj)
            .map(([k, v]) => [k, v && typeof v === 'object' ? Draftsman.cleanEmpty(v) : v])
            .reduce((a, [k, v]) => (v == null ? a : (a[k]=v, a)), {});
      }
    },
    register_redirect_hook: function(target_location,notification){
        var key = notification.identifier + notification.type + notification.message;
        redirect_hooks[key] = target_location;
    },
    register_script_hook: function(key,method){
        script_hooks[key] = method;
    },
    show_errors: function(toggle){
        show_errors = toggle;
    },
    display_error: function(message){
        console.log(message);
        if (!show_errors){
            return;
        }
        setTimeout(function(){
            var html = `<br><br><br><div class="alert alert-danger" role="alert">
                          <pre>${message}</pre>
                        </div>`;
            document.getElementById("alert_container").innerHTML = html;
        },500);
    },
    flush_cache: function(){
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("_cache")){
                localStorage.removeItem(key);
            }
        });
    },
    store: function (key,value){
        console.log(`Store: ${key}/${value}`)
        if (localStorage.memory){
            memory = JSON.parse(localStorage.memory);
        }
        if (value) {
            memory[key] = value;
        } else {
            return memory[key];
        }
        localStorage.memory = JSON.stringify(memory);
    },
    remove: function (key){
        if (localStorage.memory){
            memory = JSON.parse(localStorage.memory);
        }
        delete memory[key];
        localStorage.memory = JSON.stringify(memory);
    },
    fetch: function(array,key,key_value,value_key){
        for (let i = 0; i < array.length; i++){
            if (array[i][key] == key_value){
                return array[i][value_key];
            }
        }
    },
    fetch_string: function(variable_name){
        try{
            return JSON.parse(localStorage["_x_"+variable_name])
        } catch{
            return ""
        }
    },
    fetch_query_parameter: function(variable_name){
        return urlParams.get(variable_name);
    },
    isSubset: function(superObj, subObj) {
        return Object.keys(subObj).every(ele => {
            if (typeof subObj[ele] == 'object') {
                return isSubset(superObj[ele], subObj[ele]);
            }
            return subObj[ele] === superObj[ele]
        });
    },
    filter_array: function(array,key,value){
        return array.filter(x => x[key] == value);
    },
    encode: function(object) {return btoa(JSON.stringify(object));},
    decode: function(data) {return JSON.parse(atob(data));},
    query: cached_call,
    mutation: appsync_call,
    subscribe: function(query,callback,variables={},anonymous=true){
        const data = {
            query : query,
            variables: Object.fromEntries(Object.entries(variables).filter(([_, v]) => v != null))
        };
        console.log(data);
        var header = {
            "host": api_url.replace("https://","").replace("/graphql","")
        }
        if (anonymous){
            header["x-api-key"] = api_key;
        } else {
            header["Authorization"] = localStorage["token"];
        }
        let ws = `${api_ws}?header=${btoa(JSON.stringify(header))}&payload=e30=`;
        let socket = new WebSocket(ws,"graphql-ws");
        socket.onopen = function(e) {
          socket.send(JSON.stringify({
            "id":uuidv4(),
            "payload":{
                "data": JSON.stringify(data),
                "extensions":{
                    "authorization": header
                }
            },
            "type":"start"
          }));
        };
        socket.onmessage = function(event) {
            let data = JSON.parse(event.data).payload
            if (data){
                callback(data.data, data.errors);
            }
        };
        socket.onclose = function(event) {
          if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
          } else {
            subscription_reconnect_backoff += 1000;
            console.log(`[close] Connection died, attempt to reconnect in ${subscription_reconnect_backoff/1000} seconds`);
            setTimeout(function(){
                Draftsman.subscribe(query,callback,variables);
            },subscription_reconnect_backoff);
          }
        };
        socket.onerror = function(error) {
          console.log(`[error] ${error.message}`);
        };
    }
}
function notification_actions(key,data){
    if (reload_hooks.indexOf(key) != -1){
        Draftsman.reload();
        return true;
    }
    if (key in redirect_hooks){
        location = redirect_hooks[key];
    }
    if (key in script_hooks){
        script_hooks[key](data);
    }
    return false;
}
window.addEventListener('load', function () {
  Draftsman.notify_parent();
  setInterval(Draftsman.notify_parent,1000);
  if (auto_reload === false){
    console.error("Autoreload is disabled");
    return
  }
  const listner_query = `subscription Notification {
        onNotification {
          identifier
          message
          type
        }
      }`;
  Draftsman.subscribe(listner_query,(data,errors) => {
    if (data.onNotification){
        console.log(JSON.stringify(data,null,2));
        var notification = data.onNotification;
        // rudimentary wildcards
        var keys = [
            notification.identifier + notification.type + notification.message,
            '*' + notification.type + notification.message,
            notification.identifier + '*' + notification.message,
            notification.identifier + notification.type + '*',
            '**' + notification.message,
            notification.identifier + '**',
            '*' + notification.type + '*'
        ];
        for (i = 0; i < keys.length; i++){
            if (notification_actions(keys[i],notification)){
                return;
            }
        }
        try{
            cacheJS.removeByContext({key: data.onNotification.identifier});
        } catch {
            console.log("could not flush cache");
        }
        for (const [key, value] of urlParams) {
            if (value == data.onNotification.identifier){
                setTimeout(function(){
                    if (auto_reload){
                        Draftsman.reload();
                        return;
                    }
                    var html = `<br><br><br><div class="alert alert-info" role="alert">
                                  This resource is updated, please
                                <button type="button" class="btn btn-outline-dark btn-sm" @click="location.reload();">reload screen</button>
                                </div>`;
                    document.getElementById("alert_container").innerHTML = html;
                },500);
            }
        }
    }
  });
});