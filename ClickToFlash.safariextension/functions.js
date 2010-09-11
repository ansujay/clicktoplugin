function localize(STRING) {
    var event = document.createEvent("HTMLEvents");
    event.initEvent("beforeload", false, true);
    return safari.self.tab.canLoad(event, STRING);
}

function getTypeOf(element) {
    switch (element.tag) {
        case "embed":
            return element.type;
            break;
        case "object":
            if(element.type) {
                return element.type;
            } else {
                var paramElements = element.getElementsByTagName("param");
                for (var i = 0; i < paramElements.length; i++) {
                    try {
                        if(paramElements[i].getAttribute("name").toLowerCase() == "type") {
                            return paramElements[i].getAttribute("value");
                        }
                    } catch(err) {}
                }
                var embedChildren = element.getElementsByTagName("embed");
                if(embedChildren.length == 0) return "";
                return embedChildren[0].type;
            }
            break;
    }
}

function getParamsOf(element) {
    switch (element.tag) {
        case "embed":
            return (element.getAttribute("flashvars") ? element.getAttribute("flashvars") : ""); // fixing Safari's buggy JS support
            break
        case "object":
            var paramElements = element.getElementsByTagName("param");
            for (var i = paramElements.length - 1; i >= 0; i--) {
                try {
                    if(paramElements[i].getAttribute("name").toLowerCase() == "flashvars") {
                        return paramElements[i].getAttribute("value");
                    }
                } catch(err) {}
            }
            return "";
            break;
    }
}

function isFlash(element, url) {
    if(/\.(swf|spl)(\?|#|$)/.test(url)) return "probably";
    var type = getTypeOf(element);
    if(type == "application/x-shockwave-flash" || type == "application/futuresplash") {
        return "probably";
    } else if(type) {
        return "";
    } else {
        if(!url) return ""; // no source and no type -> cannot launch a plugin
        // check classid as a last resort
        if(element.hasAttribute("classid")) {
            if(element.getAttribute("classid").replace("clsid:","").toLowerCase() == "d27cdb6e-ae6d-11cf-96b8-444553540000") {
                return "probably";
            } else {
                return "";
            }
        }
        // A source might point to a Flash movie through server-side scripting.
        // To be 100% sure of not letting Flash through, one would have either to block
        // everything at this point, or check all other plugins as in CTP...
        // but this situation never occurs in practice anyway, so it's not worth it.
        // We'll just block if source has no extension or is a common server-side script.
        if(!(/\.([a-zA-Z0-9])+(\?|#|$)/.test(url)) || /\.(php|aspx?)(\?|#|$)/.test(url)) {
            return "maybe";
        }
        return "";
    }
}

// Debugging functions
document.HTMLToString = function(element){
    return (new XMLSerializer()).serializeToString(element);
};
